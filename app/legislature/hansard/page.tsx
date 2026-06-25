import Link from "next/link";
import { createClient } from "next-sanity";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

// ============================================
// SANITY CLIENT (safe initialization)
// ============================================
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600; // ISR: Revalidate every hour

// ============================================
// TYPES
// ============================================
interface Sitting {
  _id: string;
  title: string;
  slug: { current: string };
  houseType: "national-assembly" | "senate" | "county-assembly";
  countyName?: string;
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
  editorialSummary?: any[];
  topics?: string[];
  keyEvents?: string[];
}

export default async function HansardHub() {
  let recentSittings: Sitting[] = [];

  // Safe data fetching - will not crash the page if Sanity is empty or misconfigured
  try {
    recentSittings = await sanityClient.fetch(`
      *[_type == "hansardSitting"] 
      | order(sittingDate desc) [0...12] {
        _id,
        title,
        slug,
        houseType,
        countyName,
        sittingDate,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl,
        "editorialSummary": editorialSummary[0...3],
        topics,
        keyEvents
      }
    `);
  } catch (error) {
    console.error("Sanity fetch error (Hansard Hub):", error);
    // Page will still render with empty state
  }

  const nationalAssembly = recentSittings.filter((s) => s.houseType === "national-assembly");
  const senate = recentSittings.filter((s) => s.houseType === "senate");
  const countyAssemblies = recentSittings.filter((s) => s.houseType === "county-assembly");

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Hansard", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">Hansard</h1>
            <p className="govuk-body-l">
              Read what was said in the National Assembly, Senate, and County Assemblies. 
              Track how your representatives speak and vote.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Search */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <form action="/legislature/hansard/search" method="GET">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="search">
                  Search debates, members, bills or topics
                </label>
                <div className="govuk-input__wrapper">
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="search"
                    name="q"
                    type="search"
                    placeholder="e.g. Finance Bill, Hon. Kimani Ichung’wah, Health, IEBC"
                  />
                  <button type="submit" className="govuk-button govuk-button--secondary">
                    Search
                  </button>
                </div>
              </div>
            </form>
            <p className="govuk-body-s">Search by member name, bill, or topic</p>
          </div>
        </div>

        {/* This Week’s Highlights */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Recent Key Moments</h2>

            {recentSittings.length > 0 ? (
              <div className="govuk-grid-row">
                {recentSittings.slice(0, 3).map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-third">
                    <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-4">
                      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                        <Link 
                          href={`/legislature/hansard/${sitting.houseType}/${sitting.sittingDate}`} 
                          className="govuk-link"
                        >
                          {sitting.title}
                        </Link>
                      </h3>
                      <p className="govuk-body-s govuk-!-margin-bottom-2">
                        {new Date(sitting.sittingDate).toLocaleDateString("en-KE", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        • {sitting.sittingPeriod}
                      </p>
                      {sitting.youtubeUrl && (
                        <a 
                          href={sitting.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="govuk-link govuk-!-font-size-16"
                        >
                          Watch video →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="govuk-inset-text">
                <p className="govuk-body">No recent Hansard sittings have been added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* National Assembly */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-3">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-0">National Assembly</h2>
              <Link href="/legislature/hansard/national-assembly" className="govuk-link govuk-!-font-weight-bold">
                View full archive →
              </Link>
            </div>

            {nationalAssembly.length > 0 ? (
              <div className="govuk-grid-row">
                {nationalAssembly.slice(0, 4).map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-half">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link 
                            href={`/legislature/hansard/national-assembly/${sitting.sittingDate}`} 
                            className="govuk-link"
                          >
                            {new Date(sitting.sittingDate).toLocaleDateString("en-KE", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            — {sitting.sittingPeriod}
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s govuk-!-margin-bottom-1">{sitting.parliamentaryTerm}</p>
                        {sitting.youtubeUrl && (
                          <a href={sitting.youtubeUrl} target="_blank" rel="noopener noreferrer" className="govuk-link">
                            Watch video →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="govuk-body-s">No recent National Assembly sittings available.</p>
            )}
          </div>
        </div>

        {/* Senate */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-3">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-0">Senate</h2>
              <Link href="/legislature/hansard/senate" className="govuk-link govuk-!-font-weight-bold">
                View full archive →
              </Link>
            </div>

            {senate.length > 0 ? (
              <div className="govuk-grid-row">
                {senate.slice(0, 3).map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-third">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link 
                            href={`/legislature/hansard/senate/${sitting.sittingDate}`} 
                            className="govuk-link"
                          >
                            {new Date(sitting.sittingDate).toLocaleDateString("en-KE", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s">{sitting.sittingPeriod}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="govuk-body-s">No recent Senate sittings available.</p>
            )}
          </div>
        </div>

        {/* County Assemblies */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">County Assemblies</h2>
            <p className="govuk-body">
              Hansard from Kenya’s 47 County Assemblies.{" "}
              <Link href="/legislature/hansard/county-assemblies" className="govuk-link govuk-!-font-weight-bold">
                Browse all counties →
              </Link>
            </p>

            {countyAssemblies.length > 0 ? (
              <div className="govuk-grid-row">
                {countyAssemblies.slice(0, 3).map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-third">
                    <div className="govuk-summary-card govuk-!-margin-bottom-4">
                      <div className="govuk-summary-card__title-wrapper">
                        <h3 className="govuk-summary-card__title">
                          <Link 
                            href={`/legislature/hansard/county-assemblies/${sitting.countyName?.toLowerCase()}/${sitting.sittingDate}`} 
                            className="govuk-link"
                          >
                            {sitting.countyName} County Assembly
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s govuk-!-margin-bottom-0">
                          {new Date(sitting.sittingDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })} • {sitting.sittingPeriod}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="govuk-body-s">No County Assembly Hansard has been added yet.</p>
            )}
          </div>
        </div>

        {/* Browse by Topic */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Browse by Topic</h2>
            <div className="govuk-button-group">
              {["Finance", "Health", "Education", "IEBC", "Budget", "Agriculture", "Security", "Devolution"].map((topic) => (
                <Link
                  key={topic}
                  href={`/legislature/hansard/search?topic=${topic.toLowerCase()}`}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-2"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}