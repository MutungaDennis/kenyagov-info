import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

/** Shown when someone hits /admin while the secret path is active. */
export default function AdminNotFoundPage() {
  return (
    <div className="govuk-width-container govuk-!-margin-top-8 govuk-!-margin-bottom-8">
      <h1 className="govuk-heading-xl">Page not found</h1>
      <p className="govuk-body">
        If you typed the web address, check it is correct.
      </p>
      <p className="govuk-body">
        <a className="govuk-link" href="/">
          Go to the CitizenGuide.KE homepage
        </a>
      </p>
    </div>
  );
}
