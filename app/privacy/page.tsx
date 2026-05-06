import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function PrivacyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Privacy", href: "/privacy" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Privacy Notice</h1>
            <p className="govuk-body-s">Last updated: May 2026</p>

            <h2 className="govuk-heading-l">Introduction</h2>
            <p className="govuk-body">
              KenyaGovInfo.KE is an independent informational platform. 
              We respect your privacy and are committed to protecting your personal data.
            </p>

            <div className="govuk-inset-text">
              This website is <strong>not</strong> operated by the Government of Kenya.
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Information we collect</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>We do not require you to create an account or log in to use this website.</li>
              <li>We do not collect personal information such as your name, email, or phone number unless you voluntarily contact us.</li>
              <li>We may collect anonymous usage data (e.g. pages visited, time spent) to improve the site.</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Cookies</h2>
            <p className="govuk-body">
              This website uses a minimal number of cookies:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li><strong>Essential cookies</strong> – to remember your preferences (e.g. menu state)</li>
              <li><strong>Analytics cookies</strong> – to understand how people use the site (we use privacy-friendly tools)</li>
            </ul>
            <p className="govuk-body">
              You can manage or disable cookies through your browser settings at any time.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">How we use your information</h2>
            <p className="govuk-body">
              Any information you voluntarily provide (e.g. via the contact form) will only be used to respond to your message. 
              We do not sell, rent, or share your personal data with third parties for marketing purposes.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Links to other websites</h2>
            <p className="govuk-body">
              This site contains links to official government websites (especially <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen</a>). 
              Once you leave KenyaGovInfo.KE, we are not responsible for the privacy practices of those external sites.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Your rights</h2>
            <p className="govuk-body">
              You have the right to request access to any personal data we hold about you, or to ask us to delete it. 
              Contact us using the details below.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Contact us about privacy</h2>
            <p className="govuk-body">
              If you have any questions about this privacy notice or how we handle your data, please{' '}
              <Link href="/contact" className="govuk-link">contact us</Link>.
            </p>

            <div className="govuk-!-margin-top-12">
              <p className="govuk-body-s">
                This privacy notice may be updated from time to time. We will post any changes on this page.
              </p>
            </div>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}