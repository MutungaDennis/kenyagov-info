import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function ServicesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />
      
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Services and Information</h1>
            <p className="govuk-body-l">
              The single point of access for the most common government services in Kenya.
            </p>
          </div>
        </div>

        {/* eCitizen Highlight */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <div className="govuk-inset-text" style={{ borderLeftColor: '#003087' }}>
              Most services are now <strong>unified</strong> on the{' '}
              <a 
                href="https://www.ecitizen.go.ke" 
                className="govuk-link font-bold" 
                target="_blank"
                rel="noopener noreferrer"
              >
                eCitizen Portal
              </a>. 
              Create one account and access services from all government departments.
            </div>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          
          {/* Column 1 */}
          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-l">Citizenship &amp; Civil Registration</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/services/national-id" className="govuk-link">National ID Card (New &amp; Replacement)</Link></li>
              <li><Link href="/services/passport" className="govuk-link">Passport Application &amp; Renewal</Link></li>
              <li><Link href="/services/birth-death" className="govuk-link">Birth, Death &amp; Marriage Certificates</Link></li>
              <li><Link href="/services/good-conduct" className="govuk-link">Good Conduct Certificate</Link></li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Driving &amp; Transport</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/services/driving" className="govuk-link">Smart Driving Licence</Link></li>
              <li><Link href="/services/ntsa" className="govuk-link">Vehicle Registration &amp; Logbook</Link></li>
              <li><Link href="/services/inspection" className="govuk-link">Vehicle Inspection &amp; PSV Licensing</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-l">Taxes &amp; Business</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/services/tax" className="govuk-link">KRA PIN, Returns &amp; Tax Compliance</Link></li>
              <li><Link href="/services/business" className="govuk-link">Business Registration (BRS)</Link></li>
              <li><Link href="/services/lands" className="govuk-link">Land Searches &amp; ArdhiSasa</Link></li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Health</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/services/sha" className="govuk-link">Social Health Authority (SHA)</Link></li>
              <li><Link href="/services/nhif" className="govuk-link">NHIF Contributions &amp; Claims</Link></li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Education &amp; Housing</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li><Link href="/services/helb" className="govuk-link">HELB Loans &amp; Clearance</Link></li>
              <li><Link href="/services/education" className="govuk-link">KUCCPS University &amp; TVET Placement</Link></li>
              <li><Link href="/services/housing" className="govuk-link">Affordable Housing (Boma Yangu)</Link></li>
            </ul>
          </div>
        </div>

        <div className="govuk-!-margin-top-12 govuk-!-margin-bottom-8">
          <p className="govuk-body">
            Can’t find what you’re looking for? Use the search bar above or visit the{' '}
            <a href="https://www.ecitizen.go.ke" className="govuk-link" target="_blank">
              eCitizen Portal
            </a>.
          </p>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}