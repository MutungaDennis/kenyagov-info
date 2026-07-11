import Link from "next/link";
import { createClient } from "next-sanity";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { PortableText } from "@portabletext/react";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600;

interface Document {
  title: string;
  url: string;
  fileType?: string;
  uploadedAt?: string;
}

interface TimelineStage {
  stage: string;
  date: string;
  description?: string;
  status?: string;
  notes?: string;
}

interface RelatedBill {
  _id: string;
  title: string;
  slug: { current: string };
  billNumber: string;
  status: string;
}

interface Bill {
  _id: string;
  title: string;
  slug: { current: string };
  billNumber: string;
  house: "national-assembly" | "senate" | "county-assembly";
  county?: string;
  billType?: string;
  sponsor?: string;
  introducedDate: string;
  status: string;
  lastActionDate?: string;
  parliamentaryTerm?: string;
  summary?: any[];
  topics?: string[];
  timeline?: TimelineStage[];
  documents?: Document[];
  relatedBills?: RelatedBill[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getStatusTagClass(status: string): string {
  const s = status.toLowerCase();
  if (["passed", "assented", "enacted", "signed into law", "became act"].some((k) => s.includes(k))) {
    return "govuk-tag--green";
  }
  if (["rejected", "withdrawn", "lapsed", "negatived", "defeated"].some((k) => s.includes(k))) {
    return "govuk-tag--red";
  }
  if (["committee", "second reading", "first reading", "third reading", "referred"].some((k) => s.includes(k))) {
    return "govuk-tag--blue";
  }
  return "govuk-tag--grey";
}

function formatHouse(house: string, county?: string): string {
  if (house === "county-assembly" && county) return `${county} County Assembly`;
  if (house === "national-assembly") return "National Assembly";
  if (house === "senate") return "Senate";
  return house;
}

export default async function BillDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let bill: Bill | null = null;

  try {
    bill = await sanityClient.fetch(
      `*[_type == "bill" && slug.current == $slug][0]{
        _id, title, slug, billNumber, house, county, billType, sponsor,
        introducedDate, status, lastActionDate, parliamentaryTerm,
        summary, topics,
        timeline[] { stage, date, description, status, notes },
        documents[] { title, url, fileType, uploadedAt },
        "relatedBills": relatedBills[]->{
          _id, title, slug, billNumber, status
        }
      }`,
      { slug }
    );
  } catch (error) {
    console.error("Error fetching bill from Sanity:", error);
  }

  if (!bill) {
    return (
  <>
      
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Legislature", href: "/legislature" },
            { text: "Bills Tracker", href: "/legislature/tracker/bills" },
            { text: "Not found", href: "" },
          ]}
        />
        
          <h1 className="govuk-heading-xl">Bill not found</h1>
          <p className="govuk-body">The bill you are looking for does not exist.</p>
          <Link href="/legislature/tracker/bills" className="govuk-button">
            Browse all bills
          </Link>
        
      
    
  </>
);
  }

  const statusClass = getStatusTagClass(bill.status);
  const houseDisplay = formatHouse(bill.house, bill.county);

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Bills Tracker", href: "/legislature/tracker/bills" },
          { text: bill.billNumber || bill.title, href: "" },
        ]}
      />

      
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">{houseDisplay}</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              {bill.billNumber && <span className="govuk-!-font-weight-regular">{bill.billNumber}: </span>}
              {bill.title}
            </h1>

            <div className="govuk-!-margin-bottom-4">
              <span className={`govuk-tag ${statusClass} govuk-!-font-size-19`}>{bill.status}</span>
            </div>

            <p className="govuk-body-l">
              {bill.sponsor && <>Sponsored by <strong>{bill.sponsor}</strong><br /></>}
              Introduced on <strong>{new Date(bill.introducedDate).toLocaleDateString("en-KE", { 
                year: "numeric", month: "long", day: "numeric" 
              })}</strong>
              {bill.lastActionDate && (
                <> • Last action: <strong>{new Date(bill.lastActionDate).toLocaleDateString("en-KE")}</strong></>
              )}
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Key Information */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-half">
            <h2 className="govuk-heading-m">Key Information</h2>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">House</dt>
                <dd className="govuk-summary-list__value">{houseDisplay}</dd>
              </div>
              {bill.billType && (
                <div className="govuk-summary-list__row">
                  <dt>Bill Type</dt>
                  <dd>{bill.billType}</dd>
                </div>
              )}
              {bill.parliamentaryTerm && (
                <div className="govuk-summary-list__row">
                  <dt>Term</dt>
                  <dd>{bill.parliamentaryTerm}</dd>
                </div>
              )}
              {bill.sponsor && (
                <div className="govuk-summary-list__row">
                  <dt>Sponsor</dt>
                  <dd>{bill.sponsor}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="govuk-grid-column-one-half">
            {bill.topics && bill.topics.length > 0 && (
              <>
                <h2 className="govuk-heading-m">Topics</h2>
                <div className="govuk-!-margin-bottom-4">
                  {bill.topics.map((topic, i) => (
                    <span key={i} className="govuk-tag govuk-tag--blue govuk-!-margin-right-1">{topic}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {bill.summary && bill.summary.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Summary</h2>
              <div className="govuk-body">
                <PortableText value={bill.summary} />
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {bill.timeline && bill.timeline.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">Legislative Timeline</h2>
              {bill.timeline
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((stage, index) => (
                  <div key={index} className="govuk-summary-card govuk-!-margin-bottom-3">
                    <div className="govuk-summary-card__title-wrapper">
                      <h3 className="govuk-summary-card__title">{stage.stage}</h3>
                      <span className="govuk-caption-m">
                        {new Date(stage.date).toLocaleDateString("en-KE", { 
                          weekday: "long", year: "numeric", month: "long", day: "numeric" 
                        })}
                      </span>
                    </div>
                    <div className="govuk-summary-card__content">
                      {stage.description && <p className="govuk-body-s">{stage.description}</p>}
                      {stage.notes && <p className="govuk-body-s govuk-!-font-style-italic">{stage.notes}</p>}
                      {stage.status && (
                        <span className={`govuk-tag ${getStatusTagClass(stage.status)} govuk-!-margin-top-2`}>
                          {stage.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {bill.documents && bill.documents.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Documents</h2>
              <ul className="govuk-list govuk-list--bullet">
                {bill.documents.map((doc, index) => (
                  <li key={index}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="govuk-link">
                      {doc.title} {doc.fileType && `(${doc.fileType})`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Related Bills */}
        {bill.relatedBills && bill.relatedBills.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">Related Bills</h2>
              <div className="govuk-grid-row">
                {bill.relatedBills.map((related) => (
                  <div key={related._id} className="govuk-grid-column-one-half">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link href={`/legislature/tracker/bills/${related.slug.current}`} className="govuk-link">
                            {related.billNumber}
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s">{related.title}</p>
                        <span className={`govuk-tag ${getStatusTagClass(related.status)}`}>
                          {related.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="govuk-button-group">
          <Link href="/legislature/tracker/bills" className="govuk-button govuk-button--secondary">
            ← Back to Bills Tracker
          </Link>
          <Link href="/legislature/hansard" className="govuk-button govuk-button--secondary">
            View Hansard Records
          </Link>
        </div>

        <div className="govuk-!-margin-top-8">
        </div>
      
    
  
  </>
);
}