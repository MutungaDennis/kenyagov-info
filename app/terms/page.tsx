// app/terms/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function TermsPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Terms and conditions", href: "/terms" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Terms and conditions</h1>
            
            <p className="govuk-body-l">
              By using CitizenGuide.KE, you agree to these terms. Please read them carefully.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                CitizenGuide.KE is an independent website. It is not run, funded or endorsed by the Government of Kenya.
              </p>
            </div>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* What this website does */}
            <h2 className="govuk-heading-l">What this website does</h2>
            <p className="govuk-body">
              CitizenGuide.KE is a directory of the Kenyan government. It brings together information about government institutions, leaders, laws and public services in one place.
            </p>
            <p className="govuk-body">
              We do not provide official government services. We do not process applications, accept payments, or issue official documents.
            </p>
            <p className="govuk-body">
              For official government services, use the{' '}
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

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Accuracy of information */}
            <h2 className="govuk-heading-l">Accuracy of information</h2>
            <p className="govuk-body">
              We get our information from official public sources, including the Kenya Gazette, parliamentary records, and government reports.
            </p>
            <p className="govuk-body">
              We try to keep this website up to date, but we cannot guarantee that all information is accurate or current at all times. Government structures change, and there may be a delay between an official change and our update.
            </p>
            <p className="govuk-body">
              If you need to rely on information for legal or official purposes, always check the original source.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Acceptable use */}
            <h2 className="govuk-heading-l">Acceptable use</h2>
            <p className="govuk-body">
              You may use this website for lawful purposes. You must not:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>use the website for anything illegal</li>
              <li>share false or misleading information from this website</li>
              <li>try to hack, damage, or disrupt the website</li>
              <li>copy large amounts of content without permission</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Using our content */}
            <h2 className="govuk-heading-l">Using our content</h2>
            <p className="govuk-body">
              The design and layout of this website belong to CitizenGuide.KE.
            </p>
            <p className="govuk-body">
              The information we publish comes from public sources. Acts of Parliament, court judgments, and government reports are in the public domain and can be used freely.
            </p>
            <p className="govuk-body">
              You may link to this website from other websites. If you want to copy or reuse our content, please{' '}
              <Link href="/contact" className="govuk-link">
                contact us
              </Link>
              {' '}first.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Our responsibility */}
            <h2 className="govuk-heading-l">Our responsibility</h2>
            <p className="govuk-body">
              This website is provided "as is". We do our best to keep it working, but we cannot guarantee that it will always be available or error-free.
            </p>
            <p className="govuk-body">
              To the fullest extent permitted by law, CitizenGuide.KE is not responsible for any loss or damage that results from using this website or relying on its content.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Links to other websites */}
            <h2 className="govuk-heading-l">Links to other websites</h2>
            <p className="govuk-body">
              This website contains links to other websites, including official government portals. We are not responsible for the content or privacy practices of those websites.
            </p>
            <p className="govuk-body">
              When you click a link to another website, you should read that website's terms and privacy policy.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Law that applies */}
            <h2 className="govuk-heading-l">Law that applies</h2>
            <p className="govuk-body">
              These terms are governed by the laws of the Republic of Kenya. Any disputes will be handled in Kenyan courts.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Changes to these terms */}
            <h2 className="govuk-heading-l">Changes to these terms</h2>
            <p className="govuk-body">
              We may update these terms from time to time. Any changes will be posted on this page.
            </p>
            <p className="govuk-body">
              If we make significant changes, we will try to let you know through the website.
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
                    <Link href="/cookies" className="govuk-link">
                      Cookies policy
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
      
    
  
    </>
);
}