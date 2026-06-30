'use client';

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
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

  // Focus first field on load
  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

  // Focus error or success panel
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

        // Reset Turnstile widget on error
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
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Contact", href: "/contact" },
          ]}
        />

        <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
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
        </main>
      </div>
    );
  }

  // ==================== FORM ====================
  const isMessageInvalid = submissionState?.errorType === "validation" && charsRemaining < 0;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Contact", href: "/contact" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
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

            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Contact Us</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Submit feedback, report directory errors, or suggest improvements for CitizenGuide.KE.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              CitizenGuide.KE is an independent citizen-facing informational platform. It is <strong>not</strong> an official outlet of the Government of Kenya.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Send us a message</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-name">
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
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-email">
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
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-subject">
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

              <div className={`govuk-form-group ${isMessageInvalid ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="contact-message">
                  Message
                </label>
                <div className="govuk-hint" id="message-hint">
                  Please include specific details (e.g. table names, links, or page URLs).
                </div>

                {isMessageInvalid && (
                  <p className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {submissionState?.error}
                  </p>
                )}

                <textarea
                  className="govuk-textarea"
                  id="contact-message"
                  name="message"
                  rows={8}
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  aria-describedby={`message-hint ${isMessageInvalid ? "message-error" : ""}`}
                  style={isMessageInvalid ? { border: "4px solid #d4351c" } : {}}
                />

                <div
                  className={`govuk-hint govuk-character-count__message ${charsRemaining < 0 ? "govuk-error-message" : ""}`}
                  style={charsRemaining < 0 ? { color: "#d4351c", fontWeight: "bold" } : {}}
                >
                  {charsRemaining >= 0
                    ? `You have ${charsRemaining} characters remaining`
                    : `You have ${Math.abs(charsRemaining)} characters too many`}
                </div>
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
                  {isPending ? "Sending..." : "Submit message"}
                </button>
                <Link href="/" className="govuk-button govuk-button--secondary">
                  Cancel
                </Link>
              </div>
            </form>

            <h2 className="govuk-heading-m govuk-!-margin-top-8">Other ways to reach us</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:hello@citizenguide.ke" className="govuk-link">
                  hello@citizenguide.ke
                </a>
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-top-6" />

            <p className="govuk-body govuk-!-margin-top-4">
              <strong>Note:</strong> We cannot process official government applications or payments. Please use the official{" "}
              <a href="https://www.ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">
                eCitizen portal
              </a>{" "}
              for government services.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}