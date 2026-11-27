import type { Metadata } from "next";
import Link from "next/link";
import { getGuideAcronyms } from "@/lib/guides/reference-terms";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Acronyms",
  description: "Full forms and references for acronyms used in Kenyan government information.",
};

export default async function AcronymsPage() {
  const acronyms = await getGuideAcronyms();
  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides">Guides</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Acronyms</li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Guides</span>
          <h1 className="govuk-heading-xl">Acronyms</h1>
          <p className="govuk-body-l">Find the full forms and context for abbreviations used in public information.</p>
          {acronyms.length ? (
            <dl className="govuk-summary-list">
              {acronyms.map((entry) => (
                <div className="govuk-summary-list__row" key={entry.id}>
                  <dt className="govuk-summary-list__key">{entry.acronym.toUpperCase()}</dt>
                  <dd className="govuk-summary-list__value">
                    <p className="govuk-body govuk-!-font-weight-bold">{entry.full_form}</p>
                    {entry.meaning ? <p className="govuk-body">{entry.meaning}</p> : null}
                    {entry.reference_url ? (
                      <p className="govuk-body-s govuk-!-margin-bottom-0">Reference: <a className="govuk-link" href={entry.reference_url} target="_blank" rel="noopener noreferrer">
                        {entry.reference_label || "View source"}<span className="govuk-visually-hidden"> (opens in a new tab)</span>
                      </a></p>
                    ) : entry.reference_label ? <p className="govuk-body-s govuk-!-margin-bottom-0">Reference: {entry.reference_label}</p> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : <p className="govuk-body">Acronym entries are being prepared. Browse the <Link className="govuk-link" href="/guides/glossary-of-terms">glossary of terms</Link> in the meantime.</p>}
        </div>
      </div>
    </main>
  );
}
