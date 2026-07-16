import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600;



interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PollingStationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch the detailed polling station entry along with parent data connections
  const { data: station, error } = await supabase
    .from("polling_stations_2022")
    .select(`
      id,
      slug,
      name,
      polling_station_code,
      reg_centre_code,
      reg_centre_name,
      stream_number,
      registered_voters_2022,
      latitude,
      longitude,
      is_active,
      created_at,
      updated_at,
      counties ( name, code ),
      constituencies ( name, constituency_code ),
      wards ( name, ward_code )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  // Handle missing rows or database processing failures gracefully
  if (error || !station) {
    notFound();
  }

  // Safely cast relational tables columns arrays
  const countyName = (station.counties as any)?.name || "—";
  const countyCode = (station.counties as any)?.code || "—";
  const constituencyName = (station.constituencies as any)?.name || "—";
  const constituencyCode = (station.constituencies as any)?.constituency_code || "—";
  const wardName = (station.wards as any)?.name || "—";
  const wardCode = (station.wards as any)?.ward_code || "—";

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Polling stations", href: "/elections/polling-stations" },
          { text: station.name, href: "" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* GOV.UK Header Badge */}
            <span className="govuk-caption-l">Official IEBC Electoral Registry (2022)</span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-5">{station.name}</h1>
            
            <p className="govuk-body govuk-!-font-size-19">
              This page contains the official registration metrics and structural metadata profiles for the voting stream located at <strong>{station.reg_centre_name}</strong>.
            </p>

            {/* KEY METRIC HIGHLIGHT PANEL */}
            <div style={{ background: '#f3f2f1', borderLeft: '10px solid #00703c', padding: '20px', marginBottom: '35px' }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                {station.registered_voters_2022?.toLocaleString() || 0}
              </h2>
              <p className="govuk-body govuk-!-margin-0 govuk-!-font-weight-bold">
                Total Registered Voters for the 2022 General Election
              </p>
            </div>

            {/* GOV.UK COMPLIANT SUMMARY TABLE FOR METADATA */}
            <h3 className="govuk-heading-m">Electoral Location Profile</h3>
            <table className="govuk-table govuk-!-margin-bottom-7">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Hierarchical administrative and technical identifier mappings for the polling station stream.
              </caption>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s" style={{ width: '220px' }}>Unique Stream Code</th>
                  <td className="govuk-table__cell govuk-body-s">
                    <code>{station.polling_station_code}</code>
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">Stream Number</th>
                  <td className="govuk-table__cell govuk-body-s">
                    {station.stream_number ? `Stream ${station.stream_number}` : "Single / Main Stream"}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">Registration Centre</th>
                  <td className="govuk-table__cell govuk-body-s">
                    Code {station.reg_centre_code} — {station.reg_centre_name}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">Electoral Ward</th>
                  <td className="govuk-table__cell govuk-body-s">
                    Code {wardCode} — {wardName}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">Constituency</th>
                  <td className="govuk-table__cell govuk-body-s">
                    Code {constituencyCode} — {constituencyName}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">County</th>
                  <td className="govuk-table__cell govuk-body-s">
                    Code {countyCode} — {countyName}
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header govuk-body-s">Geographic Coordinates</th>
                  <td className="govuk-table__cell govuk-body-s">
                    {station.latitude && station.longitude ? (
                      <span>{station.latitude}, {station.longitude}</span>
                    ) : (
                      <span style={{ color: '#505a5f', fontStyle: 'italic' }}>Awaiting GIS shapefile mapping projection</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ACTION LINKS BLOCK */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '45px' }}>
              <Link
                href={`/elections/polling-stations?county=${encodeURIComponent(countyName)}&constituency=${encodeURIComponent(constituencyName)}&ward=${encodeURIComponent(wardName)}`}
                className="govuk-button"
                data-module="govuk-button"
              >
                View all stations in {wardName} Ward
              </Link>
              <Link
                href="/elections/polling-stations"
                className="govuk-link govuk-!-font-size-16"
              >
                Return to full search register
              </Link>
            </div>

          </div>

          {/* SIDEBAR REUSE FOR NATIONAL TRANSPARENCY NOTICE */}
          <div className="govuk-grid-column-one-third">
            <div style={{ borderTop: '2px solid #1d70b8', paddingTop: '15px', background: '#f8f8f8', padding: '15px', border: '1px solid #bfc1c3' }}>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Open Data Compliance</h3>
              <p className="govuk-body-s govuk-!-margin-bottom-2">
                This record reflects gazetted entries accurate to the August 2022 General Election cycle mapping updates.
              </p>
              <p className="govuk-body-s govuk-!-margin-0">
                To report anomalies or omissions, consult the local <Link href="/elections/iebc-offices" className="govuk-link">IEBC Constituency Office</Link>.
              </p>
            </div>
          </div>
        </div>

        
      
    
  
  </>
);
}
