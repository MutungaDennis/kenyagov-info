import { Suspense } from "react";
import Link from "next/link";
import { client } from "@/sanity/lib/client"; // ✅ Fixed import
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

const DOCUMENTS_QUERY = `*[_type == "governmentPublication"] | order(yearPublished desc) {
  _id,
  title,
  shortTitle,
  "slug": slug.current,
  referenceNumber,
  yearPublished,
  issuingBody,
  functionalCategory,
  archivalCategory,
  historicalEra,
  summary,
  "pdfUrl": officialPdf.asset->url,
}`;

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ category?: string; era?: string; q?: string }> }) {
  const params = await searchParams;
  let query = DOCUMENTS_QUERY;
  const filters: string[] = [];

  if (params.category) filters.push(`functionalCategory == "${params.category}"`);
  if (params.era) filters.push(`historicalEra == "${params.era}"`);
  if (params.q) filters.push(`title match "*${params.q}*" || referenceNumber match "*${params.q}*" || issuingBody match "*${params.q}*"`);

  if (filters.length > 0) {
    query = `*[_type == "governmentPublication" && ${filters.join(" && ")}] | order(yearPublished desc) {
      _id, title, shortTitle, "slug": slug.current, referenceNumber, yearPublished, issuingBody, functionalCategory, archivalCategory, historicalEra, summary, "pdfUrl": officialPdf.asset->url
    }`;
  }

  const documents = await client.fetch(query);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Documents and policies" }]} />
      
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Documents and policies</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              Key government plans, policies, and public records. Search or filter by functional category and historical era.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Sidebar Filters */}
          <aside className="govuk-grid-column-one-third">
            <form className="govuk-!-margin-bottom-6">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-docs">Search documents</label>
                <input className="govuk-input" id="search-docs" name="q" type="search" placeholder="e.g. Sessional Paper, 1965" defaultValue={params.q} />
              </div>
              
              <div className="govuk-form-group">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="filter-category">Functional Category</label>
                <select className="govuk-select govuk-!-width-full" id="filter-category" name="category" defaultValue={params.category}>
                  <option value="">All Categories</option>
                  <option value="investigative_advisory">Investigative & Advisory</option>
                  <option value="policy_formulation">Policy Formulation</option>
                  <option value="strategic_planning">Strategic Planning</option>
                  <option value="statutory_legislative">Statutory & Legislative</option>
                </select>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="filter-era">Historical Era</label>
                <select className="govuk-select govuk-!-width-full" id="filter-era" name="era" defaultValue={params.era}>
                  <option value="">All Eras</option>
                  <option value="post_independence">Post-Independence (1963–1979)</option>
                  <option value="market_liberalization">Market Liberalization (1980–2009)</option>
                  <option value="constitution_2010">Constitution 2010 Era (2010–Present)</option>
                </select>
              </div>

              <button type="submit" className="govuk-button">Apply filters</button>
              {(params.q || params.category || params.era) && (
                <Link href="/documents" className="govuk-link govuk-!-display-block govuk-!-margin-top-2">Clear all filters</Link>
              )}
            </form>
          </aside>

          {/* Results List */}
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body govuk-!-margin-bottom-4">
              <strong>{documents.length}</strong> document{documents.length !== 1 ? "s" : ""} found
            </p>

            {documents.length === 0 ? (
              <div className="govuk-inset-text"><p className="govuk-body">No documents match your search criteria.</p></div>
            ) : (
              <ul className="govuk-list govuk-!-margin-top-0">
                {documents.map((doc: any) => (
                  <li key={doc._id} className="govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-border-bottom-1">
                    <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-text-colour-secondary govuk-!-display-block govuk-!-margin-bottom-1">
                      {doc.referenceNumber} • Published {doc.yearPublished} • {doc.issuingBody}
                    </span>
                    <h3 className="govuk-heading-m govuk-!-margin-0">
                      <Link href={`/documents/${doc.slug}`} className="govuk-link govuk-!-font-weight-bold">
                        {doc.title}
                      </Link>
                    </h3>
                    <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-3">{doc.summary}</p>
                    <div className="govuk-!-display-flex govuk-!-gap-3 govuk-!-flex-wrap-wrap">
                      <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14">
                        {doc.functionalCategory?.replace(/_/g, " ")}
                      </span>
                      {doc.pdfUrl && (
                        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="govuk-link govuk-!-font-size-14">
                          Download PDF ↓
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}