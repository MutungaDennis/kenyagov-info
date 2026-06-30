'use client';

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { handleFeedbackSubmission } from "@/app/feedback/actions";

export default function GovUKReportProblem() {
  const pathname = usePathname();
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [submissionState, setSubmissionState] = useState<{
    success?: boolean;
    error?: string;
    errorType?: "validation" | "security" | "server";
  } | null>(null);

  // Focus first field when drawer opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // Focus error summary when error appears
  useEffect(() => {
    if (submissionState?.error && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [submissionState]);

  // Force Turnstile to render when the form becomes visible
  useEffect(() => {
    if (isOpen && (window as any).turnstile) {
      // Small delay to ensure the DOM element exists
      const timer = setTimeout(() => {
        try {
          (window as any).turnstile.render('.cf-turnstile');
        } catch (e) {
          // Ignore if already rendered
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState(null);

    const targetForm = event.currentTarget;
    const formData = new FormData(targetForm);
    const implicitToken = formData.get("cf-turnstile-response") as string;

    const doing = formData.get("doing") as string;
    const wrong = formData.get("wrong") as string;

    if (!doing.trim()) {
      setSubmissionState({
        error: "Tell us what you were doing.",
        errorType: "validation",
      });
      return;
    }

    if (!wrong.trim()) {
      setSubmissionState({
        error: "Tell us what went wrong.",
        errorType: "validation",
      });
      return;
    }

    if (!implicitToken) {
      setSubmissionState({
        error: "Security check is initializing. Please try again in a moment.",
        errorType: "security",
      });
      return;
    }

    formData.append("page_path", pathname);

    startTransition(async () => {
      const result = await handleFeedbackSubmission(formData, implicitToken);

      if (result.success) {
        setSubmissionState({ success: true });
        targetForm.reset();

        // Auto-close after success
        setTimeout(() => {
          setIsOpen(false);
          setSubmissionState(null);
        }, 2200);
      } else {
        setSubmissionState({
          error: result.error || "We could not save your report. Please try again later.",
          errorType: "server",
        });

        // Reset Turnstile so user can try again
        try {
          if ((window as any).turnstile) {
            const widget = targetForm.querySelector(".cf-turnstile");
            if (widget) (window as any).turnstile.reset(widget);
          }
        } catch (e) {}
      }
    });
  }

  // Success State
  if (submissionState?.success) {
    return (
      <div className="govuk-width-container govuk-!-margin-top-4" role="status" aria-live="polite">
        <div className="govuk-inset-text govuk-!-border-color-blue govuk-!-margin-0">
          <p className="govuk-body govuk-!-font-weight-bold">
            Thank you. Your report has been sent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-width-container govuk-!-margin-top-4">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {/* Error Summary */}
          {submissionState?.error && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              className="govuk-error-summary govuk-!-margin-bottom-4"
              role="alert"
            >
              <div className="govuk-error-summary__body">
                <p className="govuk-body govuk-!-font-weight-bold">
                  {submissionState.error}
                </p>
              </div>
            </div>
          )}

          {!isOpen ? (
            <p className="govuk-body-s">
              <button
                type="button"
                className="govuk-link report-problem-link"
                onClick={() => setIsOpen(true)}
              >
                Report a problem with this page
              </button>
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="report-problem-form">
              <h2 className="govuk-heading-m">Help us improve CitizenGuide.KE</h2>

              <div className="govuk-inset-text govuk-!-background-white">
                Do not include personal information such as your National ID number or phone number.
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="doing">
                  What were you doing?
                </label>
                <textarea
                  ref={firstInputRef}
                  className="govuk-textarea"
                  id="doing"
                  name="doing"
                  rows={3}
                  required
                  placeholder="e.g. Looking for information about passport applications..."
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="wrong">
                  What went wrong?
                </label>
                <textarea
                  className="govuk-textarea"
                  id="wrong"
                  name="wrong"
                  rows={4}
                  required
                  placeholder="e.g. The eCitizen link throws a timeout error..."
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="email">
                  Email address (optional)
                </label>
                <input
                  className="govuk-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>

              {/* Cloudflare Turnstile */}
              <div className="govuk-form-group">
                <div
                  className="cf-turnstile"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  data-theme="light"
                />
              </div>

              <div className="govuk-button-group">
                <button type="submit" disabled={isPending} className="govuk-button">
                  {isPending ? "Sending..." : "Submit report"}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={() => {
                    setIsOpen(false);
                    setSubmissionState(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}