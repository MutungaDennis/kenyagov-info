"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import {
  DEFAULT_VERIFICATION_STATUS,
  VERIFICATION_FIELD_HINT,
  VERIFICATION_STATUS_OPTIONS,
  normalizeVerificationStatus,
} from "@/lib/verification";

// ============================================
// TYPES
// ============================================
type Term = {
  id?: string;
  term_number: number;
  start_date: string;
  end_date: string;
  party_id: string;
  ward_id: string;
  votes_garnered: number | null | undefined; // ✅ FIXED: Allow undefined
  assembly_role: string;
  reason_for_exit: string;
  successor_mca_id: string;
  political_parties?: { name: string; abbreviation: string } | null;
  wards?: { name: string } | null;
};

type SocialMedia = {
  id: string;
  platform: string;
  url: string;
};

const SOCIAL_PLATFORMS = [
  { value: "X (Twitter)", label: "X (Twitter)" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Website", label: "Official Website" },
  { value: "Other", label: "Other" },
];

const EXIT_REASONS = [
  "N/A",
  "Death",
  "Resignation",
  "Impeachment",
  "Court Nullification",
  "Party Expulsion",
  "Lost Election",
  "Term Ended",
  "Appointed to Other Office",
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function EditMCAPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const mcaId =
    typeof rawId === "string" && rawId !== "undefined" && rawId !== "null" && rawId.length >= 10
      ? rawId
      : null;

  // ============================================
  // STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<any>({
    first_name: "",
    other_names: "",
    surname: "",
    gender: "Male",
    education_level: "",
    bio: "",
    seat_type: "Elected",
    nomination_category: "N/A",
    county_id: "",
    status: "Active",
    verification_status: "Unverified",
    official_email: "",
    ward_office_location: "",
    committees: "",
    slug: "",
  });

  const [lookups, setLookups] = useState<{
    counties: any[];
    wards: any[];
    parties: any[];
  }>({ counties: [], wards: [], parties: [] });

  const [terms, setTerms] = useState<Term[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [showNewTermForm, setShowNewTermForm] = useState(false);
  const [newTerm, setNewTerm] = useState<Partial<Term>>({
    term_number: 1,
    start_date: "",
    end_date: "",
    party_id: "",
    ward_id: "",
    votes_garnered: null,
    assembly_role: "Member of the County Assembly",
    reason_for_exit: "N/A",
    successor_mca_id: "",
  });

  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "X (Twitter)", url: "" });
  const [showAddSocial, setShowAddSocial] = useState(false);

  const [successorSearch, setSuccessorSearch] = useState("");
  const [successorDisplayName, setSuccessorDisplayName] = useState("");
  const successorSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // HELPERS
  // ============================================
  const normalizeField = (value: any): string => {
    if (value === null || value === undefined || value === "null" || value === "undefined") {
      return "";
    }
    return String(value);
  };

  const sanitizeUUID = (value: any): string | null => {
    if (!value || value === "undefined" || value === "" || value === "null") {
      return null;
    }
    return value;
  };

  const fullName = [formData.first_name, formData.other_names, formData.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const publicUrl = formData.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/government/people/${formData.slug}`
    : "";

  const isElected = formData.seat_type === "Elected";
  const isNominated = formData.seat_type === "Nominated";
  const isUnpublished = formData.status === "Unpublished";

  // ============================================
  // AUTO-SET LOGIC
  // ============================================
  useEffect(() => {
    if (isElected && formData.nomination_category !== "N/A") {
      setFormData((prev: any) => ({ ...prev, nomination_category: "N/A" }));
    }
  }, [formData.seat_type]);

  // ============================================
  // INITIAL DATA LOAD
  // ============================================
  useEffect(() => {
    if (!mcaId) {
      router.replace(adminPath("mcas"));
      return;
    }

    const fetchData = async () => {
      try {
        const [mcaRes, lookupsRes] = await Promise.all([
          fetch(`/api/admin/mcas/${mcaId}`),
          fetch("/api/admin/lookups"),
        ]);

        const mcaData = await mcaRes.json();
        if (mcaRes.ok) {
          setFormData({
            first_name: normalizeField(mcaData.data.first_name),
            other_names: normalizeField(mcaData.data.other_names),
            surname: normalizeField(mcaData.data.surname),
            gender: normalizeField(mcaData.data.gender) || "Male",
            education_level: normalizeField(mcaData.data.education_level),
            bio: normalizeField(mcaData.data.bio),
            seat_type: normalizeField(mcaData.data.seat_type) || "Elected",
            nomination_category: normalizeField(mcaData.data.nomination_category) || "N/A",
            county_id: normalizeField(mcaData.data.county_id),
            status: normalizeField(mcaData.data.status) || "Active",
            verification_status: normalizeVerificationStatus(
              mcaData.data.verification_status ?? DEFAULT_VERIFICATION_STATUS,
            ),
            official_email: normalizeField(mcaData.data.official_email),
            ward_office_location: normalizeField(mcaData.data.ward_office_location),
            committees: Array.isArray(mcaData.data.committees)
              ? mcaData.data.committees.join(", ")
              : normalizeField(mcaData.data.committees),
            slug: normalizeField(mcaData.data.slug),
          });

          if (mcaData.data.successor_mca_id) {
            loadSuccessorDisplayName(mcaData.data.successor_mca_id);
          }
        } else {
          setError(mcaData.error || "Failed to load MCA data");
        }

        if (lookupsRes.ok) {
          setLookups(await lookupsRes.json());
        }

        loadTerms();
        loadSocialMedia();
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mcaId, router]);

  // ============================================
  // TERMS MANAGEMENT
  // ============================================
  /** type="date" needs YYYY-MM-DD only */
  const toDateInput = (v: unknown): string => {
    if (v == null || v === "" || v === "null") return "";
    return String(v).slice(0, 10);
  };

  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}/terms`);
      const json = await res.json();
      if (res.ok) {
        const normalized: Term[] = (json.data || []).map((t: Term) => ({
          ...t,
          start_date: toDateInput(t.start_date),
          end_date: toDateInput(t.end_date),
          party_id: t.party_id || "",
          ward_id: t.ward_id || "",
          successor_mca_id: t.successor_mca_id || "",
        }));
        setTerms(normalized);
        const maxTerm = normalized.reduce(
          (max: number, t: Term) => Math.max(max, t.term_number),
          0
        );
        setNewTerm((prev) => ({ ...prev, term_number: (maxTerm || 0) + 1 }));
      }
    } catch (err) {
      console.error("Failed to load terms:", err);
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleAddTermWith = async (termData: Partial<Term>) => {
    setSaving(true);
    setError(null);

    if (!termData.start_date) {
      setError("Start date is required for each term.");
      setSaving(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = {
        ...termData,
        start_date: toDateInput(termData.start_date),
        end_date: toDateInput(termData.end_date) || null,
        party_id: sanitizeUUID(termData.party_id),
        ward_id: sanitizeUUID(termData.ward_id),
        votes_garnered: termData.votes_garnered ? Number(termData.votes_garnered) : null,
        successor_mca_id: sanitizeUUID(termData.successor_mca_id),
      };

      const res = await fetch(`/api/admin/mcas/${mcaId}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add term");

      setSuccess(`Term ${termData.term_number} added successfully!`);
      setShowNewTermForm(false);
      setNewTerm({
        term_number: (termData.term_number || 1) + 1,
        start_date: "",
        end_date: "",
        party_id: "",
        ward_id: "",
        votes_garnered: null,
        assembly_role: "Member of the County Assembly",
        reason_for_exit: "N/A",
        successor_mca_id: "",
      });
      await loadTerms();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTerm = async (term: Term) => {
    setSaving(true);
    setError(null);

    if (!term.start_date) {
      setError("Start date is required for each term.");
      setSaving(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = {
        termId: term.id,
        term_number: term.term_number,
        start_date: toDateInput(term.start_date),
        end_date: toDateInput(term.end_date) || null,
        party_id: sanitizeUUID(term.party_id),
        ward_id: sanitizeUUID(term.ward_id),
        votes_garnered: term.votes_garnered ? Number(term.votes_garnered) : null,
        assembly_role: term.assembly_role,
        reason_for_exit: term.reason_for_exit,
        successor_mca_id: sanitizeUUID(term.successor_mca_id),
      };

      const res = await fetch(`/api/admin/mcas/${mcaId}/terms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update term");

      setSuccess(`Term ${term.term_number} updated successfully!`);
      setEditingTermId(null);
      await loadTerms();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTerm = async (term: Term) => {
    if (!confirm(`Delete Term ${term.term_number}? This cannot be undone.`)) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}/terms?termId=${term.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete term");

      setSuccess(`Term ${term.term_number} deleted successfully!`);
      await loadTerms();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // SOCIAL MEDIA MANAGEMENT
  // ============================================
  const loadSocialMedia = async () => {
    setLoadingSocial(true);
    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}/social`);
      const json = await res.json();
      if (res.ok) {
        setSocialMedia(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load social media:", err);
    } finally {
      setLoadingSocial(false);
    }
  };

  const handleAddSocial = async () => {
    if (!newSocial.url.trim()) {
      setError("URL is required");
      return;
    }

    let url = newSocial.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: newSocial.platform, url }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add social media");

      setSuccess("Social media link added!");
      setNewSocial({ platform: "X (Twitter)", url: "" });
      setShowAddSocial(false);
      await loadSocialMedia();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocial = async (social: SocialMedia) => {
    if (!confirm(`Delete ${social.platform} link?`)) return;

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}/social?socialId=${social.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setSuccess("Social media link removed!");
      await loadSocialMedia();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    }
  };

  // ============================================
  // SUCCESSOR SEARCH
  // ============================================
  const loadSuccessorDisplayName = async (successorId: string) => {
    try {
      const res = await fetch(`/api/admin/mcas/${successorId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const name = [json.data.first_name, json.data.other_names, json.data.surname]
          .filter(Boolean)
          .join(" ")
          .trim();
        setSuccessorDisplayName(name);
        setSuccessorSearch(name);
      }
    } catch (err) {
      console.error("Failed to load successor name:", err);
    }
  };

  // ============================================
  // MAIN FORM SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
      slug: formData.slug || null,
      committees: formData.committees
        ? formData.committees.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      ward_id: null,
      party_id: null,
      votes_garnered: null,
      term_start_date: null,
      term_end_date: null,
      reason_for_exit: "N/A",
      successor_mca_id: null,
      term_count: terms.length || 1,
    };

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");

      setSuccess("MCA profile updated successfully!");
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // PUBLISH/UNPUBLISH
  // ============================================
  const handleUnpublish = async () => {
    if (!confirm("Unpublish this MCA? They will be hidden from public view.")) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "Unpublished" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to unpublish");
      setFormData({ ...formData, status: "Unpublished" });
      setSuccess("MCA unpublished successfully.");
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleRepublish = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mcas/${mcaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "Active" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to republish");
      setFormData({ ...formData, status: "Active" });
      setSuccess("MCA republished successfully.");
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAutoGenerateSlug = () => {
    const name = `${formData.first_name} ${formData.other_names || ""} ${formData.surname}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({ ...formData, slug: name });
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-body-l">Loading MCA data...</div>
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="govuk-width-container">
      <Link href={adminPath("mcas")} className="govuk-back-link">
        Back to MCAs
      </Link>

      <main className="govuk-main-wrapper">
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              Edit MCA
              {isUnpublished && (
                <span className="govuk-tag govuk-tag--red govuk-!-margin-left-2">UNPUBLISHED</span>
              )}
              {formData.status === "Vacated" && (
                <span className="govuk-tag govuk-tag--grey govuk-!-margin-left-2">VACATED</span>
              )}
            </h1>
            <p className="govuk-body-l govuk-!-margin-bottom-1">
              <strong>{fullName || "Unnamed MCA"}</strong>
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              <span className="govuk-hint">
                {lookups.counties.find((c) => c.id === formData.county_id)?.name || "No county"}
                {" · "}
                {terms.length} term{terms.length !== 1 ? "s" : ""} recorded
              </span>
            </p>
          </div>

          {publicUrl && (
            <div
              style={{
                background: "#f3f2f1",
                padding: "12px 16px",
                borderLeft: "4px solid #1d70b8",
                minWidth: "320px",
              }}
            >
              <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                Public Profile URL
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="govuk-input"
                  style={{ fontSize: "13px", fontFamily: "monospace", flex: 1 }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  style={{ fontSize: "14px", padding: "5px 10px" }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <Link
                href={`/government/people/${formData.slug}`}
                className="govuk-link govuk-!-font-size-14"
                target="_blank"
                style={{ marginTop: "4px", display: "inline-block" }}
              >
                View public profile ↗
              </Link>
            </div>
          )}
        </div>

        {isUnpublished && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              This MCA is currently unpublished and hidden from public view.
            </strong>
          </div>
        )}

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
            <p className="govuk-notification-banner__heading">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PERSONAL DETAILS */}
          <h2 className="govuk-heading-l">1. Personal Details</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="first_name">First Name *</label>
                <input
                  id="first_name"
                  className="govuk-input"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="other_names">Other Names</label>
                <input
                  id="other_names"
                  className="govuk-input"
                  value={formData.other_names}
                  onChange={(e) => setFormData({ ...formData, other_names: e.target.value })}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="surname">Surname *</label>
                <input
                  id="surname"
                  className="govuk-input"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* SLUG FIELD */}
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="slug">URL Slug</label>
            <span className="govuk-hint">
              Auto-generated from name, but can be manually edited. Use lowercase letters, numbers,
              and hyphens only.
              <br />
              Example: <code>john-doe</code> → URL will be <code>/government/people/john-doe</code>
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                id="slug"
                className="govuk-input"
                value={formData.slug}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  setFormData({ ...formData, slug: value });
                }}
                placeholder="e.g. john-doe"
                pattern="[a-z0-9-]+"
                style={{ fontFamily: "monospace" }}
              />
              <button
                type="button"
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                onClick={handleAutoGenerateSlug}
                style={{ fontSize: "14px", padding: "5px 10px" }}
              >
                Auto-generate
              </button>
            </div>
            {publicUrl && (
              <p className="govuk-body-s govuk-!-margin-top-2">
                <strong>Preview:</strong>{" "}
                <span style={{ fontFamily: "monospace", color: "#1d70b8" }}>{publicUrl}</span>
              </p>
            )}
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  className="govuk-select govuk-!-width-full"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="education_level">Education Level</label>
                <input
                  id="education_level"
                  className="govuk-input"
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  placeholder="e.g. Bachelor of Laws"
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="county_id">County *</label>
                <select
                  id="county_id"
                  className="govuk-select govuk-!-width-full"
                  value={formData.county_id}
                  onChange={(e) => setFormData({ ...formData, county_id: e.target.value })}
                  required
                >
                  <option value="">Select County</option>
                  {lookups.counties.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="bio">Biography</label>
            <span className="govuk-hint">
              Brief professional biography. Appears on the public profile page.
            </span>
            <textarea
              id="bio"
              className="govuk-textarea"
              rows={5}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Hon. Mark Gicheru is a seasoned legal practitioner..."
            />
          </div>

          {/* SECTION 2: STATUS & PUBLISHING */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">2. Status & Publishing</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="status">Publication Status *</label>
                <select
                  id="status"
                  className="govuk-select govuk-!-width-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Active">Active (Visible to public)</option>
                  <option value="Vacated">Vacated (Left office, still visible)</option>
                  <option value="Unpublished">Unpublished (Hidden from public)</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="verification_status">
                  Verification
                </label>
                <div id="mca-verification-hint" className="govuk-hint">
                  {VERIFICATION_FIELD_HINT}
                </div>
                <select
                  id="verification_status"
                  className="govuk-select govuk-!-width-full"
                  aria-describedby="mca-verification-hint"
                  value={formData.verification_status || DEFAULT_VERIFICATION_STATUS}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verification_status: e.target.value,
                    })
                  }
                >
                  {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="seat_type">Seat Type *</label>
                <select
                  id="seat_type"
                  className="govuk-select govuk-!-width-full"
                  value={formData.seat_type}
                  onChange={(e) => setFormData({ ...formData, seat_type: e.target.value })}
                  required
                >
                  <option value="Elected">Elected</option>
                  <option value="Nominated">Nominated</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="nomination_category">
                  Nomination Category
                  {isElected && (
                    <span className="govuk-hint govuk-!-display-inline govuk-!-margin-left-2">
                      (Not applicable for Elected)
                    </span>
                  )}
                </label>
                <select
                  id="nomination_category"
                  className="govuk-select govuk-!-width-full"
                  value={formData.nomination_category}
                  onChange={(e) => setFormData({ ...formData, nomination_category: e.target.value })}
                  disabled={isElected}
                  style={isElected ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                >
                  <option value="N/A">N/A</option>
                  <option value="Gender Top-up">Gender Top-up</option>
                  <option value="PWD">PWD</option>
                  <option value="Youth">Youth</option>
                  <option value="Marginalized">Marginalized</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: ELECTORAL TERMS */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">
            3. Electoral Terms
            <span className="govuk-tag govuk-!-margin-left-2">{terms.length} recorded</span>
          </h2>
          <p className="govuk-body">
            Record each term this MCA has served (start and end dates). Use{" "}
            <strong>Edit</strong> on a term to change dates, party, ward, or exit reason.
            Leave <strong>End date</strong> blank for the current term. Saving a term also updates
            the public profile dates on{" "}
            <code>/government/people</code>.
          </p>

          {loadingTerms ? (
            <p className="govuk-body">Loading terms...</p>
          ) : terms.length === 0 ? (
            <div
              style={{
                background: "#fff4cf",
                border: "1px solid #ffdd00",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <p className="govuk-body govuk-!-margin-bottom-0">
                <strong>No terms recorded yet.</strong> Add the first term below.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "16px" }}>
              {terms.map((term) => {
                const isEditing = editingTermId === term.id;
                const isCurrentTerm = !term.end_date && term.reason_for_exit === "N/A";

                return (
                  <div
                    key={term.id}
                    style={{
                      background: isCurrentTerm ? "#e6f4ea" : "#f3f2f1",
                      border: `1px solid ${isCurrentTerm ? "#00703c" : "#b1b4b6"}`,
                      borderLeft: `4px solid ${isCurrentTerm ? "#00703c" : "#505a5f"}`,
                      padding: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    {!isEditing ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                              Term {term.term_number}
                              {isCurrentTerm && (
                                <span className="govuk-tag govuk-tag--green govuk-!-margin-left-2">
                                  CURRENT
                                </span>
                              )}
                            </h3>
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>
                                {term.start_date || "—"} → {term.end_date || "Present"}
                              </strong>
                              {!term.start_date && (
                                <span className="govuk-error-message govuk-!-display-inline govuk-!-margin-left-2">
                                  Add a start date
                                </span>
                              )}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => setEditingTermId(term.id!)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                font: "inherit",
                                textDecoration: "underline",
                                color: "#1d70b8",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTerm(term)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                font: "inherit",
                                textDecoration: "underline",
                                color: "#d4351c",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="govuk-grid-row">
                          <div className="govuk-grid-column-one-half">
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>Party:</strong>{" "}
                              {term.political_parties?.abbreviation ||
                                term.political_parties?.name ||
                                "—"}
                            </p>
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>Ward:</strong> {term.wards?.name || "County-wide (Nominated)"}
                            </p>
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>Role:</strong> {term.assembly_role}
                            </p>
                          </div>
                          <div className="govuk-grid-column-one-half">
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>Votes:</strong>{" "}
                              {term.votes_garnered?.toLocaleString() || "—"}
                            </p>
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>Exit Reason:</strong> {term.reason_for_exit}
                            </p>
                            {term.end_date && (
                              <p className="govuk-body-s govuk-!-margin-bottom-0">
                                <strong>Ended:</strong> {term.end_date}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <TermEditor
                        term={term}
                        lookups={lookups}
                        countyId={formData.county_id}
                        onSave={handleUpdateTerm}
                        onCancel={() => setEditingTermId(null)}
                        saving={saving}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!showNewTermForm ? (
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setShowNewTermForm(true)}
            >
              + Add another term
            </button>
          ) : (
            <div
              style={{
                background: "#f3f2f1",
                border: "2px solid #1d70b8",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h3 className="govuk-heading-s">Add New Term</h3>
              <TermEditor
                term={{
                  term_number: newTerm.term_number || terms.length + 1,
                  start_date: newTerm.start_date || "",
                  end_date: newTerm.end_date || "",
                  party_id: newTerm.party_id || "",
                  ward_id: newTerm.ward_id || "",
                  votes_garnered: newTerm.votes_garnered,
                  assembly_role: newTerm.assembly_role || "Member of the County Assembly",
                  reason_for_exit: newTerm.reason_for_exit || "N/A",
                  successor_mca_id: newTerm.successor_mca_id || "",
                }}
                lookups={lookups}
                countyId={formData.county_id}
                onSave={(updatedTerm) => {
                  setNewTerm(updatedTerm);
                  handleAddTermWith(updatedTerm);
                }}
                onCancel={() => setShowNewTermForm(false)}
                saving={saving}
                isNew={true}
              />
            </div>
          )}

          {/* SECTION 4: SOCIAL MEDIA */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">4. Social Media</h2>
          <p className="govuk-body">Add official social media profiles. One at a time.</p>

          {loadingSocial ? (
            <p className="govuk-body">Loading social media...</p>
          ) : socialMedia.length > 0 ? (
            <div style={{ marginBottom: "16px" }}>
              {socialMedia.map((social) => (
                <div
                  key={social.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#f3f2f1",
                    borderLeft: "4px solid #1d70b8",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <strong>{social.platform}:</strong>{" "}
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govuk-link"
                      style={{ wordBreak: "break-all" }}
                    >
                      {social.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSocial(social)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#d4351c",
                      textDecoration: "underline",
                      font: "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="govuk-hint">No social media links added yet.</p>
          )}

          {!showAddSocial ? (
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => setShowAddSocial(true)}
            >
              + Add social media link
            </button>
          ) : (
            <div
              style={{
                background: "#f3f2f1",
                border: "2px solid #1d70b8",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h3 className="govuk-heading-s">Add Social Media Link</h3>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="social_platform">Platform</label>
                    <select
                      id="social_platform"
                      className="govuk-select govuk-!-width-full"
                      value={newSocial.platform}
                      onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="govuk-grid-column-two-thirds">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="social_url">URL</label>
                    <input
                      id="social_url"
                      type="text"
                      className="govuk-input"
                      value={newSocial.url}
                      onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                      placeholder="e.g. https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>
              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button"
                  onClick={handleAddSocial}
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add link"}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={() => {
                    setShowAddSocial(false);
                    setNewSocial({ platform: "X (Twitter)", url: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: CONTACT & COMMITTEES */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">5. Contact & Committees</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="official_email">Official Email</label>
                <input
                  id="official_email"
                  type="email"
                  className="govuk-input"
                  value={formData.official_email}
                  onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="ward_office_location">Ward Office Location</label>
                <input
                  id="ward_office_location"
                  className="govuk-input"
                  value={formData.ward_office_location}
                  onChange={(e) => setFormData({ ...formData, ward_office_location: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="committees">Committee Memberships</label>
            <span className="govuk-hint">Comma separated, e.g. Health, Finance, Public Accounts</span>
            <textarea
              id="committees"
              className="govuk-textarea"
              rows={3}
              value={formData.committees}
              onChange={(e) => setFormData({ ...formData, committees: e.target.value })}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="govuk-button-group govuk-!-margin-top-8">
            <button type="submit" className="govuk-button" disabled={saving}>
              {saving ? "Saving…" : "Save all changes"}
            </button>

            {isUnpublished ? (
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleRepublish}
                disabled={saving}
              >
                Republish (Make visible)
              </button>
            ) : (
              <button
                type="button"
                className="govuk-button"
                onClick={handleUnpublish}
                disabled={saving}
                style={{ background: "#d4351c" }}
              >
                Unpublish (Hide from public)
              </button>
            )}

            <Link href={adminPath("mcas")} className="govuk-button govuk-button--secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

// ============================================
// TERM EDITOR SUB-COMPONENT
// ============================================
function TermEditor({
  term,
  lookups,
  countyId,
  onSave,
  onCancel,
  saving,
  isNew = false,
}: {
  term: Term;
  lookups: any;
  countyId: string;
  onSave: (term: Term) => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  const [localTerm, setLocalTerm] = useState<Term>(term);
  const [successorSearch, setSuccessorSearch] = useState("");
  const [successorResults, setSuccessorResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableWards = lookups.wards.filter((w: any) => w.county_id === countyId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (successorSearch.length < 2) {
      setSuccessorResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/mcas/search?q=${encodeURIComponent(successorSearch)}&exclude=${localTerm.id || ""}&limit=10`
        );
        const json = await res.json();
        if (res.ok) {
          setSuccessorResults(json.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [successorSearch]);

  const handleSave = () => {
    onSave(localTerm);
  };

  return (
    <div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label">Term Number</label>
            <input
              type="number"
              className="govuk-input"
              value={localTerm.term_number}
              onChange={(e) => setLocalTerm({ ...localTerm, term_number: Number(e.target.value) })}
              min={1}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label">Start Date *</label>
            <input
              type="date"
              className="govuk-input"
              value={localTerm.start_date}
              onChange={(e) => setLocalTerm({ ...localTerm, start_date: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label">End Date</label>
            <span className="govuk-hint govuk-!-font-size-14">Leave blank if current</span>
            <input
              type="date"
              className="govuk-input"
              value={localTerm.end_date}
              onChange={(e) => setLocalTerm({ ...localTerm, end_date: e.target.value })}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label">Political Party</label>
            <select
              className="govuk-select govuk-!-width-full"
              value={localTerm.party_id}
              onChange={(e) => setLocalTerm({ ...localTerm, party_id: e.target.value })}
            >
              <option value="">Select Party</option>
              {lookups.parties.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.abbreviation} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label">Ward</label>
            <span className="govuk-hint govuk-!-font-size-14">Leave blank for nominated</span>
            <select
              className="govuk-select govuk-!-width-full"
              value={localTerm.ward_id}
              onChange={(e) => setLocalTerm({ ...localTerm, ward_id: e.target.value })}
            >
              <option value="">County-wide (Nominated)</option>
              {availableWards.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label">Votes Garnered</label>
            <input
              type="number"
              className="govuk-input"
              value={localTerm.votes_garnered ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setLocalTerm({
                  ...localTerm,
                  votes_garnered: value === "" ? null : Number(value),
                });
              }}
              placeholder="e.g. 1500"
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label">Assembly Role</label>
            <input
              type="text"
              className="govuk-input"
              value={localTerm.assembly_role}
              onChange={(e) => setLocalTerm({ ...localTerm, assembly_role: e.target.value })}
              placeholder="e.g. Speaker, Majority Leader"
            />
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label">Reason for Exit</label>
            <select
              className="govuk-select govuk-!-width-full"
              value={localTerm.reason_for_exit}
              onChange={(e) => setLocalTerm({ ...localTerm, reason_for_exit: e.target.value })}
            >
              {EXIT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label">Successor MCA</label>
            <span className="govuk-hint govuk-!-font-size-14">
              Search by name (only if this term ended)
            </span>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <input
                type="text"
                className="govuk-input"
                value={successorSearch}
                onChange={(e) => {
                  setSuccessorSearch(e.target.value);
                  if (e.target.value === "") {
                    setLocalTerm({ ...localTerm, successor_mca_id: "" });
                  }
                }}
                placeholder="Type to search..."
                autoComplete="off"
              />
              {successorSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSuccessorSearch("");
                    setLocalTerm({ ...localTerm, successor_mca_id: "" });
                  }}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#d4351c",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </button>
              )}
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "2px solid #1d70b8",
                    maxHeight: "250px",
                    overflowY: "auto",
                    zIndex: 100,
                  }}
                >
                  {searching ? (
                    <div style={{ padding: "12px", color: "#505a5f" }}>Searching...</div>
                  ) : successorResults.length === 0 ? (
                    <div style={{ padding: "12px", color: "#505a5f" }}>No MCAs found</div>
                  ) : (
                    successorResults.map((mca) => {
                      const name = [mca.first_name, mca.other_names, mca.surname]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <button
                          key={mca.id}
                          type="button"
                          onClick={() => {
                            setLocalTerm({ ...localTerm, successor_mca_id: mca.id });
                            setSuccessorSearch(name);
                            setShowDropdown(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            background: "white",
                            border: "none",
                            borderBottom: "1px solid #f3f2f1",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f2f1")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                        >
                          <strong>{name}</strong>
                          <div style={{ fontSize: "13px", color: "#505a5f" }}>
                            {mca.wards?.name} · {mca.counties?.name} ·{" "}
                            {mca.political_parties?.abbreviation}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            {localTerm.successor_mca_id && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "4px 8px",
                  background: "#e6f4ea",
                  borderLeft: "3px solid #00703c",
                  fontSize: "13px",
                }}
              >
                ✓ Successor selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="govuk-button-group govuk-!-margin-top-4">
        <button
          type="button"
          className="govuk-button govuk-!-margin-bottom-0"
          onClick={handleSave}
          disabled={saving || !localTerm.start_date}
        >
          {saving ? "Saving..." : isNew ? "Add term" : "Save term"}
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}