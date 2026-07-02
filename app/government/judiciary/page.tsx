// app/government/judiciary/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function JudiciaryPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Judiciary", href: "/government/judiciary" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">The Judiciary</h1>
            
            <p className="govuk-body-l">
              The Judiciary interprets the law, protects the Constitution, and delivers justice to all Kenyans. It is independent of the Executive and the Legislature.
            </p>

            <p className="govuk-body">
              The court system is divided into Superior Courts and Subordinate Courts.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* SUPERIOR COURTS                            */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Superior Courts</h2>
            <p className="govuk-body">
              These courts have unlimited jurisdiction over criminal and civil matters, or specific appellate jurisdiction.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/judiciary/supreme-court" className="govuk-link govuk-!-font-weight-bold">
                  Supreme Court
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1">
                  The highest court in Kenya. It handles presidential election petitions and appeals from the Court of Appeal.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Court of Appeal</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Hears appeals from the High Court and other courts or tribunals.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">High Court</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Unlimited original jurisdiction in criminal and civil matters. It also supervises subordinate courts.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Employment and Labour Relations Court (ELRC)</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  A specialised court that handles disputes relating to employment and labour relations.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Environment and Land Court (ELC)</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  A specialised court that handles disputes relating to land, environment, and natural resources.
                </p>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* SUBORDINATE COURTS                         */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Subordinate Courts</h2>
            <p className="govuk-body">
              These courts handle the majority of cases across Kenya.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Magistrates' Courts</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  The primary courts for civil and criminal cases. They are ranked by the authority of the magistrate (Chief Magistrate, Senior Principal Magistrate, etc.).
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Kadhis' Courts</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Determine questions of Muslim law relating to personal status, marriage, divorce, or inheritance, where all parties are Muslim.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Small Claims Court</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Provides a faster, cheaper way to resolve civil disputes involving small amounts of money.
                </p>
              </li>
              <li>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Tribunals</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Specialised bodies that handle specific disputes, such as the Business Premises Rent Tribunal or the Industrial Court.
                </p>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* LEADERSHIP AND ADMINISTRATION              */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Leadership and administration</h2>
            <p className="govuk-body">
              The Judiciary is headed by the Chief Justice, who is also the President of the Supreme Court. The day-to-day administration is managed by the Chief Registrar.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/judiciary/administration" className="govuk-link">
                  View the full leadership structure and directorates
                </Link>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* ========================================== */}
            {/* JUDICIAL SERVICE COMMISSION                */}
            {/* ========================================== */}
            <h2 className="govuk-heading-m">Judicial Service Commission (JSC)</h2>
            <p className="govuk-body">
              The JSC is an independent commission responsible for promoting and facilitating the independence and accountability of the judiciary. It recommends the appointment of judges and handles the discipline of judicial officers.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/government/commissions" className="govuk-link">
                  View the Judicial Service Commission profile
                </Link>
              </li>
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
                    <Link href="/constitution" className="govuk-link">
                      The Constitution of Kenya
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/legislature" className="govuk-link">
                      Parliament and laws
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/commissions" className="govuk-link">
                      Constitutional commissions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      Government officials
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