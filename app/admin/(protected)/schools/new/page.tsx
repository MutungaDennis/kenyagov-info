"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { adminPath } from "@/lib/admin-path";
import { SCHOOL_LEVELS } from "@/lib/schools/types";

type County = { code: number; name: string };
type SchoolLookups = { counties: County[] };

async function loadLookups(url: string): Promise<SchoolLookups> {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Could not load county options");
  return body;
}

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function NewSchoolPage() {
  const router = useRouter();
  const { data: lookups, error: lookupError, isLoading: loadingLookups } = useSWR<SchoolLookups>("/api/admin/schools/lookups", loadLookups);
  const [officialName, setOfficialName] = useState("");
  const [shortName, setShortName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [ownership, setOwnership] = useState("public");
  const [mainTier, setMainTier] = useState("comprehensive");
  const [seniorCluster, setSeniorCluster] = useState("");
  const [institutionType, setInstitutionType] = useState("regular");
  const [countyCode, setCountyCode] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function createSchool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          official_name: officialName,
          short_name: shortName.trim() || null,
          slug,
          ownership,
          main_tier: mainTier || null,
          moe_category: mainTier === "senior_secondary" ? seniorCluster || null : null,
          institution_type: institutionType || null,
          county_code: Number(countyCode),
          description: description.trim() || null,
          is_published: isPublished,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not create school");
      router.replace(adminPath(`schools/${body.id}`));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create school");
      setSaving(false);
    }
  }

  return <div className="govuk-width-container">
    <Link className="govuk-back-link" href={adminPath("schools")}>Back to schools</Link>
    <h1 className="govuk-heading-xl">Add a school</h1>
    <p className="govuk-body">Create the school record, then add further contact, verification and learner details on its management page.</p>
    {errorMessage && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">School could not be saved</h2><p className="govuk-body govuk-!-margin-bottom-0">{errorMessage}</p></div>}
    {lookupError && <p className="govuk-error-message" role="alert">{lookupError.message}</p>}
    <form onSubmit={createSchool}>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-name">Official name</label>
        <input id="new-school-name" className="govuk-input govuk-!-width-two-thirds" required minLength={2} maxLength={250} autoComplete="organization" value={officialName} onChange={event => {
          const nextName = event.target.value;
          setOfficialName(nextName);
          if (!slugEdited) setSlug(makeSlug(nextName));
        }} />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-short-name">Short name</label>
        <input id="new-school-short-name" className="govuk-input govuk-!-width-two-thirds" maxLength={100} value={shortName} onChange={event => setShortName(event.target.value)} />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-slug">School URL</label>
        <div className="govuk-hint" id="new-school-slug-hint">Use lowercase words separated by hyphens.</div>
        <div className="govuk-input__wrapper"><span className="govuk-input__prefix" aria-hidden="true">/government/institutions/</span><input id="new-school-slug" aria-describedby="new-school-slug-hint" className="govuk-input" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} value={slug} onChange={event => { setSlug(event.target.value); setSlugEdited(true); }} /></div>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-county">County</label>
        <select id="new-school-county" className="govuk-select govuk-!-width-two-thirds" required value={countyCode} disabled={loadingLookups || !lookups} onChange={event => setCountyCode(event.target.value)}>
          <option value="">Select a county</option>
          {(lookups?.counties ?? []).map(county => <option key={county.code} value={county.code}>{county.name}</option>)}
        </select>
        {loadingLookups && <div className="govuk-hint">Loading counties…</div>}
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-ownership">Ownership</label>
        <select id="new-school-ownership" className="govuk-select" value={ownership} onChange={event => setOwnership(event.target.value)}>
          {["public", "private", "community", "faith_based", "other"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-level">Main school level</label>
        <select id="new-school-level" className="govuk-select" value={mainTier} onChange={event => { setMainTier(event.target.value); if (event.target.value !== "senior_secondary") setSeniorCluster(""); }}>
          {Object.entries(SCHOOL_LEVELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="govuk-hint">Comprehensive schools run from Pre-Primary (PP1–PP2) through Grade 9 under one administration. Standalone primary schools end at Grade 6; standalone junior schools serve Grades 7–9.</div>
      </div>
      {mainTier === "senior_secondary" && <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-cluster">Senior school cluster</label>
        <div className="govuk-hint" id="new-school-cluster-hint">Choose the school&apos;s CBE cluster.</div>
        <select id="new-school-cluster" className="govuk-select" aria-describedby="new-school-cluster-hint" value={seniorCluster} onChange={event => setSeniorCluster(event.target.value)}>
          <option value="">Not recorded</option>
          <option value="c1">Cluster 1 (C1) — former national schools and schools elevated to C1</option>
          <option value="c2">Cluster 2 (C2) — former extra-county schools</option>
          <option value="c3">Cluster 3 (C3) — former county schools</option>
          <option value="c4">Cluster 4 (C4) — former sub-county schools</option>
        </select>
      </div>}
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-type">School type</label>
        <select id="new-school-type" className="govuk-select" value={institutionType} onChange={event => setInstitutionType(event.target.value)}>
          {["regular", "special", "rehabilitation", "ecde_centre", "hospital_school", "other"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="new-school-description">Description</label>
        <textarea id="new-school-description" className="govuk-textarea" rows={5} maxLength={10000} value={description} onChange={event => setDescription(event.target.value)} />
      </div>
      <div className="govuk-checkboxes govuk-!-margin-bottom-5"><div className="govuk-checkboxes__item">
        <input id="new-school-published" className="govuk-checkboxes__input" type="checkbox" checked={isPublished} onChange={event => setIsPublished(event.target.checked)} />
        <label className="govuk-label govuk-checkboxes__label" htmlFor="new-school-published">Publish this public school</label>
        <div className="govuk-hint govuk-checkboxes__hint">New records are unpublished by default. Private schools remain visible only to administrators.</div>
      </div></div>
      <button className="govuk-button" type="submit" disabled={saving || loadingLookups || !lookups}>{saving ? "Saving…" : "Create school"}</button>
    </form>
  </div>;
}
