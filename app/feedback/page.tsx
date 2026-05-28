"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { handleFeedbackSubmission } from "./actions"; // Import the Server Action

export default function FeedbackPage() {
  const firstInputRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] = useState<{ success?: boolean; error?: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Requirement: Immediate keyboard focus on touchscreens
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Requirement: Initialize Cloudflare Turnstile widget script interaction
  useEffect(() => {
    // @ts-ignore
    window.onTurnstileLoaded = () => {
      // @ts-ignore
      turnstile.render("#turnstile-container", {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: function (token: string) {
          setTurnstileToken(token);
        },
      });
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!turnstileToken) {
      setSubmissionState({ error: "Please complete the automated security check." });
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      // Execute the server action directly without an API fetch call
      const result = await handleFeedbackSubmission(formData, turnstileToken);
      
      if (result.success) {
        setSubmissionState({ success: true });
      } else {
        setSubmissionState({ error: result.error || "Failed to log feedback." });
      }
    });
  }

  if (submissionState?.success) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">Feedback sent</h1>
          </div>
          <p className="govuk-body govuk-!-margin-top-6">
            Thank you for your feedback. Your input helps us make this platform better for all Kenyans.
          </p>
          <Link href="/" className="govuk-button">Back to Home</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Feedback", href: "/feedback" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {submissionState?.error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{submissionState.error}</p>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Help us improve CitizenGuide.KE</h1>

            <div className="govuk-inset-text">
              Do not include personal or financial information (such as your National ID number or phone number).
            </div>

            <form onSubmit={handleSubmit}>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="doing">
                  What were you doing?
                </label>
                <textarea 
                  ref={firstInputRef}
                  className="govuk-textarea" 
                  id="doing" 
                  name="doing" 
                  rows={4}
                  required
                  placeholder="e.g. Looking for information about National ID application..."
                ></textarea>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="wrong">
                  What went wrong?
                </label>
                <textarea 
                  className="govuk-textarea" 
                  id="wrong" 
                  name="wrong" 
                  rows={6}
                  required
                  placeholder="e.g. Information is outdated, link is broken, page is confusing..."
                ></textarea>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="email">
                  Email address (optional) – so we can reply if needed
                </label>
                <input 
                  className="govuk-input" 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com"
                />
              </div>

              {/* Turnstile Container */}
              <div className="govuk-form-group">
                <div id="turnstile-container"></div>
                <script src="https://cloudflare.com" async defer></script>
              </div>

              <div className="govuk-button-group">
                <button type="submit" disabled={isPending} className="govuk-button">
                  {isPending ? "Sending..." : "Send"}
                </button>
                <Link href="/" className="govuk-button govuk-button--secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
