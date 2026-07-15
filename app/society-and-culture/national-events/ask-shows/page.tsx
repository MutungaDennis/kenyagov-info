import type { Metadata } from "next";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import {
  askTheme2026,
  getProfilesByTier,
  type AskCalendarEvent,
} from "@/lib/data/ask-shows";
import {
  daysUntilStart,
  formatAskDateRange,
  formatAskDayOfWeek,
  getAskTierLabel,
  getCurrentYear,
  getNextAskEvent,
  getPastAskEvents,
  getUpcomingAskEvents,
  profilePath,
} from "@/lib/data/ask-shows.utils";

export const metadata: Metadata = {
  title: "Agricultural Society of Kenya (ASK) shows",
  description:
    "2026 ASK calendar — next show, upcoming and past events, international and national shows, stand and gate charges.",
};

function EventTable({
  events,
  caption,
  showYear = false,
}: {
  events: AskCalendarEvent[];
  caption: string;
  showYear?: boolean;
}) {
  if (events.length === 0) {
    return <p className="govuk-body">No events in this list.</p>;
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
              Dates
            </th>
            <th scope="col" className="govuk-table__header">
              Event
            </th>
            <th scope="col" className="govuk-table__header">
              Place
            </th>
            <th scope="col" className="govuk-table__header">
              Type
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {events.map((event) => (
            <tr key={event.id} className="govuk-table__row">
              <td className="govuk-table__cell">
                {formatAskDateRange(event.startDate, event.endDate)}
                {!showYear && (
                  <span className="govuk-visually-hidden"> {event.year}</span>
                )}
              </td>
              <td className="govuk-table__cell">
                {event.profileSlug ? (
                  <Link
                    href={profilePath(event.profileSlug)}
                    className="govuk-link govuk-!-font-weight-bold"
                  >
                    {event.name}
                  </Link>
                ) : (
                  <strong>{event.name}</strong>
                )}
              </td>
              <td className="govuk-table__cell">
                {event.place}
                {event.venue !== event.place ? (
                  <span className="govuk-body-s govuk-!-display-block">
                    {event.venue}
                  </span>
                ) : null}
              </td>
              <td className="govuk-table__cell">
                {getAskTierLabel(event.tier)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function AskShowsPage() {
  const currentYear = getCurrentYear();
  const calendarYear = askTheme2026.year;
  const nextEvent = getNextAskEvent();
  const upcoming = getUpcomingAskEvents(calendarYear);
  const past = getPastAskEvents(calendarYear);
  const international = getProfilesByTier("international");
  const national = getProfilesByTier("national");
  const regional = getProfilesByTier("regional");
  const satellite = getProfilesByTier("satellite");

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
          { text: "ASK shows" },
        ]}
      />

      <span className="govuk-caption-m">Agricultural Society of Kenya</span>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
        ASK shows and trade fairs
      </h1>
      <p className="govuk-body govuk-!-margin-bottom-6">
        Calendar of Agricultural Society of Kenya shows and related events for{" "}
        {calendarYear}.
      </p>

      {/* Next event first — no scroll past long intro */}
      {nextEvent && (
        <div className="app-next-holiday-panel govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            Next ASK event
          </h2>
          <p className="govuk-heading-l govuk-!-margin-bottom-1">
            {formatAskDateRange(nextEvent.startDate, nextEvent.endDate)}
          </p>
          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {formatAskDayOfWeek(nextEvent.startDate)}
            {nextEvent.startDate !== nextEvent.endDate
              ? ` – ${formatAskDayOfWeek(nextEvent.endDate)}`
              : ""}{" "}
            — {nextEvent.name}
          </p>
          <p className="govuk-body govuk-!-margin-bottom-1">
            {nextEvent.place}
            {nextEvent.venue ? ` · ${nextEvent.venue}` : ""} ·{" "}
            {getAskTierLabel(nextEvent.tier)}
          </p>
          {daysUntilStart(nextEvent) > 0 && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Starts in {daysUntilStart(nextEvent)} day
              {daysUntilStart(nextEvent) === 1 ? "" : "s"}
            </p>
          )}
          {daysUntilStart(nextEvent) === 0 && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Starts today (or is ongoing)
            </p>
          )}
          {daysUntilStart(nextEvent) < 0 && (
            <p className="govuk-body govuk-!-margin-bottom-2">
              Ongoing until{" "}
              {formatAskDateRange(nextEvent.endDate, nextEvent.endDate)}
            </p>
          )}
          {nextEvent.profileSlug && (
            <p className="govuk-body govuk-!-margin-bottom-0">
              <Link
                href={profilePath(nextEvent.profileSlug)}
                className="govuk-link"
              >
                Show details, stand rates and gate charges
              </Link>
            </p>
          )}
        </div>
      )}

      {!nextEvent && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning </span>
            There are no upcoming events left in the loaded calendar years. Check
            with ASK for the next published programme.
          </strong>
        </div>
      )}

      <div className="govuk-inset-text">
        <p className="govuk-body">
          The Agricultural Society of Kenya (ASK) is a{" "}
          <strong>private membership society</strong> registered under the
          Societies Act — not a government parastatal. It works closely with
          national and county governments. Shows often involve state agencies as
          exhibitors and may receive public support; confirm fees and access
          with the relevant ASK branch before you exhibit or travel.
        </p>
        <p className="govuk-body govuk-!-margin-bottom-0">
          Source: ASK published calendar and branch information for{" "}
          {calendarYear}. Rates can change — verify with the organiser.
        </p>
      </div>

      <h2 className="govuk-heading-m">{calendarYear} theme</h2>
      <p className="govuk-body">
        <strong>English:</strong> {askTheme2026.english}
      </p>
      <p className="govuk-body">
        <strong>Kiswahili:</strong> {askTheme2026.kiswahili}
      </p>

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list">
          <li>
            <a className="govuk-link" href="#upcoming">
              Upcoming events
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#past">
              Past events this year
            </a>
          </li>
          <li>
            <a className="govuk-link" href="#browse-shows">
              Browse shows by type
            </a>
          </li>
        </ul>
      </nav>

      <section id="upcoming" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Upcoming ASK events</h2>
        <p className="govuk-body">
          Events in {calendarYear} that have not yet finished (including multi-day
          shows still running).
        </p>
        <EventTable
          events={upcoming}
          caption={`Upcoming ASK events in ${calendarYear}`}
        />
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="past" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past events in {calendarYear}</h2>
        <p className="govuk-body">
          Events that have already finished, most recent first.
        </p>
        {past.length > 0 ? (
          <EventTable
            events={past}
            caption={`Past ASK events in ${calendarYear}`}
            showYear
          />
        ) : (
          <p className="govuk-body">
            No events from the {calendarYear} calendar have finished yet
            {currentYear < calendarYear
              ? ` (calendar year ${calendarYear} is ahead of the current year).`
              : "."}
          </p>
        )}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <section id="browse-shows" className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Browse shows by type</h2>
        <p className="govuk-body">
          Open a show for history, location, stand rates and gate charges where
          published.
        </p>

        <h3 className="govuk-heading-m">1. International shows</h3>
        <ul className="govuk-list govuk-list--bullet">
          {international.map((p) => (
            <li key={p.slug}>
              <Link href={profilePath(p.slug)} className="govuk-link">
                {p.name}
              </Link>
              {p.shortName ? ` (${p.shortName})` : ""} — {p.location}
            </li>
          ))}
        </ul>

        <h3 className="govuk-heading-m">2. National shows</h3>
        <ul className="govuk-list govuk-list--bullet">
          {national.map((p) => (
            <li key={p.slug}>
              <Link href={profilePath(p.slug)} className="govuk-link">
                {p.name}
              </Link>
              {p.location ? ` — ${p.location}` : ""}
            </li>
          ))}
        </ul>

        <h3 className="govuk-heading-m">3. Regional / branch shows</h3>
        <ul className="govuk-list govuk-list--bullet">
          {regional.map((p) => (
            <li key={p.slug}>
              <Link href={profilePath(p.slug)} className="govuk-link">
                {p.name}
              </Link>
              {p.location ? ` — ${p.location}` : ""}
            </li>
          ))}
        </ul>

        <h3 className="govuk-heading-m">4. Satellite shows</h3>
        <p className="govuk-body">
          Listed by ASK; detailed public rates were not in the source pack for:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          {satellite.map((p) => (
            <li key={p.slug}>
              <Link href={profilePath(p.slug)} className="govuk-link">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link
            href="/society-and-culture/national-events"
            className="govuk-link"
          >
            All national events
          </Link>
        </li>
        <li>
          <Link
            href="/society-and-culture/national-events/nairobi-international-trade-fair"
            className="govuk-link"
          >
            Nairobi International Trade Fair (summary)
          </Link>
        </li>
        <li>
          <Link href="/topics/environment-farming" className="govuk-link">
            Environment and farming topic
          </Link>
        </li>
        <li>
          <Link href="/corrections" className="govuk-link">
            Report a correction
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
          font-size: 2rem;
          line-height: 1.2;
        }
        .app-next-holiday-panel .govuk-body-l {
          color: #ffffff;
        }
        .app-next-holiday-panel a.govuk-link {
          color: #ffffff !important;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
