import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "next-sanity";
import { PortableText } from "@portabletext/react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

// ============================================
// SANITY CLIENT
// ============================================
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const revalidate = 3600; // ISR

// ============================================
// TYPES
// ============================================
interface Speech {
  _id: string;
  speakerLabel: string;
  supabaseLeaderId?: string;
  party?: string;
  speechContent: any[];
  videoTimestamp?: number;
  topics?: string[];
  sectionHeader: string;
  isKeyContribution?: boolean;
}

interface Sitting {
  _id: string;
  title: string;
  houseType: string;
  countyName?: string;
  sittingDate: string;
  sittingPeriod: string;
  parliamentaryTerm: string;
  youtubeUrl?: string;
  editorialSummary?: any[];
  keyEvents?: string[];
  topics?: string[];
  speeches: Speech[];
}

// ============================================
// PAGE COMPONENT
// ============================================
interface PageProps {
  params: Promise<{ house: string; date: string }>;
}

export default async function DailySittingPage({ params }: PageProps) {
  const { house, date } = await params;

  // Validate house type
  const validHouses = ["national-assembly", "senate", "county-assembly"];
  if (!validHouses.includes(house)) {
    notFound();
  }

  let sitting: Sitting | null = null;

  try {
    sitting = await sanityClient.fetch(
      `
      *[_type == "hansardSitting" 
        && houseType == $house 
        && sittingDate == $date][0] {
        _id,
        title,
        houseType,
        countyName,
        sittingDate,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl,
        editorialSummary,
        keyEvents,
        topics,
        "speeches": *[_type == "hansardSpeech" && sitting._ref == ^._id] 
          | order(sectionHeader asc, _createdAt asc) {
            _id,
            speakerLabel,
            supabaseLeaderId,
            party,
            speechContent,
            videoTimestamp,
            topics,
            sectionHeader,
            isKeyContribution
          }
      }
      `,
      { house, date }
    );
  } catch (error) {
    console.error("Error fetching sitting:", error);
  }

  // Graceful handling if no data
  if (!sitting) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Legislature", href: "/legislature" },
            { text: "Hansard", href: "/legislature/hansard" },
            { text: house.replace("-", " "), href: `/legislature/hansard/${house}` },
            { text: date, href: "" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Sitting Not Found</h1>
          <p className="govuk-body">
            No Hansard record was found for <strong>{house}</strong> on <strong>{date}</strong>.
          </p>
          <Link href={`/legislature/hansard/${house}`} className="govuk-link">
            ← Back to {house.replace("-", " ")} archive
          </Link>
        </main>
      </div>
    );
  }

  // Group speeches by section
  const groupedSpeeches = sitting.speeches.reduce((acc: Record<string, Speech[]>, speech) => {
    const section = speech.sectionHeader || "General Debate";
    if (!acc[section]) acc[section] = [];
    acc[section].push(speech);
    return acc;
  }, {});

  const sectionNames = Object.keys(groupedSpeeches);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Legislature", href: "/legislature" },
          { text: "Hansard", href: "/legislature/hansard" },
          { text: sitting.houseType.replace("-", " "), href: `/legislature/hansard/${sitting.houseType}` },
          { text: new Date(sitting.sittingDate).toLocaleDateString("en-KE"), href: "" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">
              {sitting.houseType.replace("-", " ").toUpperCase()} • {sitting.parliamentaryTerm}
            </span>
            <h1 className="govuk-heading-xl">{sitting.title}</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-1">
              {new Date(sitting.sittingDate).toLocaleDateString("en-KE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              — {sitting.sittingPeriod}
            </p>
            {sitting.countyName && (
              <p className="govuk-body">{sitting.countyName} County Assembly</p>
            )}
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Editorial Summary */}
        {sitting.editorialSummary && sitting.editorialSummary.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-heading-m">Summary</h2>
              <div className="govuk-inset-text">
                <PortableText value={sitting.editorialSummary} />
              </div>
            </div>
          </div>
        )}

        {/* Key Events */}
        {sitting.keyEvents && sitting.keyEvents.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">Key Events</h2>
              <ul className="govuk-list govuk-list--bullet">
                {sitting.keyEvents.map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Topics */}
        {sitting.topics && sitting.topics.length > 0 && (
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-s">Topics Covered</h2>
              <div className="govuk-button-group">
                {sitting.topics.map((topic, i) => (
                  <span key={i} className="govuk-tag govuk-tag--blue govuk-!-margin-right-1">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Link */}
        {sitting.youtubeUrl && (
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-full">
              <a 
                href={sitting.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="govuk-button govuk-button--secondary"
              >
                Watch full sitting on YouTube →
              </a>
            </div>
          </div>
        )}

        {/* Debate Sections */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Debate Sections</h2>

            {sectionNames.length > 0 ? (
              sectionNames.map((sectionName, index) => (
                <div key={index} className="govuk-!-margin-bottom-8">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-3 border-b pb-2">
                    {sectionName}
                  </h3>

                  <div className="space-y-6">
                    {groupedSpeeches[sectionName].map((speech) => (
                      <div 
                        key={speech._id} 
                        className="govuk-summary-card govuk-!-margin-bottom-4"
                      >
                        <div className="govuk-summary-card__title-wrapper">
                          <h4 className="govuk-summary-card__title">
                            {speech.supabaseLeaderId ? (
                              <Link 
                                href={`/leaders/${speech.supabaseLeaderId}`} 
                                className="govuk-link"
                              >
                                {speech.speakerLabel}
                              </Link>
                            ) : (
                              speech.speakerLabel
                            )}
                            {speech.party && (
                              <span className="govuk-body-s govuk-!-margin-left-2 text-gray-600">
                                ({speech.party})
                              </span>
                            )}
                          </h4>
                        </div>

                        <div className="govuk-summary-card__content">
                          {/* Speech Content */}
                          <div className="prose prose-sm max-w-none govuk-body">
                            <PortableText value={speech.speechContent} />
                          </div>

                          {/* Topics for this speech */}
                          {speech.topics && speech.topics.length > 0 && (
                            <div className="govuk-!-margin-top-3">
                              {speech.topics.map((t, i) => (
                                <span key={i} className="govuk-tag govuk-tag--grey govuk-!-margin-right-1 govuk-!-font-size-14">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Watch Timestamp Link */}
                          {speech.videoTimestamp && sitting.youtubeUrl && (
                            <div className="govuk-!-margin-top-3">
                              <a
                                href={`${sitting.youtubeUrl}&t=${speech.videoTimestamp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="govuk-link govuk-!-font-weight-bold"
                              >
                                ▶ Watch this moment ({Math.floor(speech.videoTimestamp / 60)}m {speech.videoTimestamp % 60}s)
                              </a>
                            </div>
                          )}

                          {speech.isKeyContribution && (
                            <div className="govuk-!-margin-top-2">
                              <span className="govuk-tag govuk-tag--green">Key Contribution</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="govuk-inset-text">
                <p className="govuk-body">No speeches have been added for this sitting yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}