import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "next-sanity";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { PortableText } from "@portabletext/react";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600; // ISR

interface Paper {
  _id: string;
  title: string;
  slug: { current: string };
  referenceNumber?: string;
  house: string;
  county?: string;
  paperType?: string;
  presentedBy?: string;
  laidDate: string;
  status: string;
  parliamentaryTerm?: string;
  summary?: any[];
  fullText?: any[];
  topics?: string[];
  documents?: Array<{
    title?: string;
    url: string;
    fileType?: string;
    uploadedAt?: string;
  }>;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getHouseLabel(house: string, county?: string): string {
  if (house === "county-assembly" && county) {
    return `${county} County Assembly`;
  }
  const labels: Record<string, string> = {
    "national-assembly": "National Assembly",
    senate: "Senate",
    "county-assembly": "County Assembly",
  };
  return labels[house] || house;
}

function getStatusClass(status: string): string {
  const s = status.toLowerCase();
  if (
    s.includes("laid") ||
    s.includes("adopted") ||
    s.includes("approved") ||
    s.includes("passed") ||
    s.includes("accepted")
  ) {
    return "govuk-tag--green";
  }
  if (
    s.includes("debated") ||
    s.includes("consideration") ||
    s.includes("referred") ||
    s.includes("pending") ||
    s.includes("in progress")
  ) {
    return "govuk-tag--blue";
  }
  if (
    s.includes("rejected") ||
    s.includes("withdrawn") ||
    s.includes("lapsed") ||
    s.includes("declined") ||
    s.includes("refused")
  ) {
    return "govuk-tag--red";
  }
  return "govuk-tag--grey";
}

export default async function PaperDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let paper: Paper | null = null;

  try {
    paper = await sanityClient.fetch(
      `*[_type == "paper" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        referenceNumber,
        house,
        county,
        paperType,
        presentedBy,
        laidDate,
        status,
        parliamentaryTerm,
        summary,
        fullText,
        topics,
        documents[] { title, url, fileType, uploadedAt }
      }`,
      { slug }
    );
  } catch (error) {
    console.error("Error fetching paper:", error);
  }

  if (!paper) {
    notFound();
  }

  const hasFullText = paper.fullText && paper.fullText.length > 0;
  const hasDocuments = paper.documents && paper.documents.length > 0;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Tracker", href: "/legislature/tracker" },
          { text: "Papers & Reports", href: "/legislature/tracker/papers" },
          { text: paper.referenceNumber || paper.title, href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            
            {paper.referenceNumber && (
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>{paper.referenceNumber}</strong>
              </p>
            )}
            
            <h1 className="govuk-heading-xl">{paper.title}</h1>

            <div className="govuk-!-margin-bottom-4">
              <span className={`govuk-tag govuk-tag--xl ${getStatusClass(paper.status)}`}>
                {paper.status}
              </span>
              <span className="govuk-tag govuk-tag--blue govuk-tag--xl govuk-!-margin-left-2">
                {getHouseLabel(paper.house, paper.county)}
              </span>
              {paper.paperType && (
                <span className="govuk-tag govuk-tag--grey govuk-tag--xl govuk-!-margin-left-2">
                  {paper.paperType}
                </span>
              )}
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Key Information */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Key Information</h2>
            
            <dl className="govuk-summary-list">
              {paper.presentedBy && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Presented by</dt>
                  <dd className="govuk-summary-list__value">{paper.presentedBy}</dd>
                </div>
              )}

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Laid before the House</dt>
                <dd className="govuk-summary-list__value">
                  {new Date(paper.laidDate).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>

              {paper.parliamentaryTerm && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Parliamentary Term</dt>
                  <dd className="govuk-summary-list__value">{paper.parliamentaryTerm}</dd>
                </div>
              )}

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">House</dt>
                <dd className="govuk-summary-list__value">
                  {getHouseLabel(paper.house, paper.county)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Full Content / Summary */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">
              {hasFullText ? "Full Paper / Report" : "Summary"}
            </h2>

            {hasFullText ? (
              <div className="govuk-body">
                <PortableText value={paper.fullText} />
              </div>
            ) : paper.summary && paper.summary.length > 0 ? (
              <div className="govuk-body">
                <PortableText value={paper.summary} />
              </div>
            ) : (
              <p className="govuk-body">
                No detailed content has been published for this paper yet. 
                Please check back later or contact the relevant House for the official document.
              </p>
            )}
          </div>
        </div>

        {/* Documents Section */}
        {hasDocuments && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Documents</h2>
              <ul className="govuk-list govuk-list--bullet">
                {paper.documents!.map((doc, index) => (
                  <li key={index}>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="govuk-link"
                    >
                      {doc.title || "Download document"}
                      {doc.fileType && ` (${doc.fileType})`}
                    </a>
                    {doc.uploadedAt && (
                      <span className="govuk-hint govuk-!-font-size-14 govuk-!-margin-left-2">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-KE")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Topics */}
        {paper.topics && paper.topics.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-s">Topics</h2>
              <div>
                {paper.topics.map((topic, i) => (
                  <span 
                    key={i} 
                    className="govuk-tag govuk-tag--blue govuk-!-margin-right-1 govuk-!-margin-bottom-1"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <Link 
              href="/legislature/tracker/papers" 
              className="govuk-button govuk-button--secondary"
            >
              ← Back to Papers &amp; Reports Tracker
            </Link>
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}
