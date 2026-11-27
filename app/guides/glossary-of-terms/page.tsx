import type { Metadata } from "next";
import Link from "next/link";
import { getGlossaryTerms } from "@/lib/guides/reference-terms";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Glossary of terms",
  description: "Plain-language definitions of Kenyan government and civic terms, with references.",
};

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();
  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides">Guides</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Glossary of terms</li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Guides</span>
          <h1 className="govuk-heading-xl">Glossary of terms</h1>
          <p className="govuk-body-l">Clear explanations of words and phrases used in government and civic information.</p>
          {terms.length ? (
            <dl className="govuk-summary-list">
              {terms.map((entry) => (
                <div className="govuk-summary-list__row" key={entry.id} id={entry.slug}>
                  <dt className="govuk-summary-list__key">{entry.term}</dt>
                  <dd className="govuk-summary-list__value">
                    <p className="govuk-body">{entry.meaning}</p>
                    {entry.reference_url ? (
                      <p className="govuk-body-s govuk-!-margin-bottom-0">
                        Reference: <a className="govuk-link" href={entry.reference_url} target="_blank" rel="noopener noreferrer">
                          {entry.reference_label || "View source"}<span className="govuk-visually-hidden"> (opens in a new tab)</span>
                        </a>
                      </p>
                    ) : entry.reference_label ? <p className="govuk-body-s govuk-!-margin-bottom-0">Reference: {entry.reference_label}</p> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : <p className="govuk-body">Glossary entries are being prepared. Check the <Link className="govuk-link" href="/guides/acronyms">acronyms guide</Link> in the meantime.</p>}
        </div>
      </div>
    </main>
  );
}
