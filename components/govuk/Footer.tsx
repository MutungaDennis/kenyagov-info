'use client';

import Link from "next/link";

export default function GovUKFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
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

        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Important notice</h2>
            <p className="govuk-body-s govuk-!-margin-bottom-2">
              <strong>CitizenGuide.KE</strong> is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya. All information is compiled from audited public records.
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-2">
              For official transactions or records, use the authorised portals such as the{' '}
              <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Gateway</a>.
            </p>
            <svg
              aria-hidden="true"
              focusable="false"
              className="govuk-footer__licence-logo"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 483.2 195.7"
              height="17"
              width="41"
            >
              <path
                fill="currentColor"
                d="M421.5 142.8V.1l-50.7 32.3v161.4h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
              />
            </svg>
            <span className="govuk-footer__licence-description">
              All content is available under the{' '}
              <a
                className="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated
            </span>
          </div>
          <div className="govuk-footer__meta-item">
            <p className="govuk-body-s govuk-!-margin-top-3 govuk-!-margin-bottom-0">
              &copy; {new Date().getFullYear()} CitizenGuide.KE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}