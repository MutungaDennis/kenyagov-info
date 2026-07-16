// app/government/presidency/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function PresidencyPage() {
  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "The Presidency", href: "/government/presidency" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              The Presidency
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              The President is the Head of State and Government of the Republic of Kenya. The President commands the armed forces, declares a state of emergency, and ensures that the Constitution is upheld.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                The Executive Office of the President supports the President in carrying out constitutional duties, coordinating government policy, and managing national security.
              </p>
            </div>

            {/* ========================================== */}
            {/* KEY OFFICES                                */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Key offices
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These offices provide direct support to the President and coordinate the work of government.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/chief-of-staff" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Chief of Staff and Head of the Public Service
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the day-to-day running of the Executive Office and coordinates the work of all government ministries.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/secretary-to-the-cabinet" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Secretary to the Cabinet
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages Cabinet meetings, records decisions, and ensures follow-up on government policy.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/state-house-comptroller" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    State House Comptroller
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages the finances and administration of State House and official presidential functions.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/deputy-chief-of-staff" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Deputy Chief of Staff
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Supports the Chief of Staff in coordinating government operations and policy delivery.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/private-secretary-to-the-president" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Private Secretary to the President
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Handles the President's personal correspondence, schedule, and official communications.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/statehouse-spokesperson" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Statehouse Spokesperson
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Communicates government policy and presidential statements to the public and media.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* ADVISORY OFFICES                           */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Advisory offices
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These offices provide specialised advice to the President on key policy areas.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/office-of-the-national-security-advisor" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the National Security Advisor
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises the President on national security, defence, and intelligence matters.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/presidential-council-of-economic-advisors" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Presidential Council of Economic Advisors
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Provides expert advice on economic policy, fiscal matters, and national development strategy.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/office-of-the-women-rights-advisor" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Women Rights Advisor
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises on policies to promote gender equality and protect women's rights.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/office-of-the-climate-change-advisor" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Office of the Climate Change Advisor
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the government's response to climate change and environmental protection.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* CONSTITUTIONAL BODIES AND COUNCILS         */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Constitutional bodies and councils
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These bodies operate under the Executive Office to coordinate national policy, security, and intergovernmental relations.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/cabinet-office" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Cabinet Office
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the work of all government ministries and implements Cabinet decisions.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-security-council" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Security Council
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees national security policy and coordinates the work of the defence, intelligence, and police services.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/kenya-national-intelligence-service" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Intelligence Service
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Collects and analyses intelligence to protect Kenya from security threats at home and abroad.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-economic-and-social-council" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National Economic and Social Council
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises the government on national economic and social development policy.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-and-county-government-summit" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National and County Government Summit
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Brings together the President and all 47 Governors to coordinate national and county government policy.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/power-of-mercy-advisory-committee" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Power of Mercy Advisory Committee
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises the President on the exercise of the power of mercy, including pardons and reduction of sentences.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* SPECIALISED DIRECTORATES                   */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Specialised directorates and offices
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These directorates carry out specialised functions on behalf of the Executive Office.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/presidents-budget-office" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    President's Budget Office
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the preparation of the national budget and monitors government spending.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/presidents-economic-transformation-office" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    President's Economic Transformation Office
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Drives the implementation of the government's economic transformation agenda.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/directorate-of-national-cohesion-and-values" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Directorate of National Cohesion and Values
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Promotes national unity, cohesion, and constitutional values across government.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/directorate-of-resource-surveys-and-remote-sensing" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Directorate of Resource Surveys and Remote Sensing
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Uses satellite technology and surveys to monitor natural resources and support planning.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/public-entities-oversight-office" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Public Entities Oversight Office
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Monitors the performance of state corporations and ensures they deliver value for money.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/kenya-south-sudan-liaison-office" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Kenya South Sudan Liaison Office
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates bilateral relations and cooperation between Kenya and South Sudan.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* TRANSPARENCY AND REGISTERS                 */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Transparency and registers
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                Access official records of presidential decisions, policy directives, and international engagements.
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
                <li>
                  <Link href="/government/speeches" className="govuk-link">
                    Presidential speeches
                  </Link>
                </li>
              </ul>
            </section>

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
                    <Link href="/government/deputy-presidency" className="govuk-link">
                      Office of the Deputy President
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/prime-cabinet-secretary" className="govuk-link">
                      Office of the Prime Cabinet Secretary
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The Cabinet
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions" className="govuk-link">
                      All government institutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      
    
  
  </>
);
}