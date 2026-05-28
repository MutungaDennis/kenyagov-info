"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import Script from "next/script"; // Leverages Next.js optimized script injector
import { handleFeedbackSubmission } from "@/app/feedback/actions";

export default function GovUKReportProblem() {
  const pathname = usePathname();
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  
  const [isOpen, setIsOpen] = useState(false);
  const [submissionState, setSubmissionState] = useState<{ success?: boolean; error?: string } | null>(null);

  // Auto-focus the text field when the drawer expands for touchscreen keyboard activation
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const targetForm = event.currentTarget;
    const formData = new FormData(targetForm);
    
    // Natively extract the Turnstile token directly from the hidden form input populated by Cloudflare
    const implicitToken = formData.get("cf-turnstile-response") as string;

    if (!implicitToken) {
      setSubmissionState({ error: "Please wait for the security verification check to complete." });
      return;
    }

    formData.append("page_path", pathname); // Automatically bundle the active URL route location string

    startTransition(async () => {
      const result = await handleFeedbackSubmission(formData, implicitToken);
      if (result.success) {
        setSubmissionState({ success: true });
        targetForm.reset();
      } else {
        setSubmissionState({ error: result.error || "Failed to log feedback." });
      }
    });
  }

  if (submissionState?.success) {
    return (
      <div className="govuk-width-container govuk-!-margin-top-4" role="status" aria-live="polite">
        <div className="govuk-inset-text" style={{ borderColor: "#1d70b8", margin: 0 }}>
          <p className="govuk-body govuk-!-font-weight-bold">Thank you for your feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-width-container govuk-!-margin-top-4">
      {/* Safe global inclusion of Turnstile script logic without complex dynamic handlers */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          
          {submissionState?.error && (
            <div className="govuk-error-summary govuk-!-margin-bottom-4" role="alert" style={{ border: "4px solid #d4351c" }}>
              <div className="govuk-error-summary__body">
                <p className="govuk-body govuk-!-font-weight-bold" style={{ color: "#d4351c", margin: 0 }}>
                  {submissionState.error}
                </p>
              </div>
            </div>
          )}

          {!isOpen ? (
            <p className="govuk-body-s">
              <button 
                type="button" 
                className="govuk-link" 
                style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setIsOpen(true)}
              >
                Report a problem with this page
              </button>
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "#f3f2f1", padding: "20px", borderRadius: "4px" }}>
              <h2 className="govuk-heading-m">Help us improve CitizenGuide.KE</h2>
              
              <div className="govuk-inset-text" style={{ background: "#ffffff" }}>
                Do not include personal information (such as your National ID number or phone number).
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
                ></textarea>
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
                ></textarea>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="email">
                  Email address (optional)
                </label>
                <input className="govuk-input" id="email" name="email" type="email" placeholder="your@email.com" />
              </div>

              {/* Fixed: Reliable implicit rendering layout block that automatically builds the token inside the form structure */}
              <div className="govuk-form-group">
                <div 
                  className="cf-turnstile" 
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  data-theme="light"
                ></div>
              </div>

              <div className="govuk-button-group">
                <button type="submit" disabled={isPending} className="govuk-button">
                  {isPending ? "Sending..." : "Submit report"}
                </button>
                <button type="button" className="govuk-button govuk-button--secondary" onClick={() => setIsOpen(false)}>
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
