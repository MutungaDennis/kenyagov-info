'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function HelpPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Help and Support</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Detailed guidance on navigating public structural archives, tracking administrative dockets, verifying civil data points, and using our digital indexing platform.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              CitizenGuide.KE is an independent informational platform. It is not an official outlet of the Government of Kenya, and does not process direct transactional service claims.
            </div>

            {/* Section 1: Core Navigation Framework */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">How to Navigate the Platform</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The platform architecture splits government registers into precise indices to mirror official constitutional organs:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>
                <strong>The Executive</strong> &mdash; Explores the structures of <Link href="/executive" className="govuk-link">The Executive Hub</Link>, including specific breakdowns for the Presidency, Cabinet Dispatches, and Ministry portfolios.
              </li>
              <li>
                <strong>Devolved Counties and Wards</strong> &mdash; Tracks localized decentralization data across all 47 counties. Use our directory filters to locate information on local <Link href="/counties/wards" className="govuk-link">electoral and administrative wards</Link>, constituency lines, and county leadership arrays.
              </li>
              <li>
                <strong>Unified Search Index</strong> &mdash; Enter a query in the top bar using direct terms like a specific Ministry acronym (e.g., KRA), an IEBC ward code, or a precise constitutional section.
              </li>
            </ul>

            {/* Section 2: eCitizen Integration & Service Tracking Guidance */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Understanding Official Service Connections</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              While CitizenGuide.KE indexes the eligibility requirements and step-by-step processing paths for public services, all official transactions are processed securely via the centralized state gateway:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>
                <strong>Identity and Civil Registries</strong> &mdash; Read eligibility files for Birth Certificates, National Identity Cards, and Marriage Licenses, then complete your application directly through the official <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Gateway</a>.
              </li>
              <li>
                <strong>Statutory Tax and Business Portals</strong> &mdash; Follow guidelines on corporate registration and iTax filings, then finalize payments via Kenya Revenue Authority (KRA) automated channels.
              </li>
              <li>
                <strong>Transport Operations</strong> &mdash; Locate driving license and logbook processing rules, then access National Transport and Safety Authority (NTSA) service endpoints.
              </li>
            </ul>

            {/* Section 3: Open Data, Verification & Sourcing Standards */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Data Verification & Open Data Standards</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              To ensure transparency and combat public misinformation, all directory metrics, leader listings, and institutional profiles undergo a strict vetting process:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>
                <strong>Primary Legal Sourcing</strong> &mdash; Structural information is compiled exclusively from the Kenya Gazette, official State House dispatches, parliamentary hansards, and published Commission on Revenue Allocation (CRA) reports.
              </li>
              <li>
                <strong>File Downloads Disclosure</strong> &mdash; All available policy files, executive order transcripts, or budget balance sheets specify their explicit format extensions and payload sizes (e.g., PDF, 1.4MB) so you can track mobile bandwidth limits effectively.
              </li>
            </ul>

            {/* Section 4: Accessibility Options Explanation */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Accessibility and Assisted Browsing</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              This platform is designed to meet WCAG 2.1 AA accessibility standards to accommodate low-vision users and assistive technologies:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>
                <strong>Faceted Dynamic Filters</strong> &mdash; Active filters include aria-live announcements that instantly alert screen readers when a dataset count dynamically changes.
              </li>
              <li>
                <strong>High-Contrast Compliance</strong> &mdash; Background tokens (such as our corporate Navy header `#002147`) maintain a high-contrast ratio against white text nodes to stay accessible to visually impaired readers.
              </li>
            </ul>

            {/* Section 5: Exhaustive FAQ Component */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Frequently Asked Questions</h2>

            <details className="govuk-details govuk-!-margin-bottom-3" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">How do I verify if a public institution listed here is active?</span>
              </summary>
              <div className="govuk-details__text">
                Every listed institution features its verified legal basis (e.g., specific Act of Parliament or Constitutional Article) directly on its profile view. If a body undergoes ministerial restructuring or is dissolved, its record is updated or marked as inactive within our executive order track.
              </div>
            </details>

            <details className="govuk-details govuk-!-margin-bottom-3" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Can I update or submit an official change of local leadership details?</span>
              </summary>
              <div className="govuk-details__text">
                No. Because we enforce independent data verification rules, we do not allow crowdsourced modifications. All updates to county executives, members of parliament, or ward administrators must be verified against gazetted dispatches from public agencies before being rolled out to our directories.
              </div>
            </details>

            <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">What should I do if I find a data discrepancy or broken link?</span>
              </summary>
              <div className="govuk-details__text">
                If you locate an outdated budget figure, a missing ward parameter, or a broken reference link, you can log a discrepancy report directly via our contact form. Please include the specific table row context or URL string to help our verification desk check it against the latest official records.
              </div>
            </details>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Still Need Assistance?</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              If you require supplementary information regarding executive records or regional ward lines, choose a support option below:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Submit a technical data verification ticket on our <Link href="/contact" className="govuk-link">Contact page</Link>.</li>
              <li>Review structural compliance protocols on our <Link href="/about" className="govuk-link">About page</Link>.</li>
              <li>Access official customer support desks directly on the <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Portal</a>.</li>
            </ul>

          </div>
        </div>

        
      </main>
    </div>
  );
}
