// app/help/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function HelpPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Help and support</h1>
            
            <p className="govuk-body-l">
              Find guidance on using CitizenGuide.KE, understanding the information we provide, and getting help with official government services.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                This is an independent website. We do not provide official government services. For official transactions, use the{' '}
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
                .
              </p>
            </div>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 1: How to use this website */}
            <h2 className="govuk-heading-l">How to use this website</h2>
            <p className="govuk-body">
              CitizenGuide.KE is organised into sections that match the structure of the Kenyan government.
            </p>

            <h3 className="govuk-heading-m">Government</h3>
            <p className="govuk-body">
              Find information about how the government works, who holds office, and the institutions that deliver public services.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/government" className="govuk-link">
                  Government hub
                </Link>
                {' '}— overview of all government branches and institutions
              </li>
              <li>
                <Link href="/government/presidency" className="govuk-link">
                  The Presidency
                </Link>
                {' '}— the President, Cabinet, and executive offices
              </li>
              <li>
                <Link href="/government/institutions" className="govuk-link">
                  All government institutions
                </Link>
                {' '}— ministries, departments, agencies and commissions
              </li>
              <li>
                <Link href="/government/people" className="govuk-link">
                  Government officials
                </Link>
                {' '}— directory of current leaders and officials
              </li>
            </ul>

            <h3 className="govuk-heading-m">Counties</h3>
            <p className="govuk-body">
              Explore the 47 county governments, their leadership, and administrative units.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/government/counties" className="govuk-link">
                  County governments
                </Link>
                {' '}— overview of devolution and county leadership
              </li>
              <li>
                <Link href="/government/counties/wards" className="govuk-link">
                  Constituencies and wards
                </Link>
                {' '}— find your ward, constituency, and local representatives
              </li>
            </ul>

            <h3 className="govuk-heading-m">Search</h3>
            <p className="govuk-body">
              Use the search bar at the top of any page to find specific institutions, officials, documents, or services. You can search by:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>institution name or acronym (for example, KRA, IEBC, NTSA)</li>
              <li>official name or title</li>
              <li>ward, constituency, or county name</li>
              <li>document title or topic</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 2: Official government services */}
            <h2 className="govuk-heading-l">Official government services</h2>
            <p className="govuk-body">
              CitizenGuide.KE provides information about government services, but we do not process applications or payments. For official transactions, use the relevant government portal.
            </p>

            <h3 className="govuk-heading-m">Identity and civil registration</h3>
            <p className="govuk-body">
              For birth certificates, national ID cards, passports, and marriage certificates, visit the{' '}
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
              .
            </p>

            <h3 className="govuk-heading-m">Tax and business registration</h3>
            <p className="govuk-body">
              For KRA PIN registration, tax returns, and business registration, visit the{' '}
              <a 
                href="https://itax.kra.go.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Kenya Revenue Authority (iTax) portal
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

            <h3 className="govuk-heading-m">Driving and transport</h3>
            <p className="govuk-body">
              For driving licences, vehicle registration, and NTSA services, visit the{' '}
              <a 
                href="https://ntsa.go.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                NTSA website
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

            {/* Section 3: Where our information comes from */}
            <h2 className="govuk-heading-l">Where our information comes from</h2>
            <p className="govuk-body">
              We only use information from official public sources. This includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the Kenya Gazette</li>
              <li>parliamentary records (Hansard)</li>
              <li>court registries</li>
              <li>data from the Commission on Revenue Allocation (CRA)</li>
              <li>official government press releases and dispatches</li>
            </ul>
            <p className="govuk-body">
              All downloadable documents show their file format and size (for example, PDF, 1.4MB) so you know what to expect before downloading.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 4: Accessibility */}
            <h2 className="govuk-heading-l">Accessibility</h2>
            <p className="govuk-body">
              We have designed this website to be accessible to as many people as possible. This includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>high contrast text and backgrounds</li>
              <li>keyboard navigation support</li>
              <li>screen reader compatibility</li>
              <li>clear headings and labels</li>
              <li>plain English throughout</li>
            </ul>
            <p className="govuk-body">
              Read our full{' '}
              <Link href="/accessibility" className="govuk-link">
                accessibility statement
              </Link>
              {' '}for more information.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 5: Frequently asked questions */}
            <h2 className="govuk-heading-l">Frequently asked questions</h2>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  How do I know if an institution listed here is still active?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  Each institution page shows its legal basis, such as the Act of Parliament or Constitutional Article that created it. If an institution is dissolved or restructured, we update its status or mark it as inactive.
                </p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Can I suggest an update to a leader's details?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  We do not accept crowdsourced updates. All changes to leadership details must be verified against official sources, such as the Kenya Gazette or official government announcements, before we update our records.
                </p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  What should I do if I find an error or broken link?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  If you find outdated information, a broken link, or a missing detail, please{' '}
                  <Link href="/contact" className="govuk-link">
                    contact us
                  </Link>
                  . Include the page URL and what you expected to see, and we will investigate.
                </p>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Is this website an official government website?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  No. CitizenGuide.KE is an independent project. It is not run, funded, or endorsed by the Government of Kenya. For official government services, use the{' '}
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
                  .
                </p>
              </div>
            </details>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 6: Still need help */}
            <h2 className="govuk-heading-l">Still need help?</h2>
            <p className="govuk-body">
              If you cannot find the answer you are looking for, you can:
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/contact" className="govuk-link">
                  Contact us
                </Link>
                {' '}with your question or feedback
              </li>
              <li>
                <Link href="/feedback" className="govuk-link">
                  Give feedback
                </Link>
                {' '}about the website
              </li>
              <li>
                <Link href="/about" className="govuk-link">
                  Read about CitizenGuide.KE
                </Link>
                {' '}to learn more about the project
              </li>
              <li>
                <Link href="/accessibility" className="govuk-link">
                  Read the accessibility statement
                </Link>
                {' '}for information on how we make the site accessible
              </li>
            </ul>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/about" className="govuk-link">
                      About CitizenGuide.KE
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessibility" className="govuk-link">
                      Accessibility statement
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="govuk-link">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="govuk-link">
                      Cookies policy
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