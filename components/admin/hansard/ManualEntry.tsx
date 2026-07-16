"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { adminPath } from "@/lib/admin-path";
import {
  deleteAtSortedIndex,
  insertAtOrder as insertContributionAtOrder,
  moveBySortedIndex,
  nextAppendOrder,
  renumberContiguous,
  sortByOrder,
} from "@/lib/hansard/order";
import {
  portableTextToPlain,
  publicHansardDayPath,
  publicHansardHousePath,
} from "@/lib/hansard/speech";
import {
  PRESIDING_ROLE_LABELS,
  type PresidingRole,
} from "@/lib/hansard/stats";

function studioDocUrl(documentId: string) {
  const base = (
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    `https://www.sanity.io/manage/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "egkekbgr"}`
  ).replace(/\/$/, "");
  if (base.includes("sanity.studio")) {
    return `${base}/structure/hansardSitting;${documentId}`;
  }
  return base;
}

type ContributionType = "spoken" | "procedural" | "header" | "mini-header";

interface Contribution {
  _key?: string;
  order: number;
  type: ContributionType;
  supabaseLeaderId?: string;
  speakerName: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  /** When true, excluded from member contribution stats (chair interventions) */
  isChairContribution?: boolean;
  /** Plain text for editing; may also hold PT from load until converted */
  speech: string | unknown[];
  speechPlain?: string;
  startTime?: string;
  sectionHeader?: string;
}

interface SittingForm {
  title: string;
  sittingDate: string;
  houseType: "national-assembly" | "senate" | "county-assembly";
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  editorialSummary?: string;
  presidingRole: PresidingRole;
  presidingName: string;
  presidingLeaderId: string;
  presidingNotes: string;
}

interface LeaderSearchResult {
  id: string;
  full_name: string;
  title?: string;
  constituency?: string;
  party?: string;
  role?: string;
}

function speechToPlain(c: Contribution): string {
  if (typeof c.speechPlain === "string" && c.speechPlain) return c.speechPlain;
  return portableTextToPlain(c.speech);
}

function speechForSave(c: Contribution): string | unknown[] {
  // Prefer plain editor text when present (user may have edited)
  if (typeof c.speech === "string") return c.speech;
  if (typeof c.speechPlain === "string" && c.speechPlain.length > 0) {
    // If plain was derived from PT and user didn't re-edit as string, keep PT
    // when plain matches portable text of speech array
    if (Array.isArray(c.speech) && c.speech.length > 0) {
      const fromPt = portableTextToPlain(c.speech);
      if (fromPt === c.speechPlain) return c.speech;
      return c.speechPlain;
    }
    return c.speechPlain;
  }
  if (Array.isArray(c.speech)) return c.speech;
  return "";
}

export type ManualEntryProps = {
  /** Prefill load form when opening from sittings list */
  initialLoadDate?: string;
  initialLoadHouse?: "national-assembly" | "senate" | "county-assembly";
  initialDocumentId?: string;
  /** When embedded in the Hansard hub, hide the standalone page chrome */
  embedded?: boolean;
};

