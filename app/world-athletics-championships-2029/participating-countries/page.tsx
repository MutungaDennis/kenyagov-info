import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Participating countries", description: "How countries participate in the World Athletics Championships Nairobi 2029." };

export default function ParticipatingCountriesPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "Participating countries" }]} title="Participating countries" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-inset-text"><strong>The participating-country list has not been confirmed.</strong> A country should not be listed as participating until its federation submits accepted entries.</div>
      <h2 className="govuk-heading-l">How countries enter</h2><p className="govuk-body">Athletes are entered by national member federations affiliated with <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>. Participation is based on championship entry rules rather than simply being a United Nations member state.</p>
      <h2 className="govuk-heading-l">Country names and team codes</h2><p className="govuk-body">Official start lists and results use approved country names and federation codes. Some athletes may compete under a special designation where international rules require it.</p>
      <h2 className="govuk-heading-l">When the list becomes reliable</h2><p className="govuk-body">Expressions of interest, qualification results and preliminary selections do not establish final participation. CitizenGuide.KE will use the accepted final-entry list and record when it was published.</p>
      <h2 className="govuk-heading-l">Regional participation</h2><p className="govuk-body">Information may be summarized for East Africa and Africa, but the official list will remain organized by the federations and team designations used by the championship.</p>
      <h2 className="govuk-heading-l">Changes</h2><p className="govuk-body">A federation may withdraw, reduce its team or change entries within the applicable rules. The latest official entry list takes precedence over an earlier announcement.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
