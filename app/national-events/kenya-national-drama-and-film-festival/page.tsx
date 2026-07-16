import type { Metadata } from "next";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import { kndffNotes, type KndffEdition } from "@/lib/data/kndff";
import {

formatKndffDateRange,
  formatKndffTheme,
  formatKndffVenue,
  formatKndffWinner,
  getCancelledKndff,
  getKndffHighlight,
  getPastKndff,
} from "@/lib/data/kndff.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kenya National Drama and Film Festival",
  description:
    "Kenya National Drama and Film Festival (KNDFF) — next, ongoing or most recent national finals, past editions, hosts, themes and secondary-school play winners.",
};

function KndffTable({
  editions,
  caption,
}: {
  editions: KndffEdition[];
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
              Year
            </th>
            <th scope="col" className="govuk-table__header">
              Host / venue
            </th>
            <th scope="col" className="govuk-table__header">
              Theme
            </th>
            <th scope="col" className="govuk-table__header">
              Secondary play winner
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {editions.map((e) => (
            <tr key={`${e.year}-${e.label}`} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                {e.label}
              </th>
              <td className="govuk-table__cell">{e.year}</td>
              <td className="govuk-table__cell">{formatKndffVenue(e)}</td>
              <td className="govuk-table__cell">{formatKndffTheme(e)}</td>
              <td className="govuk-table__cell">{formatKndffWinner(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function KenyaNationalDramaAndFilmFestivalPage() {
  const highlight = getKndffHighlight();
  const past = getPastKndff();
  const cancelled = getCancelledKndff();
  const edition = highlight?.edition;

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
          { text: "Kenya National Drama and Film Festival" },
        ]}
      />

      <span className="govuk-caption-m">Education and arts</span>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
        Kenya National Drama and Film Festival
      </h1>
      <p className="govuk-body govuk-!-margin-bottom-6">
        National co-curricular finals for schools and colleges — theatre, film
        and related performance — with hosts, themes and secondary-school play
        winners where recorded.
      </p>

      {highlight && edition && (
        <div className="app-next-holiday-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            {highlight.status === "ongoing"
              ? "Kenya National Drama and Film Festival happening now"
              : highlight.status === "upcoming"
                ? "Next Kenya National Drama and Film Festival"
                : "Most recent Kenya National Drama and Film Festival"}
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {edition.label}
            {edition.edition != null ? ` edition` : ""} · {edition.year}
          </p>
          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {formatKndffDateRange(edition.startDate, edition.endDate)}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            <strong>{formatKndffVenue(edition)}</strong>
          </p>
          <p className="govuk-body govuk-!-margin-bottom-2">
            Theme: {formatKndffTheme(edition)}
          </p>
          {edition.secondaryPlayWinner && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Secondary play winner: {edition.secondaryPlayWinner}
            </p>
          )}
          {highlight.status === "ongoing" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              National finals are underway.
            </p>
          )}
          {highlight.status === "recent" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              This is the last full national finals listed. The next edition is
              usually announced for the following school year (often April).
            </p>
          )}
          {highlight.status === "upcoming" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              Confirm exact dates and halls with the Ministry of Education /
              festival secretariat before you travel.
            </p>
          )}
        </div>
      )}

      <div className="govuk-inset-text">
        <p className="govuk-body">{kndffNotes.organiser}</p>
        <p className="govuk-body">{kndffNotes.scope}</p>
        <p className="govuk-body govuk-!-margin-bottom-0">{kndffNotes.winners}</p>
      </div>

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list">
          <li>
            <a className="govuk-link" href="#past">
              Past national finals
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#cancelled">
              COVID break years
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#notes">
              History and data notes
            </a>
          </li>
        </ul>
      </nav>

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past national finals</h2>
        <p className="govuk-body">
          Most recent first. Held national finals from 1985 to the latest
          completed year in this dataset (high-school play winners from the
          compiled national list).
        </p>
        <KndffTable
          editions={past}
          caption="Past Kenya National Drama and Film Festival editions"
        />
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="cancelled" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">COVID break years</h2>
        <p className="govuk-body">
          Years with no high-school national play winner in the compiled list
          (COVID-era break).
        </p>
        {cancelled.length > 0 ? (
          <ul className="govuk-list govuk-list--bullet">
            {cancelled.map((e) => (
              <li key={e.year}>
                <strong>{e.year}</strong>
                {e.notes ? ` — ${e.notes}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="govuk-body">No cancelled years listed.</p>
        )}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="notes" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">History and data notes</h2>
        <p className="govuk-body">{kndffNotes.origin}</p>
        <p className="govuk-body">{kndffNotes.film}</p>
        <p className="govuk-body">
          High-school play winners from 1985 to 2026 follow the compiled national
          winners list (including COVID breaks for 2020–2022). The 64th State
          Concert was held at State House Grounds, Nairobi. Edition numbers for
          1985–1989 are reconstructed from the continuous sequence into the 31st
          edition (1990). The first Schools Drama Festival is dated to 1959;
          earlier decades are not fully tabulated here.
        </p>
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link
            href="/national-events/kenya-music-festival"
            className="govuk-link"
          >
            Kenya Music Festival
          </Link>
        </li>
        <li>
          <Link href="/topics/education" className="govuk-link">
            Education
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
