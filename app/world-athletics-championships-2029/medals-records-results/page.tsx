import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Medals, records and results", description: "How medals, official results and athletics records are determined at the World Athletics Championships." };

export default function MedalsRecordsResultsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Medals, records and results" }]} title="Medals, records and results" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <h2 className="govuk-heading-l">Medal placings</h2>
        <p className="govuk-body">Gold, silver and bronze medals are normally awarded to the first 3 eligible finishers or ranked competitors in each championship event. Relay medals are awarded under the applicable team rules.</p>
        <h2 className="govuk-heading-l">Ties</h2>
        <p className="govuk-body">Tie-breaking depends on the event. Photo-finish evidence, countbacks, best performances or other technical rules may apply. Some placings can remain tied where the rules allow it.</p>
        <h2 className="govuk-heading-l">Records</h2>
        <p className="govuk-body">A performance may be identified as a world, championship, area or national record. Record recognition can depend on timing, wind readings, equipment, course certification, doping control and later ratification.</p>
        <h2 className="govuk-heading-l">Protests, appeals and disqualifications</h2>
        <p className="govuk-body">Provisional results can change following a protest, jury decision, rule infringement, eligibility decision or later disciplinary process. CitizenGuide.KE will use results marked official and note material later changes.</p>
        <h2 className="govuk-heading-l">Medal table</h2>
        <p className="govuk-body">The medal table groups medals by country. It does not determine the result of an individual event and should not replace official athlete or team results.</p>
        <h2 className="govuk-heading-l">Live and official results</h2>
        <p className="govuk-body">During Nairobi 2029, use <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> for start lists, live results, official results and record status. CitizenGuide.KE may provide summaries but will not operate the official timing system.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
