// app/documents/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import CivicDisclaimer from "@/components/site/CivicDisclaimer";
import DocumentReader from "@/components/documents/DocumentReader";
import CopyTextButton from "@/components/documents/CopyTextButton";
import CitationSection from "@/components/documents/CitationSection";

const DOC_QUERY = `*[_type == "governmentPublication" && slug.current == $slug][0] {
  _id, title, shortTitle, referenceNumber, yearPublished, issuingBody,
  functionalCategory, archivalCategory, historicalEra, summary, fullText, plainSummary,
  "pdfUrl": officialPdf.asset->url,
  officialExternalUrl,
}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await client.fetch(DOC_QUERY, { slug });
  if (!doc) return { title: "Document not found" };
  return {
    title: `${doc.shortTitle} | CitizenGuide.KE`,
    description: doc.summary,
  };
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await client.fetch(DOC_QUERY, { slug });

  if (!doc) notFound();

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    "name": doc.title,
    "legislationIdentifier": doc.referenceNumber,
    "jurisdiction": { "@type": "Country", "name": "Kenya" },
    "datePublished": doc.yearPublished.toString(),
    "publisher": { "@type": "Organization", "name": doc.issuingBody },
    "url": `https://www.citizenguide.ke/documents/${slug}`,
  };

  const safeFullText = Array.isArray(doc.fullText) ? doc.fullText : [];
  const safePlainSummary = Array.isArray(doc.plainSummary) ? doc.plainSummary : [];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Documents and policies", href: "/documents" },
        { text: doc.shortTitle },
      ]} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header Section */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">{doc.referenceNumber}</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{doc.title}</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-4">{doc.summary}</p>
            
            <div className="govuk-!-display-flex govuk-!-gap-3 govuk-!-flex-wrap-wrap">
              {doc.pdfUrl && (
                <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="govuk-button govuk-!-margin-bottom-0" data-module="govuk-button">
                  Download Official PDF ↓
                </a>
              )}
              {doc.officialExternalUrl && (
                <a href={doc.officialExternalUrl} target="_blank" rel="noopener noreferrer" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" data-module="govuk-button">
                  View Original Source ↗
                </a>
              )}
              {safeFullText.length > 0 && (
                <CopyTextButton fullText={safeFullText} summary={doc.summary} />
              )}
            </div>
          </div>
        </div>

        <CivicDisclaimer context="This page reproduces official government text for civic reference. For legal proceedings, always consult the Kenya Gazette or official sources." />
        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

        {/* Two-Column Layout for Readability */}
        <div className="govuk-grid-row">
          
          {/* Left Sidebar: Sticky Navigation */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-!-margin-bottom-6" style={{ position: 'sticky', top: '20px', zIndex: 10 }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">On this page</h2>
              <nav aria-label="Document contents">
                <ul className="govuk-list govuk-!-font-size-16">
                  <li><a href="#full-text" className="govuk-link govuk-link--no-underline">Full Document Text</a></li>
                  {safePlainSummary.length > 0 && (
                    <li><a href="#plain-english" className="govuk-link govuk-link--no-underline">Plain English Summary</a></li>
                  )}
                  <li><a href="#metadata" className="govuk-link govuk-link--no-underline">Document Metadata</a></li>
                  <li><a href="#citation" className="govuk-link govuk-link--no-underline">Cite this document</a></li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="govuk-grid-column-two-thirds">
            
            {/* Full Text Rendering */}
            <div id="full-text" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l govuk-!-padding-bottom-2 govuk-!-border-bottom-1">Full Document Text</h2>
              {safeFullText.length > 0 ? (
                <DocumentReader content={safeFullText} />
              ) : (
                <div className="govuk-inset-text">
                  <p className="govuk-body">Full text is being digitized. Please refer to the PDF download above.</p>
                </div>
              )}
            </div>

            {/* Plain English Summary */}
            {safePlainSummary.length > 0 && (
              <div id="plain-english" className="govuk-!-margin-bottom-8">
                <h2 className="govuk-heading-l govuk-!-padding-bottom-2 govuk-!-border-bottom-1">Plain English Summary</h2>
                <div className="govuk-details govuk-!-margin-top-4 govuk-!-background-grey govuk-!-padding-4 govuk-!-border-left-4" style={{ borderLeftColor: '#1d70b8' }}>
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text govuk-!-font-weight-bold govuk-!-text-colour-blue">
                      Read the simplified explanation
                    </span>
                  </summary>
                  <div className="govuk-details__text govuk-!-font-size-19">
                    <DocumentReader content={safePlainSummary} />
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div id="metadata" className="govuk-!-padding-5 govuk-!-background-grey govuk-!-margin-top-8 govuk-!-border-top-4" style={{ borderTopColor: '#1d70b8' }}>
              <h3 className="govuk-heading-m govuk-!-margin-top-0">Document Metadata</h3>
              <dl className="govuk-summary-list govuk-summary-list--no-border">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-third">Issuing Body</dt>
                  <dd className="govuk-summary-list__value">{doc.issuingBody}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-third">Functional Category</dt>
                  <dd className="govuk-summary-list__value">{doc.functionalCategory?.replace(/_/g, " ")}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-third">Archival Category</dt>
                  <dd className="govuk-summary-list__value">{doc.archivalCategory?.replace(/_/g, " ")}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-third">Historical Era</dt>
                  <dd className="govuk-summary-list__value">{doc.historicalEra?.replace(/_/g, " ")}</dd>
                </div>
              </dl>
            </div>

            {/* Citation Section */}
            <CitationSection doc={doc} />

          </div>
        </div>
      </main>
    </div>
  );
}