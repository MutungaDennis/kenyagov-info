// app/open-data/page.tsx
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import PageIntro from "@/components/site/PageIntro";
import GovUKSummaryList from "@/components/govuk/SummaryList";

export const revalidate = 3600;

/** Counts change slowly — ISR, no cookies. */

export const metadata = {
  title: "Open data",
  description:
    "Download government data in open formats. Use it to build tools, do research or check facts.",
};

export default async function OpenDataPage() {
  const supabase = createPublicClient();

  const [countiesRes, wardsRes, institutionsRes, pollingRes, leadersRes] = await Promise.all([
    supabase.from("counties").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("wards").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("institutions").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("polling_stations_2022").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("leaders").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const stats = {
    counties: countiesRes.count ?? 0,
    wards: wardsRes.count ?? 0,
    institutions: institutionsRes.count ?? 0,
    pollingStations: pollingRes.count ?? 0,
    leaders: leadersRes.count ?? 0,
  };

  const lastUpdated = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data" },
        ]}
        title="Open data"
        lead="Download government data in open formats. Use it to build tools, do research or check facts."
      />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* What data is available */}
            <h2 className="govuk-heading-l">What data is available</h2>
            <p className="govuk-body">
              We provide structured datasets about the Kenyan government. All data is compiled from official public records.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Counties", value: stats.counties.toLocaleString() },
                { key: "Wards", value: stats.wards.toLocaleString() },
                { key: "Government institutions", value: stats.institutions.toLocaleString() },
                { key: "Polling stations (2022)", value: stats.pollingStations.toLocaleString() },
                { key: "Current leaders", value: stats.leaders.toLocaleString() },
              ]}
            />

            <p className="govuk-body-s">
              Data last refreshed: {lastUpdated}.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Where the data comes from */}
            <h2 className="govuk-heading-l">Where the data comes from</h2>
            <p className="govuk-body">
              The data on this page comes from official Kenyan government sources. It is information that is already in the public domain. We have collected it and made it available in convenient, structured formats.
            </p>
            <p className="govuk-body">
              Our sources include:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the Independent Electoral and Boundaries Commission (IEBC) — for polling stations, wards and voter registration data</li>
              <li>the Kenya Gazette — for institutional records and leadership appointments</li>
              <li>the Commission on Revenue Allocation (CRA) — for county data and population figures</li>
              <li>Parliamentary records (Hansard) — for leadership and institutional information</li>
              <li>official government websites and press releases</li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Using the data */}
            <h2 className="govuk-heading-l">Using the data</h2>
            <p className="govuk-body">
              Because this data comes from public government sources, you are free to use it. You can:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>download and share it</li>
              <li>use it in your own research or analysis</li>
              <li>build applications or tools with it</li>
              <li>publish it in reports or articles</li>
            </ul>
            <p className="govuk-body">
              We ask that you:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>credit CitizenGuide.KE as the source of the compilation</li>
              <li>where possible, also credit the original government source (for example, "Data from IEBC via CitizenGuide.KE")</li>
              <li>do not present the data as your own original research</li>
            </ul>
            <p className="govuk-body">
              No registration or payment is required.
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Available datasets */}
            <h2 className="govuk-heading-l">Available datasets</h2>
            <p className="govuk-body">
              Each dataset is available as CSV or JSON. Use the links below to download.
            </p>

            {/* Counties */}
            <h3 className="govuk-heading-m">Counties of Kenya</h3>
            <p className="govuk-body">
              All 47 counties with names, codes, population, area and current leaders.
            </p>
            <p className="govuk-body">
              <a 
                href="/api/data/exports/counties?format=csv" 
                className="govuk-button govuk-button--secondary"
                download
              >
                Download CSV
              </a>
              <a 
                href="/api/data/exports/counties?format=json" 
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                download
              >
                Download JSON
              </a>
            </p>

            {/* Wards */}
            <h3 className="govuk-heading-m">Wards, constituencies and counties</h3>
            <p className="govuk-body">
              All wards linked to their constituencies and counties, with 2022 voter registration numbers.
            </p>
            <p className="govuk-body">
              <a 
                href="/api/data/exports/wards?format=csv" 
                className="govuk-button govuk-button--secondary"
                download
              >
                Download CSV
              </a>
              <a 
                href="/api/data/exports/wards?format=json" 
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                download
              >
                Download JSON
              </a>
            </p>
            <p className="govuk-body-s">
              You can filter the data by adding parameters to the URL. For example, <code>?county=Nairobi</code> or <code>?constituency=Westlands</code>.
            </p>

            {/* Institutions */}
            <h3 className="govuk-heading-m">Government institutions and agencies</h3>
            <p className="govuk-body">
              National and county government institutions, including their type, level and arm of government.
            </p>
            <p className="govuk-body">
              <a 
                href="/api/data/exports/institutions?format=csv" 
                className="govuk-button govuk-button--secondary"
                download
              >
                Download CSV
              </a>
              <a 
                href="/api/data/exports/institutions?format=json" 
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                download
              >
                Download JSON
              </a>
            </p>

            {/* Polling Stations */}
            <h3 className="govuk-heading-m">Polling stations (IEBC 2022)</h3>
            <p className="govuk-body">
              All polling stations with codes, names, ward locations and registered voter numbers.
            </p>
            <p className="govuk-body">
              <a 
                href="/api/data/exports/polling-stations?format=csv" 
                className="govuk-button govuk-button--secondary"
                download
              >
                Download CSV
              </a>
              <a 
                href="/api/data/exports/polling-stations?format=json" 
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                download
              >
                Download JSON
              </a>
            </p>
            <p className="govuk-body-s">
              Source: Independent Electoral and Boundaries Commission (IEBC).
            </p>

            {/* Leaders */}
            <h3 className="govuk-heading-m">National and county leaders</h3>
            <p className="govuk-body">
              Current governors, members of parliament, senators, women representatives and other office holders.
            </p>
            <p className="govuk-body">
              <a 
                href="/api/data/exports/leaders?format=csv" 
                className="govuk-button govuk-button--secondary"
                download
              >
                Download CSV
              </a>
              <a 
                href="/api/data/exports/leaders?format=json" 
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                download
              >
                Download JSON
              </a>
            </p>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Programmatic access */}
            <h2 className="govuk-heading-l">Programmatic access</h2>
            <p className="govuk-body">
              All datasets are also available through a simple API. No API key is required.
            </p>
            <p className="govuk-body">
              The full catalogue of available endpoints is at:
            </p>
            <p className="govuk-body">
              <code>https://citizenguide.ke/api/data/datasets</code>
            </p>
            <p className="govuk-body">
              Example requests:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <code>GET /api/data/exports/wards</code> — returns all wards as CSV
              </li>
              <li>
                <code>GET /api/data/exports/wards?format=json</code> — returns all wards as JSON
              </li>
              <li>
                <code>GET /api/data/exports/wards?county=Nairobi</code> — returns wards in Nairobi County
              </li>
              <li>
                <code>GET /api/data/exports/institutions?format=json</code> — returns all institutions as JSON
              </li>
            </ul>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Data documentation */}
            <h2 className="govuk-heading-l">Data documentation</h2>
            <p className="govuk-body">
              Field definitions for the main datasets.
            </p>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Wards dataset fields</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>ward_code</strong> — official IEBC code</li>
                  <li><strong>name</strong> — ward name</li>
                  <li><strong>constituency_name</strong> — the constituency the ward belongs to</li>
                  <li><strong>county_name</strong> — the county the ward belongs to</li>
                  <li><strong>registered_voters_2022</strong> — number of registered voters as of 2022</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Counties dataset fields</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>code</strong> — official county code</li>
                  <li><strong>name</strong> — county name</li>
                  <li><strong>region</strong> — the broader region (for example, Rift Valley, Coast)</li>
                  <li><strong>headquarters</strong> — the county headquarters town</li>
                  <li><strong>population</strong> — population based on the most recent census</li>
                  <li><strong>area_km2</strong> — area in square kilometres</li>
                  <li><strong>governor_name</strong> — current governor</li>
                  <li><strong>senator_name</strong> — current senator</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Institutions dataset fields</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>name</strong> — full official name of the institution</li>
                  <li><strong>short_name</strong> — abbreviation or acronym (if applicable)</li>
                  <li><strong>institution_type</strong> — for example, Ministry, State Department, Commission</li>
                  <li><strong>arm_of_government</strong> — Executive, Judiciary, Parliament or Independent</li>
                  <li><strong>government_level</strong> — National or County</li>
                </ul>
              </div>
            </details>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Feedback */}
            <h2 className="govuk-heading-l">Feedback and corrections</h2>
            <p className="govuk-body">
              If you find an error in the data, or if you have suggestions for additional datasets, please{' '}
              <Link href="/contact" className="govuk-link">
                contact us
              </Link>
              .
            </p>

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/government/institutions" className="govuk-link">
                      All government institutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/counties" className="govuk-link">
                      County governments
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      Government officials
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections" className="govuk-link">
                      Elections
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="govuk-link">
                      About CitizenGuide.KE
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      
    
  
    </>
);
}