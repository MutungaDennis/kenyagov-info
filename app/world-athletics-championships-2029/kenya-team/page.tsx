import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Kenya's Nairobi 2029 team", description: "Selection, trials and official entries for Kenya's team at the World Athletics Championships Nairobi 2029." };

export default function KenyaTeamPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "Kenya's team" }]} title="Kenya's team" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-inset-text"><strong>Kenya&apos;s Nairobi 2029 team has not been selected.</strong> Lists circulating before the official selection process should not be treated as final.</div>
      <h2 className="govuk-heading-l">Who selects the team</h2><p className="govuk-body"><ExternalLink href="https://www.athleticskenya.or.ke/">Athletics Kenya</ExternalLink> is responsible for selecting and entering Kenya&apos;s national athletics team under the applicable international rules.</p>
      <h2 className="govuk-heading-l">Information that will be added</h2><ul className="govuk-list govuk-list--bullet"><li>published selection policy</li><li>qualification requirements and deadlines</li><li>trial dates, venue and entry conditions</li><li>provisional and final team announcements</li><li>relay pools and reserves</li><li>team changes and withdrawals</li></ul>
      <h2 className="govuk-heading-l">Home-country entry is not automatic</h2><p className="govuk-body">Hosting the championships does not mean every Kenyan athlete can compete. Athletes must meet the applicable qualification, eligibility, selection and entry requirements.</p>
      <h2 className="govuk-heading-l">Before buying a ticket for an athlete</h2><p className="govuk-body">Wait for the final entry list and session timetable. Selection can change because of injury, eligibility decisions, appeals or withdrawal.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
