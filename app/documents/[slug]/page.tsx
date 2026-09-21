import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DocumentContents,
  DocumentReadingText,
} from "@/components/documents/DocumentContent";
import { getPublicDocument } from "@/lib/documents/queries";

export const dynamic = "force-dynamic";

function displayPublicationDate(document: any) {
  if (!document.publication_date) return null;

  if (document.publication_date_precision === "year") {
    return String(new Date(`${document.publication_date}T00:00:00Z`).getUTCFullYear());
  }

  return new Date(`${document.publication_date}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  );
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicDocument(slug);

  if (!data) notFound();

  const { document, sections, files, topicLinks } = data;
  const published = displayPublicationDate(document);
  const primaryFile = files.find((file: any) => file.is_primary) || files[0];

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" href="/">
                Home
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" href="/documents">
                Documents
              </Link>
            </li>
          </ol>
        </nav>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              {document.document_type?.name || "Document"}
            </span>
            <h1 className="govuk-heading-xl">{document.title}</h1>
            {document.summary && (
              <p className="govuk-body-l">{document.summary}</p>
            )}

            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              {published && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Published</dt>
                  <dd className="govuk-summary-list__value">{published}</dd>
                </div>
              )}
              {document.publisher_text && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Author / publisher</dt>
                  <dd className="govuk-summary-list__value">
                    {document.publisher_text}
                  </dd>
                </div>
              )}
              {topicLinks.length > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Topics</dt>
                  <dd className="govuk-summary-list__value">
                    {topicLinks
                      .map((link: any) => link.topic?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            {primaryFile?.source_url && (
              <p className="govuk-body">
                <a className="govuk-button" href={primaryFile.source_url}>
                  View source document
                </a>
              </p>
            )}

            {document.description && (
              <>
                <h2 className="govuk-heading-l">Overview</h2>
                <p className="govuk-body">{document.description}</p>
              </>
            )}

            {sections.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-8">Contents</h2>
                <DocumentContents sections={sections as any} />
                <DocumentReadingText sections={sections as any} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
