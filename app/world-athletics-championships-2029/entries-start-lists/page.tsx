import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Entries and start lists", description: "How to understand provisional entries, final entries and start lists for the World Athletics Championships Nairobi 2029." };

export default function EntriesStartListsPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Countries and athletes", href: "/world-athletics-championships-2029/countries-athletes" }, { text: "Entries and start lists" }]} title="Entries and start lists" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-inset-text">No Nairobi 2029 entries or start lists are available yet.</div>
      <h2 className="govuk-heading-l">Provisional entries</h2><p className="govuk-body">Provisional entries indicate intended participation but can include more athletes than a federation ultimately enters. They can change before the final deadline.</p>
      <h2 className="govuk-heading-l">Final entries</h2><p className="govuk-body">Final entries are submitted by federations and accepted under championship rules. Later withdrawals or approved replacements may still occur.</p>
      <h2 className="govuk-heading-l">Start lists</h2><p className="govuk-body">A start list identifies athletes assigned to a particular event, round, heat, group, lane or order. It is the most useful document immediately before competition.</p>
      <h2 className="govuk-heading-l">Statuses to understand</h2><ul className="govuk-list govuk-list--bullet"><li>entered but not yet assigned to a round</li><li>confirmed starter</li><li>withdrawn or did not start</li><li>qualified for the next round</li><li>disqualified or did not finish</li></ul>
      <h2 className="govuk-heading-l">Official source</h2><p className="govuk-body">Use <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> for championship entry lists, start lists and official results. CitizenGuide.KE may summarize them but will not replace the official system.</p>
      <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/countries-athletes" className="govuk-link govuk-link--no-visited-state">Back to Countries and athletes</Link></p>
    </div></div></>;
}
