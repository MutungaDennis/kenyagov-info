import Link from "next/link";

/**
 * Site footer using a GDS-inspired footer structure (open design pattern).
 * CitizenGuide product content and independence statement — not UK gov brand.
 *
 * Pattern reference (design-system.service.gov.uk/components/footer):
 * - navigation: key primary destinations only (not every page)
 * - meta: secondary legal/about links
 * - custom meta text: independence + one official transaction pointer
 */
export default function GovUKFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="govuk-footer govuk-!-display-none-print" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__navigation">
          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Services and information
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/topics" className="govuk-footer__link">
                  Browse topics
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/services" className="govuk-footer__link">
                  Services
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/services/popular" className="govuk-footer__link">
                  Popular services
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
                <Link href="/guides" className="govuk-footer__link">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Government
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/government" className="govuk-footer__link">
                  Government hub
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/how-government-works"
                  className="govuk-footer__link"
                >
                  How government works
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/counties"
                  className="govuk-footer__link"
                >
                  Counties
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/find-your-representatives"
                  className="govuk-footer__link"
                >
                  Find your representatives
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/government/people"
                  className="govuk-footer__link"
                >
                  Officials
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
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Law and data
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/constitution" className="govuk-footer__link">
                  Constitution
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/acts/parliament" className="govuk-footer__link">
                  Acts of Parliament
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/kenya-gazette" className="govuk-footer__link">
                  Kenya Gazette
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/documents" className="govuk-footer__link">
                  Documents
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/open-data" className="govuk-footer__link">
                  Open data
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/access-to-information"
                  className="govuk-footer__link"
                >
                  Access to information
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/society-and-culture"
                  className="govuk-footer__link"
                >
                  Society and culture
                </Link>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section govuk-grid-column-one-half govuk-grid-column-one-quarter-from-desktop">
            <h2 className="govuk-footer__heading govuk-heading-m">
              Help
            </h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <Link href="/help" className="govuk-footer__link">
                  Help and support
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/scams" className="govuk-footer__link">
                  Scams and fake websites
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/huduma-centres" className="govuk-footer__link">
                  Huduma Centres
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link
                  href="/complain-about-government"
                  className="govuk-footer__link"
                >
                  Complain about government
                </Link>
              </li>
              <li className="govuk-footer__list-item">
                <Link href="/about" className="govuk-footer__link">
                  About this website
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
            <h2 className="govuk-visually-hidden">Support links</h2>

            {/*
              GOV.UK meta: secondary legal/about links only.
              Do not duplicate the full navigation tree here.
            */}
            <ul className="govuk-footer__inline-list">
              <li className="govuk-footer__inline-list-item">
                <Link href="/accessibility" className="govuk-footer__link">
                  Accessibility
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/cookies" className="govuk-footer__link">
                  Cookies
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/privacy" className="govuk-footer__link">
                  Privacy
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/terms" className="govuk-footer__link">
                  Terms and conditions
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/disclaimer" className="govuk-footer__link">
                  Disclaimer
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/copyright" className="govuk-footer__link">
                  Copyright
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/editorial-policy" className="govuk-footer__link">
                  Editorial policy
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link
                  href="/content-style-guide"
                  className="govuk-footer__link"
                >
                  Content style guide
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/corrections" className="govuk-footer__link">
                  Corrections
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/contact" className="govuk-footer__link">
                  Contact this website
                </Link>
              </li>
              <li className="govuk-footer__inline-list-item">
                <Link href="/feedback" className="govuk-footer__link">
                  Feedback
                </Link>
              </li>
            </ul>

            <div className="govuk-footer__meta-custom">
              <p className="govuk-body-s govuk-!-margin-bottom-2">
                <strong>CitizenGuide.KE</strong> is an independent civic
                information website. It is <strong>not</strong> run, funded or
                endorsed by the Government of Kenya.
              </p>
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                For official applications and payments, start from our{" "}
                <Link href="/ecitizen" className="govuk-footer__link">
                  eCitizen guide
                </Link>{" "}
                (links out to the official portal) or{" "}
                <Link
                  href="/contact-government"
                  className="govuk-footer__link"
                >
                  contact government
                </Link>
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
