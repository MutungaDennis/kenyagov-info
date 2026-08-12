import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: "Elections and voting",
  description:
    "General elections, by-elections, voter registration, political parties, polling stations and IEBC information.",
  path: "/elections",
});

const electionTopics = [
  {
    title: "General elections",
    description:
      "National election process, presidential and parliamentary contests, and key dates.",
    href: "/elections/general-elections",
  },
  {
    title: "2027 election timeline",
    description:
      "Key IEBC milestones for the 10 August 2027 poll — campaign, nominations and deadlines.",
    href: "/elections/general-elections/timeline",
  },
  {
    title: "2027 operation plan",
    description:
      "Full Election Operation Plan calendar — voter registration, nominations, finance, results and petitions.",
    href: "/elections/general-elections/operation-plan",
  },
  {
    title: "By-elections",
    description:
      "Upcoming, happening now and past by-elections for parliamentary and county seats.",
    href: "/elections/by-elections",
  },
  {
    title: "Voter registration",
    description:
      "How to register, check or update your voter details with the IEBC.",
    href: "/elections/voter-registration",
  },
  {
    title: "Registered voters data",
    description:
      "County-level registered voter statistics and historical comparisons.",
    href: "/elections/registered-voters",
  },
  {
    title: "Polling stations",
    description: "Find polling stations by county, constituency and ward.",
    href: "/elections/polling-stations",
  },
  {
    title: "Political parties",
    description:
      "Registered parties, symbols, leadership and membership information.",
    href: "/elections/political-parties",
  },
  {
    title: "Political coalitions",
    description:
      "Party alliances and coalition frameworks registered with the Registrar.",
    href: "/elections/coalitions",
  },
  {
    title: "Referendums",
    description:
      "Past and planned national referendums and constitutional amendment votes.",
    href: "/elections/referendums",
  },
  {
    title: "IEBC offices",
    description:
      "Independent Electoral and Boundaries Commission offices and contacts.",
    href: "/elections/iebc-offices",
  },
  {
    title: "About elections in Kenya",
    description:
      "How elections work under the Constitution, electoral cycle and institutions.",
    href: "/elections/about",
  },
];

export default function ElectionsHubPage() {
  return (
    <>
      <PageIntro
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Elections" },
        ]}
        caption="Democracy and participation"
        title="Elections and voting"
        lead="Find information about general elections, by-elections, voter registration, political parties, polling stations and the Independent Electoral and Boundaries Commission (IEBC)."
      />

      <h2 className="govuk-heading-l govuk-!-margin-top-2">Explore topics</h2>

      <ChevronLinkList items={electionTopics} ariaLabel="Election topics" />

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-8" />

      <h2 className="govuk-heading-m">Related information</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link href="/government/commissions" className="govuk-link">
            Independent commissions (including IEBC)
          </Link>
        </li>
        <li>
          <Link href="/constitution" className="govuk-link">
            Constitution of Kenya 2010
          </Link>
        </li>
        <li>
          <Link href="/government/legislature" className="govuk-link">
            Parliament
          </Link>
        </li>
        <li>
          <Link href="/topics/elections-participation" className="govuk-link">
            Elections and participation topic
          </Link>
        </li>
      </ul>
    </>
  );
}
