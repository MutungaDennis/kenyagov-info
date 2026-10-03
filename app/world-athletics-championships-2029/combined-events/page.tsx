import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Combined events", description: "How multi-discipline combined events are contested and scored at the World Athletics Championships." };

export default function CombinedEventsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Combined events" }]} title="Combined events" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <div className="govuk-inset-text">The combined-event programme and timetable for Nairobi 2029 have not been confirmed.</div>
        <h2 className="govuk-heading-l">What a combined event is</h2>
        <p className="govuk-body">Combined events test athletes across several running, jumping and throwing disciplines. Competition is normally spread across 2 days.</p>
        <h2 className="govuk-heading-l">Decathlon and heptathlon</h2>
        <p className="govuk-body">Recent senior championships have included the decathlon and heptathlon. The disciplines, order and eligibility categories for Nairobi 2029 must be checked against the final programme.</p>
        <h2 className="govuk-heading-l">How scoring works</h2>
        <p className="govuk-body">Each performance is converted into points using official scoring tables. Athletes accumulate points across all disciplines. The athlete with the highest total after the final discipline wins.</p>
        <h2 className="govuk-heading-l">Failure to start or finish</h2>
        <p className="govuk-body">Missing a discipline, recording no valid performance or withdrawing can affect whether an athlete receives a final classification. The applicable competition rules determine the result.</p>
        <h2 className="govuk-heading-l">Following the standings</h2>
        <p className="govuk-body">The overall leader may change after every discipline. Use official live results for individual performances, points and cumulative standings.</p>
        <p className="govuk-body"><ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> will publish the authoritative rules and Nairobi 2029 programme.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
