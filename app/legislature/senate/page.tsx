'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function SenatePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "The Senate", href: "" },
        ]}
      />

      {/* Reduced layout padding top to lift content above the screen fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced heading size from xl to l for strict site-wide uniform scales */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Senate</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The Upper House of the Parliament of Kenya, representing the 47 county governments and protecting the constitutional framework of devolution.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              Established under Article 96 of the Constitution of Kenya, the Senate coordinates legislative oversight, revenue sharing formulas, and impeachment trials.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Senate Framework Summary</h2>
            <GovUKSummaryList
              items={[
                { key: "Constitutional Basis", value: "Article 96 of the Constitution of Kenya (13th Parliament)" },
                { key: "Total Seats", value: "67 Members + 1 Speaker" },
                { key: "Current Speaker", value: "Hon. Amason Jeffah Kingi, EGH" },
                { key: "Mandate Timeline", value: "5-year concurrent legislative cycles under Article 102" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Statutory Composition</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The membership of the Senate is structured under Article 98 to ensure multi-representative oversight:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Elected Senators</strong> &mdash; 47 members, with one senator directly elected by voters in each county.</li>
              <li><strong>Nominated Women Members</strong> &mdash; 16 members nominated by political parties based on proportional seat allocation.</li>
              <li><strong>Special Interest Representatives</strong> &mdash; 2 members representing the youth (one man and one woman) and 2 members representing persons with disabilities (one man and one woman).</li>
              <li><strong>The Speaker</strong> &mdash; Elected by the house from among non-sitting individuals, serving as an ex-officio member.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Core Statutory Functions</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The Senate exercises legislative and regulatory powers concerning devolved governance:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>County Representation</strong> &mdash; Representing the counties and serving to protect the interests of county governments.</li>
              <li><strong>Bicameral Law-making</strong> &mdash; Originating, debating, and passing legislative bills concerning counties, as defined under Articles 109 to 113.</li>
              <li><strong>Revenue Allocation Formulas</strong> &mdash; Determining the vertical division of revenue between national and county governments, and setting the Basis for Sharing Revenue among counties under Article 217.</li>
              <li><strong>Executive Oversight</strong> &mdash; Tracking county expenditure reports, monitoring conditional grants execution, and investigating public resource utilization via standing committees.</li>
              <li><strong>Impeachment Trials</strong> &mdash; Resolving structural motions to remove the President, Deputy President, or County Governors from office following a vote by the National Assembly or County Assemblies.</li>
            </ul>

            {/* Task-Focused Navigation Links Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Senate Registers and Roster</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/senate/senators" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  View the register of current Senators
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Access a complete register of elected and nominated senators, county representation tracks, political party affiliations, and committee assignments.
                </p>
              </li>
              <li>
                <Link href="/counties/performance" className="govuk-link govuk-!-font-size-19">
                  View County Performance Rankings
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                  Inspect the latest revenue collection metrics, audit opiniones, and development budget absorption updates scrutinized by the Senate.
                </p>
              </li>
            </ul>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
