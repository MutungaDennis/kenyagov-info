import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const dynamic = 'force-dynamic';

export default async function OpenDataPage() {
  const supabase = await createClient();

  // Fetch lightweight stats to show current data holdings (GOV.UK loves transparency)
  const [countiesRes, wardsRes, institutionsRes, pollingRes] = await Promise.all([
    supabase.from("counties").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("wards").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("institutions").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("polling_stations_2022").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const stats = {
    counties: countiesRes.count ?? 0,
    wards: wardsRes.count ?? 0,
    institutions: institutionsRes.count ?? 0,
    pollingStations: pollingRes.count ?? 0,
  };

  const lastUpdated = new Date().toISOString().split("T")[0];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Open data</h1>

            <p className="govuk-body-l">
              We publish data to help citizens, researchers, journalists and developers understand and improve public services in Kenya.
            </p>

            <div className="govuk-inset-text">
              <strong>Open by default.</strong> All datasets listed here are available for free use, reuse and redistribution.
            </div>

            {/* Licence - prominent GOV.UK style */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6">Licence and reuse</h2>
            <p className="govuk-body">
              Unless otherwise stated, the data on this page is licensed under the{" "}
              <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" className="govuk-link" target="_blank" rel="noopener noreferrer">
                Open Government Licence v3.0
              </a>{" "}
              (adapted for use in Kenya).
            </p>
            <p className="govuk-body govuk-!-margin-bottom-4">
              You are free to:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>copy, publish, distribute and transmit the information</li>
              <li>adapt the information</li>
              <li>exploit the information commercially and non-commercially</li>
            </ul>
            <p className="govuk-body">
              You must acknowledge the source as <strong>CitizenGuide.KE</strong> and, where possible, provide a link back to this page.
            </p>

            {/* Current data holdings - shows the data is live */}
            <h2 className="govuk-heading-m govuk-!-margin-top-8">Current data holdings</h2>
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-half">
                <p className="govuk-body govuk-!-margin-bottom-1">
                  <strong className="govuk-heading-m govuk-!-margin-bottom-0">{stats.counties.toLocaleString()}</strong><br />
                  Counties
                </p>
              </div>
              <div className="govuk-grid-column-one-half">
                <p className="govuk-body govuk-!-margin-bottom-1">
                  <strong className="govuk-heading-m govuk-!-margin-bottom-0">{stats.wards.toLocaleString()}</strong><br />
                  Wards
                </p>
              </div>
              <div className="govuk-grid-column-one-half">
                <p className="govuk-body govuk-!-margin-bottom-1">
                  <strong className="govuk-heading-m govuk-!-margin-bottom-0">{stats.institutions.toLocaleString()}</strong><br />
                  Government institutions &amp; agencies
                </p>
              </div>
              <div className="govuk-grid-column-one-half">
                <p className="govuk-body">
                  <strong className="govuk-heading-m govuk-!-margin-bottom-0">{stats.pollingStations.toLocaleString()}</strong><br />
                  Polling stations (2022)
                </p>
              </div>
            </div>

            <p className="govuk-body-s govuk-!-margin-bottom-6">
              Data last refreshed: {lastUpdated}. All exports are generated on demand from live public records.
            </p>

            <div className="govuk-inset-text">
              <strong>How to use the data freely:</strong> You can download, share, modify, build apps on top of, or publish derivative works from these datasets. Just credit "Source: CitizenGuide.KE". No registration or payment required.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-top-6">Programmatic access &amp; discovery</h2>
            <p className="govuk-body">
              A machine-readable catalogue of all open datasets is available at:
            </p>
            <pre className="govuk-body-s" style={{ background: "#f3f2f1", padding: "8px" }}>
https://citizenguide.ke/api/data/datasets
            </pre>

            {/* Datasets - clear GOV.UK list style */}
            <h2 className="govuk-heading-m">Available datasets</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              All files are provided in <strong>CSV</strong> (UTF-8) and <strong>JSON</strong> formats. Use <code>?format=json</code> on any endpoint. Machine-readable and ready for Excel, Python, R, GIS tools, etc.
            </p>

            <p className="govuk-body-s govuk-!-margin-bottom-6">
              For a machine-readable list of all available datasets: <a href="/api/data/datasets?format=json" className="govuk-link">/api/data/datasets</a>
            </p>

            <div className="govuk-!-margin-bottom-6">
              {/* Counties */}
              <div className="govuk-!-margin-bottom-4" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "12px" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  Counties of Kenya
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  Names, codes, regions, headquarters, population and area for all 47 counties. Includes governor and senator names where available.
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  <a href="/api/data/exports/counties?format=csv" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download CSV
                  </a>
                  <a href="/api/data/exports/counties?format=json" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 govuk-!-margin-left-1" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download JSON
                  </a>
                  <span className="govuk-body-s govuk-!-margin-left-2">Updated daily</span>
                </p>
              </div>

              {/* Wards */}
              <div className="govuk-!-margin-bottom-4" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "12px" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  Wards, Constituencies and Counties
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  Complete mapping of all wards to their parent constituencies and counties, including 2022 registered voter numbers.
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  <a href="/api/data/exports/wards?format=csv" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download CSV
                  </a>
                  <a href="/api/data/exports/wards?format=json" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 govuk-!-margin-left-1" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download JSON
                  </a>
                  <span className="govuk-body-s govuk-!-margin-left-2">Supports ?county= and ?constituency= filters</span>
                </p>
              </div>

              {/* Institutions */}
              <div className="govuk-!-margin-bottom-4" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "12px" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  Government Institutions and Agencies
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  National and county-level institutions, ministries, state departments and agencies with type, level and high-level description.
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  <a href="/api/data/exports/institutions?format=csv" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download CSV
                  </a>
                  <a href="/api/data/exports/institutions?format=json" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 govuk-!-margin-left-1" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download JSON
                  </a>
                </p>
              </div>

              {/* Polling Stations */}
              <div className="govuk-!-margin-bottom-4" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "12px" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  Polling Stations (IEBC 2022)
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  Official polling station codes, names, registration centres and voter numbers. Filterable by county, constituency and ward.
                </p>
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  <a href="/api/data/exports/polling-stations?format=csv" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download CSV
                  </a>
                  <a href="/api/data/exports/polling-stations?format=json" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 govuk-!-margin-left-1" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download JSON
                  </a>
                  <span className="govuk-body-s govuk-!-margin-left-2">Useful for election analysis</span>
                </p>
              </div>

              {/* Leaders (added for completeness) */}
              <div>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  National and County Leaders
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-1">
                  Key leaders including governors, senators, MPs and other constitutional office holders with roles and organizations.
                </p>
                <p className="govuk-body-s">
                  <a href="/api/data/exports/leaders?format=csv" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download CSV
                  </a>
                  <a href="/api/data/exports/leaders?format=json" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0 govuk-!-margin-left-1" style={{ padding: "6px 12px", fontSize: "14px" }} download>
                    Download JSON
                  </a>
                </p>
              </div>
            </div>

            {/* Programmatic access */}
            <h2 className="govuk-heading-m govuk-!-margin-top-8">Programmatic access</h2>
            <p className="govuk-body">
              All datasets above are also available via simple HTTP GET requests. No API key required.
            </p>
            <pre className="govuk-body-s" style={{ background: "#f3f2f1", padding: "12px", overflowX: "auto" }}>
{`# CSV (default)
curl "https://citizenguide.ke/api/data/exports/wards"

# JSON format (great for developers)
curl "https://citizenguide.ke/api/data/exports/wards?format=json"

# Filtered CSV
curl "https://citizenguide.ke/api/data/exports/wards?county=Nairobi"`}
            </pre>

            {/* Schemas */}
            <h2 className="govuk-heading-m govuk-!-margin-top-8">Data documentation</h2>
            <p className="govuk-body">
              Field definitions and structure for the main datasets:
            </p>

            <details className="govuk-details govuk-!-margin-bottom-3">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Wards dataset fields</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-body-s">
                  <li><strong>ward_code</strong> — Official IEBC code</li>
                  <li><strong>name</strong> — Ward name</li>
                  <li><strong>constituency_name</strong></li>
                  <li><strong>county_name</strong></li>
                  <li><strong>registered_voters_2022</strong></li>
                </ul>
              </div>
            </details>

            <details className="govuk-details govuk-!-margin-bottom-6">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Counties dataset fields</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-body-s">
                  <li><strong>code</strong> — County code</li>
                  <li><strong>name</strong></li>
                  <li><strong>region</strong></li>
                  <li><strong>headquarters</strong></li>
                  <li><strong>population</strong>, <strong>area_km2</strong></li>
                  <li><strong>governor_name</strong>, <strong>senator_name</strong></li>
                </ul>
              </div>
            </details>

            <h2 className="govuk-heading-m">Feedback and corrections</h2>
            <p className="govuk-body">
              If you find an error in the data or have suggestions for additional datasets, please{" "}
              <Link href="/contact" className="govuk-link">contact us</Link>. We treat open data quality as a public good.
            </p>

            <div className="govuk-inset-text govuk-!-margin-top-8">
              This page follows the spirit of the UK Government’s{" "}
              <a href="https://www.gov.uk/government/publications/open-data-white-paper-unleashing-the-potential" className="govuk-link" target="_blank" rel="noopener">
                Open Data White Paper
              </a>{" "}
              principles: data should be open, machine-readable, well-documented and free to use.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
