"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import Script from "next/script";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { handleGeneralFeedback } from "./actions";

export default function GeneralFeedbackPage() {
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus references for accessible GOV.UK keyboard navigation hooks
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successPanelRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  
  // FIXED: Adjusted to capture and track the returned database UUID safely
  const [submissionState, setSubmissionState] = useState<{ 
    success?: boolean; 
    error?: string; 
    errorType?: "security" | "validation" | "server";
    recordId?: string;
  } | null>(null);
  
  const [feedbackValue, setFeedbackValue] = useState("");
  const MAX_CHARS = 1200;
  const charsRemaining = MAX_CHARS - feedbackValue.length;

  // Focus character input field instantly on load
  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

  // Shifts keyboard focus automatically when submission states change
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
        errorType: "validation" 
      });
      return;
    }

    if (charsRemaining < 0) {
      setSubmissionState({ 
        error: `Feedback must be 1,200 characters or less. Remove ${Math.abs(charsRemaining)} characters.`, 
        errorType: "validation" 
      });
      return;
    }

    if (!implicitToken) {
      setSubmissionState({ 
        error: "Security check is initializing. Please try again in a moment.", 
        errorType: "security" 
      });
      return;
    }

    startTransition(async () => {
      const result = await handleGeneralFeedback(formData, implicitToken);
      if (result.success) {
        // FIXED: Passes the concrete database UUID straight into the state system
        setSubmissionState({ success: true, recordId: result.recordId });
        setFeedbackValue("");
        targetForm.reset();
      } else {
        const isLengthError = result.error?.includes("characters") || result.error?.includes("Feedback");
        setSubmissionState({ 
          error: result.error || "Could not save feedback.", 
          errorType: isLengthError ? "validation" : "server" 
        });
        // Reset the Turnstile widget for retry
        try {
          // @ts-ignore
          if ((window as any).turnstile) {
            const widget = targetForm.querySelector('.cf-turnstile');
            if (widget) (window as any).turnstile.reset(widget);
          }
        } catch (e) {}
      }
    });
  }
  // GOV.UK Standard Success Panel and Confirmation Layout Pattern
  if (submissionState?.success) {
    // FIXED: Isolates the first structural block of the primary key UUID to generate a true reference code
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
            <h1 className="govuk-panel__title">
              Feedback submitted
            </h1>
            <div className="govuk-panel__body">
              Your reference number<br />
              <strong className="govuk-!-font-size-36 govuk-!-margin-top-2 govuk-!-display-block">{referenceNumber}</strong>
            </div>
          </div>

          <h2 className="govuk-heading-m">
            What happens next
          </h2>
          
          <p className="govuk-body">
            We review every suggestion sent to us to make our service better for all Kenyans. Thank you for helping us improve CitizenGuide.KE.
          </p>

          <p className="govuk-body govuk-!-font-size-19">
            If you provided an email address, our technical support team might contact you if they need to ask follow-up questions or clarify your suggestion.
          </p>

          <div className="govuk-button-group govuk-!-display-flex govuk-!-align-items-center govuk-!-gap-3">
            <Link 
              href="/" 
              className="govuk-button govuk-button--start"
            >
              Return to homepage
            </Link>
          </div>

        </div>
      </div>
    );
  }

  const isTextareaInvalid = submissionState?.errorType === "validation" || charsRemaining < 0;

  return (
    <>
      {/* Turnstile script loaded once globally in ClientLayoutWrapper to prevent duplicate loads and widget conflicts */}
      
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Give feedback", href: "/feedback" }]} />

      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          
          {/* Main Error Announcement Summary */}
          {submissionState?.error && (
            <div 
              ref={errorSummaryRef}
              tabIndex={-1}
              className="govuk-error-summary govuk-!-margin-bottom-6" 
              role="alert" 
            >
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body govuk-!-text-colour-red govuk-!-font-weight-bold">{submissionState.error}</p>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl">Give feedback about CitizenGuide.KE</h1>
          <p className="govuk-body-m govuk-!-margin-bottom-5">
            Use this form to tell us about your experience using the platform or suggest overall improvements to the system.
          </p>
          
          <form onSubmit={handleSubmit} noValidate>
            
            <div className={`govuk-form-group ${isTextareaInvalid ? "govuk-form-group--error" : ""}`}>
              <label className="govuk-label govuk-label--m" htmlFor="feedback_text">
                How can we improve this website?
              </label>
              
              <div id="feedback-hint" className="govuk-hint">
                Do not include sensitive personal or financial information, such as your National ID number.
              </div>

              {isTextareaInvalid && submissionState?.errorType === "validation" && (
                <p id="feedback-error" className="govuk-error-message govuk-!-text-colour-red govuk-!-font-weight-bold">
                  <span className="govuk-visually-hidden">Error:</span> {submissionState.error}
                </p>
              )}

              <textarea
                ref={firstInputRef}
                className="govuk-textarea"
                id="feedback_text"
                name="feedback_text"
                rows={5}
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                aria-describedby={`feedback-hint feedback-info ${isTextareaInvalid ? "feedback-error" : ""}`}
                style={isTextareaInvalid ? { border: "4px solid #d4351c" } : {}}
              ></textarea>

              <div 
                id="feedback-info" 
                className={`govuk-hint govuk-character-count__message ${charsRemaining < 0 ? "govuk-error-message" : ""}`}
                style={charsRemaining < 0 ? { color: "#d4351c", fontWeight: "bold" } : {}}
              >
                {charsRemaining >= 0 
                  ? `You have ${charsRemaining} characters remaining` 
                  : `You have ${Math.abs(charsRemaining)} characters too many`
                }
              </div>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="full_name">Full name (optional)</label>
              <input className="govuk-input govuk-!-width-two-thirds" id="full_name" name="full_name" type="text" />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="email">Email address (optional)</label>
              <input className="govuk-input govuk-!-width-two-thirds" id="email" name="email" type="email" />
            </div>

            <div className="govuk-form-group">
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="light"></div>
            </div>

            <div className="govuk-button-group">
              <button type="submit" disabled={isPending} className="govuk-button">
                {isPending ? "Submitting..." : "Submit feedback"}
              </button>
              <Link href="/" className="govuk-button govuk-button--secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
