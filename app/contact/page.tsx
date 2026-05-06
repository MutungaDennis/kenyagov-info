import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function ContactPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Contact", href: "/contact" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Contact Us</h1>
            <p className="govuk-body-l">
              We’d love to hear from you. Your feedback helps us improve KenyaGovInfo.KE.
            </p>

            <div className="govuk-inset-text">
              KenyaGovInfo.KE is an <strong>independent platform</strong>. 
              We are not part of the Government of Kenya.
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">How can we help?</h2>

            <div className="govuk-grid-row govuk-!-margin-top-6">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Report an error</h3>
                <p className="govuk-body">Found incorrect information, broken link, or outdated data?</p>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Suggest improvements</h3>
                <p className="govuk-body">New service, institution, or feature you’d like to see?</p>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Send us a message</h2>

            <div className="govuk-form-group">
              <form action="#" method="POST">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="name">Your name</label>
                  <input className="govuk-input" id="name" name="name" type="text" />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="email">Email address</label>
                  <input className="govuk-input" id="email" name="email" type="email" />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="subject">Subject</label>
                  <input className="govuk-input" id="subject" name="subject" type="text" />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="message">Message</label>
                  <textarea 
                    className="govuk-textarea" 
                    id="message" 
                    name="message" 
                    rows={8}
                    placeholder="Please provide as much detail as possible..."
                  ></textarea>
                </div>

                <button className="govuk-button" data-module="govuk-button">
                  Send message
                </button>
              </form>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Alternative ways to contact us</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <strong>Email:</strong> <a href="mailto:info@kenyagovinfo.ke" className="govuk-link">info@kenyagovinfo.ke</a>
              </li>
              <li>
                <strong>GitHub:</strong> We welcome issues and suggestions on our repository (coming soon)
              </li>
            </ul>

            <p className="govuk-body govuk-!-margin-top-9">
              Please note: We cannot provide official government services or legal advice. 
              For transactions, please visit <a href="https://www.ecitizen.go.ke" target="_blank" className="govuk-link">eCitizen</a>.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}