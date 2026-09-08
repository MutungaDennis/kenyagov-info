"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import DeleteModal from "@/components/govuk/DeleteModal";

type MCA = {
  id: string;
  slug: string;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  seat_type: string | null;
  nomination_category: string | null;
  status: string | null;
  county_id?: string | null;
  counties?: { name: string | null } | null;
  wards?: { name: string | null } | null;
  political_parties?: { name: string | null; abbreviation: string | null } | null;
};

type County = {
  id: string;
  name: string;
  code: number;
};

const PAGE_SIZE = 50;

export default function MCAsAdminPage() {
  const [mcas, setMcas] = useState<MCA[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [seatTypeFilter, setSeatTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MCA | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<MCA | null>(null);
  const [bulkUnpublishCounty, setBulkUnpublishCounty] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load counties for filter dropdown
  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const res = await fetch("/api/admin/lookups");
        if (res.ok) {
          const json = await res.json();
          setCounties(json.counties || []);
        }
      } catch (err) {
        console.error("Failed to load counties:", err);
      }
    };
    fetchCounties();
  }, []);

  const fetchMCAs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (q.trim()) params.set("q", q.trim());
      if (seatTypeFilter) params.set("seat_type", seatTypeFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (countyFilter) params.set("county_id", countyFilter);

      const res = await fetch(`/api/admin/mcas?${params}`, {
        credentials: "include",
        cache: "no-store",
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned HTML (Status ${res.status}). Check API route.`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed to fetch (${res.status})`);
      setMcas(json.data || []);
      setTotal(typeof json.total === "number" ? json.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading MCAs");
      setMcas([]);
    } finally {
      setLoading(false);
    }
  }, [offset, q, seatTypeFilter, statusFilter, countyFilter]);

  useEffect(() => {
    fetchMCAs();
  }, [fetchMCAs]);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setOffset(0);
    setQ(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setSeatTypeFilter("");
    setStatusFilter("");
    setCountyFilter("");
    setOffset(0);
  };

  // ============================================
  // SINGLE MCA UNPUBLISH
  // ============================================
  const confirmUnpublish = async () => {
    if (!unpublishTarget) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mcas/${unpublishTarget.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Unpublished" }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to unpublish");

      setSuccess(`${mcaDisplayName(unpublishTarget)} has been unpublished.`);
      setUnpublishTarget(null);
      await fetchMCAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error unpublishing");
      setUnpublishTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // SINGLE MCA REPUBLISH
  // ============================================
  const handleRepublish = async (mca: MCA) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mcas/${mca.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to republish");

      setSuccess(`${mcaDisplayName(mca)} has been republished.`);
      await fetchMCAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error republishing");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // BULK UNPUBLISH COUNTY
  // ============================================
  const confirmBulkUnpublish = async () => {
    if (!bulkUnpublishCounty) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const countyName = counties.find((c) => c.id === bulkUnpublishCounty)?.name || "Unknown";

    try {
      const res = await fetch("/api/admin/mcas/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unpublish",
          county_id: bulkUnpublishCounty,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to unpublish county");

      setSuccess(
        `${json.count} MCAs in ${countyName} have been unpublished.`
      );
      setBulkUnpublishCounty(null);
      await fetchMCAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error unpublishing county");
      setBulkUnpublishCounty(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // DELETE
  // ============================================
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/mcas/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned HTML (Status ${res.status}) on delete.`);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");

      setSuccess(`${mcaDisplayName(deleteTarget)} has been deleted.`);
      setDeleteTarget(null);
      await fetchMCAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting");
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  const mcaDisplayName = (mca: MCA) =>
    [mca.first_name, mca.other_names, mca.surname].filter(Boolean).join(" ").trim() || "Unknown";

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selectedCountyName = counties.find((c) => c.id === countyFilter)?.name;

  return (
    <div className="govuk-width-container">
      <Link href={adminPath()} className="govuk-back-link">
        Back to Admin
      </Link>
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Members of County Assembly (MCAs)</h1>
        <p className="govuk-body-l">
          Manage the 2000+ MCAs across all 47 counties. Use this page to search, filter, edit,
          publish, or remove MCA records.
        </p>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div
            className="govuk-notification-banner govuk-notification-banner--success"
            role="alert"
          >
            <p className="govuk-notification-banner__heading">{success}</p>
          </div>
        )}

        <div className="govuk-button-group">
          <Link href={adminPath("mcas/new")} className="govuk-button">
            Add new MCA
          </Link>
        </div>

        {/* ============================================ */}
        {/* FILTERS */}
        {/* ============================================ */}
        <form onSubmit={applyFilters} className="govuk-!-margin-bottom-4">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="q">
                  Search MCAs
                </label>
                <input
                  id="q"
                  className="govuk-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Name, ward, or party..."
                />
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="county">
                  County
                </label>
                <select
                  id="county"
                  className="govuk-select govuk-!-width-full"
                  value={countyFilter}
                  onChange={(e) => {
                    setCountyFilter(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All counties</option>
                  {counties.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-sixth">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="seat_type">
                  Seat Type
                </label>
                <select
                  id="seat_type"
                  className="govuk-select govuk-!-width-full"
                  value={seatTypeFilter}
                  onChange={(e) => {
                    setSeatTypeFilter(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All</option>
                  <option value="Elected">Elected</option>
                  <option value="Nominated">Nominated</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-sixth">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="govuk-select govuk-!-width-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Vacated">Vacated</option>
                  <option value="Unpublished">Unpublished</option>
                </select>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button govuk-button--secondary">
              Search
            </button>
            {(q || seatTypeFilter || statusFilter || countyFilter) && (
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

        {/* ============================================ */}
        {/* BULK ACTIONS (only when county is selected) */}
        {/* ============================================ */}
        {countyFilter && (
          <div
            style={{
              background: "#f3f2f1",
              borderLeft: "4px solid #1d70b8",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
              Bulk Actions for {selectedCountyName}
            </h2>
            <p className="govuk-body-s govuk-!-margin-bottom-2">
              Showing {total.toLocaleString()} MCAs in {selectedCountyName}. You can unpublish all
              of them at once (e.g., to make corrections before the next election).
            </p>
            <button
              type="button"
              className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
              style={{ background: "#d4351c" }}
              onClick={() => setBulkUnpublishCounty(countyFilter)}
              disabled={actionLoading}
            >
              Unpublish all MCAs in {selectedCountyName}
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* RESULTS */}
        {/* ============================================ */}
        <p className="govuk-body">
          {loading
            ? "Loading…"
            : `Showing ${mcas.length} of ${total.toLocaleString()} MCAs`}
          {!loading && (q || countyFilter || seatTypeFilter || statusFilter) && (
            <span className="govuk-hint">
              {q && ` · search "${q}"`}
              {countyFilter && ` · ${selectedCountyName}`}
              {seatTypeFilter && ` · ${seatTypeFilter}`}
              {statusFilter && ` · ${statusFilter}`}
            </span>
          )}
        </p>

        {!loading && mcas.length > 0 && (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">
                    Name
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Ward / County
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Party
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Seat Type
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Status
                  </th>
                  <th className="govuk-table__header" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {mcas.map((mca) => {
                  const isUnpublished = mca.status === "Unpublished";
                  const isVacated = mca.status === "Vacated";

                  return (
                    <tr
                      key={mca.id}
                      className="govuk-table__row"
                      style={isUnpublished ? { opacity: 0.6 } : {}}
                    >
                      <td className="govuk-table__cell">
                        <strong>{mcaDisplayName(mca)}</strong>
                      </td>
                      <td className="govuk-table__cell">
                        {mca.wards?.name || "County-wide"}
                        <div className="govuk-hint govuk-!-margin-bottom-0">
                          {mca.counties?.name}
                        </div>
                      </td>
                      <td className="govuk-table__cell">
                        {mca.political_parties?.abbreviation ||
                          mca.political_parties?.name ||
                          "—"}
                      </td>
                      <td className="govuk-table__cell">
                        <span
                          className={`govuk-tag ${
                            mca.seat_type === "Elected"
                              ? "govuk-tag--blue"
                              : "govuk-tag--grey"
                          }`}
                        >
                          {mca.seat_type}
                        </span>
                        {mca.nomination_category &&
                          mca.nomination_category !== "N/A" && (
                            <div className="govuk-hint govuk-!-margin-bottom-0">
                              {mca.nomination_category}
                            </div>
                          )}
                      </td>
                      <td className="govuk-table__cell">
                        <span
                          className={`govuk-tag ${
                            mca.status === "Active"
                              ? "govuk-tag--green"
                              : mca.status === "Unpublished"
                              ? "govuk-tag--red"
                              : "govuk-tag--grey"
                          }`}
                        >
                          {mca.status}
                        </span>
                      </td>
                      <td className="govuk-table__cell">
                        <Link
                          href={adminPath(`mcas/${mca.id}/edit`)}
                          className="govuk-link"
                        >
                          Edit
                        </Link>
                        {" · "}
                        <Link
                          href={`/government/people/${mca.slug}`}
                          className="govuk-link"
                          target="_blank"
                        >
                          Public
                        </Link>
                        {" · "}
                        {isUnpublished ? (
                          <button
                            type="button"
                            className="govuk-link app-button-as-link"
                            onClick={() => handleRepublish(mca)}
                            disabled={actionLoading}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#00703c",
                              cursor: "pointer",
                              padding: 0,
                              font: "inherit",
                              textDecoration: "underline",
                            }}
                          >
                            Republish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="govuk-link app-button-as-link"
                            onClick={() => setUnpublishTarget(mca)}
                            disabled={actionLoading}
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
                            Unpublish
                          </button>
                        )}
                        {" · "}
                        <button
                          type="button"
                          className="govuk-link app-button-as-link"
                          onClick={() => setDeleteTarget(mca)}
                          disabled={actionLoading}
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

        {!loading && mcas.length === 0 && (
          <p className="govuk-body">No MCAs found.</p>
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

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete MCA"
        message={`Delete "${
          deleteTarget ? mcaDisplayName(deleteTarget) : ""
        }"? This cannot be undone and will permanently remove their record from the database.`}
      />

      <DeleteModal
        isOpen={Boolean(unpublishTarget)}
        onClose={() => setUnpublishTarget(null)}
        onConfirm={confirmUnpublish}
        title="Unpublish MCA"
        message={`Unpublish "${
          unpublishTarget ? mcaDisplayName(unpublishTarget) : ""
        }"? They will be hidden from public view until you republish them. You can always republish later from this page or the edit page.`}
      />

      <DeleteModal
        isOpen={Boolean(bulkUnpublishCounty)}
        onClose={() => setBulkUnpublishCounty(null)}
        onConfirm={confirmBulkUnpublish}
        title="Unpublish Entire County"
        message={`Unpublish ALL MCAs in "${
          counties.find((c) => c.id === bulkUnpublishCounty)?.name || "Unknown"
        }"? This will hide all ${total.toLocaleString()} MCAs from public view. You can republish them individually or in bulk later.`}
      />
    </div>
  );
}