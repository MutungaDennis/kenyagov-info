"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";

export default function NewMCAPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    first_name: "",
    other_names: "",
    surname: "",
    gender: "Male",
    seat_type: "Elected",
    nomination_category: "N/A",
    county_id: "",
    status: "Active",
    slug: "",
  });

  // Initial term data (every MCA needs at least one term)
  const [termData, setTermData] = useState<any>({
    start_date: "2022-09-08",
    party_id: "",
    ward_id: "",
    votes_garnered: "",
    assembly_role: "Member of the County Assembly",
  });

  const [lookups, setLookups] = useState<{
    counties: any[];
    wards: any[];
    parties: any[];
  }>({ counties: [], wards: [], parties: [] });

  // Load lookups
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await fetch("/api/admin/lookups");
        if (res.ok) {
          setLookups(await res.json());
        }
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    };
    fetchLookups();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    const name = `${formData.first_name} ${formData.other_names || ""} ${formData.surname}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    if (name.length >= 3) {
      setFormData((prev: any) => ({ ...prev, slug: name }));
    }
  }, [formData.first_name, formData.other_names, formData.surname]);

  // Auto-set nomination_category to N/A when seat_type is Elected
  useEffect(() => {
    if (formData.seat_type === "Elected" && formData.nomination_category !== "N/A") {
      setFormData((prev: any) => ({ ...prev, nomination_category: "N/A" }));
    }
  }, [formData.seat_type]);

  // Filter wards by county
  const availableWards = lookups.wards.filter((w: any) => w.county_id === formData.county_id);

  const isElected = formData.seat_type === "Elected";
  const isNominated = formData.seat_type === "Nominated";

  const sanitizeUUID = (value: any): string | null => {
    if (!value || value === "undefined" || value === "" || value === "null") {
      return null;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validation
    if (!formData.first_name.trim() || !formData.surname.trim()) {
      setError("First name and surname are required");
      setSaving(false);
      return;
    }

    if (!formData.county_id) {
      setError("County is required");
      setSaving(false);
      return;
    }

    if (isElected && !termData.ward_id) {
      setError("Ward is required for elected MCAs");
      setSaving(false);
      return;
    }

    if (!termData.start_date) {
      setError("Term start date is required");
      setSaving(false);
      return;
    }

    try {
      // Step 1: Create the MCA
      const mcaPayload = {
        first_name: formData.first_name.trim(),
        other_names: formData.other_names.trim() || null,
        surname: formData.surname.trim(),
        gender: formData.gender,
        seat_type: formData.seat_type,
        nomination_category: isElected ? "N/A" : formData.nomination_category,
        county_id: formData.county_id,
        status: formData.status,
        slug: formData.slug,
        assembly_role: "Member of the County Assembly",
        term_count: 1,
      };

      const mcaRes = await fetch("/api/admin/mcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mcaPayload),
      });

      const mcaJson = await mcaRes.json();
      if (!mcaRes.ok) {
        throw new Error(mcaJson.error || "Failed to create MCA");
      }

      const newMcaId = mcaJson.data.id;

      // Step 2: Create the first term
      const termPayload = {
        term_number: 1,
        start_date: termData.start_date,
        end_date: null,
        party_id: sanitizeUUID(termData.party_id),
        ward_id: isElected ? sanitizeUUID(termData.ward_id) : null,
        votes_garnered: termData.votes_garnered ? Number(termData.votes_garnered) : null,
        assembly_role: termData.assembly_role,
        reason_for_exit: "N/A",
        successor_mca_id: null,
      };

      const termRes = await fetch(`/api/admin/mcas/${newMcaId}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(termPayload),
      });

      if (!termRes.ok) {
        const termJson = await termRes.json();
        throw new Error(termJson.error || "MCA created but failed to add initial term");
      }

      // Step 3: Redirect to edit page
      router.push(adminPath(`mcas/${newMcaId}/edit`));
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <Link href={adminPath("mcas")} className="govuk-back-link">
        Back to MCAs
      </Link>

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Add New MCA</h1>
        <p className="govuk-body-l">
          Create a new MCA record. After creation, you'll be taken to the edit page where you can
          add more terms, social media links, biography, and other details.
        </p>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PERSONAL DETAILS */}
          <h2 className="govuk-heading-l">1. Personal Details</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="first_name">
                  First Name *
                </label>
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
                <label className="govuk-label" htmlFor="other_names">
                  Other Names
                </label>
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
                <label className="govuk-label" htmlFor="surname">
                  Surname *
                </label>
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

          {/* SLUG PREVIEW */}
          {formData.slug && (
            <div className="govuk-form-group">
              <label className="govuk-label">URL Slug (auto-generated)</label>
              <p className="govuk-body-s" style={{ fontFamily: "monospace", color: "#505a5f" }}>
                /government/people/{formData.slug}
              </p>
              <p className="govuk-hint govuk-!-margin-bottom-0">
                You can edit this after creation on the edit page.
              </p>
            </div>
          )}

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="gender">
                  Gender
                </label>
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
                <label className="govuk-label" htmlFor="county_id">
                  County *
                </label>
                <select
                  id="county_id"
                  className="govuk-select govuk-!-width-full"
                  value={formData.county_id}
                  onChange={(e) => setFormData({ ...formData, county_id: e.target.value })}
                  required
                >
                  <option value="">Select County</option>
                  {lookups.counties.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="status">
                  Initial Status
                </label>
                <select
                  id="status"
                  className="govuk-select govuk-!-width-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active (Visible to public)</option>
                  <option value="Unpublished">Unpublished (Hidden - add details first)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ELECTORAL DETAILS */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">2. Electoral Details</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="seat_type">
                  Seat Type *
                </label>
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
                  onChange={(e) =>
                    setFormData({ ...formData, nomination_category: e.target.value })
                  }
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

          {/* SECTION 3: FIRST TERM */}
          <h2 className="govuk-heading-l govuk-!-margin-top-8">3. First Term</h2>
          <p className="govuk-body">
            Every MCA needs at least one term. You can add more terms (e.g., if they served in
            2013-2017 and returned in 2022-2027) on the edit page after creation.
          </p>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="start_date">
                  Term Start Date *
                </label>
                <input
                  id="start_date"
                  type="date"
                  className="govuk-input"
                  value={termData.start_date}
                  onChange={(e) => setTermData({ ...termData, start_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="party_id">
                  Political Party
                </label>
                <select
                  id="party_id"
                  className="govuk-select govuk-!-width-full"
                  value={termData.party_id}
                  onChange={(e) => setTermData({ ...termData, party_id: e.target.value })}
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
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="ward_id">
                  Ward {isElected ? "*" : "(Not required for Nominated)"}
                </label>
                <select
                  id="ward_id"
                  className="govuk-select govuk-!-width-full"
                  value={termData.ward_id}
                  onChange={(e) => setTermData({ ...termData, ward_id: e.target.value })}
                  disabled={!formData.county_id || isNominated}
                  required={isElected}
                  style={
                    !formData.county_id || isNominated
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}
                  }
                >
                  <option value="">
                    {!formData.county_id
                      ? "Select county first"
                      : isNominated
                      ? "County-wide (Nominated)"
                      : "Select Ward"}
                  </option>
                  {formData.county_id &&
                    isElected &&
                    availableWards.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="votes_garnered">
                  Votes Garnered
                  {isNominated && (
                    <span className="govuk-hint govuk-!-display-inline govuk-!-margin-left-2">
                      (Not applicable for Nominated)
                    </span>
                  )}
                </label>
                <input
                  id="votes_garnered"
                  type="number"
                  className="govuk-input"
                  value={termData.votes_garnered}
                  onChange={(e) => setTermData({ ...termData, votes_garnered: e.target.value })}
                  disabled={isNominated}
                  style={isNominated ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                  placeholder="e.g. 1500"
                />
              </div>
            </div>
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="assembly_role">
                  Assembly Role
                </label>
                <input
                  id="assembly_role"
                  type="text"
                  className="govuk-input"
                  value={termData.assembly_role}
                  onChange={(e) => setTermData({ ...termData, assembly_role: e.target.value })}
                  placeholder="e.g. Speaker, Majority Leader"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="govuk-button-group govuk-!-margin-top-8">
            <button type="submit" className="govuk-button" disabled={saving}>
              {saving ? "Creating MCA…" : "Create MCA"}
            </button>
            <Link href={adminPath("mcas")} className="govuk-button govuk-button--secondary">
              Cancel
            </Link>
          </div>

          <div className="govuk-inset-text govuk-!-margin-top-6">
            <p className="govuk-body govuk-!-margin-bottom-1">
              <strong>What happens next?</strong>
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>The MCA will be created with the basic information above</li>
              <li>You'll be redirected to the edit page</li>
              <li>On the edit page, you can add: biography, social media links, additional terms, committee memberships, and more</li>
            </ul>
          </div>
        </form>
      </main>
    </div>
  );
}