'use client';

import Link from "next/link";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo" style={{ clear: "both" }}>
      <div className="govuk-width-container">
        
        {/* Section 1: Navigation Links Container Grid */}
        <div className="govuk-footer__navigation" style={{ display: "block" }}>
          
          {/* Main GOV.UK Flex Layout Matrix resolving mobile alignment */}
          <div 
            className="govuk-footer__navigation-grid"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px 30px",
              justifyContent: "flex-start",
              width: "100%"
            }}
          >
            
            {/* Column 1: Explore Government Branches */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s">Explore</h2>
              <ul className="govuk-footer__list govuk-footer__list--columns-1">
                <li className="govuk-footer__list-item">
                  <Link href="/services" className="govuk-footer__link">Services</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/executive" className="govuk-footer__link">Executive (Ministries &amp; Agencies)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/legislature" className="govuk-footer__link">Legislature (Parliament &amp; Senate)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/judiciary" className="govuk-footer__link">Judiciary (Courts)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/counties" className="govuk-footer__link">Counties (All 47 Governments)</Link>
                </li>
              </ul>
            </div>

            {/* Column 2: About this platform */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s">About this site</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/about" className="govuk-footer__link">About CitizenGuide.KE</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/help" className="govuk-footer__link">Help &amp; Support</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/accessibility" className="govuk-footer__link">Accessibility statement</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/contact" className="govuk-footer__link">Contact</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/feedback" className="govuk-footer__link">Give feedback</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Public Disclosures */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s">Legal</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/privacy" className="govuk-footer__link">Privacy policy</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/cookies" className="govuk-footer__link">Cookies policy</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/terms" className="govuk-footer__link">Terms and conditions</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/open-data" className="govuk-footer__link">Open data &amp; disclosures</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/sitemap" className="govuk-footer__link">Sitemap</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Structural Border Divider built into GOV.UK style system */}
        <hr className="govuk-footer__section-break" />

        {/* Section 2: Metadata, Disclaimers and Licensing Blocks */}
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow" style={{ display: "block", float: "none", width: "100%" }}>
            
            {/* Standardized Kenya Branding Block without custom styles */}
            <div className="govuk-!-margin-bottom-4">
              <span className="govuk-heading-s govuk-!-margin-0" style={{ fontSize: "19px", color: "#ffffff" }}>
                CitizenGuide.KE
              </span>
            </div>

            <div className="govuk-footer__meta-custom" style={{ paddingRight: 0 }}>
              <p className="govuk-footer__meta-text govuk-!-font-size-14 govuk-!-margin-bottom-2" style={{ color: "#b1b4b6", maxWidth: "48rem" }}>
                <strong>Disclaimer:</strong> CitizenGuide.KE is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya. All information is compiled from audited public records.
              </p>
              <p className="govuk-footer__meta-text govuk-!-font-size-14 govuk-!-margin-bottom-4" style={{ color: "#b1b4b6", maxWidth: "48rem" }}>
                For official transactions, applications, and record lookups, access authorized national portals directly via the primary <a href="https://www.ecitizen.go.ke" className="govuk-footer__link" target="_blank" rel="noreferrer">eCitizen Gateway</a>.
              </p>
            </div>

            {/* Licensing and Copy Block */}
            <p className="govuk-footer__meta-text govuk-!-font-size-14" style={{ color: "#b1b4b6", margin: 0 }}>
              &copy; {new Date().getFullYear()} CitizenGuide.KE &bull; Built independently in accordance with public information disclosure guidelines.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
