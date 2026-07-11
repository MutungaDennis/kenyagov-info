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

interface Sitting {
  _id: string;
  title: string;
  slug: { current: string };
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
  editorialSummary?: any[];
  topics?: string[];
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    term?: string;
  }>;
}

export default async function SenateArchive({ searchParams }: PageProps) {
  const { q = "", term = "" } = await searchParams;

  let sittings: Sitting[] = [];

  try {
    let filter = `_type == "hansardSitting" && houseType == "senate"`;

    if (q) {
      filter += ` && (title match "*${q}*" || topics match "*${q}*")`;
    }
    if (term) {
      filter += ` && parliamentaryTerm match "*${term}*"`;
    }

    sittings = await sanityClient.fetch(`
      *[${filter}] 
      | order(sittingDate desc) [0...50] {
        _id,
        title,
        slug,
        sittingDate,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl,
        "editorialSummary": editorialSummary[0...2],
        topics
      }
    `);
  } catch (error) {
    console.error("Error fetching Senate sittings:", error);
  }

  const uniqueTerms = Array.from(
    new Set(sittings.map((s) => s.parliamentaryTerm).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Hansard", href: "/legislature/hansard" },
          { text: "Senate", href: "" },
        ]}
      />

      
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">Senate Hansard</h1>
            <p className="govuk-body-l">
              Official records of debates and proceedings in the Senate.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <form method="GET">
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="q">Search</label>
                    <input
                      className="govuk-input"
                      id="q"
                      name="q"
                      type="search"
                      defaultValue={q}
                      placeholder="Search title or topic..."
                    />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
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
              </div>
              <button type="submit" className="govuk-button govuk-button--secondary">
                Apply Filters
              </button>
              {(q || term) && (
                <Link href="/legislature/hansard/senate" className="govuk-link govuk-!-margin-left-3">
                  Clear filters
                </Link>
              )}
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">
              {sittings.length} Sitting{sittings.length !== 1 ? "s" : ""} Found
            </h2>

            {sittings.length > 0 ? (
              <div className="govuk-grid-row">
                {sittings.map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-half">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link 
                            href={`/legislature/hansard/senate/${sitting.sittingDate}`} 
                            className="govuk-link"
                          >
                            {new Date(sitting.sittingDate).toLocaleDateString("en-KE", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s govuk-!-margin-bottom-1">
                          <strong>{sitting.sittingPeriod}</strong> • {sitting.parliamentaryTerm}
                        </p>

                        {sitting.editorialSummary && sitting.editorialSummary.length > 0 && (
                          <div className="govuk-body-s govuk-!-margin-bottom-2">
                            <PortableText value={sitting.editorialSummary} />
                          </div>
                        )}

                        {sitting.topics && sitting.topics.length > 0 && (
                          <div className="govuk-!-margin-bottom-2">
                            {sitting.topics.slice(0, 4).map((topic, i) => (
                              <span key={i} className="govuk-tag govuk-tag--blue govuk-!-margin-right-1 govuk-!-font-size-14">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {sitting.youtubeUrl && (
                          <a 
                            href={sitting.youtubeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="govuk-link govuk-!-font-weight-bold"
                          >
                            Watch video →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s">No sittings found</h3>
                <p className="govuk-body">
                  {q || term 
                    ? "No results match your current filters." 
                    : "No Senate Hansard records have been added yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
        </div>
      
    
  
  </>
);
}