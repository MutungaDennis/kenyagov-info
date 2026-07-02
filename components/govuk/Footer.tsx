'use client';

import Link from "next/link";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        
        {/* Navigation Columns */}
        <div className="govuk-footer__navigation govuk-!-margin-bottom-6">
          <div className="govuk-grid-row">
            
            {/* Column 1: Government */}
            <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-6">
              <h2 className="govuk-footer__heading govuk-heading-s">Government</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/government" className="govuk-footer__link">All government</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/presidency" className="govuk-footer__link">The Presidency</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/legislature" className="govuk-footer__link">Parliament</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/judiciary" className="govuk-footer__link">Judiciary</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/counties" className="govuk-footer__link">County governments</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/commissions" className="govuk-footer__link">Commissions</Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Institutions & Officials */}
            <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-6">
              <h2 className="govuk-footer__heading govuk-heading-s">Institutions &amp; Officials</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/government/institutions" className="govuk-footer__link">All institutions</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/people" className="govuk-footer__link">Government officials</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/cabinet" className="govuk-footer__link">The Cabinet</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/legislature/national-assembly/members" className="govuk-footer__link">Members of Parliament</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/government/counties/governors" className="govuk-footer__link">County governors</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Services & Resources */}
            <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-6">
              <h2 className="govuk-footer__heading govuk-heading-s">Services &amp; Resources</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/services" className="govuk-footer__link">Public services</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/elections" className="govuk-footer__link">Elections</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/constitution" className="govuk-footer__link">Constitution</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/acts/parliament" className="govuk-footer__link">Acts of Parliament</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/documents" className="govuk-footer__link">Documents</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/guides" className="govuk-footer__link">Citizen guides</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/open-data" className="govuk-footer__link">Open data</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: About & Legal */}
            <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-6">
              <h2 className="govuk-footer__heading govuk-heading-s">About &amp; Legal</h2>
              <ul className="govuk-footer__list">
                <li className="govuk-footer__list-item">
                  <Link href="/about" className="govuk-footer__link">About CitizenGuide.KE</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/help" className="govuk-footer__link">Help &amp; support</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/contact" className="govuk-footer__link">Contact</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/feedback" className="govuk-footer__link">Give feedback</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/sitemap" className="govuk-footer__link">Sitemap</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/accessibility" className="govuk-footer__link">Accessibility</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/privacy" className="govuk-footer__link">Privacy policy</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/cookies" className="govuk-footer__link">Cookies</Link>
                </li>
                <li className="govuk-footer__list-item">
                  <Link href="/terms" className="govuk-footer__link">Terms &amp; conditions</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

        {/* Meta Section - Copyright moved below the notice */}
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Important notice</h2>
            
            <p className="govuk-body-s govuk-!-margin-bottom-2">
              <strong>CitizenGuide.KE</strong> is an independent citizen-facing informational platform. 
              It is <strong>not</strong> an official outlet of the Government of Kenya. 
              All information is compiled from audited public records.
            </p>
            
            <p className="govuk-body-s govuk-!-margin-bottom-4">
              For official transactions or records, use the authorised portals such as the{' '}
              <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">
                eCitizen Gateway
              </a>.
            </p>

            {/* Copyright moved here - below the notice */}
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              &copy; {new Date().getFullYear()} CitizenGuide.KE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}