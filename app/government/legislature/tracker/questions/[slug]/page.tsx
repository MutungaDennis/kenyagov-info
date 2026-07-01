import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "next-sanity";
import { PortableText } from "@portabletext/react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600;

interface Question {
  _id: string;
  title: string;
  slug: { current: string };
  questionNumber: string;
  house: string;
  county?: string;
  askedBy: string;
  directedTo: string;
  askedDate: string;
  answeredDate?: string;
  status: string;
  parliamentaryTerm: string;
  summary?: any[];
  fullQuestionText?: any[];
  answerText?: any[];
  topics?: string[];
  hansardUrl?: string;
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

// Status badge styling (consistent with listing page)
function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  
  if (["answered", "responded", "answered orally", "answered in writing"].includes(s)) {
    return { label: status, className: "govuk-tag govuk-tag--green" };
  }
  if (["unanswered", "pending", "overdue"].includes(s)) {
    return { label: status, className: "govuk-tag govuk-tag--red" };
  }
  if (["deferred", "withdrawn", "lapsed", "not reached"].includes(s)) {
    return { label: status, className: "govuk-tag govuk-tag--grey" };
  }
  if (["oral", "written", "supplementary"].includes(s)) {
    return { label: status, className: "govuk-tag govuk-tag--blue" };
  }
  
  return { label: status, className: "govuk-tag govuk-tag--blue" };
}

function getHouseLabel(house: string, county?: string) {
  if (house === "national-assembly") return "National Assembly";
  if (house === "senate") return "Senate";
  if (house === "county-assembly") return county ? `${county} County Assembly` : "County Assembly";
  return house;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let question: Question | null = null;

  try {
    question = await sanityClient.fetch(
      `*[_type == "parliamentaryQuestion" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        questionNumber,
        house,
        county,
        askedBy,
        directedTo,
        askedDate,
        answeredDate,
        status,
        parliamentaryTerm,
        summary,
        fullQuestionText,
        answerText,
        topics,
        hansardUrl,
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
    console.error("Error fetching parliamentary question:", error);
  }

  if (!question) {
    notFound();
  }

  const statusBadge = getStatusBadge(question.status);
  const houseLabel = getHouseLabel(question.house, question.county);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Questions Tracker", href: "/legislature/tracker/questions" },
          { text: question.questionNumber, href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">{houseLabel}</span>
            <h1 className="govuk-heading-xl">{question.title}</h1>
            
            <div className="govuk-!-margin-bottom-4">
              <span className={statusBadge.className}>{statusBadge.label}</span>
            </div>

            <p className="govuk-body-l govuk-!-margin-bottom-2">
              <strong>{question.questionNumber}</strong>
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Key Information */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-m">Question Details</h2>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Asked by</dt>
                <dd className="govuk-summary-list__value">{question.askedBy}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Directed to</dt>
                <dd className="govuk-summary-list__value">{question.directedTo}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Asked on</dt>
                <dd className="govuk-summary-list__value">
                  {new Date(question.askedDate).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              {question.answeredDate && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Answered on</dt>
                  <dd className="govuk-summary-list__value">
                    {new Date(question.answeredDate).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Parliamentary Term</dt>
                <dd className="govuk-summary-list__value">{question.parliamentaryTerm}</dd>
              </div>
            </dl>
          </div>

          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-m">Quick Actions</h2>
            <div className="govuk-button-group">
              <Link 
                href="/legislature/tracker/questions" 
                className="govuk-button govuk-button--secondary"
              >
                ← Back to Questions Tracker
              </Link>
              
              {question.hansardUrl && (
                <a 
                  href={question.hansardUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="govuk-button"
                >
                  View in Hansard →
                </a>
              )}
            </div>

            {question.topics && question.topics.length > 0 && (
              <div className="govuk-!-margin-top-4">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Topics</h3>
                <div>
                  {question.topics.map((topic, i) => (
                    <span key={i} className="govuk-tag govuk-tag--blue govuk-!-margin-right-1 govuk-!-margin-bottom-1">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Question Text */}
        {question.fullQuestionText && question.fullQuestionText.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Full Question</h2>
              <div className="govuk-body">
                <PortableText value={question.fullQuestionText} />
              </div>
            </div>
          </div>
        )}

        {/* Answer / Response */}
        {question.answerText && question.answerText.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-4">
                <h2 className="govuk-panel__title">Official Answer / Response</h2>
              </div>
              <div className="govuk-body">
                <PortableText value={question.answerText} />
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {question.documents && question.documents.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Documents</h2>
              <ul className="govuk-list govuk-list--bullet">
                {question.documents.map((doc, index) => (
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
                      <span className="govuk-!-margin-left-2 govuk-body-s govuk-!-colour-secondary">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-KE")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Short Summary (if no full text) */}
        {!question.fullQuestionText && question.summary && question.summary.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Summary</h2>
              <div className="govuk-body">
                <PortableText value={question.summary} />
              </div>
            </div>
          </div>
        )}

        {/* Footer navigation */}
        <div className="govuk-!-margin-top-8">
          <Link 
            href="/legislature/tracker/questions" 
            className="govuk-link govuk-!-font-weight-bold"
          >
            ← Back to all Parliamentary Questions
          </Link>
        </div>

        <div className="govuk-!-margin-top-8">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}
