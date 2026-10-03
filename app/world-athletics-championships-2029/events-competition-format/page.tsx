import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Events and competition format",
  description:
    "Track, field, road and combined events and how competition works at the World Athletics Championships Nairobi 2029.",
};

const eventPages = [
  { title: "Track events", href: "/world-athletics-championships-2029/track-events", description: "Sprints, distance races, hurdles, steeplechase and relays." },
  { title: "Field events", href: "/world-athletics-championships-2029/field-events", description: "Jumping and throwing events and how qualification and finals work." },
  { title: "Road events", href: "/world-athletics-championships-2029/road-events", description: "Marathon and race-walking competition, subject to the final Nairobi 2029 programme." },
  { title: "Combined events", href: "/world-athletics-championships-2029/combined-events", description: "Multi-discipline competition, scoring and how the overall winner is decided." },
] as const;

const formatPages = [
  { title: "Competition rounds and progression", href: "/world-athletics-championships-2029/competition-rounds", description: "Heats, qualification rounds, semifinals, finals and progression rules." },
  { title: "Medals, records and results", href: "/world-athletics-championships-2029/medals-records-results", description: "Medal placings, official results, records, protests and disqualifications." },
] as const;

export default function EventsCompetitionFormatPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" },
          { text: "About the championships", href: "/world-athletics-championships-2029/about" },
          { text: "Events and competition format" },
        ]}
        title="Events and competition format"
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <strong>The final Nairobi 2029 programme has not been published.</strong>{" "}
            Event lists and competition formats can change between editions.
          </div>

          <h2 className="govuk-heading-l">Events</h2>
          <ul className="govuk-list govuk-list--spaced">
            {eventPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">{page.title}</Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">{page.description}</p>
              </li>
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-8">How competition works</h2>
          <ul className="govuk-list govuk-list--spaced">
            {formatPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">{page.title}</Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">{page.description}</p>
              </li>
            ))}
          </ul>

          <p className="govuk-body govuk-!-margin-top-8">
            Competition rules and the final programme will be confirmed by{" "}
            <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>.
          </p>
        </div>
      </div>
    </>
  );
}
