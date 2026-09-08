import Link from "next/link";
import { notFound } from "next/navigation";

import { LegislationAdminNav } from "@/components/legislation/admin/LegislationAdminNav";
import {
  getAdminLegislationDocument,
  publicLegislationHref,
} from "@/lib/legislation/admin/queries";

export const dynamic = "force-dynamic";

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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminLegislationDocument(id);
  if (!data) notFound();

  const { document, provisions, versions, changes, inlineLinkCount, activity } = data;

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <Link className="govuk-back-link" href="/admin/legislation">
        Back to legislation
      </Link>

      <span className="govuk-caption-xl">Legislation admin</span>
      <h1 className="govuk-heading-xl">{document.legal.title}</h1>

      <div className="govuk-button-group">
        <Link
          className="govuk-button govuk-button--secondary"
          href={publicLegislationHref(document)}
        >
          View public page
        </Link>
      </div>

      <LegislationAdminNav documentId={id} active="overview" />

      <div className="admin-legislation-stats govuk-!-margin-top-6 govuk-!-margin-bottom-8">
        <Stat label="Provisions" value={provisions.length} />
        <Stat label="Versions" value={versions.length} />
        <Stat label="Lifecycle changes" value={changes.length} />
        <Stat label="Inline links" value={inlineLinkCount} />
      </div>

      <h2 className="govuk-heading-l">Document status</h2>
      <dl className="govuk-summary-list">
        {[
          ["Category", document.category],
          ["Type", document.legislation_kind],
          ["Status", document.status],
          ["Citation", document.legal.citation],
          ["Act number", document.act_number],
          ["Cap number", document.cap_number],
          ["Jurisdiction", document.county?.official_name || "Kenya"],
          ["Legislature", document.legislature_name],
          ["Originating House", document.originating_chamber],
          ["Assent date", document.assent_date],
          ["Commencement date", document.commencement_date],
          ["Last amended", document.last_amended_date],
          ["Repeal date", document.repeal_date],
          ["Content review", document.review_status],
          ["Relationship review", document.relationship_review_status],
        ]
          .filter(([, value]) => value)
          .map(([key, value]) => (
            <div className="govuk-summary-list__row" key={String(key)}>
              <dt className="govuk-summary-list__key">{key}</dt>
              <dd className="govuk-summary-list__value">{String(value)}</dd>
            </div>
          ))}
      </dl>

      <div className="govuk-button-group">
        <Link className="govuk-button" href={`/admin/legislation/documents/${id}/edit`}>
          Edit metadata
        </Link>
        <Link
          className="govuk-button govuk-button--secondary"
          href={`/admin/legislation/documents/${id}/relationships`}
        >
          Manage relationships
        </Link>
      </div>

      <h2 className="govuk-heading-l govuk-!-margin-top-8">Provisions</h2>

      <div className="admin-legislation-table-wrap">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Provision</th>
              <th className="govuk-table__header">Heading</th>
              <th className="govuk-table__header">Status</th>
              <th className="govuk-table__header">Review</th>
              <th className="govuk-table__header">Actions</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {provisions.map((provision: any) => (
              <tr className="govuk-table__row" key={provision.id}>
                <td className="govuk-table__cell">
                  <strong>{provision.provision_number || provision.provision_type}</strong>
                </td>
                <td className="govuk-table__cell">{provision.heading || "No heading"}</td>
                <td className="govuk-table__cell">{provision.status}</td>
                <td className="govuk-table__cell">{provision.review_status}</td>
                <td className="govuk-table__cell">
                  <Link
                    className="govuk-link"
                    href={`/admin/legislation/documents/${id}/provisions/${provision.id}`}
                  >
                    Edit
                  </Link>
                  {" · "}
                  <Link
                    className="govuk-link"
                    href={`/admin/legislation/documents/${id}/provisions/${provision.id}/links`}
                  >
                    Link text
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activity.length > 0 ? (
        <>
          <h2 className="govuk-heading-l govuk-!-margin-top-8">Recent admin activity</h2>
          <ul className="govuk-list">
            {activity.map((row: any) => (
              <li key={row.id} className="govuk-!-margin-bottom-3">
                <strong>{row.action}</strong>
                {row.summary ? <> — {row.summary}</> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}
