import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function NationalIDPage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/services" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "National ID", href: "/services/national-id" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">National ID Card</h1>
            <p className="govuk-body-l">
              Apply for a new National ID, replace a lost, damaged, or defaced ID, 
              or update your details.
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="govuk-panel govuk-panel--info govuk-!-margin-top-6">
          <h2 className="govuk-panel__title">Apply Online via eCitizen</h2>
          <p className="govuk-body">
            The fastest and easiest way is through the{' '}
            <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link font-bold">
              eCitizen Portal
            </a>. You will need a Huduma Number.
          </p>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-two-thirds">
            
            <h2 className="govuk-heading-l">How to Apply</h2>
            <ol className="govuk-list govuk-list--number govuk-list--spaced">
              <li>Log in to your <strong>eCitizen</strong> account</li>
              <li>Go to <strong>Interior → National ID</strong></li>
              <li>Choose: New Application, Replacement, or Update</li>
              <li>Fill the form and upload required documents</li>
              <li>Pay the application fee online</li>
              <li>Book an appointment at a Huduma Centre or Immigration Office for biometrics</li>
            </ol>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Required Documents</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Birth Certificate or Baptism Card</li>
              <li>Parent’s National ID or Death Certificate (if parent is deceased)</li>
              <li>Recent passport-size photos (for manual applications)</li>
              <li>Old ID (for replacement)</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Fees &amp; Processing Time</h2>
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Fee</th>
                    <th>Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>New National ID (First Time)</td>
                    <td>KSh 1,000</td>
                    <td>14 – 30 days</td>
                  </tr>
                  <tr>
                    <td>Replacement (Lost/Damaged)</td>
                    <td>KSh 1,000</td>
                    <td>14 – 30 days</td>
                  </tr>
                  <tr>
                    <td>Update (Details Change)</td>
                    <td>KSh 500</td>
                    <td>7 – 14 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Important Information</h2>
            <div className="govuk-inset-text">
              You must be <strong>18 years and above</strong> to apply for a National ID. 
              Minors can get a Waiting Card (under 18) at Huduma Centres.
            </div>

            <p className="govuk-body govuk-!-margin-top-6">
              <Link href="/services/birth-death" className="govuk-link">
                Need Birth or Death Certificates first? →
              </Link>
            </p>
          </div>
        </div>

       
      </main>
    </div>
  );
}