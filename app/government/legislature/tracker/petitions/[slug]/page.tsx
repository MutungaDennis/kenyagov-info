import Link from "next/link";
import { createClient } from "next-sanity";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600;

interface PetitionDocument {
  _id: string;
  title: string;
  slug: { current: string };
  petitionNumber: string;
  house: string;
  county?: string;
  petitioner: string;
  presentedDate: string;
  responseDate?: string;
  status: string;
  parliamentaryTerm?: string;
  summary?: any[];
  fullText?: any[];
  governmentResponse?: any[];
  topics?: string[];
  documents?: Array<{
    title: string;
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

function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase() || "";
  
  if (["responded", "granted", "closed", "successful", "accepted"].some(k => s.includes(k))) {
    return "govuk-tag govuk-tag--green";
  }
  if (["rejected", "withdrawn", "declined", "lapsed", "refused"].some(k => s.includes(k))) {
    return "govuk-tag govuk-tag--red";
  }
  if (["under consideration", "referred", "pending", "committee", "in progress"].some(k => s.includes(k))) {
    return "govuk-tag govuk-tag--blue";
  }
  return "govuk-tag govuk-tag--grey";
}

export default async function PetitionDetail({ params }: PageProps) {
  const { slug } = await params;

  let petition: PetitionDocument | null = null;

  try {
    petition = await sanityClient.fetch(
      `*[_type == "petition" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        petitionNumber,
        house,
        county,
        petitioner,
        presentedDate,
        responseDate,
        status,
        parliamentaryTerm,
        summary,
        fullText,
        governmentResponse,
        topics,
        documents[] {
          title,
          url,
          fileType,
          uploadedAt
        }
      }`,
      { slug }
    );
  } catch (error) {
    console.error("Error fetching petition:", error);
  }

  if (!petition) {
    notFound();
  }

  const statusClass = getStatusBadgeClass(petition.status);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Petitions Tracker", href: "/legislature/tracker/petitions" },
          { text: petition.petitionNumber || "Petition", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya • {petition.house?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              {petition.petitionNumber}
            </h1>
            <h2 className="govuk-heading-l govuk-!-margin-top-0 govuk-!-margin-bottom-4">
              {petition.title}
            </h2>
          </div>
          <div className="govuk-grid-column-one-third govuk-!-text-align-right">
            <span className={`${statusClass} govuk-!-font-size-19 govuk-!-padding-2`}>
              {petition.status}
            </span>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Key Information */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h3 className="govuk-heading-m">Key Information</h3>
            
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Petitioner</dt>
                <dd className="govuk-summary-list__value">{petition.petitioner}</dd>
              </div>
              
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">House</dt>
                <dd className="govuk-summary-list__value">
                  {petition.house?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  {petition.county && ` • ${petition.county}`}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Presented</dt>
                <dd className="govuk-summary-list__value">
                  {new Date(petition.presentedDate).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>

              {petition.responseDate && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Response Date</dt>
                  <dd className="govuk-summary-list__value">
                    {new Date(petition.responseDate).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}

              {petition.parliamentaryTerm && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Parliamentary Term</dt>
                  <dd className="govuk-summary-list__value">{petition.parliamentaryTerm}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Full Petition Text */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h3 className="govuk-heading-m">Full Petition</h3>
            
            {petition.fullText && petition.fullText.length > 0 ? (
              <div className="govuk-body">
                <PortableText value={petition.fullText} />
              </div>
            ) : petition.summary && petition.summary.length > 0 ? (
              <div className="govuk-body">
                <PortableText value={petition.summary} />
              </div>
            ) : (
              <p className="govuk-body">No full petition text has been published yet.</p>
            )}
          </div>
        </div>

        {/* Government Response */}
        {petition.governmentResponse && petition.governmentResponse.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-4">
                <h3 className="govuk-panel__title">Government / House Response</h3>
              </div>
              <div className="govuk-body">
                <PortableText value={petition.governmentResponse} />
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {petition.documents && petition.documents.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h3 className="govuk-heading-m">Documents</h3>
              <ul className="govuk-list govuk-list--bullet">
                {petition.documents.map((doc, index) => (
                  <li key={index}>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="govuk-link"
                    >
                      {doc.title}
                      {doc.fileType && ` (${doc.fileType})`}
                    </a>
                    {doc.uploadedAt && (
                      <span className="govuk-!-margin-left-2 govuk-body-s govuk-!-text-colour-secondary">
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
        {petition.topics && petition.topics.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Topics</h3>
              <div>
                {petition.topics.map((topic, i) => (
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

        {/* Actions */}
        <div className="govuk-grid-row govuk-!-margin-top-8">
          <div className="govuk-grid-column-full">
            <Link 
              href="/legislature/tracker/petitions" 
              className="govuk-button govuk-button--secondary"
            >
              ← Back to Petitions Tracker
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
