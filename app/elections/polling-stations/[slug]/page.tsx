// app/elections/polling-stations/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

// Election year configuration
const ELECTION_YEAR = 2022;
const POLLING_STATIONS_TABLE = `polling_stations_${ELECTION_YEAR}`;
const VOTERS_COLUMN = `registered_voters_${ELECTION_YEAR}`;

export const revalidate = 3600;

// SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: station } = await supabase
    .from(POLLING_STATIONS_TABLE)
    .select(`
      name,
      polling_station_code,
      counties ( name ),
      constituencies ( name ),
      wards ( name )
    `)
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!station) {
    return {
      title: "Polling station not found | Elections | CitizenGuide.KE",
    };
  }

  const countyName = (station.counties as any)?.name || "";
  const constituencyName = (station.constituencies as any)?.name || "";
  const description = `Polling station ${station.polling_station_code} — ${station.name} in ${countyName}. View registered voters and location details for the ${ELECTION_YEAR} General Election.`;

  return {
    title: `${station.name} | Polling Stations | CitizenGuide.KE`,
    description,
    openGraph: {
      title: station.name,
      description,
      type: "article",
    },
  };
}

export default async function PollingStationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: station, error } = await supabase
    .from(POLLING_STATIONS_TABLE)
    .select(`
      id,
      slug,
      name,
      polling_station_code,
      reg_centre_code,
      reg_centre_name,
      stream_number,
      ${VOTERS_COLUMN},
      latitude,
      longitude,
      ward_id,
      counties ( name, code ),
      constituencies ( name, constituency_code ),
      wards ( name, ward_code )
    `)
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !station) {
    notFound();
  }

  const county = (station.counties as any) || {};
  const constituency = (station.constituencies as any) || {};
  const ward = (station.wards as any) || {};
  const voters = (station as any)[VOTERS_COLUMN] || 0;

  const { data: relatedStations } = await supabase
    .from(POLLING_STATIONS_TABLE)
    .select("id, slug, name, polling_station_code, stream_number, reg_centre_name")
    .eq("ward_id", station.ward_id)
    .eq("is_active", true)
    .neq("id", station.id)
    .order("polling_station_code", { ascending: true })
    .limit(5);

  const hasCoordinates = station.latitude && station.longitude;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${station.latitude},${station.longitude}`
    : null;

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Polling stations", href: "/elections/polling-stations" },
          { text: station.name, href: `/elections/polling-stations/${station.slug}` },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-xl">
              Polling station · {ELECTION_YEAR} General Election
            </span>
            <h1 className="govuk-heading-xl">{station.name}</h1>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <dl className="app-station-details">
                <div>
                  <dt className="govuk-body-s"><strong>IEBC code</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">
                    <code className="app-station-code">{station.polling_station_code}</code>
                  </dd>
                </div>
                <div>
                  <dt className="govuk-body-s"><strong>Registration centre</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">
                    {station.reg_centre_name || "—"}
                    {station.reg_centre_code && (
                      <span className="govuk-body-s govuk-!-margin-left-1">
                        (Code: {station.reg_centre_code})
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="govuk-body-s"><strong>Stream</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">
                    {station.stream_number || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="govuk-body-s"><strong>Registered voters</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">
                    <strong>{voters.toLocaleString()}</strong>
                  </dd>
                </div>
              </dl>
            </div>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Location</h2>
              
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">County</dt>
                  <dd className="govuk-summary-list__value">
                    {county.name || "—"}
                    {county.code && (
                      <span className="govuk-body-s govuk-!-margin-left-1">
                        (Code: {county.code})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Constituency</dt>
                  <dd className="govuk-summary-list__value">{constituency.name || "—"}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Ward</dt>
                  <dd className="govuk-summary-list__value">{ward.name || "—"}</dd>
                </div>
                {hasCoordinates && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Coordinates</dt>
                    <dd className="govuk-summary-list__value">
                      {station.latitude}, {station.longitude}
                      {mapsUrl && (
                        <>
                          <br />
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="govuk-link"
                          >
                            View on Google Maps
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              focusable="false"
                              style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                          </a>
                        </>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">About this polling station</h2>
              <p className="govuk-body">
                <strong>{station.name}</strong> is a polling station located in{' '}
                {ward.name || "the area"}, {constituency.name || "the constituency"},{' '}
                {county.name || "the county"}. It is part of registration centre{' '}
                <strong>{station.reg_centre_name || station.name}</strong>.
              </p>
              <p className="govuk-body">
                During the {ELECTION_YEAR} General Election, this station had{' '}
                <strong>{voters.toLocaleString()}</strong> registered voters.
              </p>
              {station.stream_number && (
                <p className="govuk-body">
                  This is stream {station.stream_number} of the polling station.
                  Some polling stations have multiple streams to manage large numbers of voters.
                </p>
              )}
            </section>

            {relatedStations && relatedStations.length > 0 && (
              <>
                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                <section className="govuk-!-margin-bottom-8">
                  <h2 className="govuk-heading-l">
                    Other polling stations in {ward.name || "this ward"}
                  </h2>
                  <p className="govuk-body">
                    There {relatedStations.length === 1 ? "is" : "are"} {relatedStations.length} other{' '}
                    polling station{relatedStations.length === 1 ? "" : "s"} in this ward.
                  </p>
                  <ul className="govuk-list govuk-list--spaced">
                    {relatedStations.map((s: any) => (
                      <li key={s.id}>
                        <Link
                          href={`/elections/polling-stations/${s.slug}`}
                          className="govuk-link"
                        >
                          {s.name}
                        </Link>
                        <span className="govuk-body-s govuk-!-margin-left-1">
                          (Code: {s.polling_station_code})
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated published="2026-01-01" lastUpdated="2026-07-02" />

          </div>

          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/elections/polling-stations" className="govuk-link">
                      All polling stations
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/registered-voters" className="govuk-link">
                      Registered voters and polling stations
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/iebc-offices" className="govuk-link">
                      IEBC constituency offices
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/general-elections" className="govuk-link">
                      General elections
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions/iebc" className="govuk-link">
                      Independent Electoral and Boundaries Commission
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Data source</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Polling station data is provided by the Independent Electoral and Boundaries Commission (IEBC) from the {ELECTION_YEAR} voter register.
                </p>
              </div>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-station-details {
          margin: 0;
        }

        .app-station-details div {
          margin-bottom: 10px;
        }

        .app-station-details dt {
          margin-bottom: 2px;
          color: #505a5f;
        }

        .app-station-details dd {
          margin: 0;
        }

        .app-station-code {
          font-size: 14px;
          color: #505a5f;
          background-color: #f3f2f1;
          padding: 2px 6px;
          border-radius: 2px;
        }
      `}</style>
    
  
  </>
);
}