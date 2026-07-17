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
import {
  ROSTER_CAPACITY_OPTIONS,
  capacityFromTitleText,
  isChairCapacity,
  isPartyLeadershipCapacity,
  rosterCapacitySelectLabel,
  rosterCapacityShortLabel,
  rosterCapacityTitle,
  type RosterCapacity,
} from "@/lib/hansard/roles";

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

type ContributionType =
  | "spoken"
  | "members"
  | "procedural"
  | "header"
  | "mini-header";

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

interface RosterSpeaker {
  /** Stable key — supabase id or local key */
  key: string;
  supabaseLeaderId?: string;
  full_name: string;
  title?: string;
  constituency?: string;
  party?: string;
  role?: string;
  /**
   * Default capacity when this person is clicked:
   * member / party leadership (floor) or speaker / deputy / temporary (chair)
   */
  capacity: RosterCapacity;
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

function capacityFromContribution(c: Contribution): RosterCapacity {
  return capacityFromTitleText(
    c.speakerTitle,
    c.role,
    c.isChairContribution,
  );
}

function capacityRank(c: RosterCapacity): number {
  if (isChairCapacity(c)) return 0;
  if (isPartyLeadershipCapacity(c)) return 1;
  return 2;
}

/** Rebuild quick-pick list when loading a sitting */
function buildRosterFromSitting(
  contributions: Contribution[],
  presiding?: {
    role: PresidingRole;
    displayName: string;
    supabaseLeaderId: string;
  },
): RosterSpeaker[] {
  const byKey = new Map<string, RosterSpeaker>();

  for (const c of contributions) {
    if (c.type !== "spoken") continue;
    if (!c.speakerName?.trim() && !c.supabaseLeaderId) continue;
    const key =
      c.supabaseLeaderId ||
      `name-${c.speakerName!.toLowerCase().replace(/\s+/g, "-")}`;
    const capacity = capacityFromContribution(c);
    const existing = byKey.get(key);
    // Prefer chair, then party leadership, over plain member
    const nextCapacity =
      existing && capacityRank(existing.capacity) <= capacityRank(capacity)
        ? existing.capacity
        : capacity;
    byKey.set(key, {
      key,
      supabaseLeaderId: c.supabaseLeaderId || existing?.supabaseLeaderId,
      full_name: c.speakerName || existing?.full_name || "Unknown",
      title: c.speakerTitle || existing?.title,
      constituency: c.constituency || existing?.constituency,
      party: c.party || existing?.party,
      role: c.role || existing?.role,
      capacity: nextCapacity,
    });
  }

  if (presiding?.supabaseLeaderId || presiding?.displayName) {
    const key =
      presiding.supabaseLeaderId ||
      `name-${presiding.displayName.toLowerCase().replace(/\s+/g, "-")}`;
    const existing = byKey.get(key);
    byKey.set(key, {
      key,
      supabaseLeaderId:
        presiding.supabaseLeaderId || existing?.supabaseLeaderId,
      full_name: presiding.displayName || existing?.full_name || "Presiding",
      title: existing?.title,
      constituency: existing?.constituency,
      party: existing?.party,
      role: existing?.role,
      capacity: presiding.role || existing?.capacity || "temporary-speaker",
    });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const r = capacityRank(a.capacity) - capacityRank(b.capacity);
    if (r !== 0) return r;
    return a.full_name.localeCompare(b.full_name);
  });
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

