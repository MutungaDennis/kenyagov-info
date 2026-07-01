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

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Legislature (Parliament of Kenya)</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public registry, assembly rosters, legislative bills, and oversight frameworks for the bicameral Parliament of the Republic of Kenya.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              Established under Chapter 8 of the Constitution, Parliament consists of two Houses: the National Assembly and the Senate. Together they enact laws, allocate public revenues, and oversee the Executive.
            </div>

            {/* === HANSARD SECTION (NEW) === */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Hansard – Official Record of Debates</h2>
            <p className="govuk-body">
              Search and read the full verbatim record of proceedings in the National Assembly, Senate, and County Assemblies. 
              Track what your MP or Senator said, when they said it, and the context of every contribution.
            </p>

            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-half">
                <Link href="/legislature/hansard" className="govuk-button govuk-button--start govuk-!-width-full">
                  Browse Hansard
                  <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/></svg>
                </Link>
              </div>
              <div className="govuk-grid-column-one-half">
                <Link href="/legislature/hansard/members" className="govuk-button govuk-button--secondary govuk-!-width-full">
                  Find Members &amp; Track Contributions
                </Link>
              </div>
            </div>

            <GovUKSummaryList
              items={[
                { key: "Features", value: "Searchable speeches, member timelines, party & constituency filters, downloadable CSV, historical role tracking" },
                { key: "Coverage", value: "National Assembly, Senate, and County Assembly sittings with full Portable Text speeches" },
              ]}
            />

            {/* === LEGISLATIVE TRACKERS (NEW) === */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Legislative Trackers</h2>
            <p className="govuk-body">
              Follow the progress of Bills, Questions, Motions, and Committee work in real time.
            </p>

            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/bills" className="govuk-link govuk-!-font-weight-bold">
                  Bill Tracker
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Track the full lifecycle of Bills — from First Reading to Presidential Assent. See sponsors, committee stages, amendments, and voting records.
                </p>
              </li>
              <li>
                <Link href="/legislature/questions" className="govuk-link govuk-!-font-weight-bold">
                  Questions &amp; Motions Tracker
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Monitor Questions to the President, Cabinet Secretaries, and County Governors, plus Notices of Motion and Private Members’ Bills.
                </p>
              </li>
              <li>
                <Link href="/legislature/committees" className="govuk-link govuk-!-font-weight-bold">
                  Committee Tracker
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  View membership, meeting schedules, reports, and recommendations of all Departmental, Select, and Joint Committees.
                </p>
              </li>
            </ul>

            {/* === EXISTING CONTENT (slightly tightened) === */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Bicameral Structure Overview</h2>
            <GovUKSummaryList
              items={[
                { key: "Constitutional Basis", value: "Chapter 8 of the Constitution of Kenya (13th Parliament Assembly)" },
                { key: "Primary Functions", value: "Statutory Law-making, Annual Budget Approval, Public Representation, and Executive Oversight" },
                { key: "Administrative Organ", value: "Parliamentary Service Commission (PSC) managing logistics and infrastructure" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Explore the Houses of Parliament</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/national-assembly" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  The National Assembly (Lower House)
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Review the register of the 290 single-member constituencies, 47 County Women Representatives, legislative bills, and ministerial oversight committees.
                </p>
              </li>
              <li className="govuk-!-margin-top-4">
                <Link href="/legislature/senate" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  The Senate (Upper House)
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Track regional legislative representation, county resource allocation formulas, and the registry of the 47 elected county senators.
                </p>
              </li>
            </ul>

            {/* === STANDING ORDERS & PROCEDURE (NEW) === */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Parliamentary Procedure &amp; Standing Orders</h2>
            <p className="govuk-body">
              The rules that govern how Parliament conducts its business are contained in the Standing Orders of each House. 
              These are the “rule book” for debates, voting, committee work, and citizen participation.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body-s">
                <strong>Recommended approach for Standing Orders:</strong><br />
                1. Create a dedicated page <code>/legislature/standing-orders</code> (or separate pages for National Assembly and Senate).<br />
                2. Source the latest official PDFs from the Parliament website or the Clerk’s office.<br />
                3. Either link directly to the PDFs or (better for citizens) create a clean, searchable index of the most-used Orders with plain-English explanations.<br />
                4. Cross-reference Standing Orders inside Hansard contributions (e.g. “Raised under Standing Order 45”).
              </p>
            </div>

            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/legislature/standing-orders/national-assembly" className="govuk-link">
                  National Assembly Standing Orders (with plain English guide)
                </Link>
              </li>
              <li>
                <Link href="/legislature/standing-orders/senate" className="govuk-link">
                  Senate Standing Orders (with plain English guide)
                </Link>
              </li>
            </ul>

            {/* Key Constitutional Functions */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Key Constitutional Functions</h2>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Enacting Legislation</strong> — Originating, debating, amending, and passing national legislative bills and statutory instruments.</li>
              <li><strong>Fiscal Allocation &amp; Appropriations</strong> — Considering and approving the annual Division of Revenue Bill, County Allocation of Revenue Bill, and the National Budget Estimates.</li>
              <li><strong>Executive Oversight</strong> — Processing ministerial policy reports, querying Cabinet Secretaries, and summoning state department heads.</li>
              <li><strong>Impeachment Procedures</strong> — Executing constitutional trial parameters regarding the removal of the President, Deputy President, Cabinet Secretaries, or County Governors.</li>
            </ul>

            {/* Related Directories */}
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