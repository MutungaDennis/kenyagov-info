import type { Metadata } from "next";
import Link from "next/link";
import HomeMasthead from "@/components/site/HomeMasthead";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import {
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: DEFAULT_TITLE,
  },
};

/**
 * Homepage — GOV.UK-inspired, Kenya-first:
 * 1) Masthead
 * 2) Start here (orientation)
 * 3) Popular service guides + Featured
 * 4) Browse government (national / county / institutions)
 * 5) People, law and more (no duplicate destinations)
 */
export default function Home() {
  return (
    <>
      <HomeMasthead />

      <div className="govuk-width-container app-home-body">
        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-2 govuk-!-margin-bottom-6 app-home-section-break" />

        {/* Band 1: Orientation */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
              Start here
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Find who represents you and how government works in Kenya.
            </p>

            <ChevronLinkList
              ariaLabel="Start here — main civic destinations"
              items={[
                {
                  href: "/find-your-representatives",
                  title: "Find your representatives",
                  description:
                    "MP, senator, governor, woman representative, MCA and more.",
                },
                {
                  href: "/how-government-works",
                  title: "How government works",
                  description:
                    "National and county government in plain language.",
                },
                {
                  href: "/government/counties",
                  title: "Counties and devolution",
                  description:
                    "47 county governments, executives, assemblies and wards.",
                },
                {
                  href: "/elections",
                  title: "Elections and voting",
                  description:
                    "IEBC, parties, voter registration and election timelines.",
                },
              ]}
            />
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-6 govuk-!-margin-bottom-6 app-home-section-break" />

        {/* Band 2: Services + Featured */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
              Popular service guides
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              We explain how common public services work. We do not take
              applications or payments — use{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>{" "}
              or the relevant agency for official transactions.
            </p>

            <ChevronLinkList
              ariaLabel="Popular service guides"
              items={[
                {
                  href: "/services/categories/business-self-employed",
                  title: "Businesses and self-employed",
                  description:
                    "Business names, limited companies and annual returns.",
                },
                {
                  href: "/services/categories/civil-registration",
                  title: "Births, deaths, marriages and care",
                  description:
                    "Civil registration, marriage certificates and police clearance.",
                },
                {
                  href: "/services/categories/driving-transport",
                  title: "Driving and transport",
                  description:
                    "Provisional licences, renewals and vehicle ownership.",
                },
                {
                  href: "/services/categories/passports-travel",
                  title: "Passports, travel and living abroad",
                  description:
                    "Passports, visas and immigration profiles.",
                },
                {
                  href: "/services/categories/money-tax",
                  title: "Money and tax",
                  description:
                    "Tax returns, KRA PIN changes and compliance checks.",
                },
                {
                  href: "/services/categories/land-property",
                  title: "Land and property",
                  description:
                    "Land searches, rates and title verification.",
                },
                {
                  href: "/services",
                  title: "All services",
                  description: "Browse A to Z or filter by topic and organisation.",
                },
              ]}
            />
          </div>

          <div className="govuk-grid-column-one-third-from-desktop govuk-grid-column-full govuk-!-margin-top-4">
            <div className="govuk-inset-text">
              <h2 className="govuk-heading-s govuk-!-margin-top-0">Featured</h2>

              <div className="govuk-!-margin-bottom-3">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link
                    href="/elections/general-elections/timeline"
                    className="govuk-link"
                  >
                    2027 General Election timeline
                  </Link>
                </h3>
                <p className="govuk-body govuk-!-margin-0">
                  IEBC milestones toward the 10 August 2027 poll.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-3">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link
                    href="/world-athletics-championships-2029"
                    className="govuk-link"
                  >
                    World Athletics Championships 2029
                  </Link>
                </h3>
                <p className="govuk-body govuk-!-margin-0">
                  Explore the championships, events, venues and official updates.
                </p>
              </div>

              <div>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link href="/emergency-safety" className="govuk-link">
                    Emergency and safety
                  </Link>
                </h3>
                <p className="govuk-body govuk-!-margin-0">
                  Find emergency contacts, safety information and preparedness guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl govuk-!-margin-top-8 govuk-!-margin-bottom-8 app-home-section-break app-home-section-break--strong" />

        {/* Band 3: Browse government */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">National government</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/government/cabinet"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  The Executive
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Presidency, Cabinet and ministries.
                </p>
              </li>
              <li>
                <Link
                  href="/government/legislature"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  The Legislature
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  National Assembly and Senate.
                </p>
              </li>
              <li>
                <Link
                  href="/government/judiciary"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  The Judiciary
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Courts and judicial administration.
                </p>
              </li>
              <li>
                <Link
                  href="/government/commissions"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Independent Commissions
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  IEBC, SRC, EACC and other constitutional bodies.
                </p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">County governments</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/government/counties"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Counties
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Directory of the 47 county governments.
                </p>
              </li>
              <li>
                <Link
                  href="/government/counties/governors"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  County Executives
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Governors and deputy governors.
                </p>
              </li>
              <li>
                <Link
                  href="/government/counties/county-assemblies"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  County Assemblies
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  County legislatures and MCA registers.
                </p>
              </li>
              <li>
                <Link
                  href="/government/counties/devolution"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Devolution
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Intergovernmental relations and county budgets.
                </p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Institutions and politics</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/government/institutions"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Public institutions
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Agencies, regulators and parastatals.
                </p>
              </li>
              <li>
                <Link
                  href="/elections/political-parties"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Political parties
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Registered parties and symbols.
                </p>
              </li>
              <li>
                <Link
                  href="/elections/coalitions"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Political coalitions
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Party alliances and coalition frameworks.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl govuk-!-margin-top-8 govuk-!-margin-bottom-8 app-home-section-break app-home-section-break--strong" />

        {/* Band 4: People, law, more — each destination once */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Current leaders</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/government/people"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  All government officials
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  President, Cabinet Secretaries and senior officials.
                </p>
              </li>
              <li>
                <Link
                  href="/government/legislature/national-assembly/members"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Members of Parliament
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  National Assembly and Senate.
                </p>
              </li>
              <li>
                <Link
                  href="/government/counties/governors"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  County Executives
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Governors and deputy governors for all 47 counties.
                </p>
              </li>
              <li>
                <Link
                  href="/government/counties/county-assemblies/mcas"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Members of County Assembly
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Elected and nominated MCAs.
                </p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Law and documents</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/constitution"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Constitution of Kenya 2010
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  The supreme law — searchable with plain-language help.
                </p>
              </li>
              <li>
                <Link
                  href="/acts/parliament"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Acts of Parliament
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  National and county legislation.
                </p>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Official documents
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Vision 2030, sessional papers and key publications.
                </p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">More on this site</h2>
            <ul className="govuk-list">
              <li>
                <Link
                  href="/open-data"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Open data
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Public datasets, collections and official portals.
                </p>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Citizen guides
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Plain-language guides to public processes and rights.
                </p>
              </li>
              <li>
                <Link
                  href="/society-and-culture"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Society and culture
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  National symbols, heritage and public holidays.
                </p>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
