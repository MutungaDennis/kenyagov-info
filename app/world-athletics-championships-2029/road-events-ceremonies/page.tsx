import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nairobi 2029 road events and ceremonies",
  description:
    "Pending route, public viewing, access and ceremony information for the World Athletics Championships Nairobi 2029.",
};

export default function RoadEventsCeremoniesPage() {
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
          { text: "Road events and ceremonies" },
        ]}
        title="Road events and ceremonies"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            Road-event routes, start and finish locations and ceremony
            arrangements have not yet been announced.
          </div>

          <h2 className="govuk-heading-l">Road events</h2>
          <p className="govuk-body">
            Championship road events take place on measured and approved
            routes outside the stadium. The final Nairobi routes will need to
            support competition operations, medical services, broadcasting,
            athlete security and safe public viewing.
          </p>

          <h2 className="govuk-heading-l">Information that will be published</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>route maps and event distances</li>
            <li>start, finish and athlete-service areas</li>
            <li>competition dates and start times</li>
            <li>free and ticketed spectator areas</li>
            <li>accessible viewing areas</li>
            <li>road closures and reopening times</li>
            <li>pedestrian crossing and resident-access arrangements</li>
            <li>public transport diversions</li>
          </ul>

          <h2 className="govuk-heading-l">Do not use unofficial route maps</h2>
          <p className="govuk-body">
            Proposed or test routes may change. Use a route map only when the
            issuing organization, publication date and event are clear. Final
            competition information should be checked through{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            and the official event organizers.
          </p>

          <h2 className="govuk-heading-l">Opening and closing ceremonies</h2>
          <p className="govuk-body">
            Dates, venues, attendance rules and ticket requirements for any
            opening or closing ceremony have not been published. A competition
            ticket should not be assumed to include entry unless the ticket
            conditions say so.
          </p>

          <h2 className="govuk-heading-l">Living or working near a route</h2>
          <p className="govuk-body">
            Temporary restrictions may affect homes, businesses, deliveries
            and public transport. Detailed local notices should identify the
            roads affected, restriction times, alternative access and the
            authority responsible for enquiries.
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
