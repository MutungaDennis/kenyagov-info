"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKCharacterCount from "@/components/govuk/CharacterCount";
import { handleGeneralFeedback } from "./actions";

export default function GeneralFeedbackPage() {
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successPanelRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  const [submissionState, setSubmissionState] = useState<{
    success?: boolean;
    error?: string;
    errorType?: "security" | "validation" | "server";
    recordId?: string;
  } | null>(null);

  const [feedbackValue, setFeedbackValue] = useState("");
  const MAX_CHARS = 1200;
  const charsRemaining = MAX_CHARS - feedbackValue.length;

  // Focus textarea on load
  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

  // Shift focus to error/success messages
  useEffect(() => {
    if (submissionState?.error && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    } else if (submissionState?.success && successPanelRef.current) {
      successPanelRef.current.focus();
    }
  }, [submissionState]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState(null);

    const targetForm = event.currentTarget;
    const formData = new FormData(targetForm);
    const implicitToken = formData.get("cf-turnstile-response") as string;

    if (feedbackValue.trim().length === 0) {
      setSubmissionState({
        error: "Enter your feedback on how we can improve this website",
        errorType: "validation",
      });
      return;
    }

    if (charsRemaining < 0) {
      setSubmissionState({
        error: `Feedback must be 1,200 characters or less. Remove ${Math.abs(charsRemaining)} characters.`,
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

    startTransition(async () => {
      const result = await handleGeneralFeedback(formData, implicitToken);

      if (result.success) {
        setSubmissionState({ success: true, recordId: result.recordId });
        setFeedbackValue("");
        targetForm.reset();
      } else {
        const isLengthError = result.error?.includes("characters") || result.error?.includes("Feedback");
        setSubmissionState({
          error: result.error || "Could not save feedback.",
          errorType: isLengthError ? "validation" : "server",
        });

        // Reset Turnstile widget
        try {
          // @ts-ignore
          if ((window as any).turnstile) {
            const widget = targetForm.querySelector(".cf-turnstile");
            if (widget) (window as any).turnstile.reset(widget);
          }
        } catch (e) {}
      }
    });
  }

  // Success Screen
  if (submissionState?.success) {
    const rawUuid = submissionState.recordId || "00000000";
    const referenceNumber = `CG-${rawUuid.split("-")[0].toUpperCase()}`;

    return (
      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          <div
            ref={successPanelRef}
            tabIndex={-1}
            className="govuk-panel govuk-panel--confirmation"
          >
            <h1 className="govuk-panel__title">Feedback submitted</h1>
            <div className="govuk-panel__body">
              Your reference number<br />
              <strong className="govuk-!-font-size-36 govuk-!-margin-top-2 govuk-!-display-block">
                {referenceNumber}
              </strong>
            </div>
          </div>

          <h2 className="govuk-heading-m">What happens next</h2>

          <p className="govuk-body">
            We review every suggestion sent to us to make our service better for all Kenyans. Thank you for helping us improve CitizenGuide.KE.
          </p>

          <p className="govuk-body govuk-!-font-size-19">
            If you provided an email address, our team might contact you if we need to ask follow-up questions.
          </p>

          <div className="govuk-button-group">
            <Link href="/" className="govuk-button govuk-button--start">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isTextareaInvalid =
    submissionState?.errorType === "validation" || charsRemaining < 0;
  const fieldError =
    isTextareaInvalid && submissionState?.errorType === "validation"
      ? submissionState.error
      : charsRemaining < 0
        ? `Feedback must be ${MAX_CHARS.toLocaleString()} characters or less`
        : undefined;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Give feedback" },
        ]}
      />

      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          {submissionState?.error && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              className="govuk-error-summary govuk-!-margin-bottom-6"
              role="alert"
              data-module="govuk-error-summary"
            >
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  <li>
                    <a href="#feedback_text">{submissionState.error}</a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl">Give feedback about CitizenGuide.KE</h1>

          <p className="govuk-body-l govuk-!-margin-bottom-5">
            Use this form to tell us about your experience using the platform or
            suggest overall improvements.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <GovUKCharacterCount
              ref={firstInputRef}
              id="feedback_text"
              name="feedback_text"
              label="How can we improve this website?"
              hint="Do not include sensitive personal or financial information, such as your National ID number."
              errorMessage={fieldError}
              maxLength={MAX_CHARS}
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              rows={6}
            />

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

            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="email">
                Email address (optional)
              </label>
              <div id="email-hint" className="govuk-hint">
                We will only use this if we need to follow up.
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