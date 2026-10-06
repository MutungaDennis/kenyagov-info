"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminPath } from "@/lib/admin-path";
import styles from "./parliamentary-committee-editor.module.css";
import {
  chamberLabel,
  type ParliamentaryChamber,
  type ParliamentaryCommittee,
} from "@/lib/legislature/committees";

const CHAMBERS: ParliamentaryChamber[] = ["national_assembly", "senate"];
const CATEGORIES: Record<ParliamentaryChamber, string[]> = {
  national_assembly: [
    "Departmental Committees",
    "Financial Audit and Appropriations Committees",
    "Housekeeping and Operational Committees",
    "Select and General Purpose Committees",
    "Joint and Statutory Committees",
  ],
  senate: ["Standing Committees", "Select Committees", "Other Committees"],
};

export default function ParliamentaryCommitteesAdmin() {
  const [committees, setCommittees] = useState<ParliamentaryCommittee[]>([]);
  const [chamber, setChamber] = useState<ParliamentaryChamber>("national_assembly");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES.national_assembly[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/parliamentary-committees", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error([json.error, json.hint].filter(Boolean).join(" "));
        if (active) setCommittees(json.committees || []);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load committees.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeChamber = (value: ParliamentaryChamber) => {
    setChamber(value);
    setCategory(CATEGORIES[value][0]);
    setCustomCategory("");
  };

  const createCommittee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/parliamentary-committees", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamber,
          name,
          category: category === "custom" ? customCategory : category,
          is_active: true,
          is_published: false,
          sort_order: committees.filter((item) => item.chamber === chamber).length + 1,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error([json.error, json.hint].filter(Boolean).join(" "));
      window.location.assign(adminPath(`parliamentary-committees/${json.committee.id}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create committee.");
      setSaving(false);
    }
  };

  return (
    <main className="govuk-main-wrapper">
      <Link href={adminPath()} className="govuk-back-link">Back to Admin</Link>
      <h1 className="govuk-heading-xl">Parliamentary committees</h1>
      <p className="govuk-body-l">
        Create committees, organize them into categories, and retire them when they are no longer active.
        Assign House members and secretariat staff from the relevant institution editor.
      </p>
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <p className="govuk-body">{error}</p>
        </div>
      )}

      <section className="govuk-summary-card govuk-!-margin-bottom-7" aria-labelledby="new-committee-heading">
        <div className="govuk-summary-card__title-wrapper">
          <h2 className="govuk-summary-card__title" id="new-committee-heading">Add a committee</h2>
        </div>
        <div className="govuk-summary-card__content">
          <form className={styles.createForm} onSubmit={createCommittee}>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="committee-chamber">House</label>
                <select
                  className="govuk-select govuk-!-width-full"
                  id="committee-chamber"
                  value={chamber}
                  onChange={(event) => changeChamber(event.target.value as ParliamentaryChamber)}
                >
                  {CHAMBERS.map((option) => (
                    <option key={option} value={option}>{chamberLabel(option)}</option>
                  ))}
                </select>
              </div>
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="committee-category">Committee category</label>
                <select
                  className="govuk-select govuk-!-width-full"
                  id="committee-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {CATEGORIES[chamber].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="custom">Enter another category</option>
                </select>
                {category === "custom" && (
                  <input
                    className="govuk-input govuk-!-margin-top-2"
                    aria-label="New committee category"
                    placeholder="Category name"
                    value={customCategory}
                    onChange={(event) => setCustomCategory(event.target.value)}
                    required
                  />
                )}
              </div>
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="committee-name">Committee name</label>
                <input
                  className="govuk-input govuk-!-width-full"
                  id="committee-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={200}
                  required
                />
              </div>
            </div>
            <button className={`govuk-button ${styles.createButton}`} disabled={saving}>
              {saving ? "Creating…" : "Create committee"}
            </button>
          </form>
        </div>
      </section>

      {loading ? <p className="govuk-body">Loading committees…</p> : CHAMBERS.map((house) => {
        const rows = committees.filter((committee) => committee.chamber === house);
        return (
          <section className="govuk-!-margin-bottom-7" key={house}>
            <h2 className="govuk-heading-l">{chamberLabel(house)} <span className="govuk-caption-l">{rows.length} committees</span></h2>
            {!rows.length ? <p className="govuk-body">No committees have been added.</p> : (
              <ul className="govuk-list govuk-list--border">
                {rows.map((committee) => (
                  <li key={committee.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3">
                    <Link className="govuk-link govuk-!-font-weight-bold" href={adminPath(`parliamentary-committees/${committee.id}`)}>
                      {committee.name}
                    </Link>
                    <div className="govuk-hint govuk-!-margin-bottom-0">
                      {committee.category} · {committee.is_active ? "Active" : "Historical"} · {committee.is_published ? "Published" : "Draft"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
