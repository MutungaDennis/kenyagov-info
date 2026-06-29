'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function AccessibilityPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Accessibility statement", href: "/accessibility" },
        ]}
      />

      {/* Reduced padding wrapper to pull directory modules above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size for site-wide uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Accessibility statement for CitizenGuide.KE</h1>
            
            <p className="govuk-body-l">
              CitizenGuide.KE is committed to making this website accessible, in accordance with public sector digital accessibility design regulations.
            </p>

            {/* Replaced non-standard info panel wrapper with official GDS inset text */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              This independent informational platform targets compliance with the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong> standards.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Compliance status</h2>
            <p className="govuk-body">
              This website is built using the open-source <strong>GOV.UK Frontend</strong> style core library, which has been extensively audited for assistive compatibility. Most user paths on this platform satisfy core digital accessibility features, including:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Full semantic HTML structures and a logical, non-skipping heading hierarchy.</li>
              <li>Sufficient color contrast parameters across all default background tokens and link text elements.</li>
              <li>Complete, mouse-free keyboard navigation support using structured focus outlines.</li>
              <li>Descriptive, context-aware hyperlink anchor titles instead of generic &ldquo;click here&rdquo; labels.</li>
              <li>Properly labeled form entry fields, select controls, and error disclosure panels.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Non-accessible content and limitations</h2>
            <p className="govuk-body">
              While we optimize layouts for universal access, some specific limitations may exist within secondary resource dockets:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Historical PDF Documents</strong> &mdash; Some official legal dispatches, historic budget estimates, or old Gazette notice scans might lack text screen-reading tags or structural tables.</li>
              <li><strong>Faceted Search Toggles</strong> &mdash; Live-filtering interactions on our tables include aria-live status announcers, but certain screen readers may experience tracking delays during heavy database queries.</li>
              <li><strong>Third-Party Outlets</strong> &mdash; External hyperlink target portals (such as the official eCitizen gateway or ministerial systems) are completely outside our code control.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Requesting alternative formats</h2>
            <p className="govuk-body">
              If you require a piece of data, a local ward ledger, or an executive document in an alternative format like large print, an uncompressed text block, or a plain CSV sheet:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Email us via the active support framework on our <Link href="/contact" className="govuk-link">Contact page</Link>.</li>
              <li>Specify the exact table row context, target URL string, and your desired layout format.</li>
            </ul>
            <p className="govuk-body">
              We review submissions and make reasonable efforts to dispatch processed data within standard administrative review timelines.
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Reporting accessibility problems</h2>
            <p className="govuk-body">
              We continuously audit our design templates to improve assistive browsing. If you identify an element that lacks contrast, breaks keyboard tab loops, or fails to report clear screen-reader alt text labels, please let us know:
            </p>
            <p className="govuk-body govuk-!-margin-bottom-6">
              <Link href="/contact" className="govuk-link govuk-!-font-weight-bold">
                Contact us to report an accessibility problem &rarr;
              </Link>
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Technical information</h2>
            <p className="govuk-body">
              The technical architecture of this site runs on a Next.js framework paired with compiled GOV.UK Frontend stylesheet modules. Layout structures are verified against standard assistive software stacks, including VoiceOver, NVDA screen readers, and HTML markup validation tools.
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
