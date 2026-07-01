// app/government/presidential-visits/[slug]/page.tsx
'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "next-sanity";
import { PortableText } from "@portabletext/react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

// Configure Sanity Client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-06-19",
  useCdn: true,
});

// Type Definitions
type SpeechItem = {
  _key: string;
  title: string;
  deliveryDate?: string;
  forum?: string;
  speechText?: string;
  speechDocument?: {
    asset: {
      url: string;
      size?: number;
    };
  };
};

type OutcomeAgreement = {
  _key: string;
  title?: string;
  details?: string;
};

type PresidentialTrip = {
  _id: string;
  title: string;
  slug: { current: string };
  destinationCountry: string;
  destinationCities?: string[];
  tripType: string;
  departureDate: string;
  returnDate?: string;
  purpose?: any[];
  focusSectors?: string[];
  outcomes?: OutcomeAgreement[];
  financialCommitments?: string;
  officialLink?: string;
  tripDocument?: {
    asset: {
      url: string;
      size?: number;
    };
  };
  speeches?: SpeechItem[];
};

// GROQ Query to fetch trip by slug
const TRIP_QUERY = `*[_type == "presidentialTrip" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  destinationCountry,
  destinationCities,
  tripType,
  departureDate,
  returnDate,
  purpose,
  focusSectors,
  outcomes,
  financialCommitments,
  officialLink,
  "tripDocument": tripDocument {
    "asset": asset-> {
      url,
      size
    }
  },
  speeches[] {
    _key,
    title,
    deliveryDate,
    forum,
    speechText,
    "speechDocument": speechDocument {
      "asset": asset-> {
        url,
        size
      }
    }
  }
}`;

// Utility Functions
function formatTripDates(departure: string, returning?: string): string {
  if (!departure) return "Date unrecorded";
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const depDate = new Date(departure).toLocaleDateString('en-GB', options);
  if (!returning) return depDate;
  const retDate = new Date(returning).toLocaleDateString('en-GB', options);
  return `${depDate} to ${retDate}`;
}

function formatClassification(typeString: string): string {
  const maps: Record<string, string> = {
    'state-visit': 'State Visit',
    'official-visit': 'Official Visit',
    'working-visit': 'Working Visit',
    'summit': 'Summit',
    'regional-mission': 'Regional Mission'
  };
  return maps[typeString] || typeString || 'Official Engagement';
}

function formatDocumentMeta(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "PDF, size unknown";
  if (bytes < 1048576) {
    return `PDF, ${(bytes / 1024).toFixed(0)}KB`;
  }
  return `PDF, ${(bytes / 1048576).toFixed(1)}MB`;
}

