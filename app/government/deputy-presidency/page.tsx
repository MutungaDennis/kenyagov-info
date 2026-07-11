// app/government/deputy-presidency/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function DeputyPresidencyPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Deputy Presidency", href: "/government/deputy-presidency" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Office of the Deputy President
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              The Deputy President is the second-highest office in the Republic of Kenya. The Deputy President assists the President in the execution of government functions and acts as the President's deputy when required.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                The Office of the Deputy President coordinates intergovernmental relations, manages international development partnerships, and oversees key national initiatives.
              </p>
            </div>

            {/* ========================================== */}
            {/* KEY POSITIONS                              */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Key positions
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These positions provide direct support to the Deputy President and manage the office's operations.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/dp-chief-of-staff" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Chief of Staff, Office of the Deputy President
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the day-to-day running of the Deputy President's office and coordinates policy delivery.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/dp-ps-cabinet-affairs" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Principal Secretary for Cabinet Affairs
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the Deputy President's engagement with Cabinet and parliamentary business.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/dp-ps-devolution" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Principal Secretary for Devolution
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates relations between the national government and the 47 county governments.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/dp-private-secretary" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Private Secretary to the Deputy President
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Manages the Deputy President's correspondence, schedule, and official communications.
                  </p>
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* KEY OFFICES AND INSTITUTIONS               */}
            {/* ========================================== */}
            <section className="govuk-!-margin-bottom-9">
              <h2 className="govuk-heading-l govuk-!-margin-bottom-3">
                Key offices and institutions
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                These bodies operate under the Office of the Deputy President to coordinate national policy and intergovernmental relations.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/international-development-partnerships-coordination" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    International Development Partnerships Coordination
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates Kenya's relations with international development partners and manages aid programmes.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/nairobi-rivers-commission" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Nairobi Rivers Commission
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the restoration and management of Nairobi's river ecosystems.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/inter-government-budget-and-economic-council" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Inter-Government Budget and Economic Council
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates budget and economic policy between the national and county governments.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/inter-governmental-relations-technical-committee" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Inter-Governmental Relations Technical Committee
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Provides technical support for resolving disputes and coordinating policy between national and county governments.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/national-and-county-governments-honours-advisory-committee" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    National and County Governments Honours Advisory Committee
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Recommends recipients of national honours and awards for outstanding service to Kenya.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/coffee-sub-sector-reforms-implementation-standing-committee" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Coffee Sub-Sector Reforms Implementation Standing Committee
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the implementation of reforms in the coffee industry to improve productivity and farmer incomes.
                  </p>
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
                    <Link href="/government/presidency" className="govuk-link">
                      The Presidency
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