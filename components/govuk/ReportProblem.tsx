'use client';

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { handleFeedbackSubmission } from "@/app/feedback/actions";

/**
 * "Report a problem with this page" — sits with global feedback in the template.
 * Does not wrap in govuk-width-container (layout owns the shell).
 */
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

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (submissionState?.error && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [submissionState]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !window.turnstile) return;

    const timer = setTimeout(() => {
      try {
        // Re-render when the form becomes visible; ignore if already mounted
        window.turnstile?.render(".cf-turnstile", {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
          theme: "light",
        });
      } catch {
        // already rendered
      }
    }, 150);

    return () => clearTimeout(timer);
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
        setTimeout(() => {
          setIsOpen(false);
          setSubmissionState(null);
        }, 2200);
      } else {
        setSubmissionState({
          error:
            result.error ||
            "We could not save your report. Please try again later.",
          errorType: "server",
        });

        try {
          const widget = targetForm.querySelector(".cf-turnstile");
          if (widget && window.turnstile) {
            window.turnstile.reset(widget as HTMLElement);
          }
        } catch {
          // ignore reset errors
        }
      }
    });
  }

  if (submissionState?.success) {
    return (
      <div className="govuk-grid-row govuk-!-margin-top-4" role="status" aria-live="polite">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
            <p className="govuk-body govuk-!-font-weight-bold">
              Thank you. Your report has been sent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-grid-row govuk-!-margin-top-4">
      <div className="govuk-grid-column-two-thirds">
        {submissionState?.error && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            className="govuk-error-summary govuk-!-margin-bottom-4"
            role="alert"
            data-module="govuk-error-summary"
          >
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{submissionState.error}</p>
            </div>
          </div>
        )}

        {!isOpen ? (
          <p className="govuk-body-s">
            <button
              type="button"
              className="govuk-link app-button-as-link"
              onClick={() => setIsOpen(true)}
            >
              Report a problem with this page
            </button>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="app-report-problem-form" noValidate>
            <h2 className="govuk-heading-m">Help us improve CitizenGuide.KE</h2>

            <div className="govuk-inset-text">
              Do not include personal information such as your National ID number
              or phone number.
            </div>

            <div
              className={`govuk-form-group ${
                submissionState?.errorType === "validation" &&
                submissionState.error?.includes("doing")
                  ? "govuk-form-group--error"
                  : ""
              }`}
            >
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
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="report-email">
                Email address (optional)
              </label>
              <div id="report-email-hint" className="govuk-hint">
                We will only use this to follow up if needed.
              </div>
              <input
                className="govuk-input govuk-!-width-two-thirds"
                id="report-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby="report-email-hint"
              />
            </div>

            <div className="govuk-form-group">
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-theme="light"
              />
            </div>

            <div className="govuk-button-group">
              <button
                type="submit"
                disabled={isPending}
                className="govuk-button"
                data-module="govuk-button"
              >
                {isPending ? "Sending..." : "Submit report"}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
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
  );
}
