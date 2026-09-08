import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminLegislationList } from "@/lib/legislation/admin/queries";

export const dynamic = "force-dynamic";

type SearchParams = {
  query?: string;
  category?: string;
  status?: string;
  review?: string;
  kind?: string;
  page?: string;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-stat">
      <span className="govuk-heading-l govuk-!-margin-bottom-1">
        {value.toLocaleString("en-KE")}
      </span>
      <span className="govuk-body-s">{label}</span>
    </div>
  );
}

export default async function LegislationAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page || "1", 10) || 1);

  const [list, supabase] = await Promise.all([
    getAdminLegislationList({
      query: p.query,
      category: p.category,
      status: p.status,
      review: p.review,
      kind: p.kind,
      page,
    }),
    createClient(),
  ]);

  const [all, imported, attention, links] = await Promise.all([
    supabase.from("legislation_documents").select("id", { count: "exact", head: true }),
    supabase.from("legislation_documents").select("id", { count: "exact", head: true }).eq("review_status", "Imported"),
    supabase.from("legislation_documents").select("id", { count: "exact", head: true }).eq("review_status", "Needs attention"),
    supabase.from("legislation_inline_links").select("id", { count: "exact", head: true }).eq("verification_status", "Verified"),
  ]);

  const totalPages = Math.max(1, Math.ceil(list.count / list.pageSize));

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <span className="govuk-caption-xl">CitizenGuide admin</span>
      <h1 className="govuk-heading-xl">Legislation</h1>
      <p className="govuk-body-l">
        Manage Acts of Parliament, county legislation, subsidiary legislation
        and treaties from one legal workspace.
      </p>

      <div className="admin-legislation-stats govuk-!-margin-bottom-8">
        <Stat label="Documents" value={all.count || 0} />
        <Stat label="Awaiting review" value={imported.count || 0} />
        <Stat label="Needs attention" value={attention.count || 0} />
        <Stat label="Verified inline links" value={links.count || 0} />
      </div>

      <form method="get" className="admin-legislation-filter">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="query">
            Search legislation
          </label>
          <input className="govuk-input" id="query" name="query" type="search" defaultValue={p.query || ""} />
        </div>

        <div className="admin-legislation-filter__row">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="category">Category</label>
            <select className="govuk-select" id="category" name="category" defaultValue={p.category || ""}>
              <option value="">All</option>
              <option value="act">Acts of Parliament</option>
              <option value="county_act">County legislation</option>
              <option value="subsidiary">Subsidiary legislation</option>
              <option value="treaty">Treaties</option>
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="kind">Type</label>
            <select className="govuk-select" id="kind" name="kind" defaultValue={p.kind || ""}>
              <option value="">All</option>
              <option value="principal">Principal</option>
              <option value="amending">Amending</option>
              <option value="repealing">Repealing</option>
              <option value="revision">Revision</option>
              <option value="consolidation">Consolidation</option>
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="status">Legal status</label>
            <select className="govuk-select" id="status" name="status" defaultValue={p.status || ""}>
              <option value="">All</option>
              <option value="In force">In force</option>
              <option value="Partially in force">Partially in force</option>
              <option value="Not yet commenced">Not yet commenced</option>
              <option value="Repealed">Repealed</option>
              <option value="Spent">Spent</option>
              <option value="Revoked">Revoked</option>
              <option value="Historical">Historical</option>
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="review">Review status</label>
            <select className="govuk-select" id="review" name="review" defaultValue={p.review || ""}>
              <option value="">All</option>
              <option value="Imported">Imported</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Needs attention">Needs attention</option>
            </select>
          </div>
        </div>

        <div className="govuk-button-group">
          <button className="govuk-button" type="submit">Apply filters</button>
          <Link className="govuk-link" href="/admin/legislation">Clear filters</Link>
        </div>
      </form>

      <p className="govuk-body-s">{list.count.toLocaleString("en-KE")} documents</p>

      <div className="admin-legislation-table-wrap">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Year</th>
              <th className="govuk-table__header">Legislation</th>
              <th className="govuk-table__header">Type</th>
              <th className="govuk-table__header">Status</th>
              <th className="govuk-table__header">Review</th>
              <th className="govuk-table__header">Manage</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {list.rows.map((row: any) => (
              <tr className="govuk-table__row" key={row.id}>
                <td className="govuk-table__cell">{row.legal?.year || "—"}</td>
                <td className="govuk-table__cell">
                  <strong>{row.legal?.title}</strong>
                  {row.legal?.citation ? <span className="admin-legislation-secondary">{row.legal.citation}</span> : null}
                </td>
                <td className="govuk-table__cell">{row.legislation_kind || row.category}</td>
                <td className="govuk-table__cell">{row.status}</td>
                <td className="govuk-table__cell">{row.review_status}</td>
                <td className="govuk-table__cell">
                  <Link className="govuk-link" href={`/admin/legislation/documents/${row.id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="govuk-pagination" aria-label="Admin legislation pagination">
          {page > 1 ? (
            <div className="govuk-pagination__prev">
              <Link className="govuk-link govuk-pagination__link" href={`/admin/legislation?page=${page - 1}`}>Previous</Link>
            </div>
          ) : null}
          <ul className="govuk-pagination__list">
            <li className="govuk-pagination__item govuk-pagination__item--current">
              <span className="govuk-pagination__link">Page {page} of {totalPages}</span>
            </li>
          </ul>
          {page < totalPages ? (
            <div className="govuk-pagination__next">
              <Link className="govuk-link govuk-pagination__link" href={`/admin/legislation?page=${page + 1}`}>Next</Link>
            </div>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
