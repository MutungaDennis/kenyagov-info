import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Road events", description: "Marathon and race-walking competition at the World Athletics Championships Nairobi 2029." };

export default function RoadEventsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Road events" }]} title="Road events" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <div className="govuk-inset-text">The Nairobi 2029 road-event programme, distances and routes have not been announced.</div>
        <h2 className="govuk-heading-l">Marathon</h2>
        <p className="govuk-body">The championship marathon is run over the official marathon distance on an approved road course. Athletes compete directly for medals rather than progressing through heats.</p>
        <h2 className="govuk-heading-l">Race walking</h2>
        <p className="govuk-body">Race walking is governed by technical rules about continuous contact and the position of the advancing leg. Judges monitor athletes along the course. Distances and formats can change between championship editions.</p>
        <h2 className="govuk-heading-l">Course and conditions</h2>
        <p className="govuk-body">Course design, start time, weather procedures, drink stations, medical services and lap arrangements can affect how a road event is conducted. These will be confirmed for Nairobi 2029.</p>
        <h2 className="govuk-heading-l">Watching road events</h2>
        <p className="govuk-body">Route maps, public viewing areas and road closures are covered under <Link href="/world-athletics-championships-2029/road-events-ceremonies" className="govuk-link govuk-link--no-visited-state">road events and ceremonies</Link>.</p>
        <p className="govuk-body">The final disciplines and technical rules will be published by <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
