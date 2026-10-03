import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Kasarani Stadium and Nairobi 2029",
  description:
    "Confirmed information about Moi International Sports Centre, Kasarani as the principal stadium for the World Athletics Championships Nairobi 2029.",
};

export default function KasaraniStadiumPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          {
            text: "World Athletics Championships Nairobi 2029",
            href: "/world-athletics-championships-2029",
          },
          {
            text: "Dates and venues",
            href: "/world-athletics-championships-2029/dates-venues",
          },
          { text: "Kasarani Stadium" },
        ]}
        title="Kasarani Stadium"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Moi International Sports Centre, Kasarani was presented as the
            principal stadium in Nairobi&apos;s successful bid to host the 2029
            World Athletics Championships.
          </p>

          <div className="govuk-inset-text">
            Final spectator arrangements, seating plans, entrances and the
            events assigned to the stadium have not yet been published.
          </div>

          <h2 className="govuk-heading-l">Location</h2>
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Full name</dt>
              <dd className="govuk-summary-list__value">
                Moi International Sports Centre, Kasarani
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Area</dt>
              <dd className="govuk-summary-list__value">Kasarani, Nairobi</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Host city</dt>
              <dd className="govuk-summary-list__value">Nairobi, Kenya</dd>
            </div>
          </dl>

          <h2 className="govuk-heading-l">Role in the championships</h2>
          <p className="govuk-body">
            The stadium is expected to host the main programme of track and
            field competition. A final event-by-event allocation will only be
            added after publication by{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            or the official event organizers.
          </p>

          <h2 className="govuk-heading-l">Stadium works</h2>
          <p className="govuk-body">
            World Athletics said Kasarani was undergoing a complete structural
            overhaul ahead of major international events. Completion dates,
            certified athletics facilities and spectator capacity will be
            reported from official inspection or handover information rather
            than estimates.
          </p>

          <h2 className="govuk-heading-l">Information still required</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>final seating plan and ticket categories</li>
            <li>accessible seating and companion arrangements</li>
            <li>spectator entrances and security-screening points</li>
            <li>permitted and prohibited items</li>
            <li>food, water, toilets and medical facilities</li>
            <li>media, team and workforce entrances</li>
            <li>parking, drop-off and public transport arrangements</li>
          </ul>

          <h2 className="govuk-heading-l">Getting to Kasarani</h2>
          <p className="govuk-body">
            Do not rely on normal-day routes during the championships. Event
            traffic controls and access points may be different. Confirmed
            transport information will be provided under{" "}
            <Link
              href="/world-athletics-championships-2029/getting-to-the-venues"
              className="govuk-link govuk-link--no-visited-state"
            >
              getting to the venues
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <Link
              href="/world-athletics-championships-2029/dates-venues"
              className="govuk-link govuk-link--no-visited-state"
            >
              Back to Dates and venues
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
