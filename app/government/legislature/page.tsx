// app/government/legislature/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function LegislaturePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Legislature", href: "/government/legislature" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Parliament of Kenya</h1>
            
            <p className="govuk-body-l">
              Find information about the Parliament of Kenya, including members, bills, debates and committees.
            </p>

            <p className="govuk-body">
              Parliament is made up of the National Assembly and the Senate. It makes laws, oversees the national budget, and holds the government to account.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* HANSARD AND DEBATES                        */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Hansard and parliamentary debates</h2>
            <p className="govuk-body">
              Read the official record of what is said in the National Assembly, Senate and County Assemblies. You can search for specific members, topics or dates.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/legislature/hansard/national-assembly" className="govuk-link">
                  National Assembly debates
                </Link>
              </li>
              <li>
                <Link href="/government/legislature/hansard/senate" className="govuk-link">
                  Senate debates
                </Link>
              </li>
              <li>
                <Link href="/government/legislature/hansard/members" className="govuk-link">
                  Find a member and track their contributions
                </Link>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* BILLS, QUESTIONS AND PAPERS                */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Bills, questions and papers</h2>
            <p className="govuk-body">
              Follow the progress of bills, parliamentary questions and tabled papers.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/legislature/tracker/bills" className="govuk-link">
                  Bills tracker
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  Track bills from first reading to presidential assent.
                </p>
              </li>
              <li>
                <Link href="/government/legislature/tracker/questions" className="govuk-link">
                  Parliamentary questions
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  See questions asked to the President and Cabinet Secretaries.
                </p>
              </li>
              <li>
                <Link href="/government/legislature/tracker/papers" className="govuk-link">
                  Tabled papers
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  View reports and documents tabled in Parliament.
                </p>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* HOUSES OF PARLIAMENT                       */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Houses of Parliament</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/legislature/national-assembly/members" className="govuk-link govuk-!-font-weight-bold">
                  National Assembly
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  290 constituency members, 47 women representatives and 12 nominated members.
                </p>
              </li>
              <li>
                <Link href="/government/legislature/senate/senators" className="govuk-link govuk-!-font-weight-bold">
                  Senate
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  47 elected senators, 16 women representatives, 2 youth representatives and 2 representatives for persons with disabilities.
                </p>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* WHAT PARLIAMENT DOES                       */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">What Parliament does</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>makes laws for the country</li>
              <li>approves the national budget and allocation of revenue</li>
              <li>holds the government to account through oversight</li>
              <li>can remove the President or Deputy President through impeachment</li>
            </ul>

          </div>

          {/* ========================================== */}
          {/* SIDEBAR: RELATED CONTENT                   */}
          {/* ========================================== */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related content</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/government/counties/wards" className="govuk-link">
                      Constituencies and wards
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet-decisions" className="govuk-link">
                      Cabinet decisions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      Government officials
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions" className="govuk-link">
                      All government institutions
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