export default function PresidentialTripDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [trip, setTrip] = useState<PresidentialTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!slug) return;

      try {
        const data = await sanityClient.fetch(TRIP_QUERY, { slug });
        
        if (!data) {
          throw new Error('Trip not found');
        }
        
        setTrip(data);
      } catch (err: any) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading trip details...</p>
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "Presidential Visits", href: "/government/presidential-visits" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">
            The presidential trip you are looking for does not exist or has been removed.
          </p>
          <Link href="/government/presidential-visits" className="govuk-link">
            Return to all presidential visits
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Presidential Visits", href: "/government/presidential-visits" },
          { text: trip.title, href: `/government/presidential-visits/${trip.slug.current}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Header Section */}
            <div className="trip-profile__header">
              <span className="govuk-caption-l">
                {formatClassification(trip.tripType)}
              </span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                {trip.title}
              </h1>
              
              <div className="govuk-body-l govuk-!-margin-bottom-6">
                <strong>{trip.destinationCountry}</strong>
                {trip.destinationCities && trip.destinationCities.length > 0 && (
                  <span className="govuk-body">
                    {" "}({trip.destinationCities.join(", ")})
                  </span>
                )}
              </div>

              <p className="govuk-body govuk-!-margin-bottom-6">
                <strong>Dates:</strong> {formatTripDates(trip.departureDate, trip.returnDate)}
              </p>
            </div>

            {/* Key Information Summary */}
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Trip Type</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--blue">
                    {formatClassification(trip.tripType)}
                  </strong>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Destination</dt>
                <dd className="govuk-summary-list__value">
                  {trip.destinationCountry}
                  {trip.destinationCities && trip.destinationCities.length > 0 && (
                    <span className="govuk-body-s govuk-!-display-block govuk-!-margin-top-1">
                      Cities: {trip.destinationCities.join(", ")}
                    </span>
                  )}
                </dd>
              </div>

              {trip.focusSectors && trip.focusSectors.length > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Focus Sectors</dt>
                  <dd className="govuk-summary-list__value">
                    <ul className="govuk-list govuk-!-margin-bottom-0">
                      {trip.focusSectors.map((sector, index) => (
                        <li key={index}>{sector}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}

              {trip.financialCommitments && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Financial Commitments</dt>
                  <dd className="govuk-summary-list__value">
                    <strong className="govuk-!-font-size-24">{trip.financialCommitments}</strong>
                  </dd>
                </div>
              )}
            </dl>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Purpose & Objectives */}
            {trip.purpose && trip.purpose.length > 0 && (
              <>
                <h2 className="govuk-heading-l">Purpose and Objectives</h2>
                <div className="govuk-body">
                  <PortableText value={trip.purpose} />
                </div>
              </>
            )}

            {/* Key Outcomes & MoUs */}
            {trip.outcomes && trip.outcomes.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Outcomes and Agreements</h2>
                <p className="govuk-body">
                  The following bilateral frameworks, treaties, and MoUs were formalised during this visit:
                </p>
                <ul className="govuk-list govuk-list--spaced">
                  {trip.outcomes.map((outcome) => (
                    <li key={outcome._key}>
                      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                        {outcome.title || 'Unnamed Agreement'}
                      </h3>
                      {outcome.details && (
                        <p className="govuk-body-s govuk-!-margin-bottom-0">
                          {outcome.details}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Speeches Section */}
            {trip.speeches && trip.speeches.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Speeches and Addresses Delivered</h2>
                <p className="govuk-body">
                  The President delivered {trip.speeches.length} {trip.speeches.length === 1 ? 'address' : 'addresses'} during this trip:
                </p>

                {trip.speeches.map((speech) => (
                  <div key={speech._key} className="speech-item govuk-!-margin-bottom-6">
                    <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                      {speech.title}
                    </h3>

                    <dl className="govuk-summary-list govuk-summary-list--no-border govuk-!-margin-bottom-4">
                      {speech.deliveryDate && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Date Delivered</dt>
                          <dd className="govuk-summary-list__value">
                            {new Date(speech.deliveryDate).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </dd>
                        </div>
                      )}
                      {speech.forum && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Forum</dt>
                          <dd className="govuk-summary-list__value">{speech.forum}</dd>
                        </div>
                      )}
                    </dl>

                    {speech.speechText && (
                      <details className="govuk-details govuk-!-margin-bottom-4">
                        <summary className="govuk-details__summary">
                          <span className="govuk-details__summary-text">
                            Read speech summary
                          </span>
                        </summary>
                        <div className="govuk-details__text">
                          <p className="govuk-body">{speech.speechText}</p>
                        </div>
                      </details>
                    )}

                    {speech.speechDocument?.asset?.url && (
                      <p className="govuk-body">
                        <Link 
                          href={speech.speechDocument.asset.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="govuk-link govuk-!-font-weight-bold"
                        >
                          Download speech transcript ({formatDocumentMeta(speech.speechDocument.asset.size)})
                        </Link>
                      </p>
                    )}

                    {trip.speeches!.indexOf(speech) < trip.speeches!.length - 1 && (
                      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Official Documents */}
            {(trip.tripDocument?.asset?.url || trip.officialLink) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Official Documents</h2>
                <ul className="govuk-list govuk-list--spaced">
                  {trip.tripDocument?.asset?.url && (
                    <li>
                      <Link 
                        href={trip.tripDocument.asset.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="govuk-link govuk-!-font-weight-bold"
                      >
                        Download official report / joint communiqué ({formatDocumentMeta(trip.tripDocument.asset.size)})
                      </Link>
                    </li>
                  )}
                  {trip.officialLink && (
                    <li>
                      <Link 
                        href={trip.officialLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="govuk-link"
                      >
                        View official press release (external link)
                      </Link>
                    </li>
                  )}
                </ul>
              </>
            )}

          </div>
          
          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Related content
              </h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/government/presidential-visits" className="govuk-link">
                      All presidential visits
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The Cabinet
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet-decisions" className="govuk-link">
                      Cabinet decisions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/executive-orders" className="govuk-link">
                      Executive orders
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}