'use client';

import Link from "next/link";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo" style={{ clear: "both", paddingBottom: 0, paddingTop: "32px" }}>
      
      {/* 
        SECTION 1 CONTAINER: 
        Added an inline padding style override to cleanly push the 
        navigation categories inward from the mobile screen edges.
      */}
      <div 
        className="govuk-width-container" 
        style={{ 
          paddingLeft: "24px",  /* Pushes all your link listings cleanly to the right */
          paddingRight: "24px", /* Balance safety padding */
          boxSizing: "border-box"
        }}
      >
        <div className="govuk-footer__navigation" style={{ display: "block", marginBottom: "32px" }}>
          <div 
            className="govuk-footer__navigation-grid"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "32px 32px", /* Opened gap spacing up slightly for readability layout rhythm */
              justifyContent: "flex-start",
              width: "100%"
            }}
          >
            {/* Column 1: Explore Government Branches */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s" style={{ fontSize: "17px", fontWeight: 700 }}>Explore</h2>
              <ul className="govuk-footer__list govuk-footer__list--columns-1">
                <li className="govuk-footer__list-item">
                  <Link href="/services" className="govuk-footer__link" style={{ fontSize: "16px" }}>Services</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/executive" className="govuk-footer__link" style={{ fontSize: "16px" }}>Executive (Ministries &amp; Agencies)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/legislature" className="govuk-footer__link" style={{ fontSize: "16px" }}>Legislature (Parliament &amp; Senate)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/judiciary" className="govuk-footer__link" style={{ fontSize: "16px" }}>Judiciary (Courts)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/counties" className="govuk-footer__link" style={{ fontSize: "16px" }}>Counties (All 47 Governments)</Link>
                </li>
              </ul>
            </div>

            {/* Column 2: About this platform */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s" style={{ fontSize: "17px", fontWeight: 700 }}>About this site</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/about" className="govuk-footer__link" style={{ fontSize: "16px" }}>About CitizenGuide.KE</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/help" className="govuk-footer__link" style={{ fontSize: "16px" }}>Help &amp; Support</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/accessibility" className="govuk-footer__link" style={{ fontSize: "16px" }}>Accessibility statement</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/contact" className="govuk-footer__link" style={{ fontSize: "16px" }}>Contact</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/feedback" className="govuk-footer__link" style={{ fontSize: "16px" }}>Give feedback</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Public Disclosures */}
            <div className="govuk-footer__section" style={{ flex: "1 1 240px", boxSizing: "border-box" }}>
              <h2 className="govuk-footer__heading govuk-heading-s" style={{ fontSize: "17px", fontWeight: 700 }}>Legal</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/privacy" className="govuk-footer__link" style={{ fontSize: "16px" }}>Privacy policy</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/cookies" className="govuk-footer__link" style={{ fontSize: "16px" }}>Cookies policy</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/terms" className="govuk-footer__link" style={{ fontSize: "16px" }}>Terms and conditions</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/open-data" className="govuk-footer__link" style={{ fontSize: "16px" }}>Open data &amp; disclosures</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/sitemap" className="govuk-footer__link" style={{ fontSize: "16px" }}>Sitemap</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 
        SECTION 2 CONTAINER: 
        Maintains the solid cream wash background block layout. Left exactly 
        unaltered since its mobile spacing measurements already fit perfectly.
      */}
      <div style={{ backgroundColor: "#fcfbf7", width: "100%", padding: "32px 0", borderTop: "2px solid #bfc1c3" }}>
        <div className="govuk-width-container">
          
          {/* Main Title Heading Block */}
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "20px", color: "#000000", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Important Independent Disclaimer
            </span>
          </div>

          {/* Disclaimer Content */}
          <div style={{ maxWidth: "52rem", marginBottom: "20px" }}>
            <p style={{ color: "#000000", fontSize: "15px", lineHeight: "1.6", margin: "0 0 12px 0", fontWeight: 500 }}>
              <strong>CitizenGuide.KE</strong> is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya. All platform information is compiled and verified from audited public records.
            </p>
            <p style={{ color: "#000000", fontSize: "15px", lineHeight: "1.6", margin: 0, fontWeight: 500 }}>
              For official state transactions, applications, and civil record lookups, access authorized national portals directly via the primary{' '}
              <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" style={{ color: "#1d70b8", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", fontWeight: 700 }}>
                eCitizen Gateway
              </a>.
            </p>
          </div>

          {/* Copyright line */}
          <div style={{ borderTop: "1px solid #bfc1c3", paddingTop: "14px", marginTop: "14px" }}>
            <p style={{ color: "#000000", fontSize: "14px", margin: 0, letterSpacing: "0.01em", fontWeight: 600 }}>
              &copy; {new Date().getFullYear()} CitizenGuide.KE &bull; Built independently in accordance with public information disclosure guidelines.
            </p>
          </div>

        </div>
      </div>

    </footer>
  );
}
