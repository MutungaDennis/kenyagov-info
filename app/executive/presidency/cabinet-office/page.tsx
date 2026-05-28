'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


// FIXED: Explicitly defined 'export default function' declaration hook to satisfy Next.js page requirements
export default function CabinetOfficePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "Cabinet Office", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* Header Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Cabinet Office and Secretariat</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Constitutional mandate, institutional functions under Article 154, and administrative structures of the State Department for Cabinet Affairs.
            </p>
          </div>
        </div>

        {/* GOV.UK Guide Layout Grid Structure Split */}
        <div className="govuk-grid-row">
          {/* Navigation Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} aria-label="Office Secondary Navigation">
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/executive/presidency/deputy-president" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    Office of the Deputy President
                  </Link>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: '4px solid #1d70b8', fontWeight: 'bold', color: '#1d70b8' }}>
                  Cabinet Co-ordination
                </li>
              </ul>
            </nav>
          </div>

          {/* Primary Content Pane */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Executive Summary</h2>
            <GovUKSummaryList
              items={[
                { key: "Administrative Basis", value: "Established under Article 154 of the Constitution of Kenya" },
                { key: "Oversight Officer", value: "Secretary to the Cabinet (Subject to National Assembly confirmation)" },
                { key: "Core Mandate", value: "Managing Cabinet business, recording minutes, and tracking policy execution" },
                { key: "Headquarters", value: "Harambee House Annex, Harambee Avenue, Nairobi" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Core Functions</h2>
            <p className="govuk-body">
              The Cabinet Office operates as the central coordination system for government business across all ministries:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Cabinet Business</strong> &mdash; Arranges formal executive sessions, prepares legislative memoranda, sets agendas, and registers official minutes for the Cabinet and its standing committees.</li>
              <li><strong>Policy Tracking & M&E</strong> &mdash; Oversees and evaluates the cross-ministerial implementation of Cabinet decisions and presidential policy directives across various state departments.</li>
              <li><strong>Public Communication</strong> &mdash; Conveys and explains authorized Cabinet resolutions to the public, public institutions, and international stakeholders.</li>
              <li><strong>Public Sector Reform</strong> &mdash; Coordinates strategic public sector institutional reforms and acts as the technical liaison for constitutional commissions and development partner programs.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Key Administrative Bodies</h2>
            <p className="govuk-body">
              The cabinet coordination framework is structured through specialized administrative offices:
            </p>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <strong>Cabinet Office</strong>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Managed by the Secretary to the Cabinet; handles overall administration, high-level record-keeping, and security of state decisions.</span>
              </li>
              <li>
                <strong>State Department for Cabinet Affairs</strong>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Headed by a Principal Secretary; facilitates technical Cabinet committees and directly monitors the execution metrics of government programs.</span>
              </li>
              <li>
                <strong>Office of the Prime Cabinet Secretary</strong>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Assists the presidency in the supervision of ministries, coordinates the national government's legislative agenda, and provides an additional layer of technical monitoring.</span>
              </li>
            </ul>

            {/* Contact Information Summary List */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Official Contact Information</h2>
            <GovUKSummaryList
              items={[
                { key: "Physical Location", value: "Harambee House Annex, Harambee Avenue, Nairobi" },
                { key: "Postal Address", value: "P.O. Box 74434 - 00200, Nairobi, Kenya" },
                { key: "Telephone Connections", value: "+254 (0) 20 3341616 / +254 (0) 20 3247000" },
              ]}
            />

            
          </div>
        </div>
      </main>
    </div>
  );
}
