'use client';

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

type SessionalSection = 'overview' | 'restructuring' | 'cbc_foundations' | 'tvet' | 'legacy';

export default function SessionalPaper2012Page() {
  const [activeSection, setActiveSection] = useState<SessionalSection>('overview');

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Documents and Policies", href: "/documents" },
          { text: "Sessional Paper No. 1 of 2012", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <span className="govuk-caption-l govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
              Statutory Educational Policy Register
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Sessional Paper No. 1 of 2012</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Policy Framework for Education, Training and Research &mdash; The legislative blueprint aligning Kenyan education with the 2010 Constitution.
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
                    1. Overview &amp; Mandate
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'restructuring' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'restructuring' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('restructuring')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'restructuring' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    2. Sector Restructuring
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'cbc_foundations' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'cbc_foundations' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('cbc_foundations')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'cbc_foundations' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    3. Foundations of CBC
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'tvet' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'tvet' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('tvet')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'tvet' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    4. TVET &amp; Higher Education
                  </button>
                </li>
                <li style={{ paddingLeft: '12px', borderLeft: activeSection === 'legacy' ? '4px solid #1d70b8' : 'none', fontWeight: activeSection === 'legacy' ? 'bold' : 'normal' }}>
                  <button type="button" onClick={() => setActiveSection('legacy')} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: activeSection === 'legacy' ? 'none' : 'underline', color: '#1d70b8', textAlign: 'left', padding: 0 }}>
                    5. Long-Term Impact
                  </button>
                </li>
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
                  Sessional Paper No. 1 of 2012 was introduced to harmonize the national education sector with the requirements of the 2010 Constitution, specifically anchoring the Bill of Rights under <strong>Article 43(1)(f)</strong>, which mandates that every citizen holds the right to basic education.
                </p>

                <GovUKSummaryList
                  items={[
                    { key: "Adoption Date", value: "August 2012" },
                    { key: "Legal Status", value: "Sessional Paper No. 1 of 2012 (Adopted by the National Assembly)" },
                    { key: "Primary Objective", value: "Overhaul Kenyan education to meet Kenya Vision 2030 social pillar benchmarks" },
                    { key: "Key Deliverables", value: "Compulsory basic education, curriculum review, and TVET expansion" },
                  ]}
                />

                <div className="govuk-inset-text govuk-!-margin-top-6 govuk-!-margin-bottom-6">
                  This framework served as the policy anchor for subsequent fundamental mutations within the Ministry of Education system.
                </div>
              </>
            )}

            {/* 2. SECTOR RESTRUCTURING */}
            {activeSection === 'restructuring' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">2. Constitutional Sector Restructuring</h2>
                <p className="govuk-body">
                  The document outlined structural and administrative parameters to manage decentralized functions under the devolved government model:
                </p>
                
                <ul className="govuk-list govuk-list--spaced" style={{ paddingLeft: '15px', borderLeft: '4px solid #00703c' }}>
                  <li>
                    <strong>Devolution of Pre-Primary Systems</strong> &mdash; Delegating the operational logistics and funding infrastructure of Early Childhood Development Education (ECDE) to the 47 County Governments.
                  </li>
                  <li>
                    <strong>Establishment of the TSC as an Independent Commission</strong> &mdash; Re-aligning the Teachers Service Commission (TSC) under Article 237 as an autonomous constitutional organ managing human resource registries.
                  </li>
                  <li>
                    <strong>Compulsory Basic Education</strong> &mdash; Defining Free and Compulsory Basic Education as spanning 2 years of pre-primary, 6 years of primary, and 6 years of secondary assembly cycles.
                  </li>
                </ul>
              </>
            )}

            {/* 3. FOUNDATIONS OF CBC */}
            {activeSection === 'cbc_foundations' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">3. Foundations of Curriculum Overhaul</h2>
                <p className="govuk-body">
                  The framework formally critiqued the legacy 8-4-4 model for being overly academic and examination-focused, laying down the early policy justifications for what became the Competency-Based Curriculum (CBC):
                </p>

                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
                  <li><strong>Shift to Competency Evaluation</strong> &mdash; Transitioning student assessment parameters from a single final summative examination to continuous formative frameworks tracking individual learner talents.</li>
                  <li><strong>Introduction of Learner Pathways</strong> &mdash; Creating distinct specializations at the senior secondary level across Arts and Sports Science, Social Sciences, and STEM options.</li>
                  <li><strong>Teacher Re-training Frameworks</strong> &mdash; Mandating systemic upskilling modules across all training colleges to support altered pedagogical demands.</li>
                </ul>
              </>
            )}

            {/* 4. TVET & HIGHER EDUCATION */}
            {activeSection === 'tvet' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">4. Technical &amp; Vocational Training (TVET) Expansion</h2>
                <p className="govuk-body">
                  To supply industrial manpower for Vision 2030 manufacturing sectors, the paper prioritized the technical training framework:
                </p>

                <div className="govuk-inset-text govuk-!-margin-bottom-4">
                  <strong>The TVET Directive:</strong> Mandated the modernization of polytechnics and technical institutions, ensuring every sub-county hosts a functional TVET institution.
                </div>

                <p className="govuk-body">
                  This policy provided the basis for the enactment of the TVET Act of 2013 and the creation of regulatory organs such as TVETA and CDACC to manage technical competence test frameworks.
                </p>
              </>
            )}

            {/* 5. LONG-TERM IMPACT */}
            {activeSection === 'legacy' && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">5. Long-Term Policy Legacy</h2>
                <p className="govuk-body">
                  Sessional Paper No. 1 of 2012 remains the strategic anchor for current educational transitions:
                </p>

                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
                  <li>
                    <strong>CBC Implementation Architecture</strong> &mdash; The curriculum changes detailed in recent years stem directly from the structural recommendations laid out in this 2012 policy document.
                  </li>
                  <li>
                    <strong>Higher Education Funding Controls</strong> &mdash; The institutional unbundling of university financing lines and the restructuring of HELB parameters follow the financial sustainability frameworks initiated here.
                  </li>
                  <li>
                    <Link href="/documents/policies/sessional-paper-2012-no-1.pdf" className="govuk-link govuk-!-font-weight-bold">
                      Download Full Official Text of Sessional Paper No. 1 of 2012 PDF (1.9MB)
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {/* Shared Operational Footer Disclosures */}
            <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <p className="govuk-body-s govuk-text-secondary">
                To cross-reference other archival sessional papers or examine active medium-term plans, return to the primary{' '}
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
