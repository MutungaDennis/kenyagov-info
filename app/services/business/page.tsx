import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function StartingBusiness() {
  return (
    <div className="govuk-width-container">
      {/* Back Link */}
      {/* <GovUKBackLink href="/services" /> */}

      {/* Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "Starting a Business", href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Starting a Business in Kenya</h1>
            <p className="govuk-body-l">
              A complete step-by-step guide to choosing the right structure, registering your business, 
              and completing all legal requirements in Kenya.
            </p>

            {/* Quick Action */}
            <div className="govuk-button-group govuk-!-margin-bottom-8">
              <a href="https://ecitizen.go.ke" target="_blank" className="govuk-button">
                Start your application on eCitizen
              </a>
            </div>

            <hr className="govuk-section-break govuk-section-break--visible" />

            {/* 1. Business Structures */}
            <h2 className="govuk-heading-l">1. Choose the right business structure</h2>
            <p className="govuk-body">
              The structure you choose affects your liability, taxes, registration speed, and ability to raise capital.
            </p>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-heading-m">Sole Proprietorship</h3>
                    <p className="govuk-body">Simplest and cheapest. Owned by one person.</p>
                    <p className="govuk-body-s">Unlimited liability — personal assets are at risk.</p>
                  </div>
                </div>
              </div>

              <div className="govuk-grid-column-one-half">
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-heading-m">Private Limited Company (Ltd)</h3>
                    <p className="govuk-body">Most popular choice. Limited liability protection.</p>
                    <p className="govuk-body-s">Best for growing businesses and investors.</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">Other Structures</h3>
            <ul className="govuk-list govuk-list--spaced">
              <li><strong>Partnership / Limited Liability Partnership (LLP)</strong> – For two or more people.</li>
              <li><strong>Public Limited Company (PLC)</strong> – For large businesses raising public capital.</li>
              <li><strong>Company Limited by Guarantee</strong> – For NGOs, charities and non-profits.</li>
              <li><strong>Branch of Foreign Company</strong> – For international companies operating in Kenya.</li>
              <li><strong>Cooperative Society</strong> – For group-based economic activities.</li>
            </ul>

            <Link href="/services/business/structure-comparison" className="govuk-link govuk-!-font-weight-bold">
              Compare all business structures in detail →
            </Link>

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

            {/* 2. Registration Steps */}
            <h2 className="govuk-heading-l">2. Step-by-step registration process</h2>

            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>
                <strong>Reserve your business name</strong><br />
                Search and reserve through the Business Registration Service (BRS) on eCitizen.
                <p className="govuk-body-s">Cost: KSh 150 per name • Takes 1–3 working days</p>
                <a href="https://ecitizen.go.ke" target="_blank" className="govuk-button govuk-button--secondary govuk-!-margin-top-2">
                  Reserve Business Name →
                </a>
              </li>

              <li>
                <strong>Prepare required documents</strong><br />
                National ID/Passport, KRA PIN(s), proof of address, and Memorandum & Articles of Association (for companies).
              </li>

              <li>
                <strong>Submit your application</strong><br />
                Complete the forms on eCitizen under Business Registration Service (BRS).
              </li>

              <li>
                <strong>Receive your certificate</strong><br />
                Download your official Certificate of Registration or Incorporation.
              </li>
            </ol>

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

            {/* 3. After Registration */}
            <h2 className="govuk-heading-l">3. Next steps after registration</h2>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-m">Tax & Revenue</h3>
                <ul className="govuk-list">
                  <li>Register for iTax and obtain a Company KRA PIN</li>
                  <li>Register for VAT if turnover exceeds KSh 5 million</li>
                  <li>Understand Turnover Tax (ToT) for small businesses</li>
                </ul>
                <a href="https://kra.go.ke" target="_blank" className="govuk-link">Kenya Revenue Authority →</a>
              </div>

              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-m">County & Local Permits</h3>
                <ul className="govuk-list">
                  <li>Apply for Single Business Permit (SBP) from your County Government</li>
                  <li>Obtain necessary operational licences</li>
                </ul>
              </div>

              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-m">Social Security</h3>
                <ul className="govuk-list">
                  <li>Register as an employer with NSSF</li>
                  <li>Register employees with NHIF</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Component - Consistent with other pages */}
        <GovUKFeedback />
      </main>
    </div>
  );
}