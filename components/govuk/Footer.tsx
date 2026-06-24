'use client';

import Link from "next/link";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__navigation govuk-!-margin-bottom-8">
          <div className="govuk-footer__navigation-grid">
            {/* Column 1: Explore Government Branches */}
            <div className="govuk-footer__section">
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
            <div className="govuk-footer__section">
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
            <div className="govuk-footer__section">
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
      </div>

      <div className="govuk-footer__meta footer-notice">
        <div className="govuk-width-container">
          <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Important notice</h2>
          <p className="govuk-body-s">
            <strong>CitizenGuide.KE</strong> is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya. All information is compiled from audited public records.
          </p>
          <p className="govuk-body-s">
            For official transactions or records, use the authorised portals such as the{' '}
            <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Gateway</a>.
          </p>
          <p className="govuk-body-s govuk-!-margin-top-3 govuk-!-margin-bottom-0">
            &copy; {new Date().getFullYear()} CitizenGuide.KE
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 40.0625rem) {
          .govuk-footer__navigation-grid {
            display: flex !important;
            flex-wrap: wrap;
            gap: 30px;
          }
          .govuk-footer__section {
            flex: 1 0 0;
            min-width: 200px;
          }
        }
        .govuk-footer__navigation-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-notice {
          background-color: #f8f8f8;
          width: 100%;
          padding: 24px 0;
          border-top: 2px solid #bfc1c3;
          margin-top: 30px;
        }
      `}} />
    </footer>
  );
}
