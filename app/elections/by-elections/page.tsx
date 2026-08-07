import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import type { ByElection } from "@/lib/data/by-elections";
import {
  byElectionTitle,
  daysUntilByElection,
  formatByElectionDate,
  getByElectionHighlight,
  getByElectionStatus,
  getHappeningByElections,
  getPastByElections,
  getUpcomingByElections,
  type ByElectionStatus,
} from "@/lib/data/by-elections.utils";

export const revalidate = 3600;

export const metadata = {
  title: "By-Elections in Kenya",
  description:
    "Upcoming, happening now, and past by-elections in Kenya — parliamentary and county ward seats. Status updates automatically from poll dates.",
};

function statusLabel(s: ByElectionStatus): string {
  if (s === "happening") return "Happening now";
  if (s === "upcoming") return "Upcoming";
  return "Past";
}

function statusTag(s: ByElectionStatus): string {
  if (s === "happening") return "govuk-tag--green";
  if (s === "upcoming") return "govuk-tag--blue";
  return "govuk-tag--grey";
}

function ByElectionTable({
  elections,
  caption,
}: {
  elections: ByElection[];
  caption: string;
}) {
  if (elections.length === 0) {
    return <p className="govuk-body">No by-elections in this list.</p>;
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
              Poll date
            </th>
            <th scope="col" className="govuk-table__header">
              Area
            </th>
            <th scope="col" className="govuk-table__header">
              Seat
            </th>
            <th scope="col" className="govuk-table__header">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {elections.map((e) => {
            const st = getByElectionStatus(e);
            return (
              <tr key={e.id} className="govuk-table__row">
                <td className="govuk-table__cell">
                  {formatByElectionDate(e.date)}
                </td>
                <td className="govuk-table__cell">
                  <strong>{e.area}</strong>
                  <span className="govuk-body-s govuk-!-display-block">
                    {e.county} County
                  </span>
                </td>
                <td className="govuk-table__cell">{e.seat}</td>
                <td className="govuk-table__cell">
                  <strong className={`govuk-tag ${statusTag(st)}`}>
                    {statusLabel(st)}
                  </strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default function ByElectionsPage() {
  const highlight = getByElectionHighlight();
  const happening = getHappeningByElections();
  const upcoming = getUpcomingByElections();
  const past = getPastByElections();
  const days =
    highlight?.status === "upcoming"
      ? daysUntilByElection(highlight.election)
      : null;

  const panelTitle =
    highlight?.status === "happening"
      ? "By-election happening now"
      : highlight?.status === "upcoming"
        ? "Next by-election"
        : "Most recent by-election";

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "By-elections" },
        ]}
      />

      <h1 className="govuk-heading-xl">By-elections in Kenya</h1>

      <p className="govuk-body-l">
        By-elections are held when a seat in Parliament or a County Assembly
        becomes vacant due to death, resignation, appointment, or court
        nullification. IEBC is generally required to hold a by-election within
        90 days of a vacancy being declared.
      </p>

      <p className="govuk-body">
        Lists below update automatically: once a poll date has passed, the seat
        moves from <strong>Upcoming</strong> to <strong>Past</strong>. Confirm
        critical details with{" "}
        <Link href="/government/institutions/iebc" className="govuk-link">
          IEBC
        </Link>{" "}
        and the Kenya Gazette.
      </p>

      {/* Highlight — same idea as ASK shows / national events */}
      {highlight && (
        <div
          className={
            highlight.status === "happening"
              ? "govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6"
              : highlight.status === "upcoming"
                ? "app-next-holiday-panel govuk-!-margin-bottom-6"
                : "govuk-inset-text govuk-!-margin-bottom-6"
          }
        >
          <h2
            className={
              highlight.status === "happening"
                ? "govuk-panel__title"
                : "govuk-heading-m govuk-!-margin-bottom-2"
            }
          >
            {panelTitle}
          </h2>
          <div
            className={
              highlight.status === "happening"
                ? "govuk-panel__body"
                : "govuk-body govuk-!-margin-bottom-0"
            }
          >
            <strong>{byElectionTitle(highlight.election)}</strong>
            <br />
            {highlight.election.seat}
            <br />
            <strong>{formatByElectionDate(highlight.election.date)}</strong>
            {days != null && days > 0 && (
              <>
                <br />
                <span className="govuk-body-s">
                  {days === 1 ? "1 day" : `${days} days`} until polling day
                </span>
              </>
            )}
            {highlight.election.reason && (
              <>
                <br />
                <span className="govuk-body-s">
                  {highlight.election.reason}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {happening.length > 0 && (
        <section className="govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-l">Happening now</h2>
          <ByElectionTable
            elections={happening}
            caption="By-elections on polling day"
          />
        </section>
      )}

      <section className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Upcoming by-elections</h2>
        {upcoming.length === 0 ? (
          <p className="govuk-body">
            No upcoming by-elections are listed in our calendar. When IEBC
            gazettes new polls, they will appear here automatically once added
            to the site data.
          </p>
        ) : (
          <ByElectionTable
            elections={upcoming}
            caption="Upcoming by-elections"
          />
        )}
      </section>

      <section className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-l">Past by-elections</h2>
        <p className="govuk-body">
          Most recent first. Includes parliamentary and county assembly (MCA)
          seats after their poll date has passed.
        </p>
        <ByElectionTable elections={past} caption="Past by-elections" />
      </section>

      <section className="govuk-!-margin-bottom-8">
        <h2 className="govuk-heading-m">Related</h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            <Link href="/elections/general-elections" className="govuk-link">
              General elections
            </Link>
          </li>
          <li>
            <Link
              href="/elections/general-elections/timeline"
              className="govuk-link"
            >
              2027 general election timeline (IEBC)
            </Link>
          </li>
          <li>
            <Link href="/government/people" className="govuk-link">
              Government people directory
            </Link>
          </li>
        </ul>
      </section>

      <LastUpdated published="2026-05-01" lastUpdated="2026-08-07" />
    </>
  );
}
