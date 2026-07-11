'use client';

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


type VisionSection = 'overview' | 'economic' | 'social' | 'political' | 'mtps';

export default function Vision2030Page() {
  const [activeSection, setActiveSection] = useState<VisionSection>('overview');

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and Policies", href: "/documents" },
          { text: "Vision 2030 Blueprint", href: "" },
        ]}
      />

      {/* Reduced padding wrapper to optimize vertical height for smartphone layouts */}
      
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GovernmentPolicy",
              "name": "Kenya Vision 2030",
              "description": "Kenya's long-term national development blueprint to create a globally competitive and prosperous nation by 2030.",
              "url": "https://citizenguide.ke/documents/vision-2030",
              "datePublished": "2008-06",
              "publisher": {
                "@type": "GovernmentOrganization",
                "name": "Government of Kenya"
              }
            })
          }}
        />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <span className="govuk-caption-l govuk-!-font-weight-bold govuk-!-text-colour-secondary">
              Sessional Paper No. 10 of 2012
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Kenya Vision 2030</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Kenya&apos;s main plan (launched 2008) to become a competitive middle-income country by 2030.
            </p>
          </div>
        </div>

        {/* GOV.UK Multi-Page Guide Grid Structure Split */}
        <div className="govuk-grid-row">
          
          {/* Left Sidebar Sub-Navigation Menu */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav className="govuk-!-border-top-2 govuk-!-border-colour-blue govuk-!-padding-top-3" aria-label="Vision 2030 Sections">
              <ul className="govuk-list">
                {[
                  { key: 'overview', label: '1. Overview and mandate' },
                  { key: 'economic', label: '2. Economic pillar' },
                  { key: 'social', label: '3. Social pillar' },
                  { key: 'political', label: '4. Political pillar' },
                  { key: 'mtps', label: '5. Medium term plans' },
                ].map((item) => (
                  <li key={item.key} className={`govuk-!-padding-left-3 ${activeSection === item.key ? 'govuk-!-border-left-4 govuk-!-border-colour-blue' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(item.key as any)}
                      className={`govuk-link ${activeSection === item.key ? 'govuk-!-font-weight-bold' : ''}`}
                      aria-current={activeSection === item.key ? 'true' : undefined}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Primary Dynamic Display Area */}
          <div className="govuk-grid-column-two-thirds" aria-live="polite">
            
            {/* 1. OVERVIEW & MANDATE */}
            {activeSection === 'overview' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">1. Overview &amp; Mandate</h2>
                <p className="govuk-body">
                  Kenya Vision 2030 was launched to shift macro-economic coordination from short-term episodic planning toward long-term structural alignment. Formally operationalized as a statutory instrument through <strong>Sessional Paper No. 10 of 2012</strong>, the framework outlines continuous milestones executed across rolling 5-year planning blocks.
                </p>

                <GovUKSummaryList
                  items={[
                    { key: "Launch Date", value: "June 2008" },
                    { key: "Legal Status", value: "Sessional Paper No. 10 of 2012 (Adopted by the National Assembly)" },
                    { key: "Core Structure", value: "Divided into 3 interconnected Pillars supported by foundational enablers" },
                    { key: "Coordination Agency", value: "Kenya Vision 2030 Delivery Secretariat (VDS)" },
                  ]}
                />

                <div className="govuk-inset-text govuk-!-margin-top-6 govuk-!-margin-bottom-6">
                  The main aim is steady 10% yearly economic growth across the country.
                </div>
              </>
            )}

            {/* 2. ECONOMIC PILLAR */}
            {activeSection === 'economic' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">2. The Economic Pillar</h2>
                <p className="govuk-body">
                  The objective of the economic pillar is to distribute prosperity across all regions of Kenya by adding value within high-performance economic priority sectors:
                </p>
                
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>Tourism:</strong> Build resort cities and grow high-end tourism.</li>
                  <li><strong>Agriculture:</strong> Help small farmers process and sell more crops with better support.</li>
                  <li><strong>Trade:</strong> Build proper wholesale markets instead of scattered trading spots.</li>
                  <li><strong>Manufacturing:</strong> Set up special zones to make and export more goods.</li>
                  <li><strong>IT services:</strong> Develop tech hubs like Konza to attract global business.</li>
                  <li><strong>Finance:</strong> Make Nairobi a stronger regional finance centre.</li>
                </ul>
              </>
            )}

            {/* 3. SOCIAL PILLAR */}
            {activeSection === 'social' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">3. The Social Pillar</h2>
                <p className="govuk-body">
                  The social pillar seeks to construct a just, cohesive, and equitable society by upgrading public asset access lines inside human welfare sectors:
                </p>

                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
                  <li><strong>Education and Training</strong> &mdash; Restructuring curriculum standards to align with competence-based parameters (CBC) and expanding science, technology, and engineering (STEM) allocations.</li>
                  <li><strong>Universal Healthcare</strong> &mdash; Transitioning public health security funding pools toward automated digital tracking networks and local level-4 primary care clinical installations.</li>
                  <li><strong>Water and Sanitation Infrastructure</strong> &mdash; Enhancing household pipe connections, riparian forest protections, and urban sewerage treatment footprints.</li>
                  <li><strong>Affordable Housing Systems</strong> &mdash; Establishing state financing conduits to construct structured, high-density residential developments in urban sectors.</li>
                </ul>
              </>
            )}

            {/* 4. POLITICAL PILLAR */}
            {activeSection === 'political' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">4. The Political Pillar</h2>
                <p className="govuk-body">
                  The political pillar coordinates institutional reforms designed to safeguard rule of law, protect civil rights, and maintain decentralized devolution matrices:
                </p>

                <ul className="govuk-list govuk-list--spaced" style={{ paddingLeft: '15px', borderLeft: '4px solid #4c2c92' }}>
                  <li>
                    <strong>Rule of Law &amp; Judicial Integrity</strong> &mdash; Promoting complete separation of powers, judicial budget autonomy, and reducing long court case backlogs.
                  </li>
                  <li>
                    <strong>Electoral and Political Processes</strong> &mdash; Securing independent oversight structures for the IEBC and ensuring proportional political representation tracks.
                  </li>
                  <li>
                    <strong>Public Service Delivery</strong> &mdash; Standardizing digitizations across ministries to remove transactional roadblocks (e.g., eCitizen automation rollouts).
                  </li>
                  <li>
                    <strong>Devolution Coordination</strong> &mdash; Strengthening the capacity of the 47 county assemblies to handle decentralized finances without exchequer leakage lines.
                  </li>
                </ul>
              </>
            )}

            {/* 5. MEDIUM TERM PLANS (MTPS) */}
            {activeSection === 'mtps' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">5. Medium Term Plans (MTPs)</h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The macro objectives of Vision 2030 are translated into practical execution tasks through successive 5-year budgeting and operational plans:
                </p>

                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
                  <li>
                    <strong>MTP I (2008–2012)</strong> &mdash; Focused on macroeconomic stabilization, constitutional review parameters, and post-crisis infrastructure reconstruction.
                  </li>
                  <li>
                    <strong>MTP II (2013–2017)</strong> &mdash; Operationalized the rollout of devolution under the 2010 Constitution, standard gauge transport infrastructure, and early digitization hubs.
                  </li>
                  <li>
                    <strong>MTP III (2018–2022)</strong> &mdash; Centered on industrialization accelerators, food manufacturing security, affordable housing units, and expanding healthcare coverage pools.
                  </li>
                  <li>
                    <Link href="/documents/policies/mtp-iv-2023-2027.pdf" className="govuk-link govuk-!-font-weight-bold">
                      Download Active MTP IV (2023–2027) Framework PDF (8.2MB)
                    </Link>
                    <span className="govuk-body-s govuk-!-margin-top-1 d-block">
                      &mdash; The current planning instrument prioritizing bottom-up economic value transformation, agricultural subsidy tracking systems, and public exchequer optimization.
                    </span>
                  </li>
                </ul>
              </>
            )}

            {/* Shared Operational Footer Disclosures */}
            <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <p className="govuk-body-s govuk-text-secondary">
                To cross-reference other sessional papers or review macro-economic policy histories, return to the primary{' '}
                <Link href="/documents" className="govuk-link">National Policy &amp; Strategy Register</Link>.
              </p>
            </div>

          </div>
        </div>

        
      
    
  
  </>
);
}
