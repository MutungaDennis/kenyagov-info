'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function PrivacyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Privacy policy", href: "/privacy" },
        ]}
      />

      {/* Reduced padding wrapper to pull layout structural blocks above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size for strict site-wide uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Privacy notice</h1>
            <p className="govuk-body-s govuk-!-margin-bottom-4">Last updated: May 2026</p>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Introduction</h2>
            <p className="govuk-body">
              CitizenGuide.KE is an independent informational platform dedicated to mapping public infrastructure registries. We respect your digital privacy and are committed to processing data transparently in accordance with the provisions of the <strong>Kenya Data Protection Act, 2019</strong>.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              This platform is a citizen-focused directory. It is <strong>not</strong> operated by or an official branch of the Government of Kenya.
            </div>

            {/* Section 1: Data Processing Scope */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Information we process</h2>
            <p className="govuk-body">
              We operate under strict data minimization principles to safeguard public anonymity:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>No Authentication Requirements</strong> &mdash; You are not required to create an account, register an ID card, or sign in to explore public directories, ward codes, or executive dispatches.</li>
              <li><strong>Voluntary Interactions</strong> &mdash; We do not collect identifiable personal data unless you voluntarily initiate contact to file data discrepancy tickets, accessibility reports, or improvement logs via our communication forms.</li>
              <li><strong>Anonymized Telemetry</strong> &mdash; We may collect generic network analytics (such as browser variants, page view counts, and text search speeds) using privacy-friendly tools to optimize server responsiveness on mobile views.</li>
            </ul>

            {/* Section 2: Cookies Policy Framework */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Cookies policy summary</h2>
            <p className="govuk-body">
              This digital directory stores a minimal configuration of browser cookies to preserve system functionality:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">
              <li><strong>Essential Functional Cookies</strong> &mdash; Stored temporarily to remember system component states (such as tracking whether the mega menu drawer is expanded or collapsed).</li>
              <li><strong>Privacy-Compliant Analytics</strong> &mdash; Used strictly to evaluate platform metrics and user navigation drop-offs across lengthy table records without tracking persistent cross-site profiles.</li>
            </ul>
            <p className="govuk-body">
              You can audit, block, or completely purge these technical parameters by accessing your specific browser privacy settings at any time.
            </p>

            {/* Section 3: Legal Handling Parameters */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">How your data is managed</h2>
            <p className="govuk-body">
              Any personal communication details you supply (such as email addresses filed during support requests) are exclusively restricted to processing your specific validation item. We do not sell, leak, lease, or lease out data to commercial third parties, advertising networks, or data aggregation centers.
            </p>

            {/* Section 4: Boundary of Responsibility Disclosures */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Links to external government websites</h2>
            <p className="govuk-body">
              This directory links frequently to official state portals to facilitate direct civic processing (such as the authorized <a href="https://www.ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Portal</a> or KRA iTax gateways). Once you leave CitizenGuide.KE via an external hyperlink anchor, you are governed by the specific privacy framework of that public entity.
            </p>

            {/* Section 5: Statutory Data Subject Rights */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Your rights under the Data Protection Act</h2>
            <p className="govuk-body">
              As a data subject in the Republic of Kenya, you hold distinct statutory protections regarding your information processing. You have the right to request access to your logs, object to processing methods, rectify error records, or demand the absolute erasure of your submitted correspondence data from our system databases.
            </p>

            {/* Section 6: Direct Communications Route */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Contact us about data privacy</h2>
            <p className="govuk-body">
              If you wish to submit a data erasure request, file a regulatory tracking compliance question, or raise an objection regarding data processing, access our communication portal directly:
            </p>
            <p className="govuk-body govuk-!-margin-bottom-6">
              <Link href="/contact" className="govuk-link govuk-!-font-weight-bold">
                Contact our verification desk regarding data privacy &rarr;
              </Link>
            </p>

            <div style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }} className="govuk-!-margin-top-8">
              <p className="govuk-body-s govuk-text-secondary">
                This privacy statement is subject to statutory reviews following amendments in national data compliance laws. Structural adjustments will be displayed transparently on this registry page.
              </p>
            </div>

          </div>
        </div>

        
      </main>
    </div>
  );
}
