import type { Metadata } from "next";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import TableScroll from "@/components/govuk/TableScroll";
import {

kmfAdjudicationNotes,
  kmfMilestones,
  kmfNotes,
  kmfNyayoNotes,
  type KmfEdition,
} from "@/lib/data/kenya-music-festival";
import {
  daysUntilKmfStart,
  formatKmfDateRange,
  formatKmfTheme,
  formatKmfVenue,
  getCancelledKmf,
  getKmfHighlight,
  getPastKmf,
} from "@/lib/data/kenya-music-festival.utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kenya Music Festival",
  description:
    "Kenya Music Festival — next, ongoing or most recent national finals, past editions from 1985, venues, themes, and history since 1927.",
};

function KmfTable({
  editions,
  caption,
}: {
  editions: KmfEdition[];
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
              Dates
            </th>
            <th scope="col" className="govuk-table__header">
              Host / venue
            </th>
            <th scope="col" className="govuk-table__header">
              Theme
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
              <td className="govuk-table__cell">
                {formatKmfDateRange(e.startDate, e.endDate)}
              </td>
              <td className="govuk-table__cell">{formatKmfVenue(e)}</td>
              <td className="govuk-table__cell">{formatKmfTheme(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function KenyaMusicFestivalPage() {
  const highlight = getKmfHighlight();
  const past = getPastKmf();
  const cancelled = getCancelledKmf();
  const edition = highlight?.edition;
  const days =
    edition && highlight?.status === "upcoming"
      ? daysUntilKmfStart(edition.startDate)
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
          { text: "Kenya Music Festival" },
        ]}
      />

      <span className="govuk-caption-m">Education and arts</span>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
        Kenya Music Festival
      </h1>
      <p className="govuk-body govuk-!-margin-bottom-6">
        National co-curricular finals for schools and colleges — music, dance,
        elocution and related classes — with hosts, dates and themes from 1985
        to the current cycle.
      </p>

      <PrintPageButton />

      {highlight && edition && (
        <div className="app-next-holiday-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            {highlight.status === "ongoing"
              ? "Kenya Music Festival happening now"
              : highlight.status === "upcoming"
                ? "Next Kenya Music Festival"
                : "Most recent Kenya Music Festival"}
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {edition.label}
            {edition.edition != null ? " edition" : ""} · {edition.year}
          </p>
          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {formatKmfDateRange(edition.startDate, edition.endDate)}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            <strong>{formatKmfVenue(edition)}</strong>
          </p>
          <p className="govuk-body govuk-!-margin-bottom-2">
            Theme: {formatKmfTheme(edition)}
          </p>
          {highlight.status === "upcoming" && days !== null && days > 0 && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Starts in {days} day{days === 1 ? "" : "s"}
            </p>
          )}
          {highlight.status === "ongoing" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              National finals are underway until{" "}
              {formatKmfDateRange(edition.endDate, edition.endDate)}.
            </p>
          )}
          {highlight.status === "recent" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              This is the last national finals listed. The next edition is
              usually announced for the following August school holidays.
            </p>
          )}
          {highlight.status === "upcoming" && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              Confirm halls and the daily programme with the Ministry of
              Education or festival secretariat before you travel.
            </p>
          )}
        </div>
      )}

      <div className="govuk-inset-text">
        <p className="govuk-body">{kmfNotes.organiser}</p>
        <p className="govuk-body govuk-!-margin-bottom-0">{kmfNotes.scope}</p>
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
            <a className="govuk-link" href="#history">
              History since 1927
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#adjudication">
              Adjudication in the 1980s
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#nyayo">
              Nyayo-era themes
            </a>
          </li>
        </ul>
      </nav>

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past national finals</h2>
        <p className="govuk-body">
          Most recent first. Held editions from 1985 onward in this dataset
          (edition, dates, venue and theme — no winners column).
        </p>
        <KmfTable
          editions={past}
          caption="Past Kenya Music Festival national finals"
        />
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="cancelled" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">COVID break years</h2>
        <p className="govuk-body">
          No full national finals. Numbering therefore jumps from the 93rd
          edition (2019) to the 94th (2022).
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

      <section id="history" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">History since 1927</h2>
        <p className="govuk-body">{kmfNotes.origin}</p>
        <p className="govuk-body">{kmfNotes.film}</p>
        <h3 className="govuk-heading-m">Milestones before 1985</h3>
        <ul className="govuk-list">
          {kmfMilestones.map((m) => (
            <li key={`${m.year}-${m.title}`} className="govuk-!-margin-bottom-2">
              <strong>
                {m.year} — {m.title}
              </strong>
              <br />
              {m.text}
            </li>
          ))}
        </ul>
        <p className="govuk-body">
          Before the mid-2000s, national finals often stayed at central Nairobi
          venues (especially KICC), with regional winners travelling in. Later
          editions rotate more widely among counties and large school or
          university campuses.
        </p>
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="adjudication" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">{kmfAdjudicationNotes.heading}</h2>
        {kmfAdjudicationNotes.paragraphs.map((p) => (
          <p key={p.slice(0, 40)} className="govuk-body">
            {p}
          </p>
        ))}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="nyayo" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">{kmfNyayoNotes.heading}</h2>
        {kmfNyayoNotes.paragraphs.map((p) => (
          <p key={p.slice(0, 40)} className="govuk-body">
            {p}
          </p>
        ))}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link
            href="/national-events/kenya-national-drama-and-film-festival"
            className="govuk-link"
          >
            Kenya National Drama and Film Festival
          </Link>
        </li>
        <li>
          <Link href="/topics/education" className="govuk-link">
            Education
          </Link>
        </li>
        <li>
          <Link href="/society-and-culture/languages" className="govuk-link">
            Languages
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
