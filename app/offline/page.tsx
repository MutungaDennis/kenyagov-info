import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "You are offline",
  description: "You are not connected to the internet.",
  path: "/offline",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">You are offline</h1>
        <p className="govuk-body">
          This page has not been saved on your device. Check your connection and try again.
        </p>
        <p className="govuk-body">
          Pages you have already visited may still open. Try the{" "}
          <Link className="govuk-link" href="/">
            home page
          </Link>
          .
        </p>
        <p className="govuk-body">
          In an emergency, call <strong>999</strong> or <strong>112</strong>.
        </p>
      </div>
    </div>
  );
}