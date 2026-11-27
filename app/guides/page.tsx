import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides",
  description: "Plain-language guides to government terms, acronyms and services in Kenya.",
};

export default function GuidesPage() {
  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Citizen information</span>
          <h1 className="govuk-heading-xl">Guides</h1>
          <p className="govuk-body-l">
            Understand the terms and abbreviations used across Kenyan public services and government.
          </p>
          <div className="govuk-inset-text">
            Use these references to make government information easier to understand. Each entry can include a source for further checking.
          </div>
          <ul className="govuk-list">
            <li className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
                <Link className="govuk-link" href="/guides/glossary-of-terms">Glossary of terms</Link>
              </h2>
              <p className="govuk-body">Plain-language meanings for civic, legal and government terms.</p>
            </li>
            <li className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
                <Link className="govuk-link" href="/guides/acronyms">Acronyms</Link>
              </h2>
              <p className="govuk-body">Full forms and references for abbreviations used in public information.</p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
