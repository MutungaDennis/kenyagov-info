import Link from "next/link";
import type { Metadata } from "next";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import ExternalLink from "@/components/site/ExternalLink";
import {
  EOP_META,
  EOP_SUBSECTION_LABELS,
  eopActivities2027,
  type EopActivity,
  type EopSection,
} from "@/lib/data/election-eop";
import {
  daysUntilEopActivity,
  eopStatusLabel,
  eopStatusTagClass,
  formatEopDateRange,
  getActivitiesForSection,
  getEopActivityStatus,
  getEopSections,
  getHappeningPublicActivities,
  getNextPublicActivity,
  getUpcomingPublicActivities,
  sectionStatusCounts,
  type EopStatus,
} from "@/lib/data/election-eop.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "2027 Election Operation Plan timelines | Elections | CitizenGuide.KE",
  description:
    "Full IEBC Election Operation Plan 2025–2027 implementation timelines — voter registration, nominations, campaign financing, results and more for the 10 August 2027 General Election.",
};

function StatusTag({ status }: { status: EopStatus }) {
  return (
    <strong className={`govuk-tag ${eopStatusTagClass(status)}`}>
      {eopStatusLabel(status)}
    </strong>
  );
}

function ActivityTable({
  items,
  caption,
  showPublicColumn = false,
}: {
  items: EopActivity[];
  caption: string;
  showPublicColumn?: boolean;
}) {
  if (items.length === 0) {
    return <p className="govuk-body">No activities in this list.</p>;
  }

  return (
    <TableScroll caption={caption}>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-visually-hidden">
          {caption}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header app-eop-col-ref">
              Ref
            </th>
            <th scope="col" className="govuk-table__header">
              Activity
            </th>
            <th scope="col" className="govuk-table__header app-eop-col-dates">
              Dates
            </th>
            <th scope="col" className="govuk-table__header">
              Status
            </th>
            {showPublicColumn && (
              <th scope="col" className="govuk-table__header">
                For public
              </th>
            )}
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {items.map((a) => {
            const st = getEopActivityStatus(a);
            return (
              <tr key={a.ref} className="govuk-table__row">
                <td className="govuk-table__cell app-eop-col-ref">
                  <code className="app-eop-ref">{a.ref}</code>
                </td>
                <td className="govuk-table__cell">
                  <span className="govuk-!-font-weight-bold">{a.title}</span>
                  {a.durationDays != null && (
                    <span className="govuk-body-s govuk-!-display-block govuk-!-margin-top-1">
                      {a.durationDays === 1
                        ? "1 day"
                        : `${a.durationDays} days`}
                    </span>
                  )}
                </td>
                <td className="govuk-table__cell app-eop-col-dates">
                  {formatEopDateRange(a.startDate, a.endDate)}
                </td>
                <td className="govuk-table__cell">
                  <StatusTag status={st} />
                </td>
                {showPublicColumn && (
                  <td className="govuk-table__cell">
                    {a.publicInterest ? "Yes" : "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}

function SectionBlock({ section }: { section: EopSection }) {
  const items = getActivitiesForSection(section.id);
  const counts = sectionStatusCounts(section.id);

  // Group by subsection when present
  const subsections = new Map<string | null, EopActivity[]>();
  for (const a of items) {
    const key = a.subsectionId ?? null;
    const list = subsections.get(key) ?? [];
    list.push(a);
    subsections.set(key, list);
  }

  const countBits: string[] = [];
  if (counts.happening > 0) countBits.push(`${counts.happening} happening now`);
  if (counts.upcoming > 0) countBits.push(`${counts.upcoming} upcoming`);
  if (counts.past > 0) countBits.push(`${counts.past} past`);

  return (
    <details
      className="govuk-details govuk-!-margin-bottom-4"
      data-module="govuk-details"
      id={`section-${section.id}`}
    >
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          <span className="app-eop-section-num">{section.id}.</span>{" "}
          {section.title}
          {section.publicInterest && (
            <>
              {" "}
              <strong className="govuk-tag govuk-tag--turquoise govuk-!-margin-left-1">
                Public interest
              </strong>
            </>
          )}
        </span>
      </summary>
      <div className="govuk-details__text">
        <p className="govuk-body">{section.summary}</p>
        {countBits.length > 0 && (
          <p className="govuk-body-s">{countBits.join(" · ")}</p>
        )}

        {[...subsections.entries()].map(([subId, subItems]) => (
          <div key={subId ?? "main"} className="govuk-!-margin-bottom-4">
            {subId && EOP_SUBSECTION_LABELS[subId] && (
              <h3 className="govuk-heading-s">
                {EOP_SUBSECTION_LABELS[subId]}
              </h3>
            )}
            <ActivityTable
              items={subItems}
              caption={`${section.title}${
                subId && EOP_SUBSECTION_LABELS[subId]
                  ? ` — ${EOP_SUBSECTION_LABELS[subId]}`
                  : ""
              }`}
            />
          </div>
        ))}
      </div>
    </details>
  );
}

export default function ElectionOperationPlanPage() {
  const sections = getEopSections();
  const next = getNextPublicActivity();
  const happening = getHappeningPublicActivities();
  const upcomingPublic = getUpcomingPublicActivities(new Date(), 15);
  const days = next ? daysUntilEopActivity(next) : null;
  const nextStatus = next ? getEopActivityStatus(next) : null;

  const publicSections = sections.filter((s) => s.publicInterest);
  const operationalSections = sections.filter((s) => !s.publicInterest);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          {
            text: "General elections",
            href: "/elections/general-elections",
          },
          { text: "Operation plan" },
        ]}
      />

      <span className="govuk-caption-m">IEBC Election Operation Plan</span>
      <h1 className="govuk-heading-xl">
        2027 General Election operation plan timelines
      </h1>

      <p className="govuk-body-l">
        Full implementation calendar from the IEBC{" "}
        <strong>{EOP_META.title}</strong> ({EOP_META.appendix}) for the{" "}
        <Link href="/elections/general-elections" className="govuk-link">
          {EOP_META.electionLabel}
        </Link>
        . Includes start and finish dates for each activity across the electoral
        cycle.
      </p>

      <div className="govuk-inset-text">
        <p className="govuk-body">
          This is the detailed operational plan ({eopActivities2027.length}{" "}
          activities). For the shorter legal milestones — public officer
          resignation, campaign period, nominations and Election Day — see the{" "}
          <Link
            href="/elections/general-elections/timeline"
            className="govuk-link"
          >
            key IEBC election timeline
          </Link>
          .
        </p>
      </div>

      {next && nextStatus && (
        <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
          <h2 className="govuk-panel__title">
            {nextStatus === "happening"
              ? "Happening now (public interest)"
              : "Next public-interest milestone"}
          </h2>
          <div className="govuk-panel__body">
            <strong>
              <span className="app-eop-ref-light">{next.ref}</span> {next.title}
            </strong>
            <br />
            {formatEopDateRange(next.startDate, next.endDate)}
            {days != null && days > 0 && nextStatus === "upcoming" && (
              <>
                <br />
                {days === 1 ? "1 day" : `${days} days`} until this activity
                starts
              </>
            )}
          </div>
        </div>
      )}

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            <a className="govuk-link" href="#key-public-dates">
              Key dates for voters, candidates and parties
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#public-sections">
              Full plan — public-interest sections
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#operational-sections">
              Full plan — IEBC operational sections
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#source">
              Source and how to use this guide
            </a>
          </li>
        </ul>
      </nav>

      <section id="key-public-dates" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">
          Key dates for voters, candidates and parties
        </h2>
        <p className="govuk-body">
          Highlighted activities that most affect the public:{" "}
          <Link href="/elections/voter-registration" className="govuk-link">
            voter registration
          </Link>
          ,{" "}
          <Link href="/elections/political-parties" className="govuk-link">
            political parties
          </Link>
          , nominations, campaign finance,{" "}
          <Link href="/elections/polling-stations" className="govuk-link">
            polling stations
          </Link>
          , results and petitions. Status updates automatically from the dates
          in the EOP.
        </p>

        {happening.length > 0 && (
          <>
            <h3 className="govuk-heading-m">Happening now</h3>
            <ActivityTable
              items={happening}
              caption="Public-interest EOP activities happening now"
            />
          </>
        )}

        <h3 className="govuk-heading-m">
          {happening.length > 0 ? "Next upcoming" : "Upcoming"}
        </h3>
        <ActivityTable
          items={upcomingPublic.filter(
            (a) => getEopActivityStatus(a) === "upcoming",
          )}
          caption="Upcoming public-interest EOP activities"
        />
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="public-sections" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">
          Full plan — public-interest sections
        </h2>
        <p className="govuk-body">
          Open a section to see every activity, reference number, duration and
          date range from the appendix. Sections most relevant to citizens are
          marked{" "}
          <strong className="govuk-tag govuk-tag--turquoise">
            Public interest
          </strong>
          .
        </p>
        {publicSections.map((s) => (
          <SectionBlock key={s.id} section={s} />
        ))}
      </section>

      <section id="operational-sections" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">
          Full plan — IEBC operational sections
        </h2>
        <p className="govuk-body">
          Internal delivery work (staff training, procurement, finance, risk
          systems). Included for transparency and journalists tracking
          readiness.
        </p>
        {operationalSections.map((s) => (
          <SectionBlock key={s.id} section={s} />
        ))}
      </section>

      <section id="source" className="govuk-!-margin-bottom-6">
        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Source:</strong>{" "}
            <ExternalLink href={EOP_META.sourceUrl}>
              {EOP_META.sourceLabel}
            </ExternalLink>{" "}
            — {EOP_META.appendix} of the {EOP_META.title}.
          </p>
          <p className="govuk-body govuk-!-margin-bottom-0">
            This page is an independent civic guide.{" "}
            <Link href="/government/institutions/iebc" className="govuk-link">
              IEBC
            </Link>
            , the Kenya Gazette and the official EOP remain authoritative.
            Confirm critical deadlines before acting.
          </p>
        </div>
      </section>

      <p className="govuk-body">
        <Link href="/elections/general-elections/timeline" className="govuk-link">
          ← Key legal milestones timeline
        </Link>
        {" · "}
        <Link href="/elections/general-elections" className="govuk-link">
          General elections
        </Link>
        {" · "}
        <Link href="/elections/voter-registration" className="govuk-link">
          Voter registration
        </Link>
        {" · "}
        <Link href="/elections/political-parties" className="govuk-link">
          Political parties
        </Link>
        {" · "}
        <Link href="/elections/by-elections" className="govuk-link">
          By-elections
        </Link>
      </p>

      <LastUpdated published="2026-08-08" lastUpdated="2026-08-08" />

      <style>{`
        .app-eop-ref {
          font-size: 0.875rem;
          white-space: nowrap;
        }
        .app-eop-ref-light {
          opacity: 0.9;
          font-weight: 400;
          margin-right: 0.35em;
        }
        .app-eop-section-num {
          font-variant-numeric: tabular-nums;
        }
        .app-eop-col-ref {
          width: 4.5rem;
          white-space: nowrap;
        }
        .app-eop-col-dates {
          min-width: 11rem;
        }
        @media (max-width: 40.05em) {
          .app-eop-col-ref {
            width: auto;
          }
        }
        .govuk-panel--confirmation .app-eop-ref-light {
          color: inherit;
        }
      `}</style>
    </>
  );
}
