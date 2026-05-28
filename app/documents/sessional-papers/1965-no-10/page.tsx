'use client';

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


type SessionalSection = 'overview' | 'socialism' | 'economic' | 'dev_disparities' | 'legacy';

export default function SessionalPaper1965Page() {
  const [activeSection, setActiveSection] = useState<SessionalSection>('overview');

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and Policies", href: "/documents" },
          { text: "Sessional Paper No. 10 of 1965", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <span className="govuk-caption-l govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
              Historical Statutory Policy Register
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Sessional Paper No. 10 of 1965</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              African Socialism and its Application to Planning in Kenya — The foundational socio-economic policy paper of post-independence Kenya.
            </p>
          </div>
        </div>

        {/* GOV.UK Multi-Page Guide Structural Navigation Grid Split */}
        <div className="govuk-grid-row">
          
          {/* Left Sidebar Guide Controls Panel */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', paddingTop: '15px' }} aria-label="Document Sections">
              <ul className="govuk-list" style={{ lineHeight: '2.4', margin: 0, padding: 0 }}>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'overview' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'overview' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('overview')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'overview' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    1. Overview &amp; Context
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'socialism' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'socialism' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('socialism')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'socialism' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    2. African Socialism Defined
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'economic' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'economic' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('economic')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'economic' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    3. Economic Objectives
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'dev_disparities' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'dev_disparities' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('dev_disparities')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'dev_disparities' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    4. Regional Development
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'legacy' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'legacy' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('legacy')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'legacy' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    5. Long-Term Impact &amp; Review
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Primary Dynamic Display Area */}
          <div className="govuk-grid-column-two-thirds" aria-live="polite">
            
            {/* 1. OVERVIEW & CONTEXT */}
            {activeSection === 'overview' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">1. Overview &amp; Context</h2>
                <p className="govuk-body">
                  Sessional Paper No. 10 of 1965 was drafted during the immediate post-independence period under the direction of Minister for Economic Planning and Development Tom Mboya and head planner Mwai Kibaki. It was formally adopted by the National Assembly to define Kenya&apos;s independent ideological path during the global Cold War.
                </p>

                <GovUKSummaryList
                  items={[
                    { key: "Adoption Date", value: "April 1965" },
                    { key: "Key Authors", value: "Hon. Tom Mboya & Hon. Mwai Kibaki" },
                    { key: "Primary Goal", value: "Establish an independent economic model distinct from both Western capitalism and Eastern bloc communism" },
                    { key: "Exchequer Target", value: "Rapid economic growth to eradicate poverty, ignorance, and disease" },
                  ]}
                />

                <div className="govuk-inset-text govuk-!-margin-top-6 govuk-!-margin-bottom-6">
                  This document acted as the blueprint for Kenya&apos;s macro-budgetary planning for more than two decades, anchoring public enterprise expansion.
                </div>
              </>
            )}

            {/* 2. AFRICAN SOCIALISM DEFINED */}
            {activeSection === 'socialism' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">2. African Socialism Principles</h2>
                <p className="govuk-body">
                  The framework defined &ldquo;African Socialism&rdquo; through two core political and cultural parameters:
                </p>
                
                <ul className="govuk-list govuk-list--spaced" style={{ paddingLeft: '15px', borderLeft: '4px solid #00703c' }}>
                  <li>
                    <strong>Political Democracy</strong> &mdash; Ensuring absolute equality of citizens before the law and state security apparatus, free from foreign diplomatic alignment pressures.
                  </li>
                  <li>
                    <strong>Mutual Social Responsibility</strong> &mdash; Replicating traditional African communal relationships where individual performance property lines were balanced with obligations to the broader society.
                  </li>
                </ul>
                <p className="govuk-body">
                  Crucially, the paper rejected the classical Marxist concept of a class struggle, asserting that traditional African society lacked rigid socio-economic stratification.
                </p>
              </>
            )}

            {/* 3. ECONOMIC OBJECTIVES */}
            {activeSection === 'economic' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">3. Economic Structures &amp; Property Models</h2>
                <p className="govuk-body">
                  The paper rejected sweeping nationalization in favor of a mixed-economy operational system designed to attract international capital investment:
                </p>

                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
                  <li><strong>Diverse Property Formats</strong> &mdash; Authorized concurrent operations across state enterprises, private individual holdings, joint ventures, and agricultural cooperatives.</li>
                  <li><strong>Controlled Nationalization</strong> &mdash; Permitted asset nationalization only if national security parameters were breached, accompanied by fair, market-rate compensation under the constitution.</li>
                  <li><strong>Domestic Resource Mobilization</strong> &mdash; Implemented progressive income tax grids and introduced compulsory domestic state savings mechanisms (e.g., establishing the NSSF).</li>
                </ul>
              </>
            )}

            {/* 4. REGIONAL DEVELOPMENT DISPARITIES */}
            {activeSection === 'dev_disparities' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">4. Geographic Investment Priorities</h2>
                <p className="govuk-body">
                  To maximize net economic output with limited post-colonial budgets, the paper made a deliberate decision regarding resource distribution:
                </p>

                <div className="govuk-inset-text govuk-!-margin-bottom-4">
                  <strong>The Strategy Clause:</strong> Public development funds were strictly directed toward regions with existing infrastructure, high rainfall, and fertile soils (the former White Highlands and central corridors).
                </div>

                <p className="govuk-body">
                  The logic stated that generating fast surpluses in highly productive hubs would create exchequer revenues that could later subsidize social services in arid and semi-arid lands (ASALs). This concentration policy is historically recognized as a primary driver of long-term regional development imbalances in Kenya.
                </p>
              </>
            )}

            {/* 5. LONG-TERM IMPACT & REVIEW */}
            {activeSection === 'legacy' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">5. Modern Policy Impact Analysis</h2>
                <p className="govuk-body">
                  The long-term effects of Sessional Paper No. 10 are traced across successive historical and structural legislative adjustments:
                </p>

                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
                  <li>
                    <strong>Equalization Fund Context</strong> &mdash; The marginalization of certain regions resulting from the 1965 concentration policy served as the primary justification for the creation of the <strong>Equalization Fund under Article 204</strong> of the 2010 Constitution.
                  </li>
                  <li>
                    <strong>Shift to Liberalization</strong> &mdash; The state-led financial models detailed in this framework encountered major structural blockages during the global oil shocks of the 1970s, leading to the policy shift toward market liberalization under Sessional Paper No. 1 of 1986.
                  </li>
                  <li>
                    <Link href="/documents/policies/sessional-paper-1965-no-10.pdf" className="govuk-link govuk-!-font-weight-bold">
                      Download Full Archival Scan of Sessional Paper No. 10 of 1965 PDF (3.1MB)
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {/* Shared Operational Footer Disclosures */}
            <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <p className="govuk-body-s govuk-text-secondary">
                To cross-reference newer policies, or view the 2022–2027 Medium Term Plan arrays, return to the main{' '}
                <Link href="/documents" className="govuk-link">National Policy &amp; Strategy Register</Link>.
              </p>
            </div>

          </div>
        </div>

        
      </main>
    </div>
  );
}
