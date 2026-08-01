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
  counties?: { name: string | null } | null;
  wards?: { name: string | null } | null;
  political_parties?: { name: string | null; abbreviation: string | null } | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MCA | null>(null);

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

      const res = await fetch(`/api/admin/mcas?${params}`, { credentials: "include", cache: "no-store" });
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
  }, [offset, q, seatTypeFilter, statusFilter]);

  useEffect(() => { fetchMCAs(); }, [fetchMCAs]);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setOffset(0);
    setQ(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput(""); setQ(""); setSeatTypeFilter(""); setStatusFilter(""); setOffset(0);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/mcas/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setDeleteTarget(null);
      await fetchMCAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting");
      setDeleteTarget(null);
    }
  };

  const mcaDisplayName = (mca: MCA) => [mca.first_name, mca.other_names, mca.surname].filter(Boolean).join(" ").trim() || "Unknown";
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="govuk-width-container">
      <Link href={adminPath()} className="govuk-back-link">Back to Admin</Link>
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Members of County Assembly (MCAs)</h1>
        <p className="govuk-body-l">Manage the 2000+ MCAs across all 47 counties. Use this page to search, edit, or remove MCA records.</p>

        {error && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><div className="govuk-error-summary__body"><p className="govuk-body">{error}</p></div></div>}

        <div className="govuk-button-group">
          <Link href={adminPath("mcas/new")} className="govuk-button">Add new MCA</Link>
        </div>

        <form onSubmit={applyFilters} className="govuk-!-margin-bottom-4">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="q">Search MCAs</label>
                <input id="q" className="govuk-input" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="e.g. Name, ward, or party..." />
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="seat_type">Seat Type</label>
                <select id="seat_type" className="govuk-select" value={seatTypeFilter} onChange={(e) => { setSeatTypeFilter(e.target.value); setOffset(0); }}>
                  <option value="">All</option><option value="Elected">Elected</option><option value="Nominated">Nominated</option>
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="status">Status</label>
                <select id="status" className="govuk-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}>
                  <option value="">All</option><option value="Active">Active</option><option value="Vacated">Vacated</option>
                </select>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button govuk-button--secondary">Search</button>
            {(q || seatTypeFilter || statusFilter) && <button type="button" className="govuk-button govuk-button--secondary" onClick={clearFilters}>Clear all</button>}
          </div>
        </form>

        <p className="govuk-body">{loading ? "Loading…" : `Showing ${mcas.length} of ${total.toLocaleString()} MCAs`}</p>

        {!loading && mcas.length > 0 && (
          <div className="govuk-table-wrapper">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">Name</th>
                  <th className="govuk-table__header" scope="col">Ward / County</th>
                  <th className="govuk-table__header" scope="col">Party</th>
                  <th className="govuk-table__header" scope="col">Seat Type</th>
                  <th className="govuk-table__header" scope="col">Status</th>
                  <th className="govuk-table__header" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {mcas.map((mca) => (
                  <tr key={mca.id} className="govuk-table__row">
                    <td className="govuk-table__cell"><strong>{mcaDisplayName(mca)}</strong></td>
                    <td className="govuk-table__cell">{mca.wards?.name || "County-wide"}<div className="govuk-hint govuk-!-margin-bottom-0">{mca.counties?.name}</div></td>
                    <td className="govuk-table__cell">{mca.political_parties?.abbreviation || mca.political_parties?.name || "—"}</td>
                    <td className="govuk-table__cell">
                      <span className={`govuk-tag ${mca.seat_type === 'Elected' ? 'govuk-tag--blue' : 'govuk-tag--grey'}`}>{mca.seat_type}</span>
                      {mca.nomination_category && mca.nomination_category !== 'N/A' && <div className="govuk-hint govuk-!-margin-bottom-0">{mca.nomination_category}</div>}
                    </td>
                    <td className="govuk-table__cell"><span className={`govuk-tag ${mca.status === 'Active' ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>{mca.status}</span></td>
                    <td className="govuk-table__cell">
                      <Link href={adminPath(`mcas/${mca.id}/edit`)} className="govuk-link">Edit</Link>
                      {" · "}
                      <Link href={`/government/people/${mca.slug}`} className="govuk-link" target="_blank">Public</Link>
                      {" · "}
                      <button type="button" className="govuk-link app-button-as-link" onClick={() => setDeleteTarget(mca)} style={{ background: "none", border: "none", color: "#d4351c", cursor: "pointer", padding: 0, font: "inherit", textDecoration: "underline" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && mcas.length === 0 && <p className="govuk-body">No MCAs found.</p>}

        {totalPages > 1 && (
          <div className="govuk-button-group govuk-!-margin-top-4">
            <button type="button" className="govuk-button govuk-button--secondary" disabled={page <= 1} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>Previous</button>
            <span className="govuk-body">Page {page} of {totalPages}</span>
            <button type="button" className="govuk-button govuk-button--secondary" disabled={page >= totalPages} onClick={() => setOffset(offset + PAGE_SIZE)}>Next</button>
          </div>
        )}
      </main>

      <DeleteModal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete MCA" message={`Delete "${deleteTarget ? mcaDisplayName(deleteTarget) : ""}"? This cannot be undone.`} />
    </div>
  );
}