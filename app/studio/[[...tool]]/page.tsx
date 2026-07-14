import Link from "next/link";
import type { Metadata } from "next";

/**
 * Sanity Studio is intentionally NOT bundled into the Cloudflare Worker.
 * The full Studio (`sanity` + `@sanity/vision`) is multi‑megabytes and alone
 * can push the Worker past Free (3 MiB) / Paid (10 MiB) gzip limits.
 *
 * Edit content via:
 * - Sanity Manage: https://www.sanity.io/manage
 * - Local: `pnpm dev` and open /studio on your machine
 * - Or host Studio separately (sanity deploy / separate Worker)
 */
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioUnavailablePage() {
  return (
    <main className="govuk-width-container" style={{ padding: "2rem 0 4rem" }}>
      <h1 className="govuk-heading-l">Content studio not hosted on this site</h1>
      <p className="govuk-body">
        The Sanity Studio is not deployed with the public CitizenGuide.KE
        Worker (Cloudflare size limits). Content is still served from Sanity;
        only the editing UI is omitted here.
      </p>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <a
            className="govuk-link"
            href="https://www.sanity.io/manage"
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Sanity Manage
          </a>
        </li>
        <li>
          Local editing: run <code className="govuk-!-font-size-16">pnpm dev</code>{" "}
          and use Studio on your machine (restore the full Studio page from git
          history if you need it locally under a separate branch).
        </li>
      </ul>
      <p className="govuk-body">
        <Link className="govuk-link" href="/">
          Back to home
        </Link>
      </p>
    </main>
  );
}
