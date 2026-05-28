'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Action handler logic can be integrated directly here
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Contact", href: "/contact" },
        ]}
      />

      {/* Reduced padding wrapper to pull directory modules above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size for site-wide uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Contact Us</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Submit feedback, report directory errors, or suggest supplementary public institutional logs for CitizenGuide.KE.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              CitizenGuide.KE is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya, and does not process direct transactional service applications.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">How we handle inquiries</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              You can utilize this communications desk to file notifications regarding:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li><strong>Directory Errors</strong> &mdash; Reporting outdated data rows, missing ward records, or broken legislative links.</li>
              <li><strong>Improvement Suggestions</strong> &mdash; Proposing new semi-autonomous agency registries (SAGAs) or dataset tracking additions.</li>
              <li><strong>Accessibility Logs</strong> &mdash; Flagging high-contrast failures, keyboard loop breaks, or missing screen-reader aria labels.</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Send an online message</h2>

            {/* GOV.UK Compliant Form Component Grid Structure */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="govuk-form-group govuk-!-margin-bottom-4">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-name">
                  Full name
                </label>
                <input 
                  className="govuk-input govuk-!-width-two-thirds" 
                  id="contact-name" 
                  name="name" 
                  type="text" 
                  autoComplete="name"
                />
              </div>

              <div className="govuk-form-group govuk-!-margin-bottom-4">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-email">
                  Email address
                </label>
                <div className="govuk-hint govuk-!-margin-bottom-1" id="email-hint">
                  We will only use this to respond to your verification request.
                </div>
                <input 
                  className="govuk-input govuk-!-width-two-thirds" 
                  id="contact-email" 
                  name="email" 
                  type="email" 
                  autoComplete="email"
                  aria-describedby="email-hint"
                />
              </div>

              <div className="govuk-form-group govuk-!-margin-bottom-4">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-subject">
                  Subject
                </label>
                <input 
                  className="govuk-input govuk-!-width-two-thirds" 
                  id="contact-subject" 
                  name="subject" 
                  type="text" 
                />
              </div>

              <div className="govuk-form-group govuk-!-margin-bottom-6">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-message">
                  Message detail
                </label>
                <div className="govuk-hint govuk-!-margin-bottom-1" id="message-hint">
                  Please include specific table references, column references, or link URL tracks.
                </div>
                <textarea 
                  className="govuk-textarea" 
                  id="contact-message" 
                  name="message" 
                  rows={8}
                  aria-describedby="message-hint"
                ></textarea>
              </div>

              <button type="submit" className="govuk-button" data-module="govuk-button">
                Submit message
              </button>
            </form>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Alternative communication options</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <strong>Electronic Mail:</strong> <a href="mailto:info@citizenguide.ke" className="govuk-link">info@citizenguide.ke</a>
              </li>
              <li>
                <strong>Public Issue Tracking:</strong> Structural updates and feedback loop summaries can be inspected on our version control repositories (coming soon).
              </li>
            </ul>

            <p className="govuk-body govuk-!-font-size-16" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <strong>Important:</strong> We cannot provide official state services, immigration credentials, or legal processing support. To process applications or execute official payments, visit the authorized national portal directly via the <a href="https://www.ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Gateway</a>.
            </p>

          </div>
        </div>

       
      </main>
    </div>
  );
}
