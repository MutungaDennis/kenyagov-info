'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function NationalAssemblyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "National Assembly", href: "" },
        ]}
      />

      {/* Reduced layout padding top to pull data tables higher up the viewport fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced heading size from xl to l for strict site-wide uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The National Assembly</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The Lower House of the Parliament of Kenya, acting as the primary legislative body responsible for national resource appropriation and executive vetting.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              Established under Article 95 of the Constitution of Kenya, the National Assembly exercises direct democratic representation across all 290 constituencies.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Assembly Framework Summary</h2>
            <GovUKSummaryList
              items={[
                { key: "Constitutional Basis", value: "Article 95 of the Constitution of Kenya (13th Parliament)" },
                { key: "Total Seats", value: "349 Members + 1 Speaker" },
                { key: "Current Speaker", value: "Hon. Moses Masika Wetang&apos;ula, EGH" },
                { key: "Mandate Timeline", value: "5-year concurrent legislative terms under Article 102" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Statutory Composition</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The house membership is balanced to protect regional and special interest portfolios under the 2022–2027 cycle:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Constituency Representatives</strong> &mdash; 290 members, each directly elected by voters of single-member constituencies.</li>
              <li><strong>County Women Representatives</strong> &mdash; 47 women members, with one directly elected by voters in each county.</li>
              <li><strong>Nominated Special Members</strong> &mdash; 12 members nominated by political parties proportionally to represent youth, persons with disabilities, and workers.</li>
              <li><strong>The Speaker</strong> &mdash; Elected by the house from non-sitting members, serving as an ex-officio member.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Core Statutory Functions</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The National Assembly holds unique constitutional mandates relating to public finance and state administration:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>National Legislation</strong> &mdash; Originates, deliberates, and enacts legislative bills for the Republic, including exclusive jurisdiction over Money Bills under Article 114.</li>
              <li><strong>Exchequer Allocations</strong> &mdash; Reviews the annual Budget Policy Statement (BPS), details public spending parameters, and statutorily appropriates funds for the national government.</li>
              <li><strong>Executive Vetting</strong> &mdash; Exercises oversight through select committees, vetting presidential nominees for Cabinet, State Departments, Ambassador dockets, and Judicial offices.</li>
              <li><strong>Public Audit Oversight</strong> &mdash; Scrutinizes exchequer usage through the Public Accounts Committee (PAC) and the Public Investments Committee (PIC) based on reports from the Auditor-General.</li>
              <li><strong>International Agreements</strong> &mdash; Considers, ratifies, or rejects international treaties, conventions, and security deployments.</li>
            </ul>

            {/* Task-Focused Navigation Links Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">National Assembly Registers</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/national-assembly/members" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  View current Members of Parliament
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Access the complete register of the 349 sitting members, constituency mapping tables, party alignments, and committee assignments.
                </p>
              </li>
              <li>
                <Link href="/counties/wards" className="govuk-link govuk-!-font-size-19">
                  Search Constituencies &amp; Wards
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                  Locate IEBC constituency codes, voter enrollment metrics, and sub-tier administrative ward lines.
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
