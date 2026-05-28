'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


export default function NationalSecurityCouncilPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "National Security Council", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* Header Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">National Security Council (NSC)</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Constitutional mandate, institutional membership framework, and statutory advisory functions of the top-tier national defense and security coordination organ.
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
                  <Link href="/executive/presidency/state-house-administration" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    State House Administration
                  </Link>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: '4px solid #1d70b8', fontWeight: 'bold', color: '#1d70b8' }}>
                  National Security Council
                </li>
                <li>
                  <Link href="/executive/presidency/cabinet-office" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    Cabinet Co-ordination
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Primary Content Pane */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Council Overview</h2>
            <GovUKSummaryList
              items={[
                { key: "Constitutional Basis", value: "Established under Article 240 of the Constitution of Kenya" },
                { key: "Council Chair", value: "H.E. The President (Commander-in-Chief of the Defence Forces)" },
                { key: "Primary Objective", value: "Exercising supervisory control over national security organs and internal defense policies" },
                { key: "Statutory Reporting", value: "Submits an annual state of security report to the National Assembly" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Statutory Composition (Membership)</h2>
            <p className="govuk-body">
              Under Article 240(2) of the Constitution, the National Security Council strictly consists of the following state officers:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>The President</strong> &mdash; Serving as the Chairperson of the Council.</li>
              <li><strong>The Deputy President</strong> &mdash; Serving as the Vice-Chairperson.</li>
              <li><strong>The Cabinet Secretary</strong> responsible for Defence.</li>
              <li><strong>The Cabinet Secretary</strong> responsible for Foreign Affairs.</li>
              <li><strong>The Cabinet Secretary</strong> responsible for Internal Security.</li>
              <li><strong>The Attorney-General</strong> &mdash; Chief legal adviser to the executive government.</li>
              <li><strong>The Chief of the Kenya Defence Forces (KDF)</strong>.</li>
              <li><strong>The Director-General</strong> of the National Intelligence Service (NIS).</li>
              <li><strong>The Inspector-General</strong> of the National Police Service (NPS).</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Core Mandate & Functions</h2>
            <p className="govuk-body">
              The Council integrates national interior, defense, and foreign policies to direct strategic operations:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Assesses and monitors internal, regional, and international security threats to the Republic of Kenya.</li>
              <li>Coordinates strategy channels and actions across the Kenya Defence Forces, National Intelligence Service, and National Police Service.</li>
              <li>Develops national security policies and advises the President on the declaration of a state of emergency or deployment of regional peacekeeping forces.</li>
              <li>Approves structural deployments and internal capacity upgrades for high-level counter-terrorism and maritime border protection frameworks.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Statutory Legislative Documents</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Review the underlying legal frameworks and legislative acts governing defense infrastructure operations:
            </p>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/documents/legislation/national-security-council-act.pdf" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14">
                  Download National Security Council Act, No. 23 of 2012 PDF (450KB)
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Operationalizes the administrative functions, council secretariats, and strategic implementation committees.</span>
              </li>
            </ul>

            
          </div>
        </div>
      </main>
    </div>
  );
}
