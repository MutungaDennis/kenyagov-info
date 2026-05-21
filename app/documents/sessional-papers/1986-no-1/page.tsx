'use client';

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

type SessionalSection = 'overview' | 'sap' | 'agriculture' | 'privatization' | 'legacy';

export default function SessionalPaper1986Page() {
  const [activeSection, setActiveSection] = useState<SessionalSection>('overview');

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and Policies", href: "/documents" },
          { text: "Sessional Paper No. 1 of 1986", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <span className="govuk-caption-l govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
              Historical Statutory Policy Register
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Sessional Paper No. 1 of 1986</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Economic Management for Renewed Growth — The policy blueprint that liberalized Kenya&apos;s economy.
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
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'sap' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'sap' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('sap')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'sap' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    2. Structural Adjustments
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'agriculture' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'agriculture' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('agriculture')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'agriculture' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    3. Agricultural Re-engineering
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'privatization' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'privatization' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('privatization')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'privatization' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    4. Privatization &amp; Parastatals
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'legacy' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'legacy' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('legacy')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'legacy' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    5. Modern Policy Legacy
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
                  Sessional Paper No. 1 of 1986 was introduced to counteract structural economic bottlenecks resulting from the global oil shocks of the 1970s, falling commodity prices, and high state budgetary deficits. It marked an official departure from the heavily state-driven economic models established in the post-independence era.
                </p>

                <GovUKSummaryList
                  items={[
                    { key: "Adoption Date", value: "March 1986" },
                    { key: "Primary Policy Shift", value: "Transition from import substitution and state protection to market liberalization" },
                    { key: "Strategic Goal", value: "Achieve a 5.6% annual GDP growth rate through private sector production multipliers" },
                    { key: "Key Instruments", value: "Deregulation, budget austerity, and tariff restructuring" },
                  ]}
                />

                <div className="govuk-inset-text govuk-!-margin-top-6 govuk-!-margin-bottom-6">
                  This framework served as the policy link between Kenya and international development partners for market stabilization programs.
                </div>
              </>
            )}

            {/* 2. STRUCTURAL ADJUSTMENTS */}
            {activeSection === 'sap' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">2. Structural Adjustment Policies (SAPs)</h2>
                <p className="govuk-body">
                  The document introduced Structural Adjustment Programs backed by the World Bank and IMF, enforcing fiscal management rules:
                </p>
                
                <ul className="govuk-list govuk-list--spaced" style={{ paddingLeft: '15px', borderLeft: '4px solid #00703c' }}>
                  <li>
                    <strong>Budget Austerity and Deficit Controls</strong> &mdash; Capping state borrowing thresholds to control inflation and channel exchequer revenue toward debt servicing.
                  </li>
                  <li>
                    <strong>Introduction of Cost-Sharing</strong> &mdash; Implementing nominal user fees in public institutions, specifically within healthcare facilities and public universities.
                  </li>
                  <li>
                    <strong>Price Decontrol Operations</strong> &mdash; Dismantling state-managed price controls on consumer products to let market equilibrium values dictate asset pricing.
                  </li>
                </ul>
              </>
            )}

            {/* 3. AGRICULTURAL RE-ENGINEERING */}
            {activeSection === 'agriculture' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">3. Agricultural Market Deregulation</h2>
                <p className="govuk-body">
                  Because agriculture remained the primary economic driver, the paper restructured state input controls and sector marketing channels:
                </p>

                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
                  <li><strong>Dismantling Marketing Monopolies</strong> &mdash; Phasing out exclusive buying privileges held by state marketing boards to allow private trade configurations.</li>
                  <li><strong>Subsidies Re-alignment</strong> &mdash; Eliminating direct fertilizer and machinery input subsidies, reallocating funds to improve rural connection roads.</li>
                  <li><strong>Smallholder Inventions</strong> &mdash; Prioritizing high-value cash crop value chains (tea, coffee, horticulture) to maximize foreign exchange inflows.</li>
                </ul>
              </>
            )}

            {/* 4. PRIVATIZATION & PARASTATALS */}
            {activeSection === 'privatization' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">4. Parastatal Reform &amp; Divestiture</h2>
                <p className="govuk-body">
                  The document evaluated state-owned enterprises (parastatals) and introduced strict market discipline frameworks:
                </p>

                <div className="govuk-inset-text govuk-!-margin-bottom-4">
                  <strong>The Efficiency Directive:</strong> State enterprises operating in commercial sectors were slated for phased privatization to reduce reliance on exchequer subsidies.
                </div>

                <p className="govuk-body">
                  The state restricted its investments to strategic natural monopolies and public utilities, creating the policy basis for the eventual unbundling and partial privatization of organizations like Kenya Post and Telecommunications.
                </p>
              </>
            )}

            {/* 5. MODERN POLICY LEGACY */}
            {activeSection === 'legacy' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">5. Modern Policy Legacy &amp; Review</h2>
                <p className="govuk-body">
                  Sessional Paper No. 1 of 1986 shaped the modern fiscal and structural setup of the Kenyan economy:
                </p>

                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
                  <li>
                    <strong>Foundations of Liberalization</strong> &mdash; The deregulation guidelines led directly to the complete abolition of foreign exchange controls in 1993 and the establishment of independent regulatory authorities (e.g., Central Bank market adjustments).
                  </li>
                  <li>
                    <strong>Social Sector Impacts</strong> &mdash; The cost-sharing measures introduced in 1986 became primary reference points for later education interventions, including the transition to Free Primary Education (FPE) in 2003.
                  </li>
                  <li>
                    <Link href="/documents/policies/sessional-paper-1986-no-1.pdf" className="govuk-link govuk-!-font-weight-bold">
                      Download Full Archival Scan of Sessional Paper No. 1 of 1986 PDF (2.7MB)
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {/* Shared Operational Footer Disclosures */}
            <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <p className="govuk-body-s govuk-text-secondary">
                To cross-reference other sessional papers or review contemporary macroeconomic architectures, return to the main{' '}
                <Link href="/documents" className="govuk-link">National Policy &amp; Strategy Register</Link>.
              </p>
            </div>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}
