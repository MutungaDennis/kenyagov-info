'use client';

import Link from "next/link";
import Image from "next/image";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        
        {/* Section 1: Navigation Links Container Grid */}
        <div className="govuk-footer__navigation">
          <div className="govuk-grid-row">
            
            {/* Column 1: Explore Government Branches */}
            <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
              <h2 className="govuk-footer__heading govuk-heading-s">Explore</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/services" className="govuk-footer__link">Services</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/executive" className="govuk-footer__link">Executive (Ministries & Agencies)</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/legislature" className="govuk-footer__link">Legislature (Parliament & Senate)</Link>
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
            <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
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
            <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
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
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            
            {/* Standardized Kenya Branding Block without custom styles */}
            <div className="govuk-!-margin-bottom-4">
              <span className="govuk-heading-s govuk-!-margin-0">
                CitizenGuide.KE
              </span>
            </div>

            <div className="govuk-footer__meta-custom">
              <p className="govuk-footer__meta-text govuk-!-font-size-16 govuk-!-margin-bottom-2">
                <strong>Disclaimer:</strong> CitizenGuide.KE is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya. All information is compiled from audited public records.
              </p>
              <p className="govuk-footer__meta-text govuk-!-font-size-16 govuk-!-margin-bottom-4">
                For official transactions, applications, and record lookups, access authorized national portals directly via the primary <a href="https://www.ecitizen.go.ke" className="govuk-footer__link" target="_blank" rel="noreferrer">eCitizen Gateway</a>.
              </p>
            </div>

            {/* Licensing and Copy Block */}
            <p className="govuk-footer__meta-text govuk-!-font-size-14">
              &copy; {new Date().getFullYear()} CitizenGuide.KE &bull; Built independently in accordance with public information disclosure guidelines.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
