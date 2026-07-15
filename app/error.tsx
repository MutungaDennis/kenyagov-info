"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Public GOV.UK-style error boundary page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Sorry, there is a problem with this page</h1>
        <p className="govuk-body">Try again later.</p>
        <p className="govuk-body">
          <button type="button" className="govuk-button" onClick={() => reset()}>
            Try again
          </button>
        </p>
        <p className="govuk-body">You can also:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            <Link href="/" className="govuk-link">
              go to the homepage
            </Link>
          </li>
          <li>
            <Link href="/contact" className="govuk-link">
              contact this website
            </Link>
          </li>
        </ul>
        {error.digest ? (
          <p className="govuk-body-s">Error code: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
