import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function DevolutionPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/counties" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Devolution", href: "/counties/devolution" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Devolution in Kenya</h1>
            <p className="govuk-body-l">
              Devolution is one of the most transformative features of the Constitution of Kenya 2010. 
              It transferred power, resources, and decision-making closer to the people through 47 county governments.
            </p>

            <div className="govuk-inset-text">
              “Devolution shall ensure the participation of people in the exercise of powers of the State” — Article 174(c)
            </div>

            {/* Objects of Devolution */}
            <h2 className="govuk-heading-l">Objects of Devolution</h2>
            <p className="govuk-body">Article 174 of the Constitution outlines the following objects:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Promote democratic and accountable exercise of power</li>
              <li>Foster national unity by recognising diversity</li>
              <li>Give powers of self-governance to the people</li>
              <li>Recognise the right of communities to manage their own affairs</li>
              <li>Protect and promote interests of minorities and marginalised communities</li>
              <li>Promote social and economic development and proximate services</li>
              <li>Ensure equitable sharing of national and local resources</li>
              <li>Facilitate decentralisation of State organs</li>
              <li>Enhance checks and balances and separation of powers</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Principles of Devolved Government</h2>
            <p className="govuk-body">Article 175 requires county governments to be based on:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Democratic principles</li>
              <li>Separation of powers</li>
              <li>Accountability and transparency</li>
              <li>Equitable sharing of resources</li>
            </ul>

            {/* Key Laws Supporting Devolution */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Legislation Supporting Devolution</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>County Governments Act, No. 17 of 2012</strong> — Framework for county operations</li>
              <li><strong>Public Finance Management Act, No. 18 of 2012</strong> — Revenue sharing and budgeting</li>
              <li><strong>Intergovernmental Relations Act, No. 2 of 2012</strong> — Coordination between national and county governments</li>
              <li><strong>Transition to Devolved Government Act, No. 7 of 2013</strong></li>
              <li><strong>Urban Areas and Cities Act, No. 13 of 2011</strong></li>
              <li><strong>Division of Revenue Act (Annual)</strong> — Determines equitable share to counties</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Current Status of Devolution (2025/2026)</h2>
            <p className="govuk-body">
              Devolution has completed over 12 years of implementation. Significant progress has been made in health, infrastructure, and service delivery, though challenges remain in capacity, revenue collection, and coordination.
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}