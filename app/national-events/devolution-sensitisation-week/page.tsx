import type { Metadata } from "next";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import type { DswEdition } from "@/lib/data/devolution-events";
import {

daysUntil,
  formatDevolutionDateRange,
  getDswHighlight,
  getPastDsw,
} from "@/lib/data/devolution-events.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Devolution Sensitisation Week",
  description:
    "Council of Governors Devolution Sensitisation Week (DSW) — next, ongoing or most recent week, and past editions.",
};

function DswTable({
  editions,
  caption,
}: {
  editions: DswEdition[];
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
              Notes
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
                {formatDevolutionDateRange(
                  e.startDate,
                  e.endDate,
                  e.precision,
                )}
                {e.precision === "year-only" ? (
                  <span className="govuk-body-s govuk-!-display-block">
                    Year only (exact multi-day span not fixed in source)
                  </span>
                ) : null}
              </td>
              <td className="govuk-table__cell">{e.hostCounty}</td>
              <td className="govuk-table__cell">{e.venue}</td>
              <td className="govuk-table__cell">{e.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function DevolutionSensitisationWeekPage() {
  const highlight = getDswHighlight();
  const past = getPastDsw();
  const days =
    highlight && highlight.status === "upcoming"
      ? daysUntil(highlight.edition.startDate)
      : null;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          {
            text: "National events",
            href: "/national-events",
          },
          { text: "Devolution Sensitisation Week" },
        ]}
      />

      <span className="govuk-caption-m">Council of Governors</span>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
        Devolution Sensitisation Week
      </h1>
      <p className="govuk-body govuk-!-margin-bottom-6">
        Public-facing weeks led with the Council of Governors to explain
        devolution, showcase county progress and gather citizen feedback.
      </p>

      {highlight && (
        <div className="app-next-holiday-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            {highlight.status === "ongoing"
              ? "Devolution Sensitisation Week happening now"
              : highlight.status === "upcoming"
                ? "Next Devolution Sensitisation Week"
                : "Most recent Devolution Sensitisation Week"}
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {highlight.edition.label} edition
          </p>
          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {formatDevolutionDateRange(
              highlight.edition.startDate,
              highlight.edition.endDate,
              highlight.edition.precision,
            )}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            <strong>{highlight.edition.hostCounty} County</strong>
            {" · "}
            {highlight.edition.venue}
          </p>
          {highlight.status === "upcoming" && days !== null && days > 0 && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Starts in {days} day{days === 1 ? "" : "s"}
            </p>
          )}
          {highlight.status === "ongoing" && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              This week is underway
              {highlight.edition.precision === "exact"
                ? ` until ${formatDevolutionDateRange(highlight.edition.endDate, highlight.edition.endDate)}`
                : ""}
              .
            </p>
          )}
          {highlight.status === "recent" && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              This is the last week listed. Check the Council of Governors for
              the next announcement.
            </p>
          )}
          {highlight.edition.notes && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              {highlight.edition.notes}
            </p>
          )}
        </div>
      )}

      {!highlight && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning </span>
            No Devolution Sensitisation Week is listed in the calendar on this
            site. Check the Council of Governors for new announcements.
          </strong>
        </div>
      )}

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          DSW is distinct from the multi-day{" "}
          <Link
            href="/national-events/devolution-conference"
            className="govuk-link"
          >
            Devolution Conference
          </Link>
          . Sensitisation weeks focus on public education and feedback; the
          conference is the main intergovernmental forum.
        </p>
      </div>

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list">
          <li>
            <a className="govuk-link" href="#past">
              Past weeks
            </a>
          </li>
        </ul>
      </nav>

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past weeks</h2>
        <p className="govuk-body">Most recent first.</p>
        {past.length > 0 ? (
          <DswTable editions={past} caption="Past DSW editions" />
        ) : (
          <p className="govuk-body">No past editions in the loaded data.</p>
        )}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link
            href="/national-events/devolution-conference"
            className="govuk-link"
          >
            Devolution Conference
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
          <Link
            href="/national-events"
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
