"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import ExternalLinkIcon from "./ExternalLinkIcon";
import { recordPageVote } from "./actions";

const SITE_URL = "https://www.citizenguide.ke";

function PageHelpLinks({ pathname }: { pathname: string }) {
  const shareText = encodeURIComponent(`${SITE_URL}${pathname}`);
  return (
    <ul className="govuk-list govuk-body-s govuk-!-margin-top-2">
      <li>
        <a
          className="govuk-link"
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share this page on WhatsApp
          <ExternalLinkIcon />
          <span className="govuk-visually-hidden"> (opens in a new tab)</span>
        </a>
      </li>
    </ul>
  );
}

/**
 * "Is this page useful?" — GOV.UK-style page feedback.
 * Mounted once in the page template (layout).
 */
export default function GovUKFeedback() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const [submissionState, setSubmissionState] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  // Wait until the page has finished loading so the panel is not pushed down by late content.
  useEffect(() => {
    let frame = 0;
    const show = () => { frame = requestAnimationFrame(() => setReady(true)); };
    if (document.readyState === "complete") show();
    else window.addEventListener("load", show, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", show);
    };
  }, [pathname]);

  function handleVote(isUseful: boolean) {
    setSubmissionState(null);

    startTransition(async () => {
      const result = await recordPageVote(pathname, isUseful);
      if (result.success) {
        setSubmissionState({ success: true });
      } else {
        setSubmissionState({
          error:
            "There was a problem sending your feedback. Please try again.",
        });
      }
    });
  }

  if (!ready) return null;

  if (submissionState?.success) {
    return (
      <div className="govuk-grid-row" role="status" aria-live="polite">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
            <p className="govuk-body govuk-!-font-weight-bold">
              Thank you for your feedback.
            </p>
            <PageHelpLinks pathname={pathname} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {submissionState?.error && (
          <div
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

        <h2 className="govuk-heading-m">Is this page useful?</h2>

        <div className="govuk-button-group">
          <button
            className="govuk-button govuk-button--secondary"
            type="button"
            data-module="govuk-button"
            disabled={isPending}
            onClick={() => handleVote(true)}
          >
            {isPending ? "Sending..." : "Yes"}
          </button>
          <button
            className="govuk-button govuk-button--secondary"
            type="button"
            data-module="govuk-button"
            disabled={isPending}
            onClick={() => handleVote(false)}
          >
            {isPending ? "Sending..." : "No"}
          </button>
        </div>
        <PageHelpLinks pathname={pathname} />
      </div>
    </div>
  );
}
