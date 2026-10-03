import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Athlete qualification", description: "How athletes qualify for the World Athletics Championships Nairobi 2029." };

export default function AthleteQualificationPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "Athlete qualification" }]} title="Athlete qualification" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-inset-text"><strong>Nairobi 2029 qualification rules have not been published.</strong> Standards and ranking periods from another championship should not be reused.</div>
      <h2 className="govuk-heading-l">Possible qualification routes</h2><p className="govuk-body"><ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> sets the system for each edition. It may include entry standards, world rankings, designated competitions, defending-champion wild cards and universality provisions.</p>
      <h2 className="govuk-heading-l">Qualification period</h2><p className="govuk-body">A performance must normally occur within the published period and at an eligible competition. Performances outside that period may not count even if they exceed an entry standard.</p>
      <h2 className="govuk-heading-l">Valid performances</h2><p className="govuk-body">Timing, wind, course measurement, implements, competition authorization and result submission can affect whether a performance is accepted.</p>
      <h2 className="govuk-heading-l">Target numbers and rankings</h2><p className="govuk-body">Some events can use target field sizes. Athletes who have not met an automatic standard may qualify through their ranking position when the qualification period closes.</p>
      <h2 className="govuk-heading-l">Qualification is not selection</h2><p className="govuk-body">A qualified athlete is not automatically a member of the final national team. The relevant federation must select and enter the athlete under its policy and championship limits.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
