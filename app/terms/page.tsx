import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function TermsPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Terms and conditions", href: "/terms" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Terms and Conditions</h1>
            <p className="govuk-body-s">Last updated: May 2026</p>

            <p className="govuk-body">
              Please read these Terms and Conditions carefully before using KenyaGovInfo.KE.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">1. About KenyaGovInfo.KE</h2>
            <p className="govuk-body">
              KenyaGovInfo.KE is an <strong>independent, non-governmental</strong> informational platform. 
              It is not affiliated with, endorsed by, or operated by the Government of Kenya.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">2. Purpose of the Website</h2>
            <p className="govuk-body">
              The purpose of this website is to provide clear, neutral, and accessible information about Kenyan 
              government institutions, services, leaders, and public entities to help citizens better understand 
              and engage with their government.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">3. Important Disclaimer</h2>
            <div className="govuk-inset-text">
              <p>
                This website is for informational purposes only. We do not provide official government services, 
                legal advice, or transactional capabilities. 
                All official services and transactions should be conducted through the{' '}
                <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen Portal</a> 
                or the relevant government institution.
              </p>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">4. Accuracy of Information</h2>
            <p className="govuk-body">
              We make every effort to keep information accurate and up to date. However, we do not guarantee 
              that all information is complete, accurate, or current. You should always verify critical information 
              with official sources.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">5. Acceptable Use</h2>
            <p className="govuk-body">You agree not to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Use the website for any unlawful purpose</li>
              <li>Distribute false or misleading information from this site</li>
              <li>Attempt to gain unauthorised access to any part of the website</li>
              <li>Remove or alter any copyright or disclaimer notices</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">6. Intellectual Property</h2>
            <p className="govuk-body">
              All content on KenyaGovInfo.KE (text, design, layout, logos) is owned by KenyaGovInfo.KE 
              unless otherwise stated. You may not reproduce or republish substantial parts of the site 
              without permission.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">7. Limitation of Liability</h2>
            <p className="govuk-body">
              KenyaGovInfo.KE is provided &quot;as is&quot;. We are not liable for any loss or damage arising from your use 
              of this website or reliance on any information provided.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">8. Governing Law</h2>
            <p className="govuk-body">
              These Terms and Conditions are governed by the laws of the Republic of Kenya.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">9. Changes to these Terms</h2>
            <p className="govuk-body">
              We may update these Terms from time to time. Continued use of the website after changes 
              constitutes acceptance of the new terms.
            </p>

            <p className="govuk-body govuk-!-margin-top-9">
              If you have any questions about these Terms and Conditions, please{' '}
              <Link href="/contact" className="govuk-link">contact us</Link>.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}