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

export const revalidate = 3600; // ISR - revalidate every hour

interface ParliamentaryQuestion {
  _id: string;
  title: string;
  slug: { current: string };
  questionNumber: string;
  house: "national-assembly" | "senate" | "county-assembly";
  county?: string;
  askedBy: string;
  directedTo: string;
  askedDate: string;
  answeredDate?: string;
  status: string;
  parliamentaryTerm: string;
  summary?: any[];
  topics?: string[];
  hansardUrl?: string;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    house?: string;
    status?: string;
    term?: string;
  }>;
}

// Helper to get appropriate tag colour for question status
function getStatusTagClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("answer") || s.includes("respond")) {
    return "govuk-tag--green";
  }
  if (s.includes("unanswer") || s.includes("pend") || s.includes("overdue")) {
    return "govuk-tag--red";
  }
  if (s.includes("defer") || s.includes("withdraw") || s.includes("lapse")) {
    return "govuk-tag--grey";
  }
  if (s.includes("oral") || s.includes("written")) {
    return "govuk-tag--blue";
  }
  return "govuk-tag--grey";
}

export default async function QuestionsTracker({ searchParams }: PageProps) {
  const { q = "", house = "", status = "", term = "" } = await searchParams;

  let questions: ParliamentaryQuestion[] = [];

  try {
    let filter = `_type == "parliamentaryQuestion"`;

    if (q) {
      filter += ` && (
        title match "*${q}*" || 
        questionNumber match "*${q}*" || 
        askedBy match "*${q}*" ||
        directedTo match "*${q}*" ||
        topics match "*${q}*"
      )`;
    }

    if (house) {
      filter += ` && house == "${house}"`;
    }

    if (status) {
      filter += ` && status match "*${status}*"`;
    }

    if (term) {
      filter += ` && parliamentaryTerm match "*${term}*"`;
    }

    questions = await sanityClient.fetch(`
      *[${filter}] 
      | order(askedDate desc) [0...100] {
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
        "summary": summary[0...2],
        topics,
        hansardUrl
      }
    `);
  } catch (error) {
    console.error("Error fetching parliamentary questions:", error);
  }

  // Derive unique filter options from current results
  const uniqueTerms = Array.from(
    new Set(questions.map((q) => q.parliamentaryTerm).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const uniqueStatuses = Array.from(
    new Set(questions.map((q) => q.status).filter(Boolean))
  ).sort();

  const houseOptions = [
    { value: "", label: "All Houses" },
    { value: "national-assembly", label: "National Assembly" },
    { value: "senate", label: "Senate" },
    { value: "county-assembly", label: "County Assemblies" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Tracker", href: "/legislature/tracker" },
          { text: "Questions", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">Parliamentary Questions Tracker</h1>
            <p className="govuk-body-l">
              Track written and oral questions asked by Members of Parliament and Senators to the Executive. 
              Monitor response status, key dates, and accountability in real time.
            </p>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-inset-text govuk-!-margin-top-2">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Tip:</strong> Questions are a vital tool for parliamentary oversight. 
                Most must be answered within 7–14 days depending on the House.
              </p>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-full">
            <form method="GET" className="govuk-!-margin-bottom-4">
              <div className="govuk-grid-row">
                {/* Search */}
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="q">Search Questions</label>
                    <input
                      className="govuk-input"
                      id="q"
                      name="q"
                      type="search"
                      defaultValue={q}
                      placeholder="Question number, subject, MP, Minister..."
                    />
                  </div>
                </div>

                {/* House Filter */}
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="house">House</label>
                    <select className="govuk-select" id="house" name="house" defaultValue={house}>
                      {houseOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="govuk-grid-column-one-third">
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
              </div>

              <div className="govuk-grid-row">
                {/* Parliamentary Term */}
                <div className="govuk-grid-column-one-third">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="term">Parliamentary Term</label>
                    <select className="govuk-select" id="term" name="term" defaultValue={term}>
                      <option value="">All Terms</option>
                      {uniqueTerms.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="govuk-grid-column-two-thirds govuk-!-padding-top-6">
                  <button type="submit" className="govuk-button govuk-button--secondary govuk-!-margin-right-2">
                    Apply Filters
                  </button>
                  {(q || house || status || term) && (
                    <Link 
                      href="/legislature/tracker/questions" 
                      className="govuk-link govuk-!-margin-left-2"
                    >
                      Clear all filters
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Summary */}
        <div className="govuk-grid-row govuk-!-margin-bottom-4">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
              {questions.length} Question{questions.length !== 1 ? "s" : ""} Found
            </h2>
            <p className="govuk-body-s govuk-!-margin-bottom-4">
              Showing the most recent parliamentary questions. Data sourced from official Hansard and parliamentary records.
            </p>
          </div>
        </div>

        {/* Questions List */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            {questions.length > 0 ? (
              <div className="govuk-grid-row">
                {questions.map((question) => {
                  const statusClass = getStatusTagClass(question.status);
                  const houseLabel = 
                    question.house === "national-assembly" ? "National Assembly" :
                    question.house === "senate" ? "Senate" : 
                    question.county ? `${question.county} County Assembly` : "County Assembly";

                  return (
                    <div key={question._id} className="govuk-grid-column-one-half govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card">
                        <div className="govuk-summary-card__title-wrapper">
                          <h3 className="govuk-summary-card__title">
                            <Link 
                              href={`/legislature/tracker/questions/${question.slug.current}`} 
                              className="govuk-link"
                            >
                              {question.questionNumber} — {question.title.length > 80 ? question.title.substring(0, 77) + "..." : question.title}
                            </Link>
                          </h3>
                        </div>
                        <div className="govuk-summary-card__content">
                          {/* House + Status */}
                          <div className="govuk-!-margin-bottom-2">
                            <span className="govuk-tag govuk-tag--blue govuk-!-margin-right-2">
                              {houseLabel}
                            </span>
                            <span className={`govuk-tag ${statusClass}`}>
                              {question.status}
                            </span>
                          </div>

                          {/* Key metadata */}
                          <dl className="govuk-summary-list govuk-summary-list--no-border govuk-!-margin-bottom-3">
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
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </dd>
                              </div>
                            )}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">Term</dt>
                              <dd className="govuk-summary-list__value">{question.parliamentaryTerm}</dd>
                            </div>
                          </dl>

                          {/* Short summary */}
                          {question.summary && question.summary.length > 0 && (
                            <div className="govuk-body-s govuk-!-margin-bottom-3">
                              <PortableText value={question.summary} />
                            </div>
                          )}

                          {/* Topics */}
                          {question.topics && question.topics.length > 0 && (
                            <div className="govuk-!-margin-bottom-2">
                              {question.topics.slice(0, 5).map((topic, i) => (
                                <span 
                                  key={i} 
                                  className="govuk-tag govuk-tag--grey govuk-!-margin-right-1 govuk-!-font-size-14"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="govuk-!-margin-top-2">
                            <Link 
                              href={`/legislature/tracker/questions/${question.slug.current}`} 
                              className="govuk-link govuk-!-font-weight-bold govuk-!-margin-right-3"
                            >
                              View full question &amp; response →
                            </Link>
                            {question.hansardUrl && (
                              <a 
                                href={question.hansardUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="govuk-link"
                              >
                                View in Hansard →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s">No questions found</h3>
                <p className="govuk-body">
                  {q || house || status || term 
                    ? "No questions match your current filters. Try broadening your search or clearing filters."
                    : "No parliamentary questions have been added to the tracker yet. Check back soon or explore the Hansard archives for recent debates."}
                </p>
                {(q || house || status || term) && (
                  <Link href="/legislature/tracker/questions" className="govuk-button govuk-button--secondary govuk-!-margin-top-2">
                    Clear filters
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Helpful footer section */}
        <div className="govuk-grid-row govuk-!-margin-top-8">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">About Parliamentary Questions in Kenya</h2>
            <p className="govuk-body">
              Parliamentary Questions allow Members of the National Assembly and Senators to hold the Executive 
              to account. Questions can be <strong>oral</strong> (asked during Question Time) or <strong>written</strong> 
              (submitted in advance and published with answers).
            </p>
            <p className="govuk-body">
              The Executive is generally required to respond within set deadlines. Unanswered questions may be 
              followed up through supplementary questions, motions, or referral to relevant committees.
            </p>
            <p className="govuk-body">
              <Link href="/legislature/hansard" className="govuk-link">Browse Hansard records</Link> to see 
              full debates around these questions, or visit the <Link href="/legislature" className="govuk-link">Legislature homepage</Link> for more tools.
            </p>
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}
