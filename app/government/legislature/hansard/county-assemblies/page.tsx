import Link from "next/link";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { PortableText } from "@portabletext/react";

const sanityClient = createSanityClient();

export const revalidate = 3600;

interface Sitting {
  _id: string;
  title: string;
  slug: { current: string };
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  county?: string;
  youtubeUrl?: string;
  editorialSummary?: any[];
  topics?: string[];
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    county?: string;
    term?: string;
  }>;
}

// Full list of Kenya's 47 counties for the filter dropdown
const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
  "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "West Pokot"
].sort();

export default async function CountyAssembliesArchive({ searchParams }: PageProps) {
  const { q = "", county = "", term = "" } = await searchParams;

  let sittings: Sitting[] = [];

  try {
    let filter = `_type == "hansardSitting" && houseType == "county-assembly"`;

    if (q) {
      filter += ` && (title match "*${q}*" || topics match "*${q}*" || county match "*${q}*")`;
    }
    if (county) {
      filter += ` && county == "${county}"`;
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
        county,
        youtubeUrl,
        "editorialSummary": editorialSummary[0...2],
        topics
      }
    `);
  } catch (error) {
    console.error("Error fetching County Assembly sittings:", error);
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
          { text: "County Assemblies", href: "" },
        ]}
      />

      
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">County Assemblies Hansard</h1>
            <p className="govuk-body-l">
              Official records of debates, questions, and proceedings from Kenya&apos;s 47 County Assemblies.
            </p>
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              Each county has its own County Assembly with independent Hansard records.
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
                      placeholder="Search title, topic or county..."
                    />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="county">County</label>
                    <select className="govuk-select" id="county" name="county" defaultValue={county}>
                      <option value="">All Counties</option>
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="govuk-grid-row">
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
              {(q || county || term) && (
                <Link href="/legislature/hansard/county-assemblies" className="govuk-link govuk-!-margin-left-3">
                  Clear all filters
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
                            href={`/legislature/hansard/county-assemblies/${sitting.slug?.current || sitting.sittingDate}`} 
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
                          <strong>{sitting.county || "Unknown"} County Assembly</strong>
                        </p>
                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                          {sitting.sittingPeriod} • {sitting.parliamentaryTerm}
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
                  {q || county || term 
                    ? "No results match your current filters. Try broadening your search or selecting a different county." 
                    : "No County Assembly Hansard records have been added yet."}
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
