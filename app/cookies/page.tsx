// app/cookies/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import TableScroll from "@/components/govuk/TableScroll";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Find out how CitizenGuide.KE uses cookies and similar technologies, why we use them and how you can manage your preferences.",
};

export default function CookiesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Cookies" },
        ]}
        title="Cookies on CitizenGuide.KE"
        lead="Find out what cookies CitizenGuide.KE uses, why we use them and how you can control your preferences."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Cookies are small files saved on your phone, tablet or computer
            when you visit a website.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE uses cookies and similar technologies to make the
            website work, remember choices you make and, where you allow it,
            help us understand how the website is used.
          </p>

          <p className="govuk-body">
            We do not use cookies to track your activity across unrelated
            websites or to serve third-party behavioural advertising.
          </p>

          <h2 className="govuk-heading-l">How we use cookies</h2>

          <p className="govuk-body">
            We use cookies for a small number of purposes:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>to make the website work securely and reliably</li>
            <li>to remember your cookie choices and other preferences</li>
            <li>
              to understand how people use CitizenGuide.KE so we can improve it
            </li>
          </ul>

          <p className="govuk-body">
            Some cookies are essential and cannot be switched off through our
            cookie settings. Other cookies, such as analytics cookies, are
            optional and are only used where you allow them.
          </p>

          <h2 className="govuk-heading-l">Cookies we use</h2>

          <h3 className="govuk-heading-m">Essential cookies</h3>

          <p className="govuk-body">
            These cookies are necessary for core website functions, such as
            security, remembering your cookie preferences or maintaining a
            session where a signed-in service requires one.
          </p>

          <p className="govuk-body">
            They cannot be turned off through our cookie settings because some
            parts of CitizenGuide.KE may not work properly without them.
          </p>

          <TableScroll caption="Essential cookies">
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Essential cookies used by CitizenGuide.KE
              </caption>

              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Name
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Purpose
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Expires
                  </th>
                </tr>
              </thead>

              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">
                      govuk-cookies-preferences
                    </code>
                  </td>
                  <td className="govuk-table__cell">
                    Saves your cookie preferences so we do not ask you again
                    on every visit.
                  </td>
                  <td className="govuk-table__cell">1 year</td>
                </tr>

                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">session-id</code>
                  </td>
                  <td className="govuk-table__cell">
                    Keeps your session active as you move between pages where a
                    signed-in service requires it.
                  </td>
                  <td className="govuk-table__cell">
                    When you close your browser
                  </td>
                </tr>
              </tbody>
            </table>
          </TableScroll>

          <h3 className="govuk-heading-m">
            Analytics cookies (optional)
          </h3>

          <p className="govuk-body">
            With your permission, we use analytics cookies to understand how
            people use CitizenGuide.KE. This helps us improve content,
            navigation, performance and the overall user experience.
          </p>

          <p className="govuk-body">
            Analytics may collect information about:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the pages you visit</li>
            <li>how you arrived at the website</li>
            <li>how long you spend on pages</li>
            <li>links and features you use</li>
            <li>your browser and device type</li>
            <li>general technical information about your visit</li>
          </ul>

          <p className="govuk-body">
            We use this information to understand patterns of website use. We
            do not use analytics cookies to serve behavioural advertising or
            to track your activity across unrelated websites.
          </p>

          <p className="govuk-body">
            Analytics cookies are optional. Where they are used, they will not
            be set unless you choose to allow them.
          </p>

          <TableScroll caption="Analytics cookies">
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Analytics cookies used by CitizenGuide.KE
              </caption>

              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Name
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Purpose
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Expires
                  </th>
                </tr>
              </thead>

              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">_ga</code>
                  </td>
                  <td className="govuk-table__cell">
                    Helps distinguish visits and understand how people use the
                    website.
                  </td>
                  <td className="govuk-table__cell">2 years</td>
                </tr>

                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">_ga_xxxxxx</code>
                  </td>
                  <td className="govuk-table__cell">
                    Helps maintain and measure analytics sessions for the
                    relevant analytics property.
                  </td>
                  <td className="govuk-table__cell">2 years</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>

          <div className="govuk-inset-text">
            The cookie names and expiry periods shown on this page should match
            the cookies actually set by the live CitizenGuide.KE website.
          </div>

          <h2 className="govuk-heading-l">
            Cookies that remember your settings
          </h2>

          <p className="govuk-body">
            CitizenGuide.KE may use cookies or similar storage technologies to
            remember choices you make, such as your cookie preferences or
            interface settings.
          </p>

          <p className="govuk-body">
            Where we introduce additional preference cookies, we will explain
            what they do and how long they remain on your device.
          </p>

          <h2 className="govuk-heading-l">
            Turning cookies on or off
          </h2>

          <p className="govuk-body">
            You can choose to accept or reject optional analytics cookies
            through our cookie settings. You can also delete cookies that have
            already been saved on your device.
          </p>

          <p className="govuk-body">
            To manage, block or delete cookies in your browser, follow the
            instructions for your browser:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Google Chrome
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Mozilla Firefox
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://support.microsoft.com/en-gb/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Microsoft Edge
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </li>

            <li>
              <a
                href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Apple Safari
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    marginLeft: "4px",
                    verticalAlign: "middle",
                    display: "inline-block",
                  }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </li>
          </ul>

          <div className="govuk-inset-text">
            If you block or delete essential cookies, some parts of
            CitizenGuide.KE may not work properly.
          </div>

          <h2 className="govuk-heading-l">
            Cookies set by other services
          </h2>

          <p className="govuk-body">
            Some features on CitizenGuide.KE may rely on services provided by
            other organisations. If third-party content is embedded directly
            into a page, that service may set its own cookies or use similar
            technologies.
          </p>

          <p className="govuk-body">
            Where this happens, we will identify the service where appropriate
            and provide relevant information or choices where required.
          </p>

          <p className="govuk-body">
            CitizenGuide.KE also contains links to external websites, including
            official government websites and other public information sources.
            Simply following one of these links does not mean that the external
            website&apos;s cookies are set by CitizenGuide.KE.
          </p>

          <p className="govuk-body">
            Once you leave CitizenGuide.KE, the other organisation&apos;s own
            privacy and cookie policies apply.
          </p>

          <h2 className="govuk-heading-l">
            Similar technologies
          </h2>

          <p className="govuk-body">
            Some website features may use technologies such as local storage
            rather than traditional cookies. These technologies can perform
            similar functions, such as remembering a preference or maintaining
            information within your browser.
          </p>

          <p className="govuk-body">
            Where these technologies are used for purposes similar to cookies,
            we apply the same principles described on this page.
          </p>

          <h2 className="govuk-heading-l">
            Your privacy
          </h2>

          <p className="govuk-body">
            Cookies and similar technologies can involve the processing of
            personal data.
          </p>

          <p className="govuk-body">
            Read our{" "}
            <Link href="/privacy" className="govuk-link">
              privacy policy
            </Link>{" "}
            to find out more about how CitizenGuide.KE collects, uses and
            protects personal data and about your data protection rights.
          </p>

          <h2 className="govuk-heading-l">
            Changes to this cookies policy
          </h2>

          <p className="govuk-body">
            We may update this page when the cookies or other technologies used
            by CitizenGuide.KE change.
          </p>

          <p className="govuk-body">
            The latest version will always be published on this page.
          </p>

          <h2 className="govuk-heading-l">
            Contact us
          </h2>

          <p className="govuk-body">
            If you have a question about the cookies used by CitizenGuide.KE or
            your privacy preferences,{" "}
            <Link href="/contact" className="govuk-link">
              contact CitizenGuide.KE
            </Link>
            .
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> 9 September 2026
          </p>
        </div>

        <RelatedNav
          links={[
            { text: "Privacy policy", href: "/privacy" },
            { text: "Terms and conditions", href: "/terms" },
            { text: "Disclaimer", href: "/disclaimer" },
            { text: "Copyright and content notices", href: "/copyright" },
            { text: "Accessibility statement", href: "/accessibility" },
            { text: "Contact this website", href: "/contact" },
          ]}
        />
      </div>
    </>
  );
}