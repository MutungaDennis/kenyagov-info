"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { recordPageVote } from "./actions";

export default function GovUKFeedback() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleVote(isUseful: boolean) {
    setSubmissionState(null); // Clear previous errors if they retry

    startTransition(async () => {
      const result = await recordPageVote(pathname, isUseful);
      if (result.success) {
        setSubmissionState({ success: true });
      } else {
        setSubmissionState({ error: "There was a problem sending your feedback. Please try again." });
      }
    });
  }

  // Case 1: Success State matching GOV.UK confirmation pattern
  if (submissionState?.success) {
    return (
      <div className="govuk-grid-row" role="status" aria-live="polite">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ borderColor: "#1d70b8" }}>
            <p className="govuk-body govuk-!-font-weight-bold">Thank you for your feedback.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        
        {/* Case 2: Error Notification Banner if the database transaction fails */}
        {submissionState?.error && (
          <div className="govuk-error-summary govuk-!-margin-bottom-4" role="alert" style={{ border: "4px solid #d4351c" }}>
            <div className="govuk-error-summary__body">
              <p className="govuk-body govuk-!-font-weight-bold" style={{ color: "#d4351c", margin: 0 }}>
                {submissionState.error}
              </p>
            </div>
          </div>
        )}

        <h2 className="govuk-heading-m">Is this page useful?</h2>
        
        <div className="govuk-button-group">
          <button 
            className="govuk-button govuk-button--secondary" 
            type="button"
            disabled={isPending}
            onClick={() => handleVote(true)}
          >
            {isPending ? "Sending..." : "Yes"}
          </button>
          <button 
            className="govuk-button govuk-button--secondary" 
            type="button"
            disabled={isPending}
            onClick={() => handleVote(false)}
          >
            {isPending ? "Sending..." : "No"}
          </button>
        </div>
        
        {/* <p className="govuk-body-s govuk-!-margin-top-3">
          <Link href="/feedback" className="govuk-link">
            Report a problem with this page
          </Link>
        </p> */}
      </div>
    </div>
  );
}
