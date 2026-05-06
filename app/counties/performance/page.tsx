import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function CountyPerformancePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/counties" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Performance", href: "/counties/performance" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">County Performance &amp; Rankings</h1>
            <p className="govuk-body-l">
              Monitoring how Kenya’s 47 counties are performing in service delivery, financial management, and development outcomes.
            </p>

            <div className="govuk-inset-text">
              Performance measurement helps citizens hold their county governments accountable.
            </div>

            {/* Latest Overview */}
            <h2 className="govuk-heading-l">Latest Performance Highlights (FY 2024/25)</h2>
            <p className="govuk-body">
              Counties continue to improve in budget absorption and service delivery. However, challenges remain in own-source revenue collection and audit outcomes.
            </p>

            <h3 className="govuk-heading-m govuk-!-margin-top-9">Top Performing Counties (Recent Trends)</h3>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>Kisumu, Mombasa, and Uasin Gishu</strong> – Strong in revenue collection and infrastructure delivery</li>
              <li><strong>Nakuru and Kiambu</strong> – High budget absorption and health service coverage</li>
              <li><strong>Elgeyo Marakwet and Nyeri</strong> – Excellent performance in agriculture and value addition</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Performance Indicators</h2>

            <details className="govuk-details" data-module="govuk-details" open>
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Financial Management</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Budget Absorption Rate (Development Expenditure)</li>
                  <li>Own Source Revenue Collection</li>
                  <li>Audit Opinions from Auditor General (Unqualified, Qualified, Adverse)</li>
                  <li>Equitable Share Utilization</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Service Delivery</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li>Health: Access to hospitals, immunisation coverage, maternal health</li>
                  <li>Agriculture: Extension services, value addition, food security</li>
                  <li>Water &amp; Sanitation: Access to clean water</li>
                  <li>Early Childhood Education (ECDE) and Village Polytechnics</li>
                  <li>County Roads and Infrastructure</li>
                </ul>
              </div>
            </details>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Resources for County Performance</h2>
            <ul className="govuk-list">
              <li><Link href="https://www.crakenya.org/" className="govuk-link">Commission on Revenue Allocation (CRA)</Link> – County Revenue Reports</li>
              <li><Link href="https://www.auditorgeneral.go.ke/" className="govuk-link">Office of the Auditor General</Link> – County Audit Reports</li>
              <li><Link href="https://www.devolution.go.ke/" className="govuk-link">Ministry of Devolution</Link> – Annual County Performance Reports</li>
              <li><Link href="https://www.budget.go.ke/" className="govuk-link">National Treasury</Link> – Division of Revenue &amp; County Allocation Acts</li>
            </ul>

            <p className="govuk-body govuk-!-margin-top-9">
              <strong>Note:</strong> Detailed county-by-county rankings and scorecards are updated annually by the Commission on Revenue Allocation (CRA) and the Council of Governors.
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}