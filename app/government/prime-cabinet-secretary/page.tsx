// app/government/prime-cabinet-secretary/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function PrimeCabinetSecretaryPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Prime Cabinet Secretary", href: "/government/prime-cabinet-secretary" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Office of the Prime Cabinet Secretary
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              The Prime Cabinet Secretary coordinates the work of government ministries, supervises the implementation of government policy, and ensures effective service delivery across the public service.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-8">
              <p className="govuk-body">
                The Office of the Prime Cabinet Secretary provides strategic leadership to the public service and oversees the performance of state corporations and government delivery systems.
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
                These positions provide direct support to the Prime Cabinet Secretary and manage the office's operations.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/pcs-chief-of-staff" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Chief of Staff, Office of the Prime Cabinet Secretary
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Oversees the day-to-day running of the Prime Cabinet Secretary's office and coordinates policy delivery.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/pcs-ps-performance-and-delivery" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Principal Secretary for Performance and Delivery Management
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Monitors the performance of government ministries and ensures they meet their delivery targets.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/pcs-ps-parliamentary-affairs" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Principal Secretary for Parliamentary Affairs
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the government's legislative agenda and manages relations with Parliament.
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
                These bodies operate under the Office of the Prime Cabinet Secretary to oversee public service performance and state corporation governance.
              </p>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/government/institutions/public-service-performance-management-unit" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Public Service Performance Management Unit
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Tracks and improves the performance of government ministries and public service delivery.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/state-corporations-advisory-committee" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    State Corporations Advisory Committee
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Advises the government on the establishment, restructuring, and performance of state corporations.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/inspectorate-of-state-corporations" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Inspectorate of State Corporations
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Inspects and audits state corporations to ensure good governance, accountability, and value for money.
                  </p>
                </li>
                <li>
                  <Link href="/government/institutions/government-delivery-services" className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
                    Government Delivery Services
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    Coordinates the implementation of priority government projects and ensures timely service delivery.
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
                    <Link href="/government/deputy-presidency" className="govuk-link">
                      Office of the Deputy President
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
      </main>
    </div>
  );
}