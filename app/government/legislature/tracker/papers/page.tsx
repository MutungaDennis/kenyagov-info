import Link from "next/link";
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
  topics?: string[];
  documents?: Array<{
    title?: string;
    url: string;
    fileType?: string;
    uploadedAt?: string;
  }>;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    house?: string;
    type?: string;
    status?: string;
    term?: string;
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

export default async function PapersReportsPage({ searchParams }: PageProps) {
  const { q = "", house = "", type = "", status = "", term = "" } = await searchParams;

  let papers: Paper[] = [];

  try {
    let filter = `_type == "paper"`;

    if (q) {
      filter += ` && (
        title match "*${q}*" || 
        referenceNumber match "*${q}*" || 
        topics match "*${q}*" || 
        presentedBy match "*${q}*"
      )`;
    }

    if (house) {
      filter += ` && house == "${house}"`;
    }

    if (type) {
      filter += ` && paperType == "${type}"`;
    }

    if (status) {
      filter += ` && status == "${status}"`;
    }

    if (term) {
      filter += ` && parliamentaryTerm match "*${term}*"`;
    }

    papers = await sanityClient.fetch(`
      *[${filter}] 
      | order(laidDate desc) [0...50] {
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
        "summary": summary[0...2],
        topics,
        documents[0...1] { title, url, fileType, uploadedAt }
      }
    `);
  } catch (error) {
    console.error("Error fetching parliamentary papers:", error);
  }

  // Dynamic filter options from current results (TypeScript-safe)
  const uniqueStatuses = Array.from(
    new Set(
      papers
        .map((p) => p.status)
        .filter((status): status is string => Boolean(status))
    )
  ).sort();

  const uniqueTerms = Array.from(
    new Set(
      papers
        .map((p) => p.parliamentaryTerm)
        .filter((term): term is string => Boolean(term))
    )
  ).sort((a, b) => b.localeCompare(a));

  const uniqueTypes = Array.from(
    new Set(
      papers
        .map((p) => p.paperType)
        .filter((type): type is string => Boolean(type))
    )
  ).sort();

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Tracker", href: "/legislature/tracker" },
          { text: "Papers & Reports", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">Parliamentary Papers &amp; Reports</h1>
            <p className="govuk-body-l">
              Official papers, committee reports, sessional papers, annual reports, and other documents laid before the National Assembly, Senate, and County Assemblies.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-full">
            <form method="GET">
              <div className="govuk-grid-row">
                {/* Search */}
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="q">Search</label>
                    <input
                      className="govuk-input"
                      id="q"
                      name="q"
                      type="search"
                      defaultValue={q}
                      placeholder="Title, reference, presenter..."
                    />
                  </div>
                </div>

                {/* House */}
                <div className="govuk-grid-column-one-sixth">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="house">House</label>
                    <select className="govuk-select" id="house" name="house" defaultValue={house}>
                      <option value="">All Houses</option>
                      <option value="national-assembly">National Assembly</option>
                      <option value="senate">Senate</option>
                      <option value="county-assembly">County Assembly</option>
                    </select>
                  </div>
                </div>

                {/* Paper Type */}
                <div className="govuk-grid-column-one-sixth">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="type">Type</label>
                    <select className="govuk-select" id="type" name="type" defaultValue={type}>
                      <option value="">All Types</option>
                      {uniqueTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="govuk-grid-column-one-sixth">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="status">Status</label>
                    <select className="govuk-select" id="status" name="status" defaultValue={status}>
                      <option value="">All Statuses</option>
                      {uniqueStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Parliamentary Term */}
                <div className="govuk-grid-column-one-sixth">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="term">Term</label>
                    <select className="govuk-select" id="term" name="term" defaultValue={term}>
                      <option value="">All Terms</option>
                      {uniqueTerms.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="govuk-button-group">
                <button type="submit" className="govuk-button govuk-button--secondary">
                  Apply Filters
                </button>
                {(q || house || type || status || term) && (
                  <Link href="/legislature/tracker/papers" className="govuk-link govuk-!-margin-left-3">
                    Clear all filters
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">
              {papers.length} Paper{papers.length !== 1 ? "s" : ""} Found
            </h2>

            {papers.length > 0 ? (
              <div className="govuk-grid-row">
                {papers.map((paper) => (
                  <div key={paper._id} className="govuk-grid-column-one-half">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link
                            href={`/legislature/tracker/papers/${paper.slug.current}`}
                            className="govuk-link"
                          >
                            {paper.referenceNumber ? `${paper.referenceNumber} — ` : ""}
                            {paper.title}
                          </Link>
                        </h3>
                      </div>

                      <div className="govuk-summary-card__content">
                        <div className="govuk-!-margin-bottom-2">
                          <span className={`govuk-tag ${getStatusClass(paper.status)} govuk-!-margin-right-1`}>
                            {paper.status}
                          </span>
                          <span className="govuk-tag govuk-tag--blue govuk-!-font-size-14">
                            {getHouseLabel(paper.house, paper.county)}
                          </span>
                          {paper.paperType && (
                            <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14 govuk-!-margin-left-1">
                              {paper.paperType}
                            </span>
                          )}
                        </div>

                        <p className="govuk-body-s govuk-!-margin-bottom-1">
                          <strong>Laid:</strong>{" "}
                          {new Date(paper.laidDate).toLocaleDateString("en-KE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {paper.presentedBy && <> • <strong>By:</strong> {paper.presentedBy}</>}
                        </p>

                        {paper.parliamentaryTerm && (
                          <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <strong>Term:</strong> {paper.parliamentaryTerm}
                          </p>
                        )}

                        {paper.summary && paper.summary.length > 0 && (
                          <div className="govuk-body-s govuk-!-margin-bottom-2">
                            <PortableText value={paper.summary} />
                          </div>
                        )}

                        {paper.topics && paper.topics.length > 0 && (
                          <div className="govuk-!-margin-bottom-2">
                            {paper.topics.slice(0, 4).map((topic, i) => (
                              <span
                                key={i}
                                className="govuk-tag govuk-tag--blue govuk-!-margin-right-1 govuk-!-font-size-14"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quick document link if available */}
                        {paper.documents && paper.documents.length > 0 && paper.documents[0].url && (
                          <a
                            href={paper.documents[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="govuk-link govuk-!-font-weight-bold"
                          >
                            Download document →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s">No papers found</h3>
                <p className="govuk-body">
                  {q || house || type || status || term
                    ? "No results match your current filters. Try broadening your search or clearing filters."
                    : "No parliamentary papers or reports have been added to the tracker yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Helpful information */}
        <div className="govuk-grid-row govuk-!-margin-top-8">
          <div className="govuk-grid-column-two-thirds">
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  What are Parliamentary Papers &amp; Reports?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  Parliamentary papers include Sessional Papers, Committee Reports, Annual Reports, 
                  Budget Papers, White Papers, and other official documents formally laid before 
                  the National Assembly, Senate, or County Assemblies. They form a critical part of 
                  legislative transparency and public accountability in Kenya.
                </p>
                <p className="govuk-body">
                  Use the filters above to explore documents by House, type, status, or parliamentary term. 
                  Click any paper to view its full details, timeline, and downloadable files.
                </p>
              </div>
            </details>
          </div>
        </div>

        <div className="govuk-!-margin-top-6">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}