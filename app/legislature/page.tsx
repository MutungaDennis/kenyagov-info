'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


export default function LegislaturePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
        ]}
      />

      {/* Reduced layout padding top to drag core dashboards above the screen fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced down to heading-l for strict style guide compliance */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Legislature (Parliament of Kenya)</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public registry, assembly rosters, legislative bills, and oversight frameworks for the bicameral Parliament of the Republic of Kenya.
            </p>

            {/* Inset Text strictly applied for objective statutory definitions */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              Established under Chapter 8 of the Constitution, Parliament consists of two Houses: the National Assembly and the Senate. Together they enact laws, allocate public revenues, and oversee the Executive.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Bicameral Structure Overview</h2>
            <GovUKSummaryList
              items={[
                { key: "Constitutional Basis", value: "Chapter 8 of the Constitution of Kenya (13th Parliament Assembly)" },
                { key: "Primary Functions", value: "Statutory Law-making, Annual Budget Approval, Public Representation, and Executive Oversight" },
                { key: "Administrative Organ", value: "Parliamentary Service Commission (PSC) managing logistics and infrastructure" },
              ]}
            />

            {/* Task-Focused GOV.UK Style Navigation Lists Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Explore the Houses of Parliament</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/national-assembly" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  The National Assembly (Lower House)
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Review the register of the 290 single-member constituencies, 47 County Women Representatives, legislative bills, and ministerial oversight committees.
                </p>
                <div className="govuk-!-margin-top-2">
                  <GovUKSummaryList
                    items={[
                      { key: "Total Seats", value: "349 Members + 1 Speaker (Hon. Moses Wetang&apos;ula, EGH)" },
                      { key: "Primary Mandate", value: "Vets public appointments, passes national revenue bills, and appropriates exchequer funds." }
                    ]}
                  />
                </div>
              </li>
              <li className="govuk-!-margin-top-4">
                <Link href="/legislature/senate" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  The Senate (Upper House)
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Track regional legislative representation, county resource allocation formulas, and the registry of the 47 elected county senators.
                </p>
                <div className="govuk-!-margin-top-2">
                  <GovUKSummaryList
                    items={[
                      { key: "Total Seats", value: "67 Members + 1 Speaker (Hon. Amason Kingi, EGH)" },
                      { key: "Primary Mandate", value: "Represents county interests, protects devolution, and considers bills affecting county governments." }
                    ]}
                  />
                </div>
              </li>
            </ul>

            {/* Core Statutory Function Details Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Key Constitutional Functions</h2>
            <p className="govuk-body">
              Under Articles 94, 95, and 96 of the Constitution, the bicameral assembly executes specific sovereign legislative functions:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Enacting Legislation</strong> &mdash; Originating, debating, amending, and passing national legislative bills and statutory instruments.</li>
              <li><strong>Fiscal Allocation &amp; Appropriations</strong> &mdash; Considering and approving the annual Division of Revenue Bill, County Allocation of Revenue Bill, and the National Budget Estimates.</li>
              <li><strong>Executive Oversight</strong> &mdash; Processing ministerial policy reports, querying Cabinet Secretaries, and summoning state department heads before standing select committees.</li>
              <li><strong>Impeachment Procedures</strong> &mdash; Executing constitutional trial parameters regarding the removal of the President, Deputy President, Cabinet Secretaries, or County Governors.</li>
            </ul>

            {/* Related Directories Navigation Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Legislative Registers Lookup</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/counties/wards" className="govuk-link">
                  Register of Electoral Constituencies &amp; Wards
                </Link>
              </li>
              <li>
                <Link href="/executive/presidency/cabinet-decisions" className="govuk-link">
                  Register of Cabinet Dispatches &amp; Approved Policies
                </Link>
              </li>
            </ul>

          </div>
        </div>
      </main>
    </div>
  );
}
