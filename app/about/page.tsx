// app/about/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 86400;
export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "About", href: "/about" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">About CitizenGuide.KE</h1>
            
            <p className="govuk-body-l">
              CitizenGuide.KE is an independent directory of the Kenyan government. It brings together information about government institutions, leaders, laws and public services in one place.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                This is an independent website. It is not run, funded or endorsed by the Government of Kenya.
              </p>
            </div>

            {/* Section 1: Why we built this website */}
            <h2 className="govuk-heading-l">Why we built this website</h2>
            <p className="govuk-body">
              Kenya's government includes many ministries, agencies, commissions and public bodies. Each runs its own website and keeps its own records.
            </p>
            <p className="govuk-body">
              It can be difficult to find accurate information because:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>information is spread across many different websites</li>
              <li>names and acronyms can be confusing</li>
              <li>leaders and structures change frequently</li>
            </ul>
            <p className="govuk-body">
              CitizenGuide.KE brings this information together so you can find what you need quickly.
            </p>

            {/* Section 2: The problem we are solving */}
            <h2 className="govuk-heading-l">The problem we are solving</h2>
            <p className="govuk-body">
              Government information is often hard to find. Official records are spread across different department websites, and it can be difficult to know exactly what each agency does or where their offices are located.
            </p>
            <p className="govuk-body">
              Many people want clearer information about how the government works, how money is spent, and how laws are made. We aim to make this information easy to find and understand.
            </p>

            {/* Section 3: Where our information comes from */}
            <h2 className="govuk-heading-l">Where our information comes from</h2>
            <p className="govuk-body">
              We provide a clear and neutral directory of government institutions, public services and leaders.
            </p>
            <p className="govuk-body">
              We only use information from official public sources. This includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the Kenya Gazette</li>
              <li>parliamentary records (Hansard)</li>
              <li>court registries</li>
              <li>data from the Commission on Revenue Allocation (CRA)</li>
            </ul>

            {/* Section 4: Keeping information up to date */}
            <h2 className="govuk-heading-l">Keeping information up to date</h2>
            <p className="govuk-body">
              Government structures change. New ministries are created, leaders are appointed, and policies are updated.
            </p>
            <p className="govuk-body">
              We review our information regularly and update it when official sources publish changes. However, there may be a short delay between an official announcement and our update.
            </p>
            <p className="govuk-body">
              For the most current information, always check the official government website of the relevant institution.
            </p>

            {/* Section 5: How this website is designed */}
            <h2 className="govuk-heading-l">How this website is designed</h2>
            <p className="govuk-body">
              CitizenGuide.KE is a <strong>GDS-inspired</strong> civic information
              site for Kenya. We adapt open patterns from the UK Government
              Digital Service{" "}
              <a
                href="https://design-system.service.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-link"
              >
                Design System
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
              — plain language, clear structure and accessibility — with our own
              branding, colours and Kenyan content.
            </p>
            <p className="govuk-body">
              We are <strong>not</strong> GOV.UK, not a Government of Kenya
              website, and not affiliated with the UK government. We use the
              design system&apos;s open components and ideas; we do not use the
              GOV.UK logo, crown or official brand.
            </p>
            <p className="govuk-body">
              We use a clean layout with high contrast and simple navigation.
              This makes the website easier to read on any device and more
              usable with assistive technologies.
            </p>

            <h2 className="govuk-heading-l">Editorial standards</h2>
            <p className="govuk-body">
              We follow a published{" "}
              <Link href="/editorial-policy" className="govuk-link">
                editorial policy
              </Link>
              : source hierarchy, plain language, independence from party politics, and how we handle updates.
            </p>
            <p className="govuk-body">
              If you find an error, use our{" "}
              <Link href="/corrections" className="govuk-link">
                corrections process
              </Link>
              .
            </p>

            {/* Section 6: Help us improve */}
            <h2 className="govuk-heading-l">Help us improve</h2>
            <p className="govuk-body">
              CitizenGuide.KE is a work in progress. We welcome your feedback and suggestions.
            </p>
            <p className="govuk-body">
              If you find an error or have a suggestion, please get in touch:
            </p>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/feedback" className="govuk-link">
                  Give feedback
                </Link>
              </li>
              <li>
                <Link href="/contact" className="govuk-link">
                  Contact this website
                </Link>
              </li>
              <li>
                <Link href="/corrections" className="govuk-link">
                  Request a correction
                </Link>
              </li>
            </ul>

            {/* Section 7: Important notice */}
            <h2 className="govuk-heading-l">Important notice</h2>
            <p className="govuk-body">
              CitizenGuide.KE is an informational directory only. We do not process applications, accept payments, or provide official government services.
            </p>
            <p className="govuk-body">
              If you need to apply for a service, make a payment, or submit an official application, you must use the official government portals, such as the{' '}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen portal
              </Link>
              {' '}or the specific ministry website. Read the full{' '}
              <Link href="/disclaimer" className="govuk-link">
                disclaimer
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
                    <Link href="/editorial-policy" className="govuk-link">
                      Editorial policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/content-style-guide" className="govuk-link">
                      Content style guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="govuk-link">
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link href="/corrections" className="govuk-link">
                      Corrections
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="govuk-link">
                      Help and support
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
                    <Link href="/contact" className="govuk-link">
                      Contact this website
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