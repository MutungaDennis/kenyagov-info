import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function FeedbackPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Feedback", href: "/feedback" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Help us improve KenyaGovInfo.KE</h1>

            <div className="govuk-inset-text">
              Do not include personal or financial information 
              (such as your National ID number, phone number, or email address).
            </div>

            <form action="#" method="POST">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="what-were-you-doing">
                  What were you doing?
                </label>
                <textarea 
                  className="govuk-textarea" 
                  id="what-were-you-doing" 
                  name="what-were-you-doing" 
                  rows={4}
                  placeholder="e.g. Looking for information about National ID application..."
                ></textarea>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="what-went-wrong">
                  What went wrong?
                </label>
                <textarea 
                  className="govuk-textarea" 
                  id="what-went-wrong" 
                  name="what-went-wrong" 
                  rows={6}
                  placeholder="e.g. Information is outdated, link is broken, page is confusing..."
                ></textarea>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="email">
                  Email address (optional) – so we can reply if needed
                </label>
                <input 
                  className="govuk-input" 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com"
                />
              </div>

              <div className="govuk-button-group">
                <button type="submit" className="govuk-button" data-module="govuk-button">
                  Send
                </button>
                <Link href="/" className="govuk-button govuk-button--secondary">
                  Cancel
                </Link>
              </div>
            </form>

            <p className="govuk-body govuk-!-margin-top-9">
              Thank you for your feedback. Your input helps us make this platform better for all Kenyans.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}