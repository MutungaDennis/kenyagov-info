// app/privacy/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function PrivacyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Privacy policy", href: "/privacy" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Privacy policy</h1>
            
            <p className="govuk-body-l">
              This policy explains how CitizenGuide.KE collects and uses your personal information. We follow the Kenya Data Protection Act, 2019.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                CitizenGuide.KE is an independent website. It is not part of the Government of Kenya.
              </p>
            </div>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* What information we collect */}
            <h2 className="govuk-heading-l">What information we collect</h2>
            <p className="govuk-body">
              You can browse most of this website without giving us any personal information.
            </p>
            <p className="govuk-body">
              We only collect personal information if you choose to give it to us, for example when you:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>fill in the contact form</li>
              <li>send us feedback</li>
              <li>report an error or broken link</li>
            </ul>
            <p className="govuk-body">
              When you contact us, we may collect:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>your name (if you provide it)</li>
              <li>your email address (if you provide it)</li>
              <li>the content of your message</li>
            </ul>

            <h3 className="govuk-heading-m">Automatic information</h3>
            <p className="govuk-body">
              Like most websites, we collect some information automatically when you visit. This includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the pages you visit</li>
              <li>how long you spend on each page</li>
              <li>the type of device and browser you use</li>
              <li>your approximate location (country or region level)</li>
            </ul>
            <p className="govuk-body">
              This information is anonymous. It does not identify you personally. We use it to understand how people use the website so we can improve it.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Why we collect information */}
            <h2 className="govuk-heading-l">Why we collect information</h2>
            <p className="govuk-body">
              We use the information we collect to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>respond to your messages and feedback</li>
              <li>fix errors and improve the website</li>
              <li>understand how people use the site</li>
              <li>keep the website secure</li>
            </ul>
            <p className="govuk-body">
              We do not use your information for advertising or marketing.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Cookies */}
            <h2 className="govuk-heading-l">Cookies</h2>
            <p className="govuk-body">
              We use cookies to make the website work and to collect anonymous information about how it is used.
            </p>
            <p className="govuk-body">
              Read our{' '}
              <Link href="/cookies" className="govuk-link">
                cookies policy
              </Link>
              {' '}to find out what cookies we use and how to manage them.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* How long we keep your information */}
            <h2 className="govuk-heading-l">How long we keep your information</h2>
            <p className="govuk-body">
              We only keep your personal information for as long as we need it to respond to your message or improve the website. After that, we delete it.
            </p>
            <p className="govuk-body">
              Anonymous usage data (such as page views and browser types) may be kept for longer to help us understand trends over time.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Sharing your information */}
            <h2 className="govuk-heading-l">Sharing your information</h2>
            <p className="govuk-body">
              We do not sell, rent, or share your personal information with other organisations, except where required by law.
            </p>
            <p className="govuk-body">
              We may use third-party services to help us run the website, such as hosting providers or analytics tools. These services are contractually required to keep your information secure and confidential.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Links to other websites */}
            <h2 className="govuk-heading-l">Links to other websites</h2>
            <p className="govuk-body">
              This website contains links to other websites, including official government portals such as the{' '}
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
            <p className="govuk-body">
              This privacy policy only applies to CitizenGuide.KE. When you click a link to another website, you should read that website's privacy policy.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Your rights */}
            <h2 className="govuk-heading-l">Your rights</h2>
            <p className="govuk-body">
              Under the Kenya Data Protection Act, 2019, you have the right to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>ask what personal information we hold about you</li>
              <li>ask us to correct inaccurate information</li>
              <li>ask us to delete your personal information</li>
              <li>object to how we use your information</li>
              <li>withdraw consent at any time (where we have asked for your consent)</li>
            </ul>
            <p className="govuk-body">
              To make a request, please contact us using the details below.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Contact us */}
            <h2 className="govuk-heading-l">Contact us</h2>
            <p className="govuk-body">
              If you have questions about this privacy policy, want to access your personal information, or want to make a complaint, please contact us:
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/contact" className="govuk-link">
                  Contact us using our form
                </Link>
              </li>
              <li>
                Email us at{' '}
                <a href="mailto:info@citizenguide.ke" className="govuk-link">
                  info@citizenguide.ke
                </a>
              </li>
            </ul>
            <p className="govuk-body">
              We will respond to your request as soon as possible, and within 30 days.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Changes to this policy */}
            <h2 className="govuk-heading-l">Changes to this policy</h2>
            <p className="govuk-body">
              We may update this privacy policy from time to time. Any changes will be posted on this page.
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
                    <Link href="/cookies" className="govuk-link">
                      Cookies policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="govuk-link">
                      Terms and conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessibility" className="govuk-link">
                      Accessibility statement
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
      </main>
    </div>
  );
}