import styles from "./constitution-admin.module.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConstitutionAdminPage() {
  const supabase = await createClient();
  const [{ count: articles }, { count: imported }, { count: attention }, { count: citations }] = await Promise.all([
    supabase.from("constitution_articles").select("id", { count: "exact", head: true }),
    supabase.from("constitution_articles").select("id", { count: "exact", head: true }).eq("review_status", "Imported"),
    supabase.from("constitution_articles").select("id", { count: "exact", head: true }).eq("review_status", "Needs attention"),
    supabase.from("legal_citations").select("id", { count: "exact", head: true }).eq("source_type", "constitution_article"),
  ]);

  const { data: rows } = await supabase
    .from("constitution_articles")
    .select("id, article_number, title, review_status")
    .order("article_number")
    .limit(264);

  return <main className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-9">
    <span className="govuk-caption-xl">CitizenGuide admin</span>
    <h1 className="govuk-heading-xl">Constitution</h1>
    <p className="govuk-body-l">Review the imported constitutional structure and prepare provisions for cross-linking with Acts, Gazette notices, institutions and other legal material.</p>

    <div className={`${styles.stats} govuk-!-margin-bottom-8`}>
      <Stat label="Articles" value={articles || 0} />
      <Stat label="Awaiting review" value={imported || 0} />
      <Stat label="Needs attention" value={attention || 0} />
      <Stat label="Internal citations" value={citations || 0} />
    </div>

    <div className="govuk-button-group">
      <Link href="/constitution" className="govuk-button govuk-button--secondary">View public Constitution</Link>
    </div>

    <h2 className="govuk-heading-l">Articles</h2>
    <table className="govuk-table">
      <thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header">Article</th><th className="govuk-table__header">Title</th><th className="govuk-table__header">Review status</th><th className="govuk-table__header">Public</th></tr></thead>
      <tbody className="govuk-table__body">{(rows || []).map((a: any) => <tr className="govuk-table__row" key={a.id}>
        <td className="govuk-table__cell"><strong>{a.article_number}</strong></td>
        <td className="govuk-table__cell">{a.title}</td>
        <td className="govuk-table__cell"><strong className={`govuk-tag ${a.review_status === "Needs attention" ? "govuk-tag--red" : a.review_status === "Reviewed" ? "govuk-tag--green" : "govuk-tag--grey"}`}>{a.review_status}</strong></td>
        <td className="govuk-table__cell"><Link className="govuk-link" href={`/constitution/article/${a.article_number}`}>View</Link></td>
      </tr>)}</tbody>
    </table>
  </main>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div style={{ borderTop: "4px solid #1d70b8", paddingTop: 10 }}><span className="govuk-heading-l govuk-!-margin-bottom-1">{value}</span><span className="govuk-body-s">{label}</span></div>;
}