  /** Speakers for this sitting — pick with one click when entering speeches */
  const [speakerRoster, setSpeakerRoster] = useState<RosterSpeaker[]>([]);
  const [rosterSearchResults, setRosterSearchResults] = useState<
    LeaderSearchResult[]
  >([]);
  const [isSearchingRoster, setIsSearchingRoster] = useState(false);
  const [showRosterDropdown, setShowRosterDropdown] = useState(false);
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");
  /** Capacity applied when adding someone via the compact roster search */
  const [rosterAddCapacity, setRosterAddCapacity] =
    useState<RosterCapacity>("member");
  /** Which roster speaker is selected in the contribution modal */
  const [selectedRosterKey, setSelectedRosterKey] = useState<string | null>(
    null,
  );

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
      // Rebuild quick-pick roster from sitting speakers + presiding officer
      setSpeakerRoster(
        buildRosterFromSitting(mapped, {
          role: presidingRole,
          displayName: po.displayName || "",
          supabaseLeaderId: po.supabaseLeaderId || "",
        }),
      );
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
    setSelectedRosterKey(null);
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
    // Highlight matching roster speaker if any
    const match = speakerRoster.find(
      (s) =>
        (item.supabaseLeaderId && s.supabaseLeaderId === item.supabaseLeaderId) ||
        (item.speakerName &&
          s.full_name.toLowerCase() === item.speakerName.toLowerCase()),
    );
    setSelectedRosterKey(match?.key || null);
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
    } else if (type === "members") {
      if (!speechText.trim()) {
        alert(
          'Content is required for Hon. Members entries (e.g. "Put the question").',
        );
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
      // Group chamber responses always attributed to Hon. Members
      speakerName:
        type === "members"
          ? currentContribution.speakerName?.trim() || "Hon. Members"
          : currentContribution.speakerName,
      supabaseLeaderId:
        type === "members" ? undefined : currentContribution.supabaseLeaderId,
      isChairContribution:
        type === "members" ? false : currentContribution.isChairContribution,
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

  const upsertRosterSpeaker = (
    speaker: Omit<RosterSpeaker, "key"> & { key?: string },
  ) => {
    const key =
      speaker.key ||
      speaker.supabaseLeaderId ||
      `local-${speaker.full_name.toLowerCase().replace(/\s+/g, "-")}`;
    setSpeakerRoster((prev) => {
      const idx = prev.findIndex(
        (s) =>
          s.key === key ||
          (speaker.supabaseLeaderId &&
            s.supabaseLeaderId === speaker.supabaseLeaderId),
      );
      const next: RosterSpeaker = {
        key,
        supabaseLeaderId: speaker.supabaseLeaderId,
        full_name: speaker.full_name,
        title: speaker.title,
        constituency: speaker.constituency,
        party: speaker.party,
        role: speaker.role,
        capacity: speaker.capacity,
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...next, capacity: speaker.capacity };
        return copy;
      }
      return [...prev, next];
    });
    return key;
  };

  const applyRosterSpeaker = (speaker: RosterSpeaker) => {
    const isChair = isChairCapacity(speaker.capacity);
    const title = rosterCapacityTitle(speaker.capacity, speaker.title);
    setSelectedRosterKey(speaker.key);
    setCurrentContribution((c) => ({
      ...c,
      type: "spoken",
      supabaseLeaderId: speaker.supabaseLeaderId,
      speakerName: speaker.full_name || "",
      speakerTitle: title,
      // Store leadership / role label for stats & reload
      role:
        isPartyLeadershipCapacity(speaker.capacity) || isChair
          ? title
          : speaker.role || "",
      constituency: speaker.constituency || "",
      party: speaker.party || "",
      isChairContribution: isChair,
    }));
    setShowLeaderDropdown(false);
    setLeaderSearchResults([]);
  };

  const selectLeader = (leader: LeaderSearchResult) => {
    const key = upsertRosterSpeaker({
      supabaseLeaderId: leader.id,
      full_name: leader.full_name || "",
      title: leader.title,
      constituency: leader.constituency,
      party: leader.party,
      role: leader.role,
      capacity: "member",
    });
    applyRosterSpeaker({
      key,
      supabaseLeaderId: leader.id,
      full_name: leader.full_name || "",
      title: leader.title,
      constituency: leader.constituency,
      party: leader.party,
      role: leader.role,
      capacity: "member",
    });
  };

  const searchRosterLeaders = async (query: string) => {
    setRosterSearchQuery(query);
    if (query.length < 2) {
      setRosterSearchResults([]);
      setShowRosterDropdown(false);
      return;
    }
    setIsSearchingRoster(true);
    try {
      const res = await fetch(
        `/api/leaders/search?q=${encodeURIComponent(query)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setRosterSearchResults(data.leaders || []);
        setShowRosterDropdown(true);
      }
    } catch (err) {
      console.error("Roster leader search failed", err);
    } finally {
      setIsSearchingRoster(false);
    }
  };

  const addLeaderToRoster = (
    leader: LeaderSearchResult,
    capacity: RosterCapacity = "member",
  ) => {
    upsertRosterSpeaker({
      supabaseLeaderId: leader.id,
      full_name: leader.full_name || "",
      title: leader.title,
      constituency: leader.constituency,
      party: leader.party,
      role: leader.role,
      capacity,
    });
    // Keep sitting-level presiding officer in sync when designating chair only
    if (isChairCapacity(capacity)) {
      setSitting((s) => ({
        ...s,
        presidingRole: capacity as PresidingRole,
        presidingName: leader.full_name || s.presidingName,
        presidingLeaderId: leader.id,
      }));
    }
    setRosterSearchQuery("");
    setRosterSearchResults([]);
    setShowRosterDropdown(false);
  };

  const setRosterCapacity = (key: string, capacity: RosterCapacity) => {
    setSpeakerRoster((prev) => {
      const next = prev.map((s) =>
        s.key === key ? { ...s, capacity } : s,
      );
      const sp = next.find((s) => s.key === key);
      // Sync sitting chair only for Speaker / Deputy / Temporary
      if (sp && isChairCapacity(capacity)) {
        queueMicrotask(() => {
          setSitting((s) => ({
            ...s,
            presidingRole: capacity as PresidingRole,
            presidingName: sp.full_name || s.presidingName,
            presidingLeaderId: sp.supabaseLeaderId || s.presidingLeaderId,
          }));
        });
      }
      if (selectedRosterKey === key && sp) {
        queueMicrotask(() => applyRosterSpeaker(sp));
      }
      return next;
    });
  };

  const removeFromRoster = (key: string) => {
    setSpeakerRoster((prev) => prev.filter((s) => s.key !== key));
    if (selectedRosterKey === key) setSelectedRosterKey(null);
  };

  const applyChairRoleToContribution = (role: PresidingRole) => {
    setCurrentContribution((c) => ({
      ...c,
      isChairContribution: true,
      speakerTitle: PRESIDING_ROLE_LABELS[role],
    }));
    // Sync roster capacity if this person is on the roster
    if (currentContribution.supabaseLeaderId) {
      setSpeakerRoster((prev) =>
        prev.map((s) =>
          s.supabaseLeaderId === currentContribution.supabaseLeaderId
            ? { ...s, capacity: role }
            : s,
        ),
      );
    }
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

      {/* Optional extras collapsed so contributions stay near the top */}
      <details className="govuk-details govuk-!-margin-bottom-4">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            Optional: PDF / video / summary / chair notes
            {sitting.presidingName
              ? ` · Chair: ${sitting.presidingName}`
              : ""}
          </span>
        </summary>
        <div className="govuk-details__text">
          <p className="govuk-body-s">
            Prefer designating the Temporary / Deputy Speaker under{" "}
            <strong>Session speakers</strong> above. These fields are optional
            extras.
          </p>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="presidingNotes">
              Chair notes
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
          {sitting.presidingLeaderId && (
            <p className="govuk-body-s">
              Chair linked: {sitting.presidingName || "—"} (
              <code>{sitting.presidingLeaderId.slice(0, 8)}…</code>)
            </p>
          )}
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="pdf">
              Official Hansard PDF URL
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
              Editorial summary
            </label>
            <textarea
              id="summary"
              className="govuk-textarea"
              rows={2}
              value={sitting.editorialSummary || ""}
              onChange={(e) =>
                setSitting({ ...sitting, editorialSummary: e.target.value })
              }
            />
          </div>
        </div>
      </details>

      {/* Compact session speakers — designate role, then pick when adding speech */}
      <div
        style={{
          border: "1px solid #b1b4b6",
          background: "#f3f2f1",
          padding: "12px 14px",
          marginBottom: 20,
        }}
      >
        <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
          Session speakers
        </h2>
        <p
          className="govuk-body-s govuk-!-margin-bottom-2"
          style={{ color: "#505a5f" }}
        >
          Add as Member, party leader/whip, or Chair. Click their chip when
          entering a contribution — title is applied automatically.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label" htmlFor="rosterAddCapacity">
              Add as
            </label>
            <select
              id="rosterAddCapacity"
              className="govuk-select"
              value={rosterAddCapacity}
              onChange={(e) =>
                setRosterAddCapacity(e.target.value as RosterCapacity)
              }
              style={{ minWidth: 200 }}
            >
              <optgroup label="Floor">
                <option value="member">Member</option>
              </optgroup>
              <optgroup label="Party leadership">
                {ROSTER_CAPACITY_OPTIONS.filter((o) => o.group === "party").map(
                  (o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </optgroup>
              <optgroup label="In the Chair">
                {ROSTER_CAPACITY_OPTIONS.filter((o) => o.group === "chair").map(
                  (o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </optgroup>
            </select>
          </div>
          <div
            className="govuk-form-group govuk-!-margin-bottom-0"
            style={{ flex: "1 1 200px", minWidth: 180 }}
          >
            <label className="govuk-label" htmlFor="rosterSearch">
              Search name
            </label>
            <input
              id="rosterSearch"
              className="govuk-input"
              value={rosterSearchQuery}
              onChange={(e) => searchRosterLeaders(e.target.value)}
              placeholder="Type name…"
              autoComplete="off"
            />
          </div>
        </div>
        {isSearchingRoster && (
          <p className="govuk-hint govuk-!-margin-bottom-0 govuk-!-margin-top-1">
            Searching…
          </p>
        )}
        {showRosterDropdown && rosterSearchResults.length > 0 && (
          <ul
            className="govuk-list govuk-!-margin-bottom-0 govuk-!-margin-top-1"
            style={{
              border: "1px solid #b1b4b6",
              maxHeight: 140,
              overflow: "auto",
              background: "#fff",
            }}
          >
            {rosterSearchResults.map((l) => (
              <li key={l.id} style={{ margin: 0 }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f3f2f1",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "6px 10px",
                    width: "100%",
                    fontSize: 15,
                  }}
                  onClick={() => addLeaderToRoster(l, rosterAddCapacity)}
                >
                  <strong>{l.full_name}</strong>
                  {(l.constituency || l.party) && (
                    <span style={{ color: "#505a5f" }}>
                      {" "}
                      — {[l.constituency, l.party].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span style={{ color: "#1d70b8", marginLeft: 6 }}>
                    + {rosterCapacitySelectLabel(rosterAddCapacity)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {speakerRoster.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              maxHeight: 120,
              overflowY: "auto",
            }}
          >
            {[...speakerRoster]
              .sort(
                (a, b) =>
                  capacityRank(a.capacity) - capacityRank(b.capacity) ||
                  a.full_name.localeCompare(b.full_name),
              )
              .map((sp) => (
              <span
                key={sp.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  background: "#fff",
                  border: isChairCapacity(sp.capacity)
                    ? "1px solid #f47738"
                    : isPartyLeadershipCapacity(sp.capacity)
                      ? "1px solid #1d70b8"
                      : "1px solid #b1b4b6",
                  fontSize: 14,
                  borderRadius: 2,
                }}
              >
                {sp.capacity !== "member" && (
                  <span
                    style={{
                      fontSize: 11,
                      color: isChairCapacity(sp.capacity)
                        ? "#b58840"
                        : "#1d70b8",
                      fontWeight: 600,
                    }}
                  >
                    {rosterCapacityShortLabel(sp.capacity)}:
                  </span>
                )}
                <span>{sp.full_name}</span>
                <select
                  aria-label={`Role for ${sp.full_name}`}
                  value={sp.capacity}
                  onChange={(e) =>
                    setRosterCapacity(
                      sp.key,
                      e.target.value as RosterCapacity,
                    )
                  }
                  style={{
                    fontSize: 12,
                    border: "none",
                    background: "transparent",
                    maxWidth: 140,
                    color: "#505a5f",
                  }}
                >
                  <optgroup label="Floor">
                    <option value="member">Member</option>
                  </optgroup>
                  <optgroup label="Party leadership">
                    {ROSTER_CAPACITY_OPTIONS.filter(
                      (o) => o.group === "party",
                    ).map((o) => (
                      <option key={o.value} value={o.value}>
                        {rosterCapacityShortLabel(o.value)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chair">
                    {ROSTER_CAPACITY_OPTIONS.filter(
                      (o) => o.group === "chair",
                    ).map((o) => (
                      <option key={o.value} value={o.value}>
                        {rosterCapacityShortLabel(o.value)}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <button
                  type="button"
                  aria-label={`Remove ${sp.full_name}`}
                  onClick={() => removeFromRoster(sp.key)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#d4351c",
                    fontSize: 16,
                    lineHeight: 1,
                    padding: "0 2px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contributions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 8,
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
                      {contrib.type === "members" && (
                        <span className="govuk-tag govuk-tag--purple">
                          Hon. Members
                        </span>
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
                onChange={(e) => {
                  const next = e.target.value as ContributionType;
                  setCurrentContribution({
                    ...currentContribution,
                    type: next,
                    isChairContribution:
                      next === "spoken"
                        ? currentContribution.isChairContribution
                        : false,
                    speakerName:
                      next === "members"
                        ? currentContribution.speakerName?.trim() ||
                          "Hon. Members"
                        : currentContribution.speakerName,
                    supabaseLeaderId:
                      next === "members"
                        ? undefined
                        : currentContribution.supabaseLeaderId,
                  });
                }}
              >
                <option value="spoken">Spoken contribution (one MP)</option>
                <option value="members">
                  Hon. Members (group / chamber)
                </option>
                <option value="procedural">Procedural note</option>
                <option value="header">Section header (main)</option>
                <option value="mini-header">
                  Mini header (under a section)
                </option>
              </select>
              <p className="govuk-hint">
                Use <strong>Hon. Members</strong> for collective responses
                (&quot;Put the question&quot;, &quot;Which Standing
                Order?&quot;, &quot;Send him out&quot;). Headers: REQUESTS FOR
                STATEMENTS; mini: IMPORTATION OF REFINED SUGAR…
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

            {currentContribution.type === "members" && (
              <div className="govuk-inset-text">
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Chamber speaking as a group. Displayed publicly as{" "}
                  <strong>Hon. Members</strong> with the words below. Not linked
                  to an individual MP and not counted in member stats.
                </p>
              </div>
            )}

            {currentContribution.type === "spoken" && (
              <>
                {/* One-click speaker pick from sitting roster */}
                <div className="govuk-form-group">
                  <label className="govuk-label">Who is speaking?</label>
                  <p className="govuk-hint">
                    Click a name. Role on the roster (Member vs Temporary
                    Speaker) is applied automatically.
                  </p>
                  {speakerRoster.length === 0 ? (
                    <p className="govuk-body-s">
                      No speakers on the roster yet. Add them under{" "}
                      <strong>Speakers for this sitting</strong>, or search
                      below.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {speakerRoster.map((sp) => {
                        const selected = selectedRosterKey === sp.key;
                        const isChair = isChairCapacity(sp.capacity);
                        const isParty = isPartyLeadershipCapacity(sp.capacity);
                        return (
                          <button
                            key={sp.key}
                            type="button"
                            onClick={() => applyRosterSpeaker(sp)}
                            style={{
                              cursor: "pointer",
                              padding: "8px 12px",
                              border: selected
                                ? "2px solid #1d70b8"
                                : isChair
                                  ? "1px solid #f47738"
                                  : isParty
                                    ? "1px solid #1d70b8"
                                    : "1px solid #b1b4b6",
                              background: selected ? "#e8f1f8" : "#fff",
                              fontWeight: selected ? 700 : 400,
                              textAlign: "left",
                              maxWidth: 280,
                            }}
                          >
                            <span style={{ display: "block" }}>
                              {sp.full_name}
                            </span>
                            <span
                              style={{
                                display: "block",
                                fontSize: 12,
                                color: isChair
                                  ? "#b58840"
                                  : isParty
                                    ? "#1d70b8"
                                    : "#505a5f",
                                marginTop: 2,
                              }}
                            >
                              {rosterCapacitySelectLabel(sp.capacity)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <details className="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      Not on the list? Search / edit speaker details
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <div className="govuk-form-group">
                      <label className="govuk-label">
                        Search leader (Supabase) — also adds to roster
                      </label>
                      <input
                        className="govuk-input"
                        onChange={(e) => searchLeaders(e.target.value)}
                        placeholder="Type name…"
                      />
                      {isSearchingLeaders && (
                        <p className="govuk-hint">Searching…</p>
                      )}
                      {showLeaderDropdown && leaderSearchResults.length > 0 && (
                        <ul
                          className="govuk-list"
                          style={{
                            border: "1px solid #b1b4b6",
                            maxHeight: 200,
                            overflow: "auto",
                          }}
                        >
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
                      <label className="govuk-label">
                        Title / how addressed
                      </label>
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
                          checked={Boolean(
                            currentContribution.isChairContribution,
                          )}
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
                          Speaking as Chair (exclude from member stats)
                        </label>
                      </div>
                    </div>
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
                  </div>
                </details>

                {currentContribution.speakerName && (
                  <p className="govuk-body-s">
                    Selected:{" "}
                    <strong>
                      {currentContribution.isChairContribution
                        ? `${currentContribution.speakerTitle || "Chair"} — `
                        : ""}
                      {currentContribution.speakerName}
                    </strong>
                    {currentContribution.supabaseLeaderId
                      ? " (linked)"
                      : " (not linked)"}
                  </p>
                )}
              </>
            )}

            {currentContribution.type !== "header" &&
              currentContribution.type !== "mini-header" && (
              <div className="govuk-form-group">
                <label className="govuk-label">
                  {currentContribution.type === "members"
                    ? "What Hon. Members said"
                    : "Content / speech (plain text; paragraphs separated by blank lines)"}
                </label>
                <textarea
                  className="govuk-textarea"
                  rows={currentContribution.type === "members" ? 4 : 10}
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
                  placeholder={
                    currentContribution.type === "members"
                      ? "e.g. Put the question! / Which Standing Order? / Send him out!"
                      : undefined
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
