import Link from "next/link";

/**
 * Site footer using GOV.UK footer component structure.
 * Navigation sections are direct children of govuk-footer__navigation
 * (no nested govuk-grid-row — that breaks mobile gutter alignment).
 *
 * @see https://design-system.service.gov.uk/components/footer/
 */
export default function GovUKFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__navigation">
          {/*
            Sections are direct children of govuk-footer__navigation.
            Grid columns: full-width on mobile, half from tablet, quarter from desktop.
          */}
          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Government
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/government" className="govuk-footer__link">
                  All government
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/presidency"
                  className="govuk-footer__link"
                >
                  The Presidency
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/legislature"
                  className="govuk-footer__link"
                >
                  Parliament
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/judiciary"
                  className="govuk-footer__link"
                >
                  Judiciary
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/counties"
                  className="govuk-footer__link"
                >
                  County governments
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/commissions"
                  className="govuk-footer__link"
                >
                  Commissions
                </Link>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Institutions &amp; officials
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/institutions"
                  className="govuk-footer__link"
                >
                  All institutions
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/government/people" className="govuk-footer__link">
                  Government officials
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/government/cabinet" className="govuk-footer__link">
                  The Cabinet
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/legislature/national-assembly/members"
                  className="govuk-footer__link"
                >
                  Members of Parliament
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/counties/governors"
                  className="govuk-footer__link"
                >
                  County governors
                </Link>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Services &amp; resources
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/topics" className="govuk-footer__link">
                  Browse topics
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/services" className="govuk-footer__link">
                  Public services
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/services/a-z" className="govuk-footer__link">
                  Services A to Z
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/ecitizen" className="govuk-footer__link">
                  eCitizen explained
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/elections" className="govuk-footer__link">
                  Elections
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/constitution" className="govuk-footer__link">
                  Constitution
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/guides" className="govuk-footer__link">
                  Citizen guides
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/open-data" className="govuk-footer__link">
                  Open data
                </Link>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              About &amp; legal
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/about" className="govuk-footer__link">
                  About CitizenGuide.KE
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/help" className="govuk-footer__link">
                  Help &amp; support
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/contact-government"
                  className="govuk-footer__link"
                >
                  Contact government
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/contact" className="govuk-footer__link">
                  Contact this website
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/disclaimer" className="govuk-footer__link">
                  Disclaimer
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/accessibility" className="govuk-footer__link">
                  Accessibility
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/privacy" className="govuk-footer__link">
                  Privacy
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/cookies" className="govuk-footer__link">
                  Cookies
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/terms" className="govuk-footer__link">
                  Terms and conditions
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/sitemap" className="govuk-footer__link">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="govuk-footer__section-break" />

        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <h2 className="govuk-visually-hidden">About this website</h2>

            <div className="govuk-footer__meta-custom">
              <p className="govuk-body-s govuk-!-margin-bottom-2">
                <strong>CitizenGuide.KE</strong> is an independent
                citizen-facing informational platform. It is{" "}
                <strong>not</strong> an official outlet of the Government of
                Kenya. All information is compiled from public records.{" "}
                <Link href="/disclaimer" className="govuk-footer__link">
                  Disclaimer
                </Link>
                {" · "}
                <Link
                  href="/editorial-policy"
                  className="govuk-footer__link"
                >
                  Editorial policy
                </Link>
                {" · "}
                <Link href="/corrections" className="govuk-footer__link">
                  Corrections
                </Link>
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                For official transactions or records, use authorised portals
                such as the{" "}
                <a
                  href="https://www.ecitizen.go.ke"
                  target="_blank"
                  rel="noreferrer"
                  className="govuk-footer__link"
                >
                  eCitizen Gateway
                </a>
                .
              </p>
            </div>

            <p className="govuk-footer__licence-description govuk-!-margin-top-4 govuk-!-margin-bottom-0">
              &copy; {year} CitizenGuide.KE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
