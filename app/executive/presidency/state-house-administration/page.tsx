'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


export default function StateHouseAdministrationPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "State House Administration", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* Header Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">State House Administration</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Administrative hierarchy, key advisory offices, support structures, and public budget disclosures for the official residence and operational hub of the President.
            </p>
          </div>
        </div>

        {/* GOV.UK Guide Layout Grid Split */}
        <div className="govuk-grid-row">
          {/* Navigation Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} aria-label="Office Secondary Navigation">
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/executive/presidency/president" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    Office of the President
                  </Link>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: '4px solid #1d70b8', fontWeight: 'bold', color: '#1d70b8' }}>
                  State House Administration
                </li>
                <li>
                  <Link href="/executive/presidency/national-security-council" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    National Security Council
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Primary Content Pane */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Administrative Overview</h2>
            <GovUKSummaryList
              items={[
                { key: "Accounting Officer", value: "Comptroller of State House" },
                { key: "Primary Location", value: "State House, State House Road, Nairobi" },
                { key: "Constituent Lodges", value: "Mombasa, Kisumu, Sagana, Eldoret, Nakuru, Kakamega, and Kisii State Lodges" },
                { key: "Primary Function", value: "Operational, logistical, and technical advisory support to the Head of State" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Core Advisory Desks and Secretariats</h2>
            <p className="govuk-body">
              The internal administrative framework is managed by specialized technical desks that support the President's executive agenda:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Office of the Comptroller</strong> &mdash; Directs the financial planning, budget allocations, overall logistics, and human resource registries inside State House and all state lodges.</li>
              <li><strong>Presidential Communication Service (PCS)</strong> &mdash; Manages official press dispatches, media relations, public tracking transcripts, and records public statements.</li>
              <li><strong>Advisory Secretariats</strong> &mdash; Houses dedicated technical desks spanning the Presidential Economic Transformation Secretariat, Legal Affairs Unit, and Fiscal Policy Advisers.</li>
              <li><strong>Logistics and Security Command</strong> &mdash; Handles specialized internal operational itineraries, hospitality administration, and coordination with the Presidential Escort Unit.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Statutory Budget Disclosures</h2>
            <p className="govuk-body">
              State House expenditures and resource tracking sheets are reviewed annually by the National Treasury and the Office of the Budget Controller:
            </p>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <strong>Recurrent Expenditure Tracking</strong>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Operations budget for staff remuneration, maintenance of facilities, and administrative logistics across the state lodge network.</span>
              </li>
              <li>
                <strong>Capital Development Estimates</strong>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Financial allocations earmarked for security systems integration, modernization of structural facilities, and infrastructure protection.</span>
              </li>
              <li>
                <Link href="/documents/budget/state-house-allocation-2025-2026.pdf" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14">
                  Download State House Budget Allocation Estimates PDF (1.2MB)
                </Link>
              </li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Official Contact</h2>
            <GovUKSummaryList
              items={[
                { key: "Physical Address", value: "State House Road, Nairobi, Kenya" },
                { key: "Postal Registry", value: "P.O. Box 40530 - 00100, Nairobi, Kenya" },
                { key: "Official Channel", value: "statehouse.go.ke" },
              ]}
            />

            
          </div>
        </div>
      </main>
    </div>
  );
}
