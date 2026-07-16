// app/cookies/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function CookiesPage() {
  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Cookies", href: "/cookies" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Cookies</h1>
            
            <p className="govuk-body">
              CitizenGuide.KE uses cookies to make the website work and to collect anonymous information about how people use it.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* What are cookies */}
            <h2 className="govuk-heading-l">What are cookies?</h2>
            <p className="govuk-body">
              Cookies are small text files that are saved on your phone, tablet or computer when you visit a website. They are used to remember information about your visit, such as your preferences and how you use the site.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* How we use cookies */}
            <h2 className="govuk-heading-l">How we use cookies</h2>
            <p className="govuk-body">
              We use cookies to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>make the website work properly</li>
              <li>remember your settings and preferences</li>
              <li>collect anonymous information about how you use the site, so we can improve it</li>
            </ul>
            <p className="govuk-body">
              We do not use cookies for advertising or to track your behaviour across other websites.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Cookies we use */}
            <h2 className="govuk-heading-l">Cookies we use</h2>
            
            <h3 className="govuk-heading-m">Essential cookies</h3>
            <p className="govuk-body">
              These cookies are necessary for the website to work. They cannot be turned off.
            </p>

            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Essential cookies used by CitizenGuide.KE
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Purpose</th>
                  <th scope="col" className="govuk-table__header">Expires</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">govuk-cookies-preferences</code>
                  </td>
                  <td className="govuk-table__cell">
                    Saves your cookie preferences so we do not ask you again on every page.
                  </td>
                  <td className="govuk-table__cell">1 year</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">session-id</code>
                  </td>
                  <td className="govuk-table__cell">
                    Keeps you signed in as you move between pages.
                  </td>
                  <td className="govuk-table__cell">When you close your browser</td>
                </tr>
              </tbody>
            </table>

            <h3 className="govuk-heading-m">Analytics cookies (optional)</h3>
            <p className="govuk-body">
              With your permission, we use Google Analytics to collect information about how you use this website. This helps us understand how we can improve the site.
            </p>
            <p className="govuk-body">
              Google Analytics stores information about:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the pages you visit</li>
              <li>how long you spend on each page</li>
              <li>how you arrived at the site</li>
              <li>what you click on while using the site</li>
            </ul>
            <p className="govuk-body">
              Google Analytics does not collect or store your personal information. The information produced is anonymous and cannot be used to identify you.
            </p>

            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Analytics cookies used by CitizenGuide.KE
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Purpose</th>
                  <th scope="col" className="govuk-table__header">Expires</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">_ga</code>
                  </td>
                  <td className="govuk-table__cell">
                    Used to distinguish anonymous users.
                  </td>
                  <td className="govuk-table__cell">2 years</td>
                </tr>
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <code className="govuk-body-s">_ga_xxxxxx</code>
                  </td>
                  <td className="govuk-table__cell">
                    Used to track anonymous user sessions.
                  </td>
                  <td className="govuk-table__cell">2 years</td>
                </tr>
              </tbody>
            </table>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Turning cookies on or off */}
            <h2 className="govuk-heading-l">Turning cookies on or off</h2>
            <p className="govuk-body">
              You can choose to accept or decline analytics cookies at any time. You can also delete cookies that have already been saved on your device.
            </p>
            <p className="govuk-body">
              To turn off cookies, follow the instructions for your browser:
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
                    style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="govuk-visually-hidden"> (opens in a new tab)</span>
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
                    style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="govuk-visually-hidden"> (opens in a new tab)</span>
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
                    style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="govuk-visually-hidden"> (opens in a new tab)</span>
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
                    style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
            <p className="govuk-body">
              If you turn off essential cookies, some parts of the website may not work properly.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Cookies from other websites */}
            <h2 className="govuk-heading-l">Cookies from other websites</h2>
            <p className="govuk-body">
              CitizenGuide.KE links to other websites, such as the official{' '}
              <a 
                href="https://www.ecitizen.go.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                eCitizen portal
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
                  style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden"> (opens in a new tab)</span>
              </a>
              . These websites may set their own cookies. CitizenGuide.KE does not control how these cookies are used.
            </p>
            <p className="govuk-body">
              Check the privacy and cookie policies of those websites for more information.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* More information */}
            <h2 className="govuk-heading-l">More information about cookies</h2>
            <p className="govuk-body">
              For more information about cookies, including how to see what cookies have been set on your device and how to manage or delete them, visit{' '}
              <a 
                href="https://www.allaboutcookies.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                All About Cookies
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
                  style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="govuk-visually-hidden"> (opens in a new tab)</span>
              </a>
              .
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Changes to this policy */}
            <h2 className="govuk-heading-l">Changes to this cookies policy</h2>
            <p className="govuk-body">
              We may update this policy from time to time. Any changes will be posted on this page.
            </p>
            <p className="govuk-body">
              Last updated: 2 July 2026
            </p>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/privacy" className="govuk-link">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessibility" className="govuk-link">
                      Accessibility statement
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="govuk-link">
                      Terms and conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="govuk-link">
                      About CitizenGuide.KE
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="govuk-link">
                      Contact us
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      
    
  
  </>
);
}