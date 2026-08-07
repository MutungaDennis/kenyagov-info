import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import ExternalLink from "@/components/site/ExternalLink";
import {
  GENERAL_ELECTION_2027,
  type ElectionTimelineMilestone,
} from "@/lib/data/election-timeline";
import {
  daysUntilMilestone,
  formatTimelineDate,
  formatTimelineDateRange,
  getDefaultTimelineYear,
  getHappeningMilestones,
  getMilestoneStatus,
  getNextGeneralElectionDay,
  getPastMilestones,
  getTimelineHighlight,
  getUpcomingMilestones,
  statusLabel,
  statusTagClass,
} from "@/lib/data/election-timeline.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "2027 General Election timeline | Elections | CitizenGuide.KE",
  description:
    "Official IEBC milestones for the Tuesday 10 August 2027 General Election — campaign period, nominations, agents, and election day.",
};

/**
 * Phrase → internal page links.
 * Longer / more specific phrases first so they win over shorter overlaps
 * (e.g. "General Election Day" before "General Election").
 */
const INTERNAL_PHRASES: { phrase: string; href: string }[] = [
  {
    phrase: "Independent Electoral and Boundaries Commission",
    href: "/government/institutions/iebc",
  },
  {
    phrase: "President of the Republic of Kenya",
    href: "/government/presidency",
  },
  {
    phrase: "Political Party candidates",
    href: "/elections/political-parties",
  },
  {
    phrase: "Independent candidates",
    href: "/elections/political-parties",
  },
  {
    phrase: "independent candidates",
    href: "/elections/political-parties",
  },
  {
    phrase: "Political Parties",
    href: "/elections/political-parties",
  },
  {
    phrase: "Political parties",
    href: "/elections/political-parties",
  },
  {
    phrase: "political parties",
    href: "/elections/political-parties",
  },
  {
    phrase: "political party",
    href: "/elections/political-parties",
  },
  {
    phrase: "General Election Day",
    href: "/elections/general-elections",
  },
  {
    phrase: "General Elections",
    href: "/elections/general-elections",
  },
  {
    phrase: "General Election",
    href: "/elections/general-elections",
  },
  {
    phrase: "general election",
    href: "/elections/general-elections",
  },
  {
    phrase: "Public officers",
    href: "/government/people",
  },
  {
    phrase: "public officers",
    href: "/government/people",
  },
  {
    phrase: "Public officer",
    href: "/government/people",
  },
  {
    phrase: "public officer",
    href: "/government/people",
  },
  {
    phrase: "polling station",
    href: "/elections/polling-stations",
  },
  {
    phrase: "President",
    href: "/government/presidency",
  },
  {
    phrase: "the Commission",
    href: "/government/institutions/iebc",
  },
  {
    phrase: "Commission",
    href: "/government/institutions/iebc",
  },
];

