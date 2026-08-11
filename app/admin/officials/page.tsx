"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import DeleteModal from "@/components/govuk/DeleteModal";

// 🚀 Import the IndexNow helper
import {
  DEFAULT_VERIFICATION_STATUS,
  normalizeVerificationStatus,
  verificationTagClass,
} from "@/lib/verification";

type Leader = {
  id: string;
  slug: string;
  full_name?: string | null;
  first_name?: string | null;
  other_names?: string | null;
  surname?: string | null;
  title?: string | null;
  current_party?: string | null;
  current_constituency?: string | null;
  current_county?: string | null;
  current_organization?: string | null;
  level?: string | null;
  is_active?: boolean | null;
  verification_status?: string | null;
  leader_roles?: Array<{
    title?: string | null;
    organization?: string | null;
    status?: string | null;
    term_start_date?: string | null;
    term_end_date?: string | null;
  }> | null;
};

function leaderDisplayName(row: Leader & { name_titles?: unknown }): string {
  const parts = [row.first_name, row.other_names, row.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const base = parts || row.full_name || "Unknown";
  // Admin list: plain name is fine; titles are edited on the person form
  return base;
}

const PAGE_SIZE = 40;

export default function OfficialsAdminPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [organization, setOrganization] = useState("");
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [sort, setSort] = useState<"default" | "az" | "za">("default");
  /** all | active | inactive */
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Leader | null>(null);

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (q.trim()) params.set("q", q.trim());
      if (organization.trim()) params.set("organization", organization.trim());
      if (sort && sort !== "default") params.set("sort", sort);
      else params.set("sort", "default");
      if (activeFilter === "active") params.set("active", "1");
      if (activeFilter === "inactive") params.set("active", "0");

      const res = await fetch(`/api/admin/leaders?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to fetch (${res.status})`);
      }
      const rows = (json.data || []) as Leader[];
      // Dedupe by id — prevents React key collisions if API returns duplicates
      const seen = new Set<string>();
      const unique = rows.filter((row) => {
        if (!row?.id || seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      });
      setLeaders(unique);
      setTotal(typeof json.total === "number" ? json.total : unique.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading officials");
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  }, [offset, q, organization, sort, activeFilter]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  // Load organisation filter options (distinct orgs on leaders / roles)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/admin/leaders/lookups?only=leader_organizations",
          { credentials: "include", cache: "no-store" },
        );
        const json = await res.json();
        if (
          !cancelled &&
          res.ok &&
          Array.isArray(json.leader_organizations)
        ) {
          setOrgOptions(json.leader_organizations);
        }
      } catch {
        /* keep empty — filter still works if user knows exact name via API later */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setOffset(0);
    setQ(searchInput.trim());
    // organisation is applied immediately via select — keep state in sync
  };

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setOrganization("");
    setSort("default");
    setActiveFilter("all");
    setOffset(0);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/leaders/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setDeleteTarget(null);
      await fetchLeaders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting");
      setDeleteTarget(null);
    }
  };

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="govuk-width-container">
      <Link href={adminPath()} className="govuk-back-link">
        Back to Admin
      </Link>

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Officials (leaders)</h1>
        <p className="govuk-body-l">
          Manage public leaders used on{" "}
          <Link href="/government/people" className="govuk-link">
            /government/people
          </Link>{" "}
          and Hansard. Edit a person to correct names, biography, academic
          qualifications, and position history (for example MP → Cabinet
          Secretary, or concurrent offices with from–to dates).
        </p>
        <p className="govuk-body">
          Full name is generated by the database from first name / other names /
          surname — never update <code>full_name</code> directly.
        </p>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <div className="govuk-button-group">
          <Link href={adminPath("officials/new")} className="govuk-button">
            Add official
          </Link>
        </div>

        <form onSubmit={applyFilters} className="govuk-!-margin-bottom-4">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="q">
                  Search
                </label>
                <div className="govuk-hint">
                  Free text: name, position, constituency, county, party
                </div>
                <input
                  id="q"
                  className="govuk-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Kiringai, Chief of Staff…"
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="org-filter">
                  Filter by organisation
                </label>
                <div className="govuk-hint">
                  Only people linked to this organisation (current or any role)
                </div>
                <select
                  id="org-filter"
                  className="govuk-select"
                  value={organization}
                  onChange={(e) => {
                    setOrganization(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All organisations</option>
                  {orgOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="sort">
                  Sort by
                </label>
                <select
                  id="sort"
                  className="govuk-select"
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "default" || v === "az" || v === "za") {
                      setSort(v);
                      setOffset(0);
                    }
                  }}
                >
                  <option value="default">Default</option>
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <fieldset className="govuk-fieldset govuk-!-margin-top-4">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  Directory status
                </legend>
                <div className="govuk-radios govuk-radios--inline govuk-radios--small">
                  {(
                    [
                      ["all", "All"],
                      ["active", "Active only"],
                      ["inactive", "Inactive only"],
                    ] as const
                  ).map(([value, label]) => (
                    <div key={value} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={`active-filter-${value}`}
                        name="active-filter"
                        type="radio"
                        value={value}
                        checked={activeFilter === value}
                        onChange={() => {
                          setActiveFilter(value);
                          setOffset(0);
                        }}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`active-filter-${value}`}
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button govuk-button--secondary">
              Search
            </button>
            {(q ||
              organization ||
              sort !== "default" ||
              activeFilter !== "all") && (
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </div>
        </form>

        <p className="govuk-body">
          {loading
            ? "Loading…"
            : `Showing ${leaders.length} of ${total.toLocaleString()} officials`}
          {!loading && (q || organization) && (
            <span className="govuk-hint">
              {" "}
              {q && `· search “${q}”`}
              {organization && ` · organisation “${organization}”`}
            </span>
          )}
        </p>

        {!loading && leaders.length > 0 && (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">
                    Name
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Title
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Organisation
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Party / seat
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Verification
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {leaders.map((row) => {
                  const activeRole = row.leader_roles?.find(
                    (r) =>
                      String(r.status || "").toLowerCase() === "active" ||
                      !r.term_end_date,
                  );
                  const title = activeRole?.title || row.title || "—";
                  const org =
                    activeRole?.organization ||
                    row.current_organization ||
                    "—";
                  const verification = normalizeVerificationStatus(
                    row.verification_status ?? DEFAULT_VERIFICATION_STATUS,
                  );
                  return (
                  <tr key={row.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{leaderDisplayName(row)}</strong>
                      {row.is_active === false && (
                        <span className="govuk-tag govuk-tag--grey govuk-!-margin-left-1">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {title}
                      {row.leader_roles && row.leader_roles.length > 1 && (
                        <div className="govuk-hint govuk-!-margin-bottom-0">
                          {row.leader_roles.length} positions recorded
                        </div>
                      )}
                    </td>
                    <td className="govuk-table__cell">{org}</td>
                    <td className="govuk-table__cell">
                      {[row.current_party, row.current_constituency, row.current_county]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="govuk-table__cell">
                      <strong
                        className={`govuk-tag ${verificationTagClass(verification)}`}
                      >
                        {verification}
                      </strong>
                    </td>
                    <td className="govuk-table__cell">
                      <Link
                        href={adminPath(`officials/${row.id}/edit`)}
                        className="govuk-link"
                      >
                        Edit
                      </Link>
                      {" · "}
                      <Link
                        href={`/government/people/${row.slug}`}
                        className="govuk-link"
                        target="_blank"
                      >
                        Public
                      </Link>
                      {" · "}
                      <Link
                        href={`/government/legislature/hansard/member/${row.slug}`}
                        className="govuk-link"
                        target="_blank"
                      >
                        Hansard
                      </Link>
                      {" · "}
                      <button
                        type="button"
                        className="govuk-link app-button-as-link"
                        onClick={() => setDeleteTarget(row)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d4351c",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          textDecoration: "underline",
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

        {!loading && leaders.length === 0 && (
          <p className="govuk-body">No officials found.</p>
        )}

        {totalPages > 1 && (
          <div className="govuk-button-group govuk-!-margin-top-4">
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              disabled={page <= 1}
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
              disabled={page >= totalPages}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete official"
        message={`Delete "${deleteTarget ? leaderDisplayName(deleteTarget) : ""}" from leaders? This cannot be undone and may break Hansard links.`}
      />
    </div>
  );
}