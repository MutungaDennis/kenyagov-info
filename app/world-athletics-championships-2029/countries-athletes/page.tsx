import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Countries and athletes", description: "Participating countries, athlete qualification, team selection and entries for the World Athletics Championships Nairobi 2029." };

const participationPages = [
  { title: "Participating countries", href: "/world-athletics-championships-2029/participating-countries", description: "How countries take part and when the confirmed list will be available." },
  { title: "Athlete qualification", href: "/world-athletics-championships-2029/athlete-qualification", description: "Entry standards, world rankings, qualification periods and other routes to qualification." },
  { title: "National-team selection", href: "/world-athletics-championships-2029/national-team-selection", description: "Why qualifying and being selected are different, and how federations enter teams." },
  { title: "Kenya's team", href: "/world-athletics-championships-2029/kenya-team", description: "Kenyan selection information, trials and the final team when officially announced." },
] as const;

const entryPages = [
  { title: "Entries and start lists", href: "/world-athletics-championships-2029/entries-start-lists", description: "Provisional entries, final entries, start lists, substitutions and withdrawals." },
  { title: "Athlete eligibility and representation", href: "/world-athletics-championships-2029/athlete-eligibility", description: "Eligibility, nationality representation, age requirements and integrity decisions." },
] as const;

export default function CountriesAthletesPage() {
  return <><PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "About the championships", href: "/world-athletics-championships-2029/about" }, { text: "Countries and athletes" }]} title="Countries and athletes" />
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-inset-text"><strong>Participating countries and athletes have not been confirmed.</strong> Use official entry and start lists rather than unofficial team announcements.</div>
      <h2 className="govuk-heading-l">Countries and team selection</h2>
      <ul className="govuk-list govuk-list--spaced">{participationPages.map((page) => <li key={page.href}><Link href={page.href} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">{page.title}</Link><p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">{page.description}</p></li>)}</ul>
      <h2 className="govuk-heading-l govuk-!-margin-top-8">Entries and eligibility</h2>
      <ul className="govuk-list govuk-list--spaced">{entryPages.map((page) => <li key={page.href}><Link href={page.href} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">{page.title}</Link><p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">{page.description}</p></li>)}</ul>
      <p className="govuk-body govuk-!-margin-top-8">Final international entries will be published through <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>.</p>
    </div></div></>;
}
