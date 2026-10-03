import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Track events", description: "Track races normally contested at the World Athletics Championships and how they are run." };

export default function TrackEventsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Track events" }]} title="Track events" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <div className="govuk-inset-text">The final Nairobi 2029 track programme has not been announced. The events below describe the normal senior championship programme, not a confirmed entry list.</div>
        <h2 className="govuk-heading-l">Sprints</h2>
        <p className="govuk-body">Sprint events normally include 100 metres, 200 metres and 400 metres. Athletes usually progress through rounds before the final.</p>
        <h2 className="govuk-heading-l">Middle and long distances</h2>
        <p className="govuk-body">These normally include 800 metres, 1500 metres, 5000 metres and 10,000 metres. The number of rounds and qualification method depend on the event and entry size.</p>
        <h2 className="govuk-heading-l">Hurdles and steeplechase</h2>
        <p className="govuk-body">The programme normally includes sprint hurdles, 400-metre hurdles and the 3000-metre steeplechase. Hurdle height and spacing differ by event.</p>
        <h2 className="govuk-heading-l">Relays</h2>
        <p className="govuk-body">Relay events involve national teams passing a baton within marked takeover zones. The final relay programme, team-entry rules and whether qualifying heats are required will be confirmed for Nairobi 2029.</p>
        <h2 className="govuk-heading-l">Lane draws and advancement</h2>
        <p className="govuk-body">Lane allocation and progression can depend on seedings, finishing position, time and event-specific rules. Do not assume the format used at another championship will apply unchanged.</p>
        <p className="govuk-body">Check <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> for the official programme, start lists and technical rules.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
