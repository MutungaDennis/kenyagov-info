// app/government/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function GovernmentHomePage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Government
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-8">
              Find information about how the government of Kenya works, who holds office, and the institutions that deliver public services.
            </p>

            {/* SECTION 1: DEPARTMENTS AND AGENCIES */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Departments and agencies
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-3">
                Explore the executive ministries, state departments, commissions, and parastatals that make up the national government.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/government/institutions" className="govuk-link">
                    View all government institutions
                  </Link>
                </li>
                <li>
                  <Link href="/government/world" className="govuk-link">
                    Kenyan missions abroad
                  </Link>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* SECTION 2: MINISTERS AND OFFICIALS */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Ministers and senior officials
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-3">
                Read biographies and find contact details for the political leadership and senior civil servants.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/government/cabinet" className="govuk-link">
                    The Cabinet
                  </Link>
                </li>
                <li>
                  <Link href="/government/people" className="govuk-link">
                    All government officials (A-Z)
                  </Link>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* SECTION 3: TRANSPARENCY AND REGISTERS */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Transparency and registers
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-3">
                Access official dispatches, statutory resolutions, and records of executive engagements.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/government/cabinet-decisions" className="govuk-link">
                    Cabinet decisions
                  </Link>
                </li>
                <li>
                  <Link href="/government/executive-orders" className="govuk-link">
                    Presidential executive orders
                  </Link>
                </li>
                <li>
                  <Link href="/government/presidential-visits" className="govuk-link">
                    Register of international visits
                  </Link>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* SECTION 4: PUBLICATIONS AND DOCUMENTS */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Publications and documents
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-3">
                Search for policy papers, speeches, consultations, and statistical releases.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/government/publications" className="govuk-link">
                    Publications
                  </Link>
                </li>
                <li>
                  <Link href="/government/speeches" className="govuk-link">
                    Speeches
                  </Link>
                </li>
                <li>
                  <Link href="/government/consultations" className="govuk-link">
                    Open consultations
                  </Link>
                </li>
                <li>
                  <Link href="/government/policies" className="govuk-link">
                    Policy documents
                  </Link>
                </li>
                <li>
                  <Link href="/government/statistics" className="govuk-link">
                    Statistics and data
                  </Link>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* SECTION 5: UNDERSTANDING GOVERNMENT */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Understanding government
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-3">
                Learn about the structure, history, and constitutional framework of Kenya's government.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/government/how-government-works" className="govuk-link">
                    How government works
                  </Link>
                </li>
                <li>
                  <Link href="/government/news" className="govuk-link">
                    News and announcements
                  </Link>
                </li>
                <li>
                  <Link href="/government/history" className="govuk-link">
                    Historical government records
                  </Link>
                </li>
              </ul>
            </section>

          </div>

          {/* SIDEBAR: RELATED CONTENT */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Related content
              </h2>
              <nav role="navigation" aria-labelledby="related-content">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/government/legislature" className="govuk-link">
                      Parliament
                    </Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                      National Assembly and Senate
                    </p>
                  </li>
                  <li>
                    <Link href="/government/judiciary" className="govuk-link">
                      The Judiciary
                    </Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                      Courts and judicial administration
                    </p>
                  </li>
                  <li>
                    <Link href="/government/commissions" className="govuk-link">
                      Independent Commissions
                    </Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                      Chapter 15 constitutional bodies
                    </p>
                  </li>
                  <li>
                    <Link href="/government/counties" className="govuk-link">
                      County Governments
                    </Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                      Devolved government units
                    </p>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-6" />

              <h3 className="govuk-heading-s govuk-!-margin-bottom-3">
                Quick links
              </h3>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/search/all" className="govuk-link">
                    Search all government content
                  </Link>
                </li>
                <li>
                  <Link href="/constitution" className="govuk-link">
                    Constitution of Kenya
                  </Link>
                </li>
                <li>
                  <Link href="/acts/parliament" className="govuk-link">
                    Acts of Parliament
                  </Link>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      
    
  
    </>
);
}