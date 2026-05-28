"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import Script from "next/script";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { handleGeneralFeedback } from "./actions";

export default function GeneralFeedbackPage() {
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] = useState<{ success?: boolean; error?: string } | null>(null);

  // Focus character input field instantly on load
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState(null);

    const targetForm = event.currentTarget;
    const formData = new FormData(targetForm);
    const implicitToken = formData.get("cf-turnstile-response") as string;

    if (!implicitToken) {
      setSubmissionState({ error: "Security check is initializing. Please try again in a moment." });
      return;
    }

    startTransition(async () => {
      const result = await handleGeneralFeedback(formData, implicitToken);
      if (result.success) {
        setSubmissionState({ success: true });
        targetForm.reset();
      } else {
        setSubmissionState({ error: result.error || "Could not save feedback. Please try again." });
      }
    });
  }

  // GOV.UK Standard Success Banner Layout Pattern
  if (submissionState?.success) {
    return (
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">Feedback submitted</h1>
            <div className="govuk-panel__body">
              Thank you for helping us improve CitizenGuide.KE
            </div>
          </div>
          <p className="govuk-body govuk-!-margin-top-6">
            We review every suggestion sent to us to make our service better for all Kenyans.
          </p>
          <Link href="/" className="govuk-button">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://cloudflare.com" async defer />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Give feedback", href: "/feedback" },
        ]}
      />

      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          
          {submissionState?.error && (
            <div className="govuk-error-summary" role="alert" style={{ border: "4px solid #d4351c" }}>
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body" style={{ color: "#d4351c" }}>{submissionState.error}</p>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl">Give feedback about CitizenGuide.KE</h1>
          <p className="govuk-body-m text-secondary">
            Use this form to tell us about your experience using the platform or suggest overall improvements to the system.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Feedback Content Input Section */}
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="feedback_text">
                How can we improve this website?
              </label>
              <div id="feedback-hint" className="govuk-hint">
                Do not include sensitive personal or financial information, such as your National ID number or banking details.
              </div>
              <textarea
                ref={firstInputRef}
                className="govuk-textarea"
                id="feedback_text"
                name="feedback_text"
                rows={5}
                required
                aria-describedby="feedback-hint"
              ></textarea>
            </div>

            {/* Optional Name Input Section */}
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="full_name">
                Full name (optional)
              </label>
              <input
                className="govuk-input govuk-!-width-two-thirds"
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
              />
            </div>

            {/* Optional Email Input Section */}
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="email">
                Email address (optional)
              </label>
              <div id="email-hint" className="govuk-hint">
                Only provide your email if you want us to reply or ask follow-up questions.
              </div>
              <input
                className="govuk-input govuk-!-width-two-thirds"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby="email-hint"
              />
            </div>

            {/* Bot Check Verification Container */}
            <div className="govuk-form-group">
              <div 
                className="cf-turnstile" 
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-theme="light"
              ></div>
            </div>

            <div className="govuk-button-group">
              <button type="submit" disabled={isPending} className="govuk-button">
                {isPending ? "Submitting..." : "Submit feedback"}
              </button>
              <Link href="/" className="govuk-button govuk-button--secondary">
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
