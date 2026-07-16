import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/site/PageIntro";
import LastUpdated from "@/components/govuk/LastUpdated";
import TableScroll from "@/components/govuk/TableScroll";
import {
  askCalendarByYear,
  getAllAskProfileSlugs,
  getAskProfile,
  askTierLabels,
} from "@/lib/data/ask-shows";
import { formatAskDateRange } from "@/lib/data/ask-shows.utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllAskProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = getAskProfile(slug);
  if (!profile) return { title: "Show not found" };
  return {
    title: profile.name,
    description: `${profile.name} — ASK show information, location and published charges.`,
  };
}

function FeeTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { item: string; amount: string; note?: string }[];
}) {
  if (!rows.length) return null;
  return (
    <TableScroll caption={caption}>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--m">
          {caption}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Item
            </th>
            <th scope="col" className="govuk-table__header">
              Charge
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {rows.map((row) => (
            <tr key={row.item} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                {row.item}
              </th>
              <td className="govuk-table__cell">
                {row.amount}
                {row.note ? (
                  <span className="govuk-body-s govuk-!-display-block">
                    {row.note}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

export default async function AskShowProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = getAskProfile(slug);
  if (!profile) notFound();

  const calendarHits = Object.values(askCalendarByYear)
    .flat()
    .filter((e) => e.profileSlug === slug)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      <PageIntro
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          {
            text: "National events",
            href: "/national-events",
          },
          {
            text: "ASK shows",
            href: "/national-events/ask-shows",
          },
          { text: profile.name },
        ]}
        caption={askTierLabels[profile.tier]}
        title={profile.name}
        lead={
          profile.history?.[0] ??
          `${profile.name} is part of the Agricultural Society of Kenya show network.`
        }
      />

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          Charges below are as published by ASK for guidance. They can change
          and may attract VAT. Confirm with the branch before you budget or
          travel. ASK is a private society, not a government department.
        </p>
      </div>

      {calendarHits.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Dates in the published calendar</h2>
          <ul className="govuk-list govuk-list--bullet">
            {calendarHits.map((e) => (
              <li key={e.id}>
                <strong>{formatAskDateRange(e.startDate, e.endDate)}</strong>
                {" — "}
                {e.venue}, {e.place}
              </li>
            ))}
          </ul>
          <p className="govuk-body">
            <Link
              href="/national-events/ask-shows"
              className="govuk-link"
            >
              Full ASK calendar and next upcoming event
            </Link>
          </p>
        </section>
      )}

      {profile.history && profile.history.length > 1 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">About this show</h2>
          {profile.history.map((p) => (
            <p key={p.slice(0, 40)} className="govuk-body">
              {p}
            </p>
          ))}
        </section>
      )}

      {profile.locationNotes && profile.locationNotes.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Location</h2>
          <ul className="govuk-list govuk-list--bullet">
            {profile.locationNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          {profile.countiesServed && profile.countiesServed.length > 0 && (
            <p className="govuk-body">
              <strong>Counties typically served:</strong>{" "}
              {profile.countiesServed.join(", ")}
            </p>
          )}
        </section>
      )}

      {profile.standRates && profile.standRates.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Stand rates</h2>
          <FeeTable caption="Exhibition stand rates" rows={profile.standRates} />
        </section>
      )}

      {profile.gateCharges && profile.gateCharges.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Gate charges</h2>
          <FeeTable caption="Gate and entry charges" rows={profile.gateCharges} />
        </section>
      )}

      {profile.otherCharges && profile.otherCharges.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Other charges</h2>
          <FeeTable caption="Other exhibitor charges" rows={profile.otherCharges} />
        </section>
      )}

      {profile.membership && profile.membership.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Membership</h2>
          <FeeTable caption="Membership charges" rows={profile.membership} />
        </section>
      )}

      {profile.notes && profile.notes.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Notes</h2>
          <ul className="govuk-list govuk-list--bullet">
            {profile.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {profile.relatedHref && (
        <p className="govuk-body">
          <Link href={profile.relatedHref} className="govuk-link">
            Related national events page
          </Link>
        </p>
      )}

      <p className="govuk-body">
        <Link
          href="/national-events/ask-shows"
          className="govuk-link"
        >
          All ASK shows and calendar
        </Link>
        {" · "}
        <Link
          href="/national-events"
          className="govuk-link"
        >
          National events hub
        </Link>
      </p>

      <LastUpdated published="2026-07-15" lastUpdated="2026-07-15" />
    </>
  );
}
