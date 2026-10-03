import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Field events", description: "Jumping and throwing events at the World Athletics Championships and how qualification and finals work." };

export default function FieldEventsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Field events" }]} title="Field events" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <div className="govuk-inset-text">The final Nairobi 2029 field-event programme and timetable have not been announced.</div>
        <h2 className="govuk-heading-l">Jumping events</h2>
        <ul className="govuk-list govuk-list--bullet"><li>high jump</li><li>pole vault</li><li>long jump</li><li>triple jump</li></ul>
        <p className="govuk-body">High jump and pole vault are decided by the greatest height cleared under the event rules. Long jump and triple jump are decided by the longest valid distance.</p>
        <h2 className="govuk-heading-l">Throwing events</h2>
        <ul className="govuk-list govuk-list--bullet"><li>shot put</li><li>discus throw</li><li>hammer throw</li><li>javelin throw</li></ul>
        <p className="govuk-body">Throwing events are decided by the longest valid attempt. Implements and technical requirements differ by event and competition category.</p>
        <h2 className="govuk-heading-l">Qualification</h2>
        <p className="govuk-body">Athletes may compete in qualification groups before the final. They can advance by meeting an automatic qualifying mark or by ranking among the required number of best performers.</p>
        <h2 className="govuk-heading-l">Finals and attempts</h2>
        <p className="govuk-body">In horizontal jumps and throws, the field normally receives an initial number of attempts before the leading athletes receive further attempts. Vertical jumps continue through increasing bar heights until placings are decided.</p>
        <p className="govuk-body">Final rules and qualifying marks will be published by <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
