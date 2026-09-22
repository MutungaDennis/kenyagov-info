"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ActionDropdown from "@/components/govuk/ActionDropdown";
import { INSTITUTION_STATUS_OPTIONS, isInstitutionHistorical } from "@/lib/institutions/fields";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  government_level?: string | null;
  arm_of_government?: string | null;
  mtef_sector?: string | null;
  is_active: boolean;
  status?: string | null;
  description?: string | null;
};

const PAGE_SIZE = 50;

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [lifecycleStatus, setLifecycleStatus] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [armOptions, setArmOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Distinct filter options across the full catalogue (not just the current page)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/institutions?facets=1", {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && res.ok) {
          if (Array.isArray(json.arms)) setArmOptions(json.arms);
          if (Array.isArray(json.types)) setTypeOptions(json.types);
        }
      } catch {
        /* dropdowns stay empty; free search still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (q.trim()) params.set("q", q.trim());
      if (lifecycleStatus) params.set("status", lifecycleStatus);
      if (selectedMainCategory !== "All") {
        params.set("arm", selectedMainCategory);
      }
      if (selectedSubCategory !== "All") {
        params.set("type", selectedSubCategory);
      }
      // Default: active only. Checkbox “Include unpublished records” loads everyone.
      if (!showInactive) params.set("active", "1");

      const res = await fetch(`/api/admin/institutions?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to load (${res.status})`);
      }
      setInstitutions(json.data || []);
      setTotal(typeof json.total === "number" ? json.total : 0);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load institutions");
      setInstitutions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [offset, q, selectedMainCategory, selectedSubCategory, showInactive, lifecycleStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchInstitutions(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchInstitutions]);

  const mainCategories = useMemo(
    () => ["All", ...armOptions],
    [armOptions],
  );

  // Full type catalogue from facets (server filters by type across all pages)
  const subCategoryOptions = useMemo(
    () => ["All", ...typeOptions],
    [typeOptions],
  );

  const applySearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setOffset(0);
    setQ(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setSelectedMainCategory("All");
    setSelectedSubCategory("All");
    setShowInactive(false);
    setLifecycleStatus("");
    setOffset(0);
  };

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + institutions.length, total);

  const toggleActive = async (id: string, current: boolean) => {
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/institutions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setActionMessage(
        current
          ? "Institution unpublished (hidden from the public site)."
          : "Institution published on the public site.",
      );
      await fetchInstitutions();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={adminPath()} />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Admin", href: adminPath() },
          { text: "Government Institutions", href: adminPath("institutions") },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Institutions</h1>
            <p className="govuk-body-l">
              Manage public institutions —{" "}
              <strong>{total.toLocaleString()}</strong> matching
              {loading ? " (loading…)" : ""} record
              {total === 1 ? "" : "s"} in Supabase
              {q || selectedMainCategory !== "All" || selectedSubCategory !== "All"
                ? " for the current filters"
                : ""}
              .
            </p>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link
              href={adminPath("institutions/new")}
              className="govuk-button"
            >
              + Add institution
            </Link>
          </div>
        </div>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <p className="govuk-body">{error}</p>
          </div>
        )}

        {actionMessage && (
          <div className="govuk-notification-banner govuk-notification-banner--success">
            <div className="govuk-notification-banner__content">
              <p className="govuk-body">{actionMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={applySearch}>
          <div className="govuk-grid-row govuk-!-margin-bottom-4">
            <div className="govuk-grid-column-one-third">
              <label className="govuk-label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                className="govuk-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, short name, slug…"
              />
            </div>
            <div className="govuk-grid-column-one-third">
              <label className="govuk-label" htmlFor="main">
                Main category
              </label>
              <select
                id="main"
                className="govuk-select"
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedSubCategory("All");
                  setOffset(0);
                }}
              >
                {mainCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="govuk-grid-column-one-third">
              <label className="govuk-label" htmlFor="sub">
                Sub category (type)
              </label>
              <select
                id="sub"
                className="govuk-select"
                value={selectedSubCategory}
                onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                  setOffset(0);
                }}
              >
                {subCategoryOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="lifecycle-status">Lifecycle status</label>
            <select id="lifecycle-status" className="govuk-select" value={lifecycleStatus} onChange={event => { setLifecycleStatus(event.target.value); setOffset(0); }}>
              <option value="">All lifecycle statuses</option>{INSTITUTION_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <p className="govuk-hint">Keep former, dissolved and renamed institutions published for historical context. Edit a record to add dated names, operational periods and successor links. Institution records cannot be deleted.</p>
          </div>
          <div className="govuk-checkboxes govuk-!-margin-bottom-4">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="inactive"
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  setOffset(0);
                }}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="inactive"
              >
                Show inactive
              </label>
            </div>
          </div>

          <div className="govuk-button-group">
            <button type="submit" className="govuk-button">
              Search
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        </form>

        <p className="govuk-body-s">
          {total === 0
            ? loading
              ? "Loading…"
              : "No institutions match your filters."
            : `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${total.toLocaleString()}`}
          {totalPages > 1
            ? ` · Page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`
            : ""}
        </p>

        {!loading && institutions.length === 0 && (
          <p className="govuk-body">No institutions match your filters.</p>
        )}

        {institutions.length > 0 && (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">
                    #
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Institution
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Type
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Category
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Level
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Publication and lifecycle
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {institutions.map((inst, index) => (
                  <tr key={inst.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{offset + index + 1}</td>
                    <td className="govuk-table__cell">
                      <strong>{inst.name}</strong>
                      {inst.short_name && ` (${inst.short_name})`}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.institution_type || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.institution_category ||
                        inst.arm_of_government ||
                        "—"}
                    </td>
                    <td className="govuk-table__cell">
                      {inst.government_level || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <span
                        className={`govuk-tag ${
                          inst.is_active !== false
                            ? "govuk-tag--green"
                            : "govuk-tag--grey"
                        }`}
                      >
                        {inst.is_active !== false
                          ? "Published"
                          : "Unpublished"}
                      </span>
                      <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">{isInstitutionHistorical(inst.status) ? "Historical: " : ""}{inst.status || "Active"}</p>
                      <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">{isInstitutionHistorical(inst.status) ? "Historical: " : ""}{inst.status || "Active"}</p>
                    </td>
                    <td className="govuk-table__cell">
                      <ActionDropdown
                        actions={[
                          {
                            label: "Edit details and history",
                            href: adminPath(`institutions/${inst.id}/edit`),
                          },
                          {
                            label: "View public",
                            href: `/government/institutions/${inst.slug}`,
                          },
                          {
                            label:
                              inst.is_active !== false
                                ? "Unpublish"
                                : "Publish",
                            onClick: () =>
                              toggleActive(inst.id, inst.is_active !== false),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="govuk-button-group govuk-!-margin-top-4">
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={page <= 1 || loading}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <span className="govuk-body">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
