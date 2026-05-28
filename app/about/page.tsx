'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function AboutPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
        ]}
      />

      {/* Tighter top padding wrapper to maximize initial viewport real estate */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced heading size from xl to l for strict site-wide uniform scales */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">About CitizenGuide.KE</h1>
            
            <p className="govuk-body-l">
              CitizenGuide.KE is an independent public directory designed to simplify the structure, functions, and leadership of the Government of the Republic of Kenya.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              This platform is a citizen-facing informational archive. It is <strong>not</strong> an official outlet of the Government of Kenya, and does not host direct public service transactions.
            </div>

            {/* Section 1: Institutional Context */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Why this platform exists</h2>
            <p className="govuk-body">
              The national executive architecture of Kenya spans hundreds of state ministries, distinct departments, semi-autonomous government agencies (SAGAs), independent regulatory boards, commissions, and public funds. Each entity administers separate digital portals, historical records, and policy frameworks.
            </p>
            <p className="govuk-body">
              For public verification, tracking this administrative framework often introduces navigation challenges across decentralized dockets, commonly referenced by their institutional acronyms:
            </p>
            
            {/* High-contrast factual list format block */}
            <div className="govuk-inset-text govuk-!-margin-bottom-4" style={{ letterSpacing: '0.5px', fontStyle: 'normal' }}>
              <strong>KRA, NTSA, KEBS, NEMA, NSSF, SHA, EPRA, RBA, CA, WASREB, PPB, OAG, OCOB...</strong>
            </div>

            <p className="govuk-body">
              CitizenGuide.KE consolidates these scattered registries into a centralized index. This helps citizens quickly determine institutional mandates, identify appointed leaders, trace executive orders, and access official publication links.
            </p>

            {/* Section 2: Core Structural Challenges Addressed */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">The Informational Problem</h2>
            <p className="govuk-body">
              Public access to administrative data is often limited by specific structural constraints:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">
              <li>Information is fragmented across independent state department websites.</li>
              <li>There is low public awareness regarding the exact statutory boundaries of regulatory bodies.</li>
              <li>Locating direct service delivery nodes or physical regional offices can be complex.</li>
              <li>Unverified data and misinformation easily proliferate when official records lack clear public indexing.</li>
            </ul>

            <p className="govuk-body">
              These information gaps present significant bottlenecks for citizen engagement. Civic events—including the legislative expressions and public participation debates surrounding the Finance Bill—highlighted a strong demand among young Kenyans for greater transparent tracking of state data, budget allocations, and legislative processes.
            </p>

            {/* Section 3: Strategic Platform Objectives */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Our Mission & Sourcing Standards</h2>
            <p className="govuk-body">
              CitizenGuide.KE provides a <strong>neutral, clear, and unembellished</strong> directory of public dockets, civil services, and leadership roles. We strictly enforce open-data transparency standards:
            </p>
            
            <div className="govuk-inset-text govuk-!-margin-bottom-4">
              <strong>The Objective:</strong> To make public administration completely understandable, navigable, and accountable to every citizen.
            </div>

            <p className="govuk-body">
              All directories, ward parameters, and cabinet dispatches are compiled exclusively from audited public source files, including the official Kenya Gazette, parliamentary hansards, judicial registries, and data from the Commission on Revenue Allocation (CRA).
            </p>

            {/* Section 4: Design Philosophy Framework */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">UI Design Philosophy</h2>
            <p className="govuk-body">
              To prioritize universal accessibility and high usability, this platform is modeled after the structural conventions of the <strong>UK Government Digital Service (GOV.UK)</strong>. 
            </p>
            <p className="govuk-body">
              By utilizing a clean, tabular presentation layer, high-contrast layouts, and mobile-responsive grid frameworks from the open-source GDS frontend design system, we ensure the index stays clean, scannable, and accessible to assistive screen-reader technologies.
            </p>

            {/* Section 5: Statutory Mandatory Disclaimer */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Statutory Disclaimer</h2>
            <div className="govuk-inset-text govuk-!-margin-bottom-6" style={{ borderLeftColor: '#d4351c' }}>
              CitizenGuide.KE is a completely <strong>independent</strong> informational platform. It is not affiliated with, endorsed by, or funded by the Government of Kenya or any state corporation. To process official transactions, applications, or statutory service claims, you must utilize the authorized state portal directly via the <a href="https://www.ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Portal</a> or respective ministry websites.
            </div>

            <p className="govuk-body govuk-!-margin-top-4">
              Thank you for using this independent resource to track and verify the structural data of your public institutions.
            </p>
          </div>
        </div>

        
      </main>
    </div>
  );
}
