'use client';

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKCharacterCount from "@/components/govuk/CharacterCount";
import { handleContactMessage } from "./actions";

export default function ContactPage() {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successPanelRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  const [submissionState, setSubmissionState] = useState<{
    success?: boolean;
    error?: string;
    errorType?: "validation" | "security" | "server";
  } | null>(null);

  const [messageValue, setMessageValue] = useState("");
  const MAX_CHARS = 2000;
  const charsRemaining = MAX_CHARS - messageValue.length;

  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

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

    const subject = formData.get("subject") as string;
    const message = messageValue.trim();

    if (!subject.trim()) {
      setSubmissionState({ error: "Enter a subject for your message.", errorType: "validation" });
      return;
    }

    if (!message) {
      setSubmissionState({ error: "Enter your message.", errorType: "validation" });
      return;
    }

    if (charsRemaining < 0) {
      setSubmissionState({
        error: `Your message must be 2,000 characters or less. Remove ${Math.abs(charsRemaining)} characters.`,
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
      const result = await handleContactMessage(formData, implicitToken);

      if (result.success) {
        setSubmissionState({ success: true });
        setMessageValue("");
        targetForm.reset();
      } else {
        const isValidationError =
          result.error?.includes("subject") ||
          result.error?.includes("message") ||
          result.error?.includes("characters");

        setSubmissionState({
          error: result.error || "Could not send your message.",
          errorType: isValidationError ? "validation" : "server",
        });

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

  // ==================== SUCCESS SCREEN ====================
  if (submissionState?.success) {
    return (
  <>
      
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Contact" },
          ]}
        />

        
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div
                ref={successPanelRef}
                tabIndex={-1}
                className="govuk-panel govuk-panel--confirmation"
              >
                <h1 className="govuk-panel__title">Message sent</h1>
                <div className="govuk-panel__body">
                  Thank you. We have received your message.
                </div>
              </div>

              <h2 className="govuk-heading-m">What happens next</h2>
              <p className="govuk-body">
                We review all messages and will get back to you if we need more information.
              </p>

              <div className="govuk-button-group">
                <Link href="/" className="govuk-button govuk-button--start">
                  Return to homepage
                </Link>
              </div>
            </div>
          </div>
        
      
    
  </>
);
  }

  // ==================== FORM ====================
  const isMessageInvalid = submissionState?.errorType === "validation" && charsRemaining < 0;

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Contact" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {/* Error Summary */}
            {submissionState?.error && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                className="govuk-error-summary govuk-!-margin-bottom-6"
                role="alert"
              >
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body govuk-!-font-weight-bold">{submissionState.error}</p>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Contact CitizenGuide.KE</h1>
            
            <p className="govuk-body-l">
              Use this form to send us feedback, report an error, or suggest an improvement.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                This is an independent website. We do not provide official government services.
              </p>
            </div>

            <h2 className="govuk-heading-l">Send us a message</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="contact-name">
                  Full name (optional)
                </label>
                <input
                  ref={firstInputRef}
                  className="govuk-input govuk-!-width-two-thirds"
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="contact-email">
                  Email address (optional)
                </label>
                <div className="govuk-hint" id="email-hint">
                  We will only use this to reply to your message.
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

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="contact-subject">
                  Subject
                </label>
                <input
                  className="govuk-input govuk-!-width-two-thirds"
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                />
              </div>

              <GovUKCharacterCount
                id="contact-message"
                name="message"
                label="Message"
                labelClassName="govuk-label govuk-label--s"
                hint="Include specific details, such as page names, links, or what you were looking for."
                errorMessage={
                  isMessageInvalid
                    ? submissionState?.error ||
                      `Message must be ${MAX_CHARS.toLocaleString()} characters or less`
                    : undefined
                }
                maxLength={MAX_CHARS}
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
                rows={8}
              />

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
                  {isPending ? "Sending..." : "Send message"}
                </button>
                <Link href="/" className="govuk-button govuk-button--secondary">
                  Cancel
                </Link>
              </div>
            </form>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <h2 className="govuk-heading-l">Other ways to contact us</h2>
            <p className="govuk-body">
              You can also email us at{' '}
              <a href="mailto:info@citizenguide.ke" className="govuk-link">
                info@citizenguide.ke
              </a>
            </p>

          </div>
        </div>
      
    
  
  </>
);
}