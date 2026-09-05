import Link from "next/link";
import {
  forwardNoticeRelationLabel,
  inverseNoticeRelationLabel,
  relationLabel,
} from "@/lib/gazette/relationship-types";

type Props = {
  context: any;
};

const one = <T,>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? value[0] || null : value || null;

const personName = (row: any) => {
  const leader = one(row.leaders);
  if (leader) {
    return (
      [leader.first_name, leader.other_names, leader.surname]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      leader.full_name ||
      "Unknown"
    );
  }
  const mca = one(row.mcas);
  return mca
    ? [mca.first_name, mca.other_names, mca.surname].filter(Boolean).join(" ")
    : "Unknown";
};

const noticeUrl = (notice: any) => {
  if (!notice) return null;
  const issue = one(notice.gazette_issues);
  return issue
    ? `/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`
    : null;
};

const noticeDate = (notice: any, fallback?: string | null) => {
  if (fallback) {
    return new Date(fallback).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  const issue = one(notice?.gazette_issues);
  return issue?.date
    ? new Date(issue.date).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
};

export default function GazetteNoticeContext({ context }: Props) {
  // Generic mentions are now represented by inline links inside the Gazette
  // transcription. Keep only relationships that add semantic context beyond
  // "this name appears in the notice".
  const people = (context?.people || []).filter(
    (row: any) => row.relationship_type !== "mentioned_person",
  );

  const institutions = (context?.institutions || []).filter(
    (row: any) => row.relationship_type !== "mentioned_institution",
  );
  const outgoing = context?.outgoing || [];
  const incoming = context?.incoming || [];
  const corrigenda = context?.corrigenda || [];

  const incomingStatus = incoming.filter((r: any) =>
    ["corrects","amends","revokes","partially_revokes","supersedes","replaces","varies"].includes(
      r.relationship_type,
    ),
  );

  const hasContext =
    people.length || institutions.length || outgoing.length || incoming.length || corrigenda.length;

  if (!hasContext) return null;

  return (
    <>
      {(corrigenda.length > 0 || incomingStatus.length > 0) && (
        <section aria-labelledby="gazette-status-heading" className="govuk-!-margin-bottom-6">
          <h2 id="gazette-status-heading" className="govuk-heading-l">
            Status of this notice
          </h2>

          {corrigenda.map((r: any) => {
            const section = one(r.gazette_issue_sections);
            const issue = one(section?.gazette_issues);
            return (
              <div className="govuk-notification-banner" role="region" key={`corr-${r.id}`}>
                <div className="govuk-notification-banner__header">
                  <h3 className="govuk-notification-banner__title">
                    {r.relationship_type === "amends" ? "This notice was amended" : "This notice was corrected"}
                  </h3>
                </div>
                <div className="govuk-notification-banner__content">
                  {issue?.date && (
                    <p className="govuk-body">
                      A Corrigenda entry published on{" "}
                      <strong>
                        {new Date(issue.date).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>{" "}
                      {r.relationship_type === "amends" ? "amended" : "corrected"} this notice.
                    </p>
                  )}
                  {r.affected_field && (
                    <p className="govuk-body">
                      <strong>Affected information:</strong> {r.affected_field}
                    </p>
                  )}
                  {(r.original_text || r.corrected_text) && (
                    <dl className="govuk-summary-list govuk-!-margin-bottom-3">
                      {r.original_text && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Originally published</dt>
                          <dd className="govuk-summary-list__value">{r.original_text}</dd>
                        </div>
                      )}
                      {r.corrected_text && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Corrected to</dt>
                          <dd className="govuk-summary-list__value">{r.corrected_text}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <p className="govuk-body-s">{r.entry_text}</p>
                  {issue && (
                    <Link className="govuk-link" href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}>
                      View the Gazette issue containing the Corrigenda
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {incomingStatus.map((r: any) => {
            const source = one(r.source);
            const url = noticeUrl(source);
            const when = noticeDate(source, r.effective_date);
            const title =
              r.relationship_type === "revokes"
                ? "This notice was revoked"
                : r.relationship_type === "partially_revokes"
                  ? "This notice was partially revoked"
                  : r.relationship_type === "supersedes" || r.relationship_type === "replaces"
                    ? "This notice was superseded"
                    : r.relationship_type === "corrects"
                      ? "This notice was corrected"
                      : r.relationship_type === "amends" || r.relationship_type === "varies"
                        ? "This notice was amended"
                        : "This notice was changed";

            return (
              <div className="govuk-notification-banner" role="region" key={`incoming-${r.id}`}>
                <div className="govuk-notification-banner__header">
                  <h3 className="govuk-notification-banner__title">{title}</h3>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-body">
                    {inverseNoticeRelationLabel(r.relationship_type)} Gazette Notice No.{" "}
                    <strong>{source?.notice_number}</strong>
                    {when ? <> on <strong>{when}</strong></> : null}.
                  </p>
                  {r.description && <p className="govuk-body">{r.description}</p>}
                  {url && (
                    <Link className="govuk-link" href={url}>
                      View Gazette Notice No. {source.notice_number}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section aria-labelledby="about-notice-heading" className="govuk-!-margin-bottom-6">
        <h2 id="about-notice-heading" className="govuk-heading-l">Context and related records</h2>

        {people.length > 0 && (
          <>
            <h3 className="govuk-heading-m">People</h3>
            <dl className="govuk-summary-list">
              {people.map((r: any) => {
                const person = one(r.leaders) || one(r.mcas);
                const name = personName(r);
                return (
                  <div className="govuk-summary-list__row" key={r.id}>
                    <dt className="govuk-summary-list__key">{relationLabel(r.relationship_type)}</dt>
                    <dd className="govuk-summary-list__value">
                      {person?.slug ? (
                        <Link className="govuk-link" href={`/government/people/${person.slug}`}>
                          {name}
                        </Link>
                      ) : name}
                      {(r.position_title || r.capacity_title) && (
                        <div className="govuk-hint govuk-!-margin-bottom-0">
                          {r.position_title || r.capacity_title}
                        </div>
                      )}
                      {r.fiduciary_authority && (
                        <div className="govuk-!-margin-top-1">
                          <strong className="govuk-tag govuk-tag--blue">Public / fiduciary authority</strong>
                        </div>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </>
        )}

        {institutions.length > 0 && (
          <>
            <h3 className="govuk-heading-m">Institutions</h3>
            <dl className="govuk-summary-list">
              {institutions.map((r: any) => {
                const inst = one(r.institutions);
                return (
                  <div className="govuk-summary-list__row" key={r.id}>
                    <dt className="govuk-summary-list__key">{relationLabel(r.relationship_type)}</dt>
                    <dd className="govuk-summary-list__value">
                      {inst?.slug ? (
                        <Link className="govuk-link" href={`/government/institutions/${inst.slug}`}>
                          {inst.name}
                        </Link>
                      ) : inst?.name || "Institution"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </>
        )}

        {(outgoing.length > 0 || incoming.length > 0) && (
          <>
            <h3 className="govuk-heading-m">Related Gazette notices</h3>
            <ul className="govuk-list">
              {outgoing.map((r: any) => {
                const target = one(r.target);
                const url = noticeUrl(target);
                return (
                  <li key={`out-${r.id}`}>
                    <strong>{forwardNoticeRelationLabel(r.relationship_type)}:</strong>{" "}
                    {url ? (
                      <Link className="govuk-link" href={url}>
                        Gazette Notice No. {target?.notice_number}
                      </Link>
                    ) : `Gazette Notice No. ${target?.notice_number ?? "—"}`}
                    {target?.title ? ` — ${target.title}` : ""}
                  </li>
                );
              })}
              {incoming
                .filter((r: any) => !incomingStatus.some((x: any) => x.id === r.id))
                .map((r: any) => {
                  const source = one(r.source);
                  const url = noticeUrl(source);
                  return (
                    <li key={`in-${r.id}`}>
                      <strong>{inverseNoticeRelationLabel(r.relationship_type)}:</strong>{" "}
                      {url ? (
                        <Link className="govuk-link" href={url}>
                          Gazette Notice No. {source?.notice_number}
                        </Link>
                      ) : `Gazette Notice No. ${source?.notice_number ?? "—"}`}
                      {source?.title ? ` — ${source.title}` : ""}
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