export default function ManualHansardEntry({
  initialLoadDate = "",
  initialLoadHouse = "national-assembly",
  initialDocumentId,
  embedded = false,
}: ManualEntryProps = {}) {
  const [sitting, setSitting] = useState<SittingForm>({
    title: "",
    sittingDate: "",
    houseType: "national-assembly",
    sittingPeriod: "Morning Sitting",
    parliamentaryTerm: "13th Parliament (2022–2027)",
    youtubeUrl: "",
    officialHansardUrl: "",
    editorialSummary: "",
    presidingRole: "speaker",
    presidingName: "",
    presidingLeaderId: "",
    presidingNotes: "",
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [insertMode, setInsertMode] = useState<"append" | "at">("append");
  const [insertAtOrder, setInsertAtOrder] = useState(1);
  const [currentContribution, setCurrentContribution] = useState<Contribution>({
    order: 1,
    type: "spoken",
    speakerName: "",
    speech: "",
  });

  const [leaderSearchResults, setLeaderSearchResults] = useState<
    LeaderSearchResult[]
  >([]);
  const [isSearchingLeaders, setIsSearchingLeaders] = useState(false);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const [presidingSearchResults, setPresidingSearchResults] = useState<
    LeaderSearchResult[]
  >([]);
  const [isSearchingPresiding, setIsSearchingPresiding] = useState(false);
  const [showPresidingDropdown, setShowPresidingDropdown] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successData, setSuccessData] = useState<{
    documentId?: string;
    title?: string;
    contributionsCount?: number;
    isActive?: boolean;
    message?: string;
  } | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const [existingDocumentId, setExistingDocumentId] = useState<string | null>(
    initialDocumentId || null,
  );
  const [isActive, setIsActive] = useState(true);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [loadDate, setLoadDate] = useState(initialLoadDate);
  const [loadHouse, setLoadHouse] = useState<
    "national-assembly" | "senate" | "county-assembly"
  >(initialLoadHouse);

  const sortedContributions = useMemo(
    () => sortByOrder(contributions),
    [contributions],
  );

  const publicUrl =
    sitting.sittingDate && sitting.houseType
      ? publicHansardDayPath(sitting.houseType, sitting.sittingDate)
      : "#";

  const loadExistingSitting = async (quiet = false) => {
    const dateToLoad = loadDate || initialLoadDate;
    const houseToLoad = loadHouse || initialLoadHouse;
    const idToLoad = existingDocumentId || initialDocumentId;

    if (!dateToLoad && !idToLoad) {
      if (!quiet) alert("Please select a date");
      return;
    }
    setIsLoadingExisting(true);
    try {
      const qs = idToLoad
        ? `id=${encodeURIComponent(idToLoad)}`
        : `date=${dateToLoad}&houseType=${houseToLoad}`;
      const res = await fetch(`/api/hansard/load-existing?${qs}`);
      const data = await res.json();
      if (!data.exists) {
        if (!quiet) alert("No sitting found for that date and house.");
        return;
      }
      const loaded = data.sitting;
      const po = loaded.presidingOfficer || {};
      const roleRaw = (po.role || "speaker") as string;
      const presidingRole: PresidingRole =
        roleRaw === "deputy-speaker" || roleRaw === "temporary-speaker"
          ? roleRaw
          : "speaker";
      setSitting({
        title: loaded.title || "",
        sittingDate: loaded.sittingDate,
        houseType: loaded.houseType,
        sittingPeriod: loaded.sittingPeriod || "Morning Sitting",
        parliamentaryTerm:
          loaded.parliamentaryTerm || "13th Parliament (2022–2027)",
        youtubeUrl: loaded.youtubeUrl || "",
        officialHansardUrl: loaded.officialHansardUrl || "",
        editorialSummary: portableTextToPlain(loaded.editorialSummary) || "",
        presidingRole,
        presidingName: po.displayName || "",
        presidingLeaderId: po.supabaseLeaderId || "",
        presidingNotes: po.notes || "",
      });
      const mapped: Contribution[] = (loaded.contributions || []).map(
        (c: Contribution & { speechPlain?: string }, i: number) => ({
          _key: c._key || `loaded-${i}`,
          order: c.order || i + 1,
          type: (c.type as ContributionType) || "spoken",
          supabaseLeaderId: c.supabaseLeaderId,
          speakerName: c.speakerName || "",
          speakerTitle: c.speakerTitle,
          constituency: c.constituency,
          party: c.party,
          role: c.role,
          isChairContribution: Boolean(c.isChairContribution),
          speech: c.speech,
          speechPlain: c.speechPlain || portableTextToPlain(c.speech),
          startTime: c.startTime,
          sectionHeader: c.sectionHeader,
        }),
      );
      setContributions(renumberContiguous(mapped));
      setExistingDocumentId(loaded._id);
      setIsActive(loaded.isActive !== false);
      if (loaded.sittingDate) setLoadDate(loaded.sittingDate);
      if (loaded.houseType) setLoadHouse(loaded.houseType);
      if (!quiet) {
        alert(
          `Loaded ${mapped.length} contributions. Add more, insert at any order, then Save draft or Publish.`,
        );
      }
    } catch (e) {
      console.error(e);
      if (!quiet) alert("Failed to load existing sitting");
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Auto-load when opened from sittings list (Edit)
  useEffect(() => {
    if (!initialLoadDate && !initialDocumentId) return;
    void loadExistingSitting(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot prefill
  }, []);

  const openAddModal = (mode: "append" | "at" = "append", atOrder?: number) => {
    const next =
      mode === "at" && atOrder
        ? atOrder
        : nextAppendOrder(contributions);
    setInsertMode(mode);
    setInsertAtOrder(next);
    setCurrentContribution({
      order: next,
      type: "spoken",
      speakerName: "",
      speech: "",
      speechPlain: "",
    });
    setEditingKey(null);
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setModalOpen(true);
  };

  const openEditModal = (sortedIndex: number) => {
    const item = sortedContributions[sortedIndex];
    if (!item) return;
    const plain = speechToPlain(item);
    setCurrentContribution({
      ...item,
      speech: plain,
      speechPlain: plain,
    });
    setEditingKey(item._key || `idx-${sortedIndex}`);
    setInsertMode("append");
    setLeaderSearchResults([]);
    setShowLeaderDropdown(false);
    setModalOpen(true);
  };

  const saveContribution = () => {
    const type = currentContribution.type;
    const speechText =
      typeof currentContribution.speech === "string"
        ? currentContribution.speech
        : speechToPlain(currentContribution);

    if (type === "header" || type === "mini-header") {
      if (!currentContribution.sectionHeader?.trim()) {
        alert(
          type === "mini-header"
            ? "Mini-header title is required (e.g. topic under a main section)."
            : "Section / Order of Business is required for Section Headers.",
        );
        return;
      }
    } else if (type === "procedural") {
      if (!speechText.trim()) {
        alert("Content is required for Procedural Notes.");
        return;
      }
    } else if (type === "spoken") {
      if (!currentContribution.speakerName.trim() || !speechText.trim()) {
        alert("Speaker Name and Content are required for Spoken contributions.");
        return;
      }
    }

    const row: Contribution = {
      ...currentContribution,
      speech: speechText,
      speechPlain: speechText,
      _key:
        currentContribution._key ||
        `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };

    if (editingKey !== null) {
      setContributions((prev) =>
        renumberContiguous(
          prev.map((c) => (c._key === editingKey || c._key === row._key ? row : c)),
        ),
      );
    } else if (insertMode === "at") {
      setContributions((prev) =>
        insertContributionAtOrder(prev, row, insertAtOrder),
      );
    } else {
      setContributions((prev) =>
        renumberContiguous([
          ...prev,
          { ...row, order: nextAppendOrder(prev) },
        ]),
      );
    }

    setModalOpen(false);
    setEditingKey(null);
    setCurrentContribution({
      order: 1,
      type: "spoken",
      speakerName: "",
      speech: "",
    });
  };

  const handleSaveToSanity = async (status: "draft" | "publish") => {
    if (!sitting.title || !sitting.sittingDate) {
      alert("Please fill in Title and Sitting Date.");
      return;
    }
    if (contributions.length === 0) {
      alert("Please add at least one contribution.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        houseType: sitting.houseType,
        sittingDate: sitting.sittingDate,
        title: sitting.title,
        sittingPeriod: sitting.sittingPeriod,
        parliamentaryTerm: sitting.parliamentaryTerm,
        youtubeUrl: sitting.youtubeUrl || undefined,
        officialHansardUrl: sitting.officialHansardUrl || undefined,
        editorialSummary: sitting.editorialSummary || undefined,
        presidingOfficer: {
          role: sitting.presidingRole,
          displayName: sitting.presidingName.trim(),
          supabaseLeaderId: sitting.presidingLeaderId.trim() || undefined,
          notes: sitting.presidingNotes.trim() || undefined,
        },
        status,
        isActive: status === "publish",
        contributions: sortByOrder(contributions).map((c) => ({
          _key: c._key,
          order: c.order,
          type: c.type,
          supabaseLeaderId: c.supabaseLeaderId || undefined,
          speakerName: c.speakerName.trim(),
          speakerTitle: c.speakerTitle?.trim() || "",
          constituency: c.constituency?.trim() || "",
          party: c.party?.trim() || "",
          role: c.role?.trim() || "",
          isChairContribution: Boolean(c.isChairContribution),
          speech: speechForSave(c),
          startTime: c.startTime?.trim() || "",
          sectionHeader: c.sectionHeader?.trim() || "",
        })),
        existingDocumentId: existingDocumentId || undefined,
      };

      const res = await fetch("/api/hansard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setExistingDocumentId(data.documentId);
      setIsActive(data.isActive !== false);
      setSuccessData(data);
      setShowSuccessBanner(true);
      // Keep contributions loaded — do NOT clear
    } catch (error: unknown) {
      alert(
        "Error saving: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!existingDocumentId) {
      alert("Save the sitting first.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/hansard/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: existingDocumentId,
          isActive: !isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setIsActive(data.isActive);
      alert(data.message);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Status update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSitting = async () => {
    if (!existingDocumentId) {
      alert("No existing sitting loaded.");
      return;
    }
    if (
      !confirm(
        "Permanently delete this Hansard sitting from Sanity? This cannot be undone.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/hansard/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: existingDocumentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert("Sitting deleted.");
      window.location.reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const searchLeaders = async (query: string) => {
    if (query.length < 2) {
      setLeaderSearchResults([]);
      setShowLeaderDropdown(false);
      return;
    }
    setIsSearchingLeaders(true);
    try {
      const res = await fetch(
        `/api/leaders/search?q=${encodeURIComponent(query)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setLeaderSearchResults(data.leaders || []);
        setShowLeaderDropdown(true);
      }
    } catch (err) {
      console.error("Leader search failed", err);
    } finally {
      setIsSearchingLeaders(false);
    }
  };

  const selectLeader = (leader: LeaderSearchResult) => {
    setCurrentContribution({
      ...currentContribution,
      supabaseLeaderId: leader.id,
      speakerName: leader.full_name || "",
      speakerTitle:
        currentContribution.isChairContribution
          ? PRESIDING_ROLE_LABELS[sitting.presidingRole]
          : leader.title || currentContribution.speakerTitle || "",
      constituency: leader.constituency || "",
      party: leader.party || "",
      role: leader.role || "",
    });
    setShowLeaderDropdown(false);
  };

  const searchPresidingLeaders = async (query: string) => {
    if (query.length < 2) {
      setPresidingSearchResults([]);
      setShowPresidingDropdown(false);
      return;
    }
    setIsSearchingPresiding(true);
    try {
      const res = await fetch(
        `/api/leaders/search?q=${encodeURIComponent(query)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPresidingSearchResults(data.leaders || []);
        setShowPresidingDropdown(true);
      }
    } catch (err) {
      console.error("Presiding leader search failed", err);
    } finally {
      setIsSearchingPresiding(false);
    }
  };

  const selectPresidingLeader = (leader: LeaderSearchResult) => {
    setSitting((s) => ({
      ...s,
      presidingName: leader.full_name || "",
      presidingLeaderId: leader.id,
    }));
    setShowPresidingDropdown(false);
    setPresidingSearchResults([]);
  };

  const applyChairRoleToContribution = (role: PresidingRole) => {
    setCurrentContribution((c) => ({
      ...c,
      isChairContribution: true,
      speakerTitle: PRESIDING_ROLE_LABELS[role],
    }));
  };

  return (
    <div>
      {!embedded && (
        <div style={{ marginBottom: 16 }}>
          <Link href={adminPath("hansard")} className="govuk-back-link">
            Back to Hansard management
          </Link>
        </div>
      )}

      <h2 className={embedded ? "govuk-heading-m" : "govuk-heading-l"}>
        Manual entry
      </h2>
      <p className="govuk-body">
        Load an existing sitting to <strong>add more contributions</strong> without
        wiping previous ones. Link speakers via Supabase (stores{" "}
        <code>supabaseLeaderId</code> only for identity). Insert missed rows at any
        order. Save as draft or publish.
      </p>

      {showSuccessBanner && successData && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              {successData.message || "Saved."}{" "}
              {successData.contributionsCount != null && (
                <>
                  ({successData.contributionsCount} contributions
                  {successData.isActive ? ", published" : ", draft"})
                </>
              )}
            </p>
            <p className="govuk-body">
              <Link href={publicUrl} className="govuk-link" target="_blank">
                View public page
              </Link>
              {" · "}
              {successData.documentId && (
                <a
                  href={studioDocUrl(successData.documentId)}
                  className="govuk-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Studio
                </a>
              )}
            </p>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setShowSuccessBanner(false)}
            >
              Continue editing
            </button>
          </div>
        </div>
      )}

      {/* Load existing */}
      <div className="govuk-inset-text">
        <h2 className="govuk-heading-s">Load existing sitting</h2>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label" htmlFor="loadDate">
              Sitting date
            </label>
            <input
              id="loadDate"
              type="date"
              className="govuk-input"
              value={loadDate}
              onChange={(e) => setLoadDate(e.target.value)}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label" htmlFor="loadHouse">
              House
            </label>
            <select
              id="loadHouse"
              className="govuk-select"
              value={loadHouse}
              onChange={(e) =>
                setLoadHouse(e.target.value as typeof loadHouse)
              }
            >
              <option value="national-assembly">National Assembly</option>
              <option value="senate">Senate</option>
              <option value="county-assembly">County Assembly</option>
            </select>
          </div>
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">&nbsp;</label>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => void loadExistingSitting(false)}
              disabled={isLoadingExisting || !loadDate}
            >
              {isLoadingExisting ? (
                <>
                  <Loader2 className="inline w-4 h-4 animate-spin" /> Loading…
                </>
              ) : (
                "Load sitting"
              )}
            </button>
          </div>
        </div>
        {existingDocumentId && (
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            Editing existing document{" "}
            <code>{existingDocumentId}</code> —{" "}
            <strong>{isActive ? "Published" : "Draft"}</strong>
            {" · "}
            <Link href={publicUrl} className="govuk-link" target="_blank">
              Public URL
            </Link>
          </p>
        )}
      </div>

      {/* Sitting metadata */}
      <h2 className="govuk-heading-m">Sitting details</h2>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="govuk-input"
          value={sitting.title}
          onChange={(e) => setSitting({ ...sitting, title: e.target.value })}
          placeholder="e.g. National Assembly — Tuesday, 15 July 2025"
        />
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sittingDate">
              Sitting date
            </label>
            <input
              id="sittingDate"
              type="date"
              className="govuk-input"
              value={sitting.sittingDate}
              onChange={(e) =>
                setSitting({ ...sitting, sittingDate: e.target.value })
              }
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="houseType">
              House
            </label>
            <select
              id="houseType"
              className="govuk-select"
              value={sitting.houseType}
              onChange={(e) =>
                setSitting({
                  ...sitting,
                  houseType: e.target.value as SittingForm["houseType"],
                })
              }
            >
              <option value="national-assembly">National Assembly</option>
              <option value="senate">Senate</option>
              <option value="county-assembly">County Assembly</option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sittingPeriod">
              Period
            </label>
            <select
              id="sittingPeriod"
              className="govuk-select"
              value={sitting.sittingPeriod}
              onChange={(e) =>
                setSitting({ ...sitting, sittingPeriod: e.target.value })
              }
            >
              <option>Morning Sitting</option>
              <option>Afternoon Sitting</option>
              <option>Evening Sitting</option>
              <option>Special Sitting</option>
            </select>
          </div>
        </div>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="term">
          Parliamentary term
        </label>
        <input
          id="term"
          className="govuk-input"
          value={sitting.parliamentaryTerm}
          onChange={(e) =>
            setSitting({ ...sitting, parliamentaryTerm: e.target.value })
          }
        />
      </div>

      {/* Presiding officer */}
      <h2 className="govuk-heading-m">Presiding officer (this sitting)</h2>
      <p className="govuk-hint">
        When the Speaker is absent, the Deputy Speaker presides. If both are
        absent, the House elects a Member as Temporary Speaker. Link Temporary /
        Deputy Speakers to Supabase so their chair interventions can be excluded
        from personal contribution stats.
      </p>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="presidingRole">
              Chair role
            </label>
            <select
              id="presidingRole"
              className="govuk-select"
              value={sitting.presidingRole}
              onChange={(e) =>
                setSitting({
                  ...sitting,
                  presidingRole: e.target.value as PresidingRole,
                })
              }
            >
              <option value="speaker">The Speaker</option>
              <option value="deputy-speaker">The Deputy Speaker</option>
              <option value="temporary-speaker">
                The Temporary Speaker (elected Member)
              </option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="presidingSearch">
              Search Member / leader (optional link)
            </label>
            <input
              id="presidingSearch"
              className="govuk-input"
              onChange={(e) => searchPresidingLeaders(e.target.value)}
              placeholder="Type name to link Supabase leader…"
            />
            {isSearchingPresiding && (
              <p className="govuk-hint">Searching…</p>
            )}
            {showPresidingDropdown && presidingSearchResults.length > 0 && (
              <ul
                className="govuk-list"
                style={{
                  border: "1px solid #b1b4b6",
                  maxHeight: 180,
                  overflow: "auto",
                }}
              >
                {presidingSearchResults.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="govuk-link"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 8,
                        width: "100%",
                      }}
                      onClick={() => selectPresidingLeader(l)}
                    >
                      {l.full_name}
                      {l.constituency ? ` — ${l.constituency}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="presidingName">
          Name in Hansard
        </label>
        <input
          id="presidingName"
          className="govuk-input"
          value={sitting.presidingName}
          onChange={(e) =>
            setSitting({ ...sitting, presidingName: e.target.value })
          }
          placeholder="e.g. Hon. Moses Wetang'ula"
        />
      </div>
      {sitting.presidingLeaderId && (
        <p className="govuk-body-s">
          Linked leader ID: <code>{sitting.presidingLeaderId}</code>{" "}
          <button
            type="button"
            className="govuk-link"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#d4351c",
            }}
            onClick={() =>
              setSitting({ ...sitting, presidingLeaderId: "" })
            }
          >
            Unlink
          </button>
        </p>
      )}
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="presidingNotes">
          Notes (optional)
        </label>
        <input
          id="presidingNotes"
          className="govuk-input"
          value={sitting.presidingNotes}
          onChange={(e) =>
            setSitting({ ...sitting, presidingNotes: e.target.value })
          }
          placeholder="e.g. Speaker absent; Temporary Speaker elected at 14:45"
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="pdf">
          Official Hansard PDF URL (source of truth)
        </label>
        <input
          id="pdf"
          className="govuk-input"
          value={sitting.officialHansardUrl || ""}
          onChange={(e) =>
            setSitting({ ...sitting, officialHansardUrl: e.target.value })
          }
          placeholder="https://..."
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="yt">
          YouTube URL (optional)
        </label>
        <input
          id="yt"
          className="govuk-input"
          value={sitting.youtubeUrl || ""}
          onChange={(e) =>
            setSitting({ ...sitting, youtubeUrl: e.target.value })
          }
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="summary">
          Editorial summary (plain text)
        </label>
        <textarea
          id="summary"
          className="govuk-textarea"
          rows={3}
          value={sitting.editorialSummary || ""}
          onChange={(e) =>
            setSitting({ ...sitting, editorialSummary: e.target.value })
          }
        />
      </div>

      {/* Contributions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 32,
        }}
      >
        <h2 className="govuk-heading-m govuk-!-margin-bottom-0">
          Contributions ({contributions.length})
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="govuk-button"
            onClick={() => openAddModal("append")}
          >
            + Add at end
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={() => {
              const at = window.prompt(
                "Insert at order number (existing items shift down):",
                "1",
              );
              if (!at) return;
              const n = parseInt(at, 10);
              if (!n || n < 1) {
                alert("Enter a valid order ≥ 1");
                return;
              }
              openAddModal("at", n);
            }}
          >
            Insert at order…
          </button>
        </div>
      </div>

      {contributions.length === 0 ? (
        <div className="govuk-inset-text">
          No contributions yet. Load an existing sitting or add the first entry.
        </div>
      ) : (
        <div className="app-table-scroll" role="region" tabIndex={0}>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="col">
                  Order
                </th>
                <th className="govuk-table__header" scope="col">
                  Type
                </th>
                <th className="govuk-table__header" scope="col">
                  Speaker / section
                </th>
                <th className="govuk-table__header" scope="col">
                  Content
                </th>
                <th className="govuk-table__header" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {sortedContributions.map((contrib, sortedIndex) => {
                const plain = speechToPlain(contrib);
                return (
                  <tr key={contrib._key || `row-${sortedIndex}`} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{contrib.order}</strong>
                    </td>
                    <td className="govuk-table__cell">
                      {contrib.type === "spoken" && (
                        <span className="govuk-tag govuk-tag--blue">Spoken</span>
                      )}
                      {contrib.type === "procedural" && (
                        <span className="govuk-tag govuk-tag--yellow">
                          Procedural
                        </span>
                      )}
                      {contrib.type === "header" && (
                        <span className="govuk-tag govuk-tag--grey">Header</span>
                      )}
                      {contrib.type === "mini-header" && (
                        <span className="govuk-tag govuk-tag--turquoise">
                          Mini header
                        </span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {contrib.sectionHeader && (
                        <div style={{ fontWeight: 600, color: "#1d70b8" }}>
                          {contrib.sectionHeader}
                        </div>
                      )}
                      <strong>{contrib.speakerName || "—"}</strong>
                      {contrib.supabaseLeaderId && (
                        <span className="govuk-body-s"> · linked</span>
                      )}
                      {contrib.isChairContribution && (
                        <span className="govuk-tag govuk-tag--yellow govuk-!-margin-left-1">
                          Chair
                        </span>
                      )}
                    </td>
                    <td className="govuk-table__cell" style={{ maxWidth: 360 }}>
                      {plain.length > 120
                        ? plain.slice(0, 120) + "…"
                        : plain || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <button
                        type="button"
                        className="govuk-button govuk-button--secondary govuk-!-margin-right-1"
                        style={{ padding: "4px 8px", fontSize: 13 }}
                        onClick={() => openEditModal(sortedIndex)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="govuk-button govuk-button--secondary"
                        style={{ padding: "4px 8px", fontSize: 13 }}
                        onClick={() =>
                          setContributions((prev) =>
                            moveBySortedIndex(prev, sortedIndex, "up"),
                          )
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="govuk-button govuk-button--secondary"
                        style={{ padding: "4px 8px", fontSize: 13 }}
                        onClick={() =>
                          setContributions((prev) =>
                            moveBySortedIndex(prev, sortedIndex, "down"),
                          )
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="govuk-button govuk-button--secondary"
                        style={{ padding: "4px 8px", fontSize: 13 }}
                        onClick={() => openAddModal("at", contrib.order)}
                        title="Insert a missed entry at this order (shift others down)"
                      >
                        Insert here
                      </button>
                      <button
                        type="button"
                        className="govuk-button govuk-button--warning"
                        style={{
                          padding: "4px 8px",
                          fontSize: 13,
                          marginLeft: 4,
                        }}
                        onClick={() => {
                          if (!confirm("Delete this contribution?")) return;
                          setContributions((prev) =>
                            deleteAtSortedIndex(prev, sortedIndex),
                          );
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="govuk-button-group govuk-!-margin-top-8">
        <button
          type="button"
          className="govuk-button"
          disabled={isSaving || contributions.length === 0}
          onClick={() => handleSaveToSanity("publish")}
        >
          {isSaving ? "Saving…" : "Save & publish"}
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          disabled={isSaving || contributions.length === 0}
          onClick={() => handleSaveToSanity("draft")}
        >
          Save as draft
        </button>
        {existingDocumentId && (
          <>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={isSaving}
              onClick={handleTogglePublish}
            >
              {isActive ? "Unpublish (draft)" : "Publish now"}
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--warning"
              disabled={isDeleting}
              onClick={handleDeleteSitting}
            >
              {isDeleting ? "Deleting…" : "Delete sitting"}
            </button>
          </>
        )}
      </div>
      <p className="govuk-hint">
        Public pages only show sittings marked published. Drafts stay in Sanity
        for admin until you publish.{" "}
        <Link
          href={publicHansardHousePath(sitting.houseType)}
          className="govuk-link"
        >
          Browse house archive
        </Link>
      </p>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 4,
              width: "100%",
              maxWidth: 860,
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <h2 className="govuk-heading-m">
              {editingKey
                ? "Edit contribution"
                : insertMode === "at"
                  ? `Insert at order ${insertAtOrder}`
                  : "Add contribution"}
            </h2>

            {insertMode === "at" && !editingKey && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="insertOrder">
                  Order (items at this number and below shift down)
                </label>
                <input
                  id="insertOrder"
                  type="number"
                  min={1}
                  className="govuk-input govuk-input--width-5"
                  value={insertAtOrder}
                  onChange={(e) =>
                    setInsertAtOrder(parseInt(e.target.value, 10) || 1)
                  }
                />
              </div>
            )}

            <div className="govuk-form-group">
              <label className="govuk-label">Entry type</label>
              <select
                className="govuk-select"
                value={currentContribution.type}
                onChange={(e) =>
                  setCurrentContribution({
                    ...currentContribution,
                    type: e.target.value as ContributionType,
                    isChairContribution:
                      e.target.value === "spoken"
                        ? currentContribution.isChairContribution
                        : false,
                  })
                }
              >
                <option value="spoken">Spoken contribution</option>
                <option value="procedural">Procedural note</option>
                <option value="header">Section header (main)</option>
                <option value="mini-header">
                  Mini header (under a section)
                </option>
              </select>
              <p className="govuk-hint">
                Main example: REQUESTS FOR STATEMENTS. Mini under it:
                IMPORTATION OF REFINED SUGAR INTO THE COUNTRY.
              </p>
            </div>

            {(currentContribution.type === "header" ||
              currentContribution.type === "mini-header" ||
              currentContribution.type === "spoken") && (
              <div className="govuk-form-group">
                <label className="govuk-label">
                  {currentContribution.type === "mini-header"
                    ? "Mini-header title"
                    : currentContribution.type === "header"
                      ? "Section header (order of business)"
                      : "Section / topic (optional)"}
                </label>
                <input
                  className="govuk-input"
                  value={currentContribution.sectionHeader || ""}
                  onChange={(e) =>
                    setCurrentContribution({
                      ...currentContribution,
                      sectionHeader: e.target.value,
                    })
                  }
                  placeholder={
                    currentContribution.type === "mini-header"
                      ? 'e.g. "IMPORTATION OF REFINED SUGAR INTO THE COUNTRY"'
                      : 'e.g. "REQUESTS FOR STATEMENTS"'
                  }
                />
              </div>
            )}

            {currentContribution.type === "spoken" && (
              <>
                <div className="govuk-form-group">
                  <label className="govuk-label">Search leader (Supabase)</label>
                  <input
                    className="govuk-input"
                    onChange={(e) => searchLeaders(e.target.value)}
                    placeholder="Type name…"
                  />
                  {isSearchingLeaders && (
                    <p className="govuk-hint">Searching…</p>
                  )}
                  {showLeaderDropdown && leaderSearchResults.length > 0 && (
                    <ul className="govuk-list" style={{ border: "1px solid #b1b4b6", maxHeight: 200, overflow: "auto" }}>
                      {leaderSearchResults.map((l) => (
                        <li key={l.id}>
                          <button
                            type="button"
                            className="govuk-link"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              padding: 8,
                              width: "100%",
                            }}
                            onClick={() => selectLeader(l)}
                          >
                            {l.full_name}
                            {l.constituency ? ` — ${l.constituency}` : ""}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="govuk-form-group">
                  <label className="govuk-label">Speaker name</label>
                  <input
                    className="govuk-input"
                    value={currentContribution.speakerName}
                    onChange={(e) =>
                      setCurrentContribution({
                        ...currentContribution,
                        speakerName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="govuk-form-group">
                  <label className="govuk-label">Title / how addressed</label>
                  <input
                    className="govuk-input"
                    value={currentContribution.speakerTitle || ""}
                    onChange={(e) =>
                      setCurrentContribution({
                        ...currentContribution,
                        speakerTitle: e.target.value,
                      })
                    }
                    placeholder="Hon., The Temporary Speaker, …"
                  />
                </div>
                <div className="govuk-checkboxes">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="isChairContribution"
                      type="checkbox"
                      checked={Boolean(currentContribution.isChairContribution)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCurrentContribution({
                          ...currentContribution,
                          isChairContribution: checked,
                          speakerTitle: checked
                            ? currentContribution.speakerTitle ||
                              PRESIDING_ROLE_LABELS[sitting.presidingRole]
                            : currentContribution.speakerTitle,
                        });
                      }}
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="isChairContribution"
                    >
                      Speaking as Chair (exclude from this Member&apos;s
                      contribution stats)
                    </label>
                  </div>
                </div>
                <p className="govuk-hint">
                  Use for Speaker, Deputy Speaker, or Temporary Speaker
                  interventions while in the chair. Floor speeches by the same
                  person (as MP) should leave this unticked.
                </p>
                <div className="govuk-button-group">
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={() => applyChairRoleToContribution("speaker")}
                  >
                    Mark as The Speaker
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={() =>
                      applyChairRoleToContribution("deputy-speaker")
                    }
                  >
                    Mark as Deputy Speaker
                  </button>
                  <button
                    type="button"
                    className="govuk-button govuk-button--secondary"
                    onClick={() =>
                      applyChairRoleToContribution("temporary-speaker")
                    }
                  >
                    Mark as Temporary Speaker
                  </button>
                </div>
              </>
            )}

            {currentContribution.type !== "header" &&
              currentContribution.type !== "mini-header" && (
              <div className="govuk-form-group">
                <label className="govuk-label">
                  Content / speech (plain text; paragraphs separated by blank
                  lines)
                </label>
                <textarea
                  className="govuk-textarea"
                  rows={10}
                  value={
                    typeof currentContribution.speech === "string"
                      ? currentContribution.speech
                      : speechToPlain(currentContribution)
                  }
                  onChange={(e) =>
                    setCurrentContribution({
                      ...currentContribution,
                      speech: e.target.value,
                      speechPlain: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="govuk-form-group">
              <label className="govuk-label">Start time (optional)</label>
              <input
                className="govuk-input govuk-input--width-10"
                value={currentContribution.startTime || ""}
                onChange={(e) =>
                  setCurrentContribution({
                    ...currentContribution,
                    startTime: e.target.value,
                  })
                }
                placeholder="10:23"
              />
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={saveContribution}
              >
                Save contribution
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={() => {
                  setModalOpen(false);
                  setEditingKey(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
