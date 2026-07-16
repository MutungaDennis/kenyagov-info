import Link from "next/link";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

// ============================================
// SANITY CLIENT (same as main Hansard hub)
// ============================================
const sanityClient = createSanityClient();

export const revalidate = 3600; // ISR: Revalidate every hour

// ============================================
// TYPES
// ============================================
interface Sitting {
  _id: string;
  title: string;
  slug: { current: string };
  houseType: "national-assembly" | "senate" | "county-assembly";
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
}

export default async function NationalAssemblyHansard() {
  let recentSittings: Sitting[] = [];

  // Fetch recent National Assembly sittings (safe fetch)
  try {
    recentSittings = await sanityClient.fetch(`
      *[_type == "hansardSitting" && houseType == "national-assembly"] 
      | order(sittingDate desc) [0...10] {
        _id,
        title,
        slug,
        sittingDate,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl
      }
    `);
  } catch (error) {
    console.error("Sanity fetch error (National Assembly Hansard):", error);
  }

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "National Assembly", href: "/legislature/national-assembly" },
          { text: "Hansard", href: "" },
        ]}
      />

      
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Republic of Kenya</span>
            <h1 className="govuk-heading-xl">National Assembly Hansard</h1>
            <p className="govuk-body-l">
              The official verbatim record of debates, questions, and proceedings 
              in the National Assembly.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Quick Actions */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-half">
            <Link 
              href="/legislature/hansard" 
              className="govuk-button govuk-button--secondary govuk-!-width-full"
            >
              Search all Hansard →
            </Link>
          </div>
          <div className="govuk-grid-column-one-half">
            <Link 
              href="/government/legislature/hansard/members?house=National Assembly" 
              className="govuk-button govuk-!-width-full"
            >
              Find National Assembly Members →
            </Link>
          </div>
        </div>

        {/* Recent Sittings */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            <div className="govuk-!-display-flex govuk-!-align-items-center govuk-!-justify-content-space-between govuk-!-margin-bottom-4">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-0">Recent Sittings</h2>
              <Link 
                href="/legislature/hansard" 
                className="govuk-link govuk-!-font-weight-bold"
              >
                View full archive →
              </Link>
            </div>

            {recentSittings.length > 0 ? (
              <div className="govuk-grid-row">
                {recentSittings.map((sitting) => (
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
                              month: "long",
                              day: "numeric",
                            })}
                          </Link>
                        </h3>
                      </div>
                      <div className="govuk-summary-card__content">
                        <p className="govuk-body-s govuk-!-margin-bottom-1">
                          {sitting.sittingPeriod} • {sitting.parliamentaryTerm}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="govuk-inset-text">
                <p className="govuk-body">
                  No recent National Assembly sittings have been added yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Simple footer note */}
        <p className="govuk-body-s" style={{ color: "#505a5f" }}>
          Data sourced from official Hansard reports of the National Assembly of Kenya.
        </p>
      
    
  
  </>
);
}