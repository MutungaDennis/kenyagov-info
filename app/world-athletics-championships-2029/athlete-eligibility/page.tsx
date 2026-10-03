import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Athlete eligibility and representation", description: "Eligibility and country-representation rules for athletes at the World Athletics Championships Nairobi 2029." };

export default function AthleteEligibilityPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "Athlete eligibility" }]} title="Athlete eligibility and representation" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <p className="govuk-body"><ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> sets eligibility and country-representation rules for the championships.</p>
      <h2 className="govuk-heading-l">General eligibility</h2><p className="govuk-body">An athlete must satisfy the applicable entry, age, membership, nationality and integrity requirements. Qualification performance alone does not establish full eligibility.</p>
      <h2 className="govuk-heading-l">Representing a country</h2><p className="govuk-body">Rules determine which member federation an athlete may represent. Nationality changes, transfers of allegiance and previous representation can affect eligibility and waiting periods.</p>
      <h2 className="govuk-heading-l">Age requirements</h2><p className="govuk-body">Minimum ages and restrictions can differ by discipline. The Nairobi 2029 entry rules should be checked for the athlete&apos;s event and year of birth.</p>
      <h2 className="govuk-heading-l">Integrity and disciplinary status</h2><p className="govuk-body">An athlete who is suspended, ineligible or serving a sanction cannot compete contrary to that decision. The <ExternalLink href="https://www.athleticsintegrity.org/">Athletics Integrity Unit</ExternalLink> publishes information about international athletics integrity matters.</p>
      <h2 className="govuk-heading-l">Neutral or special status</h2><p className="govuk-body">Some athletes may compete under a neutral or other approved designation where the rules allow it. CitizenGuide.KE will use the designation shown in official entries and results.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
