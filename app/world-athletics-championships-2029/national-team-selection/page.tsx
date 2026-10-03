import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "National-team selection", description: "How national federations select and enter teams for the World Athletics Championships Nairobi 2029." };

export default function NationalTeamSelectionPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "National-team selection" }]} title="National-team selection" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <p className="govuk-body">National member federations select and formally enter their championship teams under <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> rules.</p>
      <h2 className="govuk-heading-l">Qualification and selection are different</h2><p className="govuk-body">Qualification establishes that an athlete may be eligible for entry. Selection is the federation&apos;s decision to include that athlete in its team, subject to team limits and its published policy.</p>
      <h2 className="govuk-heading-l">Selection policies</h2><p className="govuk-body">A policy may consider trials, qualifying standards, rankings, current form, fitness, relay needs and championship strategy. Criteria and decision dates should be published before selection where possible.</p>
      <h2 className="govuk-heading-l">Trials</h2><p className="govuk-body">Winning or placing at a national trial does not always guarantee selection unless the published policy says it does. Trials can also be subject to qualification and eligibility requirements.</p>
      <h2 className="govuk-heading-l">Appeals</h2><p className="govuk-body">Federations may provide a process for challenging a selection decision. Deadlines can be short because final-entry dates are fixed.</p>
      <h2 className="govuk-heading-l">Final entry</h2><p className="govuk-body">A public team announcement is not the same as an accepted championship entry. Final entries and start lists provide stronger confirmation that an athlete is scheduled to compete.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
