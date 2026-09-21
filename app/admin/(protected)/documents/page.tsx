import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { getAdminDocuments } from "@/lib/documents/admin-queries";

export default async function AdminDocumentsPage({ searchParams }: { searchParams: Promise<{q?:string}> }) {
  const { q } = await searchParams;
  const { rows, total } = await getAdminDocuments(q);
  return <><div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><div><h1 className="govuk-heading-xl">Documents</h1><p className="govuk-body">Manage nationally important non-legislative documents.</p></div><div><Link className="govuk-button" href={adminPath("documents/new")}>Add document</Link></div></div>
  <form method="get" className="govuk-!-margin-bottom-6"><label className="govuk-label" htmlFor="q">Search documents</label><input className="govuk-input govuk-!-width-two-thirds" id="q" name="q" defaultValue={q||""}/><button className="govuk-button govuk-!-margin-left-2" type="submit">Search</button></form>
  <p className="govuk-body-s">{total} records</p><div className="govuk-table__container"><table className="govuk-table"><thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header">Document</th><th className="govuk-table__header">Published</th><th className="govuk-table__header">Status</th><th className="govuk-table__header">Review</th><th className="govuk-table__header"></th></tr></thead><tbody className="govuk-table__body">{rows.map((d:any)=><tr className="govuk-table__row" key={d.id}><td className="govuk-table__cell">{d.title}</td><td className="govuk-table__cell">{d.publication_date||"—"}</td><td className="govuk-table__cell">{d.status}</td><td className="govuk-table__cell">{d.review_status}</td><td className="govuk-table__cell"><Link className="govuk-link" href={adminPath(`documents/${d.id}`)}>Manage</Link></td></tr>)}</tbody></table></div></>;
}
