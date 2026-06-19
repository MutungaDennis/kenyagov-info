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
            style={{ 
              backgroundColor: "#00703c", 
              color: "#ffffff", 
              padding: "35px", 
              textAlign: "center", 
              marginBottom: "30px",
              outline: "none"
            }}
          >
            <h1 className="govuk-panel__title" style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 15px 0", fontFamily: "sans-serif" }}>
              Feedback submitted
            </h1>
            <div className="govuk-panel__body" style={{ fontSize: "24px", fontFamily: "sans-serif" }}>
              Your reference number<br />
              <strong style={{ display: "block", fontSize: "36px", marginTop: "10px" }}>{referenceNumber}</strong>
            </div>
          </div>

          <h2 className="govuk-heading-m" style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
            What happens next
          </h2>
          
          <p className="govuk-body" style={{ fontSize: "19px", lineHeight: "1.5", marginBottom: "15px" }}>
            We review every suggestion sent to us to make our service better for all Kenyans. Thank you for helping us improve CitizenGuide.KE.
          </p>

          <p className="govuk-body" style={{ fontSize: "19px", lineHeight: "1.5", marginBottom: "30px" }}>
            If you provided an email address, our technical support team might contact you if they need to ask follow-up questions or clarify your suggestion.
          </p>

          <div className="govuk-button-group" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Link 
              href="/" 
              className="govuk-button"
              style={{
                backgroundColor: "#00703c",
                color: "#ffffff",
                padding: "10px 20px",
                textDecoration: "none",
                fontWeight: "bold",
                borderRadius: "0",
                display: "inline-block",
                boxShadow: "0 2px 0 #002d18"
              }}
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
      <Script src="https://cloudflare.com" async defer />
      
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Give feedback", href: "/feedback" }]} />

      <div className="govuk-grid-row govuk-!-margin-top-4">
        <div className="govuk-grid-column-two-thirds">
          
          {/* Main Error Announcement Summary */}
          {submissionState?.error && (
            <div 
              ref={errorSummaryRef}
              tabIndex={-1}
              className="govuk-error-summary" 
              role="alert" 
              style={{ 
                border: "4px solid #d4351c", 
                padding: "15px", 
                marginBottom: "30px",
                outline: "none"
              }}
            >
              <h2 className="govuk-error-summary__title" style={{ color: "#d4351c", margin: "0 0 10px 0" }}>There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body" style={{ color: "#d4351c", fontWeight: "bold" }}>{submissionState.error}</p>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-xl">Give feedback about CitizenGuide.KE</h1>
          <p className="govuk-body-m text-secondary" style={{ marginBottom: "25px" }}>
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
                <p id="feedback-error" className="govuk-error-message" style={{ color: "#d4351c", fontWeight: "bold", margin: "0 0 5px 0" }}>
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
