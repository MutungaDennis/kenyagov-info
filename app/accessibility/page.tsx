// app/accessibility/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function AccessibilityPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Accessibility", href: "/accessibility" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Accessibility statement for CitizenGuide.KE</h1>
            
            <p className="govuk-body-l">
              This accessibility statement applies to the CitizenGuide.KE website. We want as many people as possible to be able to use this website.
            </p>

            <p className="govuk-body">
              For example, that means you should be able to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>change colours, contrast levels and fonts using browser or device settings</li>
              <li>zoom in up to 400% without the text spilling off the screen</li>
              <li>navigate most of the website using just a keyboard</li>
              <li>navigate most of the website using speech recognition software</li>
              <li>listen to most of the website using a screen reader (including JAWS, NVDA and VoiceOver)</li>
            </ul>
            <p className="govuk-body">
              We have also made the website text as simple as possible to understand.
            </p>
            <p className="govuk-body">
              <a 
                href="https://mcmw.abilitynet.org.uk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                AbilityNet
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
              {' '}has advice on making your device easier to use if you have a disability.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* How accessible this website is */}
            <h2 className="govuk-heading-l">How accessible this website is</h2>
            <p className="govuk-body">
              We know some parts of this website are not fully accessible. For example:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>some older PDF documents are not fully accessible to screen reader software</li>
              <li>some third-party links open in new tabs without clear warning</li>
              <li>live search filters may not announce results instantly on all screen readers</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Feedback and contact information */}
            <h2 className="govuk-heading-l">Feedback and contact information</h2>
            <p className="govuk-body">
              If you need information on this website in a different format, such as accessible PDF, large print, easy read, or audio, please contact us.
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/contact" className="govuk-link">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="govuk-link">
                  Give feedback about this website
                </Link>
              </li>
            </ul>
            <p className="govuk-body">
              We will consider your request and get back to you as soon as we can.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Reporting accessibility problems */}
            <h2 className="govuk-heading-l">Reporting accessibility problems with this website</h2>
            <p className="govuk-body">
              We are always looking to improve the accessibility of this website. If you find any problems not listed on this page or think we are not meeting accessibility requirements, please let us know.
            </p>
            <p className="govuk-body">
              <Link href="/contact" className="govuk-link">
                Contact us to report an accessibility problem
              </Link>
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Contacting us by different methods */}
            <h2 className="govuk-heading-l">Contacting us by phone or visiting us in person</h2>
            <p className="govuk-body">
              CitizenGuide.KE is an online-only service. We do not have a physical office or phone line. Please use our{' '}
              <Link href="/contact" className="govuk-link">
                contact form
              </Link>
              {' '}to get in touch.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Technical information about this website's accessibility */}
            <h2 className="govuk-heading-l">Technical information about this website's accessibility</h2>
            <p className="govuk-body">
              CitizenGuide.KE is committed to making its website accessible, in accordance with the{' '}
              <a 
                href="https://inable.org/wp-content/uploads/2023/08/Kenya-Accessibility-Standard-ICT-Products-and-Services_KS-2952-1-2-2022_May_2023_.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Kenya Standard KS 2952-1:2022 for Accessibility of ICT Products and Services
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
              . This is the first Kenyan standard for accessibility of ICT products and services for persons with disabilities.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Compliance status */}
            <h2 className="govuk-heading-l">Compliance status</h2>
            <p className="govuk-body">
              This website is partially compliant with the{' '}
              <a 
                href="https://www.w3.org/TR/WCAG22/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Web Content Accessibility Guidelines (WCAG) 2.2
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
              {' '}Level AA standard and KS 2952-1:2022, due to the non-compliances and exemptions listed below.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Non-accessible content */}
            <h2 className="govuk-heading-l">Non-accessible content</h2>
            <p className="govuk-body">
              The content listed below is non-accessible for the following reasons.
            </p>

            <h3 className="govuk-heading-m">Non-compliance with the accessibility regulations</h3>
            
            <p className="govuk-body">
              <strong>PDF documents.</strong> Some PDF documents published on this website, including older legal notices and historical records, do not meet accessibility standards. For example, some PDFs may not have text that can be read by a screen reader, or may be missing proper headings and tags. This fails WCAG 2.2 success criteria 1.3.1 (Info and Relationships) and 1.1.1 (Non-text Content). We plan to fix these issues or provide accessible HTML alternatives by reviewing and re-publishing affected documents.
            </p>

            <p className="govuk-body">
              <strong>Live search filters.</strong> When users filter large tables or search results, the updated content may not be announced immediately by all screen readers. This partially fails WCAG 2.2 success criterion 4.1.3 (Status Messages). We are working to improve the live region announcements used by these components.
            </p>

            <h3 className="govuk-heading-m">Disproportionate burden</h3>
            <p className="govuk-body">
              We are not currently claiming that any accessibility problems would be a disproportionate burden to fix.
            </p>

            <h3 className="govuk-heading-m">Content that is not within the scope of the accessibility regulations</h3>
            <p className="govuk-body">
              <strong>Third-party websites.</strong> This website links to external government portals, such as the eCitizen portal and individual ministry websites. These are not within our control and are not covered by this accessibility statement.
            </p>
            <p className="govuk-body">
              <strong>PDFs and other documents published before 23 September 2018.</strong> PDFs or other documents published before this date that are not essential to providing our services are exempt from the accessibility regulations.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* What we have done to make this website accessible */}
            <h2 className="govuk-heading-l">What we have done to make this website accessible</h2>
            <p className="govuk-body">
              This website is a GDS-inspired civic site. It uses open-source{" "}
              <a
                href="https://design-system.service.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                GOV.UK Frontend
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
                <span className="govuk-visually-hidden"> (opens in a new tab)</span>
              </a>{" "}
              components and patterns (MIT-licensed) for accessibility foundations.
              CitizenGuide.KE branding, colours and content are our own — we are
              not a UK or Kenyan government service.
            </p>
            <p className="govuk-body">
              We have also made sure that:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>focus states are clearly visible when navigating with a keyboard</li>
              <li>colour contrast meets WCAG 2.2 Level AA requirements</li>
              <li>all images have meaningful alternative text</li>
              <li>headings are used in a logical order</li>
              <li>form fields have clear labels and error messages</li>
              <li>links describe their destination, rather than using generic text like "click here"</li>
              <li>the website works with browser zoom up to 400%</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* How we tested this website */}
            <h2 className="govuk-heading-l">How we tested this website</h2>
            <p className="govuk-body">
              We tested this website using a combination of automated tools and manual checks. This includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>automated accessibility audits using tools such as axe and Lighthouse</li>
              <li>manual keyboard navigation testing</li>
              <li>testing with screen readers including NVDA and VoiceOver</li>
              <li>checking colour contrast ratios</li>
              <li>reviewing HTML structure and ARIA attributes</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Preparation of this accessibility statement */}
            <h2 className="govuk-heading-l">Preparation of this accessibility statement</h2>
            <p className="govuk-body">
              This statement was prepared on 2 July 2026. It was last reviewed on 15 July 2026.
            </p>
            <p className="govuk-body">
              This website was last tested on 2 July 2026. The test was carried out by the CitizenGuide.KE team using automated tools and manual keyboard and screen reader checks on primary public templates.
            </p>
            <p className="govuk-body">
              We aim for WCAG 2.2 Level AA and alignment with Kenya Standard KS 2952-1:2022. We will review this statement when we ship major interface changes or at least once a year.
            </p>
            <p className="govuk-body">
              If you need information from this website in another format, or you need to report an accessibility problem, use our{' '}
              <Link href="/contact" className="govuk-link">
                contact form
              </Link>
              .
            </p>

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
                    <Link href="/help" className="govuk-link">
                      Help and support
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