'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function TermsPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Terms and conditions", href: "/terms" },
        ]}
      />

      {/* Tighter top padding layout wrapper to pull entries higher up the viewport */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced heading size from xl to l for strict site-wide compliance */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Terms and Conditions</h1>
            <p className="govuk-body-s govuk-!-margin-bottom-4">Last updated: May 2026</p>

            <p className="govuk-body">
              Please read these Terms and Conditions carefully before using the CitizenGuide.KE platform.
            </p>

            {/* Section 1: Institutional Clarification */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">1. About CitizenGuide.KE</h2>
            <p className="govuk-body">
              CitizenGuide.KE operates as an <strong>independent, non-governmental</strong> digital platform. It is not affiliated with, endorsed by, funded by, or an official representative of the Government of Kenya or any state agency.
            </p>

            {/* Section 2: Purpose Mapping */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">2. Purpose of the Website</h2>
            <p className="govuk-body">
              The purpose of this platform is to provide a clear, neutral, and consolidated directory mapping public institutions, elected officials, constituency boundaries, and public records. The objective is to make public data transparent and accessible to citizens seeking information.
            </p>

            {/* Section 3: Statutory Mandatory Disclaimer */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">3. Statutory Disclaimer</h2>
            <div className="govuk-inset-text govuk-!-margin-bottom-4">
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                This directory is for informational purposes only. We do not provide official state services, commercial licensing, immigration credentials, or transactional capabilities. 
                All official applications, document registrations, and processing payments must be conducted through the authorized state platform directly via the <a href="https://www.ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Portal</a> or respective ministry endpoints.
              </p>
            </div>

            {/* Section 4: Data Standards Responsibility */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">4. Accuracy & Verification of Information</h2>
            <p className="govuk-body">
              While we compile records exclusively from audited public sources (such as the Kenya Gazette, parliamentary records, and financial allocation charts), we do not warrant that all parameters remain perfectly complete, accurate, or current in real-time. Users bear the sole responsibility for cross-checking time-sensitive milestones against raw statutory legal documents.
            </p>

            {/* Section 5: Acceptable Use Conditions */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">5. Acceptable Use</h2>
            <p className="govuk-body">As a condition of accessing these public records indices, you agree not to:</p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">
              <li>Use the directory data rows or interface components for any unlawful purpose.</li>
              <li>Distribute false, altered, or intentionally misleading info fragments derived from this site.</li>
              <li>Attempt to bypass access limitations, inject scripts, or compromise the database server node.</li>
              <li>Remove, strip, or alter any embedded data sources, tracking attributions, or disclaimer notices.</li>
            </ul>

            {/* Section 6: IP and Attribution Guidelines */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">6. Intellectual Property & Attribution</h2>
            <p className="govuk-body">
              The thematic layout structure, design tokens, and consolidated text data sheets on CitizenGuide.KE belong to the platform unless otherwise stated. Raw public statistics, acts, or gazetted quotes remain public domain artifacts, but substantial automated scraping or duplication of our core directory trees without attribution is prohibited.
            </p>

            {/* Section 7: Limitations Risk Block */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">7. Limitation of Liability</h2>
            <p className="govuk-body">
              CitizenGuide.KE is provided strictly on an &quot;as is&quot; and &quot;as available&quot; operational baseline. We disclaim all liability for any specific loss, administrative penalty, or data processing constraint arising from reliance on the informational records displayed across our pages.
            </p>

            {/* Section 8: Legal Venue Mapping */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">8. Governing Law</h2>
            <p className="govuk-body">
              These Terms and Conditions and any directory dispute parameters are governed by and construed entirely in accordance with the laws of the Republic of Kenya.
            </p>

            {/* Section 9: Terms Iteration Toggles */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">9. Changes to these Terms</h2>
            <p className="govuk-body">
              We may update these terms following amendments to national digital compliance frameworks. Continued interaction with the registry tools after changes are published constitutes active acceptance of the revised conditions.
            </p>

            <p className="govuk-body govuk-!-margin-top-6" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              If you have queries regarding this legal usage agreement, contact our administrative support desk directly via the <Link href="/contact" className="govuk-link">Contact page</Link>.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}
