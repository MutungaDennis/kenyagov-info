import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function CountyAssembliesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "County Assemblies" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">County Assemblies</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              County Assemblies are the legislative arm of Kenya’s 47 devolved county governments. They make county laws, oversee the county executive, and ensure public participation in county governance.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                Each of the 47 counties has its own assembly, comprising elected Members of County Assembly (MCAs) representing wards, alongside nominated and appointed members to represent special interests including youth, persons with disabilities, and minorities.
              </p>
            </div>

            <h2 className="govuk-heading-l">Directories and registers</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Use the directories below to find current office holders and understand the structure of county governance.
            </p>

            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/county-assemblies/mcas" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold govuk-!-font-size-19">
                  Members of County Assembly (MCAs)
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Official register of all 2,222 elected and nominated MCAs across the 47 county assemblies, filterable by county, party, and seat type.
                </p>
              </li>
              <li>
                <Link href="/government/counties/governors" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold govuk-!-font-size-19">
                  County Governors
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  The executive heads of the 47 county governments, elected at the county level.
                </p>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold govuk-!-font-size-19">
                  The 47 Counties
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Explore the geographic, administrative, and demographic profiles of all 47 devolved counties and their 290 constituencies.
                </p>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-8" />

            <h2 className="govuk-heading-l">What County Assemblies do</h2>
            <p className="govuk-body">
              Under the Constitution of Kenya (2010) and the County Governments Act, county assemblies have three core mandates:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <strong>Law-making:</strong> Enacting legislation necessary for the effective governance of the county.
              </li>
              <li>
                <strong>Oversight:</strong> Monitoring and scrutinizing the execution of powers by the county executive (the Governor and their cabinet).
              </li>
              <li>
                <strong>Public participation:</strong> Facilitating public involvement in the legislative and other processes of the assembly, including the approval of county budgets.
              </li>
            </ul>

            <div className="govuk-inset-text govuk-!-margin-top-6">
              <p className="govuk-body govuk-!-margin-bottom-0">
                County assemblies operate independently of the national Parliament, but their laws must conform to the Constitution of Kenya. For national-level legislation, visit the <Link href="/government/legislature" className="govuk-link">National Legislature</Link>.
              </p>
            </div>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Related content
              </h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/how-government-works" className="govuk-link">
                      How government works
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The National Cabinet
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials A–Z
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections" className="govuk-link">
                      Elections and voting
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}