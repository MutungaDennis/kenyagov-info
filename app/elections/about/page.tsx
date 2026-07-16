import Link from "next/link";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import ChevronLinkList from "@/components/site/ChevronLinkList";

export const revalidate = 86400;
export const dynamic = "force-static";

const electionSections = [
  {
    title: "General Elections",
    description:
      "Learn about presidential, parliamentary, gubernatorial, senatorial, county assembly, and women representative elections.",
    href: "/elections/general-elections",
  },
  {
    title: "By-Elections",
    description:
      "Access information about parliamentary, county, and ward by-elections held after vacancies arise.",
    href: "/elections/by-elections",
  },
  {
    title: "Referendums",
    description:
      "Understand constitutional referendums, amendment procedures, and public voting processes.",
    href: "/elections/referendums",
  },
  {
    title: "Voter Registration",
    description:
      "Learn how citizens register as voters and understand eligibility requirements under Kenyan law.",
    href: "/elections/voter-registration",
  },
  {
    title: "Electoral Institutions",
    description:
      "Explore institutions involved in elections, including the IEBC and electoral dispute mechanisms.",
    href: "/elections/iebc-offices",
  },
  {
    title: "Election Results",
    description:
      "Access election results archives, official declarations, and electoral outcome summaries.",
    href: "/elections",
  },
];

export default function ElectionsPage() {
  return (
    <>
    

      {/* Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "About elections" },
        ]}
      />

      

        {/* Page heading */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <span className="govuk-caption-xl">
              Democratic processes
            </span>

            <h1 className="govuk-heading-xl">
              Elections & Referendums
            </h1>

            <p className="govuk-body-l">
              Understand how elections, voting, referendums,
              voter registration, and electoral institutions
              work in Kenya.
            </p>

            <p className="govuk-body">
              Elections are the primary way citizens choose
              leaders at the national and county levels.
              Kenya also allows constitutional referendums
              where citizens directly vote on constitutional
              amendments and major national questions.
            </p>

            

          </div>
        </div>

        <section className="govuk-!-margin-top-7">
          <h2 className="govuk-heading-l">Explore election topics</h2>
          <ChevronLinkList
            items={electionSections}
            ariaLabel="Election topics"
          />
        </section>

        {/* Main content section */}
        <section className="govuk-!-margin-top-8">

          <div className="govuk-grid-row">

            {/* Main column */}
            <div className="govuk-grid-column-two-thirds">

              <h2 className="govuk-heading-l">
                Kenya’s electoral system
              </h2>

              <p className="govuk-body">
                Kenya conducts elections under the Constitution
                of Kenya, 2010 and electoral laws administered
                primarily by the Independent Electoral and
                Boundaries Commission (IEBC).
              </p>

              <p className="govuk-body">
                Citizens elect leaders at both the national
                and county levels through periodic elections.
                Elections are generally held every five years.
              </p>

              <h3 className="govuk-heading-m">
                Elective positions in Kenya
              </h3>

              <ul className="govuk-list govuk-list--bullet">
                <li>President</li>
                <li>Governor</li>
                <li>Senator</li>
                <li>Member of Parliament (MP)</li>
                <li>County Woman Representative</li>
                <li>Member of County Assembly (MCA)</li>
              </ul>

              <h3 className="govuk-heading-m">
                Electoral principles
              </h3>

              <p className="govuk-body">
                The Constitution requires elections to be:
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>Free and fair</li>
                <li>Transparent</li>
                <li>Administered impartially</li>
                <li>Conducted by secret ballot</li>
                <li>Free from violence and intimidation</li>
              </ul>

              <h3 className="govuk-heading-m">
                Referendums in Kenya
              </h3>

              <p className="govuk-body">
                Referendums allow citizens to vote directly
                on constitutional amendments and other major
                constitutional matters affecting governance
                and the structure of the state.
              </p>

            </div>

            {/* Sidebar */}
            <div className="govuk-grid-column-one-third">

              <aside className="govuk-inset-text">

                <h2 className="govuk-heading-s">
                  Related information
                </h2>

                <ul className="govuk-list govuk-list--spaced">

                  <li>
                    <Link
                      href="/elections/political-parties"
                      className="govuk-link"
                    >
                      Political parties
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/constitution"
                      className="govuk-link"
                    >
                      Constitution of Kenya
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/laws"
                      className="govuk-link"
                    >
                      Electoral laws
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/institutions"
                      className="govuk-link"
                    >
                      Government institutions
                    </Link>
                  </li>

                </ul>

              </aside>

              <aside className="govuk-inset-text govuk-!-margin-top-6">

                <h2 className="govuk-heading-s">
                  Key election topics
                </h2>

                <ul className="govuk-list govuk-list--bullet govuk-body-s">
                  <li>Voter registration</li>
                  <li>Election petitions</li>
                  <li>Boundary delimitation</li>
                  <li>Campaign financing</li>
                  <li>Election observation</li>
                  <li>Political coalitions</li>
                </ul>

              </aside>

            </div>

          </div>

        </section>

        {/* Footer note */}
        <section className="govuk-!-margin-top-8">

          <p className="govuk-body-s govuk-hint">
            Election information may be updated periodically
            based on constitutional provisions, electoral laws,
            court decisions, official notices, and public records.
          </p>

        </section>

        <LastUpdated
              published="2026-05-19"
              lastUpdated="2026-05-19"
            />


      
    
  
    </>
);
}