import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nairobi 2029 championship dates",
  description:
    "Confirmed date information and planning guidance for the World Athletics Championships Nairobi 2029.",
};

export default function ChampionshipDatesPage() {
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
          { text: "Championship dates" },
        ]}
        title="Championship dates"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <strong>Exact dates have not been announced.</strong> The
            championships will take place in September 2029.
          </div>

          <h2 className="govuk-heading-l">What is confirmed</h2>
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Year</dt>
              <dd className="govuk-summary-list__value">2029</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Month</dt>
              <dd className="govuk-summary-list__value">September</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Host city</dt>
              <dd className="govuk-summary-list__value">Nairobi, Kenya</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Time zone</dt>
              <dd className="govuk-summary-list__value">
                East Africa Time (UTC+3)
              </dd>
            </div>
          </dl>

          <h2 className="govuk-heading-l">What will be added</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>opening and closing dates</li>
            <li>competition days and rest days</li>
            <li>morning and evening session times</li>
            <li>opening and closing ceremony times</li>
            <li>ticket-session dates</li>
            <li>changes caused by weather or operational requirements</li>
          </ul>

          <h2 className="govuk-heading-l">Before booking travel</h2>
          <p className="govuk-body">
            Do not use the September 2029 window as if it were an exact event
            date. If your trip depends on a particular discipline or athlete,
            wait for the detailed programme before making non-refundable
            arrangements.
          </p>
          <p className="govuk-body">
            Ticket sessions may not cover an entire day. Check the session,
            date, venue and entry time before paying for transport or
            accommodation.
          </p>

          <h2 className="govuk-heading-l">How dates will be confirmed</h2>
          <p className="govuk-body">
            CitizenGuide.KE will update this page after dates are published by{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            or the official event organizers. The publication date and issuing
            organization will be recorded.
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
