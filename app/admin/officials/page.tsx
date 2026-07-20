"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import DeleteModal from "@/components/govuk/DeleteModal";

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
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    other_names: "",
    surname: "",
    title: "",
    current_party: "",
    current_constituency: "",
    current_county: "",
    current_organization: "",
    level: "",
  });
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
      if (activeOnly) params.set("active", "1");

      const res = await fetch(`/api/admin/leaders?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Failed to fetch (${res.status})`);
      }
      setLeaders(json.data || []);
      setTotal(typeof json.total === "number" ? json.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading officials");
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  }, [offset, q, organization, sort, activeOnly]);

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
    setActiveOnly(false);
    setOffset(0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leaders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          [json.error, json.hint].filter(Boolean).join(" — ") ||
            "Failed to create",
        );
      }
      setShowForm(false);
      setFormData({
        first_name: "",
        other_names: "",
        surname: "",
        title: "",
        current_party: "",
        current_constituency: "",
        current_county: "",
        current_organization: "",
        level: "",
      });
      setOffset(0);
      await fetchLeaders();
      if (json.data?.id) {
        window.location.href = adminPath(`officials/${json.data.id}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating official");
    } finally {
      setSaving(false);
    }
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
          <button
            type="button"
            className="govuk-button"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Add official"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="govuk-!-margin-bottom-6"
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#f3f2f1",
            }}
          >
            <h2 className="govuk-heading-m">New official</h2>
            <p className="govuk-hint">
              Full name is generated in the database from first name, other
              names and surname. After create, add positions with dates on the
              edit page for career history.
            </p>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="first_name">
                    First name *
                  </label>
                  <input
                    id="first_name"
                    className="govuk-input"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="other_names">
                    Other names
                  </label>
                  <input
                    id="other_names"
                    className="govuk-input"
                    value={formData.other_names}
                    onChange={(e) =>
                      setFormData({ ...formData, other_names: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="title">
                    Title / office
                  </label>
                  <input
                    id="title"
                    className="govuk-input"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Member of Parliament"
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="level">
                    Level
                  </label>
                  <input
                    id="level"
                    className="govuk-input"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    placeholder="e.g. National Assembly, Senate"
                  />
                </div>
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="party">
                    Party
                  </label>
                  <input
                    id="party"
                    className="govuk-input"
                    value={formData.current_party}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_party: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="const">
                    Constituency
                  </label>
                  <input
                    id="const"
                    className="govuk-input"
                    value={formData.current_constituency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_constituency: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="county">
                    County
                  </label>
                  <input
                    id="county"
                    className="govuk-input"
                    value={formData.current_county}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_county: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="org">
                Organisation
              </label>
              <input
                id="org"
                className="govuk-input"
                value={formData.current_organization}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_organization: e.target.value,
                  })
                }
              />
            </div>
            <button
              type="submit"
              className="govuk-button"
              disabled={saving}
            >
              {saving ? "Saving…" : "Create official"}
            </button>
          </form>
        )}

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
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-checkboxes govuk-!-margin-top-6">
                <div className="govuk-checkboxes__item">
                  <input
                    className="govuk-checkboxes__input"
                    id="active_only"
                    type="checkbox"
                    checked={activeOnly}
                    onChange={(e) => {
                      setActiveOnly(e.target.checked);
                      setOffset(0);
                    }}
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="active_only"
                  >
                    Active only
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button govuk-button--secondary">
              Search
            </button>
            {(q || organization || sort !== "default" || activeOnly) && (
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
