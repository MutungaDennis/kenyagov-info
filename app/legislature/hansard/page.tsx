import Link from "next/link";
import { createClient } from "next-sanity";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

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
  houseType: "national-assembly" | "senate" | "county-assembly";
  countyName?: string;
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
}

export default async function HansardHub() {
  let recentSittings: Sitting[] = [];

  try {
    recentSittings = await sanityClient.fetch(`
      *[_type == "hansardSitting"] 
      | order(sittingDate desc) [0...20] {
        _id, title, slug, houseType, countyName, sittingDate, sittingPeriod, parliamentaryTerm, youtubeUrl
      }
    `);
  } catch (error) {
    console.error("Sanity fetch error (Hansard Hub):", error);
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
              Official verbatim record of proceedings in the National Assembly, Senate, and County Assemblies.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Search */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <form action="/legislature/hansard/search" method="GET">
              <div className="govuk-form-group govuk-!-margin-bottom-2">
                <label className="govuk-label govuk-label--m" htmlFor="search">
                  Search debates, members, bills or topics
                </label>
                <div className="govuk-input__wrapper">
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="search"
                    name="q"
                    type="search"
                    placeholder="e.g. Finance Bill, Hon. Kimani Ichung’wah, Health"
                  />
                  <button type="submit" className="govuk-button govuk-button--secondary">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Key Moments - Compact */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-2">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-0">Recent Key Moments</h2>
              <Link href="/legislature/hansard" className="govuk-link govuk-!-font-size-16">View all →</Link>
            </div>

            {recentSittings.length > 0 ? (
              <div className="govuk-grid-row">
                {recentSittings.slice(0, 3).map((sitting) => (
                  <div key={sitting._id} className="govuk-grid-column-one-third">
                    <div className="govuk-!-margin-bottom-3">
                      <Link 
                        href={`/legislature/hansard/${sitting.houseType}/${sitting.sittingDate}`} 
                        className="govuk-link govuk-!-font-weight-bold"
                      >
                        {new Date(sitting.sittingDate).toLocaleDateString("en-KE", { 
                          weekday: "short", month: "short", day: "numeric" 
                        })} — {sitting.sittingPeriod}
                      </Link>
                      <div className="govuk-body-s govuk-!-margin-top-1" style={{ color: '#505a5f' }}>
                        {sitting.houseType.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="govuk-body-s">No recent sittings available.</p>
            )}
          </div>
        </div>

        {/* National Assembly - Compact List */}
        <div className="govuk-grid-row govuk-!-margin-bottom-5">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-2">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-0">National Assembly</h2>
              <Link href="/legislature/hansard/national-assembly" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-16">
                View all →
              </Link>
            </div>

            {nationalAssembly.length > 0 ? (
              <ul className="govuk-list govuk-!-margin-bottom-0" style={{ borderTop: '1px solid #b1b4b6' }}>
                {nationalAssembly.slice(0, 8).map((sitting) => (
                  <li key={sitting._id} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid #f3f2f1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div>
                      <Link 
                        href={`/legislature/hansard/national-assembly/${sitting.sittingDate}`} 
                        className="govuk-link"
                      >
                        <strong>
                          {new Date(sitting.sittingDate).toLocaleDateString("en-KE", { 
                            weekday: "short", month: "short", day: "numeric" 
                          })}
                        </strong>{" "}
                        — {sitting.sittingPeriod}
                      </Link>
                    </div>
                    <div className="govuk-body-s" style={{ color: '#505a5f', whiteSpace: 'nowrap' }}>
                      {sitting.parliamentaryTerm}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="govuk-body-s">No recent sittings available.</p>
            )}
          </div>
        </div>

        {/* Senate - Compact List */}
        <div className="govuk-grid-row govuk-!-margin-bottom-5">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-2">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-0">Senate</h2>
              <Link href="/legislature/hansard/senate" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-16">
                View all →
              </Link>
            </div>

            {senate.length > 0 ? (
              <ul className="govuk-list govuk-!-margin-bottom-0" style={{ borderTop: '1px solid #b1b4b6' }}>
                {senate.slice(0, 6).map((sitting) => (
                  <li key={sitting._id} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid #f3f2f1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Link 
                      href={`/legislature/hansard/senate/${sitting.sittingDate}`} 
                      className="govuk-link"
                    >
                      <strong>
                        {new Date(sitting.sittingDate).toLocaleDateString("en-KE", { 
                          weekday: "short", month: "short", day: "numeric" 
                        })}
                      </strong>{" "}
                      — {sitting.sittingPeriod}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="govuk-body-s">No recent Senate sittings available.</p>
            )}
          </div>
        </div>

        {/* County Assemblies - Compact List */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-2">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-0">County Assemblies</h2>
              <Link href="/legislature/hansard/county-assemblies" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-16">
                Browse all counties →
              </Link>
            </div>

            {countyAssemblies.length > 0 ? (
              <ul className="govuk-list govuk-!-margin-bottom-0" style={{ borderTop: '1px solid #b1b4b6' }}>
                {countyAssemblies.slice(0, 6).map((sitting) => (
                  <li key={sitting._id} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid #f3f2f1' 
                  }}>
                    <Link 
                      href={`/legislature/hansard/county-assemblies/${sitting.countyName?.toLowerCase()}/${sitting.sittingDate}`} 
                      className="govuk-link"
                    >
                      <strong>{sitting.countyName} County</strong> — {sitting.sittingPeriod} 
                      <span className="govuk-body-s govuk-!-margin-left-2" style={{ color: '#505a5f' }}>
                        ({new Date(sitting.sittingDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })})
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="govuk-body-s">No County Assembly Hansard available yet.</p>
            )}
          </div>
        </div>

        {/* Browse by Topic */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Browse by Topic</h2>
            <div className="govuk-button-group">
              {["Finance", "Health", "Education", "Budget", "Agriculture", "Security", "Devolution"].map((topic) => (
                <Link
                  key={topic}
                  href={`/legislature/hansard/search?topic=${topic.toLowerCase()}`}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-1"
                  style={{ padding: '4px 12px', fontSize: '14px' }}
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