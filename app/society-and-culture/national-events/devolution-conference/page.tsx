import type { Metadata } from "next";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import {

devolutionConferenceNotes,
  type DevolutionConferenceEdition,
} from "@/lib/data/devolution-events";
import {
  formatDevolutionDateRange,
  getDevolutionConferenceHighlight,
  getPastDevolutionConferences,
} from "@/lib/data/devolution-events.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Devolution Conference",
  description:
    "Council of Governors Devolution Conference — next, ongoing or most recent edition, and past hosts, venues and themes since 2014.",
};

function ConferenceTable({
  editions,
  caption,
}: {
  editions: DevolutionConferenceEdition[];
  caption: string;
}) {
  if (editions.length === 0) {
    return <p className="govuk-body">No editions in this list.</p>;
  }

  return (
    <TableScroll caption={caption}>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-visually-hidden">
          {caption}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Edition
            </th>
            <th scope="col" className="govuk-table__header">
              Dates
            </th>
            <th scope="col" className="govuk-table__header">
              Host county
            </th>
            <th scope="col" className="govuk-table__header">
              Venue
            </th>
            <th scope="col" className="govuk-table__header">
              Theme
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {editions.map((e) => (
            <tr key={e.edition} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                {e.label}
              </th>
              <td className="govuk-table__cell">
                {formatDevolutionDateRange(e.startDate, e.endDate)}
              </td>
              <td className="govuk-table__cell">{e.hostCounty}</td>
              <td className="govuk-table__cell">{e.venue}</td>
              <td className="govuk-table__cell">{e.theme}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function DevolutionConferencePage() {
  const highlight = getDevolutionConferenceHighlight();
  const past = getPastDevolutionConferences();

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          {
            text: "National events",
            href: "/society-and-culture/national-events",
          },
          { text: "Devolution Conference" },
        ]}
      />

      <span className="govuk-caption-m">Council of Governors</span>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
        Devolution Conference
      </h1>
      <p className="govuk-body govuk-!-margin-bottom-6">
        Major intergovernmental conference on Kenya’s devolved system of
        government — hosts, venues and official themes since 2014.
      </p>

      {/* Highlight: ongoing → next → most recent (last held) */}
      {highlight && (
        <div className="app-next-holiday-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            {highlight.status === "ongoing"
              ? "Devolution Conference happening now"
              : highlight.status === "upcoming"
                ? "Next Devolution Conference"
                : "Most recent Devolution Conference"}
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {highlight.edition.label} edition
          </p>
          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {formatDevolutionDateRange(
              highlight.edition.startDate,
              highlight.edition.endDate,
            )}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            <strong>{highlight.edition.hostCounty} County</strong>
            {" · "}
            {highlight.edition.venue}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-2">
            Theme: {highlight.edition.theme}
          </p>
          {highlight.status === "ongoing" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              This conference is underway.
            </p>
          )}
          {highlight.status === "recent" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              This is the last conference held. The next (typically under the
              biennial cycle) has not been announced yet.
            </p>
          )}
        </div>
      )}

      <div className="govuk-inset-text">
        <p className="govuk-body">{devolutionConferenceNotes.organiser}</p>
        <p className="govuk-body govuk-!-margin-bottom-0">
          {devolutionConferenceNotes.biennial}
        </p>
      </div>

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list">
          <li>
            <a className="govuk-link" href="#past">
              Past conferences
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#notes">
              Key transitions
            </a>
          </li>
        </ul>
      </nav>

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past conferences</h2>
        <p className="govuk-body">Most recent first.</p>
        <ConferenceTable
          editions={past}
          caption="Past Devolution Conference editions"
        />
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="notes" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Key historical transitions</h2>
        <h3 className="govuk-heading-m">2020 hiatus</h3>
        <p className="govuk-body">{devolutionConferenceNotes.covid2020}</p>
        <h3 className="govuk-heading-m">Shift to a biennial cycle</h3>
        <p className="govuk-body">{devolutionConferenceNotes.biennial}</p>
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link
            href="/society-and-culture/national-events/devolution-sensitisation-week"
            className="govuk-link"
          >
            Devolution Sensitisation Week
          </Link>
        </li>
        <li>
          <Link href="/government/counties/devolution" className="govuk-link">
            Devolution
          </Link>
        </li>
        <li>
          <Link href="/county-vs-national" className="govuk-link">
            County vs national government
          </Link>
        </li>
        <li>
          <Link href="/constitution/chapter/11" className="govuk-link">
            Chapter 11 — Devolved government
          </Link>
        </li>
        <li>
          <Link
            href="/society-and-culture/national-events"
            className="govuk-link"
          >
            All national events
          </Link>
        </li>
      </ul>

      <LastUpdated published="2026-07-15" lastUpdated="2026-07-15" />

      <style>{`
        .app-next-holiday-panel {
          background-color: #00703c;
          color: #ffffff;
          padding: 20px;
          border-left: 5px solid #005a30;
        }
        .app-next-holiday-panel h2,
        .app-next-holiday-panel p {
          color: #ffffff;
        }
        .app-next-holiday-panel .govuk-heading-l {
          color: #ffffff;
          font-size: 1.75rem;
          line-height: 1.2;
        }
        .app-next-holiday-panel .govuk-body-l {
          color: #ffffff;
        }
        @media (max-width: 40.05em) {
          .app-next-holiday-panel {
            padding: 16px;
          }
          .app-next-holiday-panel .govuk-heading-l {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
