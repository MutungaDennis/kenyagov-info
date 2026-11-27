import type { Metadata } from "next";
import Link from "next/link";
import { getGlossaryTerms } from "@/lib/guides/reference-terms";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Glossary of terms",
  description: "Browse concise meanings of terms used in Kenyan government and civic information, with full definitions on each term page.",
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
          <p className="govuk-body-l">Browse terms and their short meanings. Open a term to read the full definition.</p>
          {terms.length ? (
            <dl className="govuk-summary-list">
              {terms.map((entry) => (
                <div className="govuk-summary-list__row" key={entry.id}>
                  <dt className="govuk-summary-list__key">
                    <Link className="govuk-link" href={`/guides/glossary-of-terms/${entry.slug}`}>{entry.term}</Link>
                  </dt>
                  <dd className="govuk-summary-list__value">
                    <p className="govuk-body govuk-!-margin-bottom-0">{entry.short_meaning}</p>
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