function linkifyText(text: string): ReactNode[] {
  type Hit = { start: number; end: number; href: string; phrase: string };
  const hits: Hit[] = [];

  for (const { phrase, href } of INTERNAL_PHRASES) {
    let from = 0;
    while (from < text.length) {
      const i = text.indexOf(phrase, from);
      if (i === -1) break;
      const end = i + phrase.length;
      const overlaps = hits.some((h) => !(end <= h.start || i >= h.end));
      if (!overlaps) hits.push({ start: i, end, href, phrase });
      from = i + phrase.length;
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const h of hits) {
    if (h.start > cursor) {
      nodes.push(text.slice(cursor, h.start));
    }
    nodes.push(
      <Link key={`l-${key++}`} href={h.href} className="govuk-link">
        {h.phrase}
      </Link>,
    );
    cursor = h.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function MilestoneCards({
  items,
}: {
  items: ElectionTimelineMilestone[];
}) {
  if (items.length === 0) {
    return <p className="govuk-body">No milestones in this list.</p>;
  }

  return (
    <ul className="govuk-list">
      {items.map((m) => {
        const st = getMilestoneStatus(m);
        return (
          <li key={m.id} className="govuk-!-margin-bottom-6">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
              {linkifyText(m.title)}{" "}
              <strong className={`govuk-tag ${statusTagClass(st)}`}>
                {statusLabel(st)}
              </strong>
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              <strong>{formatTimelineDateRange(m.date, m.endDate)}</strong>
            </p>
            <p className="govuk-body">{linkifyText(m.description)}</p>
            {m.timeNotes && (
              <p className="govuk-inset-text govuk-!-margin-top-2">
                {linkifyText(m.timeNotes)}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function ElectionTimelinePage() {
  const year = getDefaultTimelineYear();
  const highlight = getTimelineHighlight(year);
  const happening = getHappeningMilestones(year);
  const upcoming = getUpcomingMilestones(year);
  const past = getPastMilestones(year);
  const electionDay = getNextGeneralElectionDay();
  const days =
    highlight?.status === "upcoming"
      ? daysUntilMilestone(highlight.milestone)
      : null;

  const showGreenNext =
    highlight &&
    (highlight.status === "upcoming" || highlight.status === "happening");

  const panelTitle =
    highlight?.status === "happening"
      ? "Happening now"
      : highlight?.status === "upcoming"
        ? "Next milestone"
        : "Most recent milestone";

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
          { text: "Election timeline" },
        ]}
      />

      <span className="govuk-caption-m">IEBC calendar</span>
      <h1 className="govuk-heading-xl">{year} General Election timeline</h1>

      <p className="govuk-body-l">
        Key legal milestones for the{" "}
        <Link href="/elections/general-elections" className="govuk-link">
          {GENERAL_ELECTION_2027.label}
        </Link>
        . For the full IEBC Election Operation Plan (voter registration,
        nominations by office, results, petitions and more), see the{" "}
        <Link
          href="/elections/general-elections/operation-plan"
          className="govuk-link"
        >
          2027 operation plan timelines
        </Link>
        .
      </p>

      {electionDay && (
        <div className="app-next-election-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            General Election Day
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {formatTimelineDate(electionDay.date)}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-0">
            Poll for{" "}
            <Link href="/government/presidency" className="govuk-link app-next-election-panel__link">
              President
            </Link>
            ,{" "}
            <Link
              href="/government/legislature"
              className="govuk-link app-next-election-panel__link"
            >
              Parliament
            </Link>
            ,{" "}
            <Link
              href="/government/counties/governors"
              className="govuk-link app-next-election-panel__link"
            >
              governors
            </Link>{" "}
            and county assemblies in gazetted electoral areas (if contested).
          </p>
        </div>
      )}

      {highlight && showGreenNext && (
        <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
          <h2 className="govuk-panel__title">{panelTitle}</h2>
          <div className="govuk-panel__body">
            <strong>{linkifyText(highlight.milestone.title)}</strong>
            <br />
            {formatTimelineDateRange(
              highlight.milestone.date,
              highlight.milestone.endDate,
            )}
            {days != null && days > 0 && (
              <>
                <br />
                {days === 1 ? "1 day" : `${days} days`} until this milestone
              </>
            )}
            <br />
            <span className="govuk-body-s">
              {linkifyText(
                highlight.milestone.description.length > 220
                  ? `${highlight.milestone.description.slice(0, 220)}…`
                  : highlight.milestone.description,
              )}
            </span>
          </div>
        </div>
      )}

      {highlight && !showGreenNext && (
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            {panelTitle}
          </h2>
          <p className="govuk-body govuk-!-margin-bottom-0">
            <strong>{highlight.milestone.title}</strong>
            <br />
            {formatTimelineDateRange(
              highlight.milestone.date,
              highlight.milestone.endDate,
            )}
          </p>
        </div>
      )}

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list govuk-list--bullet">
          {happening.length > 0 && (
            <li>
              <a className="govuk-link" href="#happening">
                Happening now
              </a>
            </li>
          )}
          <li>
            <a className="govuk-link" href="#upcoming">
              Upcoming milestones
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#past">
              Past milestones
            </a>
          </li>
        </ul>
      </nav>

      {happening.length > 0 && (
        <section id="happening" className="govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-l">Happening now</h2>
          <MilestoneCards items={happening} />
        </section>
      )}

      <section id="upcoming" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Upcoming milestones</h2>
        {upcoming.length === 0 ? (
          <p className="govuk-body">
            No upcoming milestones remain on this calendar for {year}.
          </p>
        ) : (
          <MilestoneCards items={upcoming} />
        )}
      </section>

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past milestones</h2>
        {past.length === 0 ? (
          <p className="govuk-body">
            No milestones have passed yet on this calendar.
          </p>
        ) : (
          <MilestoneCards items={past} />
        )}
      </section>

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          <strong>Source:</strong>{" "}
          <ExternalLink href={GENERAL_ELECTION_2027.sourceUrl}>
            IEBC official timeline PDF
          </ExternalLink>
          . This page is an independent civic guide;{" "}
          <Link href="/government/institutions/iebc" className="govuk-link">
            IEBC
          </Link>{" "}
          and the Gazette remain authoritative.
        </p>
      </div>

      <p className="govuk-body">
        <Link href="/elections/general-elections" className="govuk-link">
          ← Back to general elections
        </Link>
        {" · "}
        <Link
          href="/elections/general-elections/operation-plan"
          className="govuk-link"
        >
          Full operation plan (EOP)
        </Link>
        {" · "}
        <Link href="/elections/by-elections" className="govuk-link">
          By-elections
        </Link>
        {" · "}
        <Link href="/elections/political-parties" className="govuk-link">
          Political parties
        </Link>
        {" · "}
        <Link href="/government/people" className="govuk-link">
          Government people
        </Link>
      </p>

      <LastUpdated published="2026-08-07" lastUpdated="2026-08-08" />

      <style>{`
        /* Green panels (GOV.UK confirmation + election day): readable links */
        .govuk-panel--confirmation a.govuk-link,
        .app-next-election-panel a.govuk-link,
        .app-next-election-panel__link {
          color: #ffe066 !important;
          text-decoration: underline;
          text-underline-offset: 0.15em;
          font-weight: 700;
        }
        .govuk-panel--confirmation a.govuk-link:hover,
        .app-next-election-panel a.govuk-link:hover,
        .app-next-election-panel__link:hover {
          color: #ffffff !important;
        }
        .govuk-panel--confirmation a.govuk-link:focus,
        .app-next-election-panel a.govuk-link:focus,
        .app-next-election-panel__link:focus {
          color: #0b0c0c !important;
          background-color: #ffdd00;
          box-shadow: 0 -2px #ffdd00, 0 4px #0b0c0c;
          outline: 3px solid transparent;
          text-decoration: none;
        }
        .app-next-election-panel {
          background-color: #00703c;
          color: #ffffff;
          padding: 20px;
          border-left: 5px solid #005a30;
        }
        .app-next-election-panel h2,
        .app-next-election-panel p {
          color: #ffffff;
        }
        .app-next-election-panel .govuk-heading-l {
          color: #ffffff;
          font-size: 2rem;
          line-height: 1.2;
        }
        @media (max-width: 40.05em) {
          .app-next-election-panel {
            padding: 16px;
          }
          .app-next-election-panel .govuk-heading-l {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
