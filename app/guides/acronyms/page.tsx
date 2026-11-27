import type { Metadata } from "next";
import Link from "next/link";
import { getGuideAcronyms } from "@/lib/guides/reference-terms";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Acronyms",
  description: "Browse acronyms used in Kenyan government and civic information, with concise meanings and full details.",
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
          <p className="govuk-body-l">Browse acronyms and their short meanings. Open an acronym for its full details.</p>
          {acronyms.length ? (
            <dl className="govuk-summary-list">
              {acronyms.map((entry) => (
                <div className="govuk-summary-list__row" key={entry.id}>
                  <dt className="govuk-summary-list__key">
                    <Link className="govuk-link" href={`/guides/acronyms/${entry.slug}`} aria-label={`${entry.acronym}: ${entry.full_form}`}>
                      {entry.acronym.toUpperCase()}
                    </Link>
                  </dt>
                  <dd className="govuk-summary-list__value">
                    <p className="govuk-body govuk-!-font-weight-bold">{entry.full_form}</p>
                    <p className="govuk-body govuk-!-margin-bottom-0">{entry.short_meaning}</p>
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
