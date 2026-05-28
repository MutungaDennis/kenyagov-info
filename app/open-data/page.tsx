'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export default function OpenDataPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Open data and disclosures", href: "/open-data" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size from xl to l for strict site-wide uniform scales */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Open Data and Disclosures</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-4">
              Access machine-readable administrative datasets, schema architectures, and open public registers maintained on CitizenGuide.KE.
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              All data files are aggregated from audited public records, including the Kenya Gazette, controller of budget summaries, and constitution registers.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Open Data Policy</h2>
            <p className="govuk-body">
              In accordance with international open-data conventions and public access transparency standards, CitizenGuide.KE distributes consolidated datasets under a public domain attribution framework. Developers, civil researchers, and citizens are free to extract, reuse, and redistribute this information without cost.
            </p>

            {/* Section 1: Machine Readable Downloads Sheet */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Available Datasets</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Download complete raw records tables processed into standard comma-separated value (CSV) formats:
            </p>

            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/data/exports/kenya-counties-directory.csv" className="govuk-link govuk-!-font-weight-bold">
                  Counties of Kenya Directory CSV (48KB)
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">
                  &mdash; Contains names, official codes, geographic regions, population densities, and registered leadership names for all 47 counties.
                </span>
              </li>
              <li>
                <Link href="/data/exports/kenya-constituencies-wards.csv" className="govuk-link govuk-!-font-weight-bold">
                  Constituencies and Wards Mapping CSV (310KB)
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">
                  &mdash; Complete relational lookup linking all 1,450 electoral wards back to their parent 290 constituencies and respective county codes.
                </span>
              </li>
              <li>
                <Link href="/data/exports/national-government-ministries.csv" className="govuk-link govuk-!-font-weight-bold">
                  National Executive Ministries &amp; State Departments CSV (115KB)
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">
                  &mdash; Comprehensive structural index details outlining active cabinet portfolios, sub-tier dockets, and administrative head titles.
                </span>
              </li>
            </ul>

            {/* Section 2: Technical API Schema Details - Kept CLOSED for mobile scannability */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Data Schemas &amp; Integration</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Review our structural relational mapping tables to understand the database types when linking into external environments like Supabase or Sanity:
            </p>

            <details className="govuk-details govuk-!-margin-bottom-3" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Wards Table Schema Layout</span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body-s">Core datatypes used inside the administrative ward index mapping tracks:</p>
                <ul className="govuk-list govuk-body-s" style={{ fontFamily: 'monospace', background: '#f8f8f8', padding: '10px', borderLeft: '4px solid #bfc1c3' }}>
                  <li>id: uuid (PRIMARY KEY)</li>
                  <li>slug: text (UNIQUE INDEX)</li>
                  <li>name: text (NOT NULL)</li>
                  <li>ward_code: text</li>
                  <li>constituency_name: text</li>
                  <li>county_name: text</li>
                  <li>registered_voters_2022: integer</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Institutions Table Schema Layout</span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body-s">Core fields tracking national ministries, state departments, and semi-autonomous agencies:</p>
                <ul className="govuk-list govuk-body-s" style={{ fontFamily: 'monospace', background: '#f8f8f8', padding: '10px', borderLeft: '4px solid #bfc1c3' }}>
                  <li>id: uuid (PRIMARY KEY)</li>
                  <li>slug: text (UNIQUE INDEX)</li>
                  <li>name: text (NOT NULL)</li>
                  <li>institution_type: text (&apos;Ministry&apos; | &apos;State Department&apos;)</li>
                  <li>government_level: text (&apos;National&apos; | &apos;County&apos;)</li>
                  <li>parent_institution_id: uuid (FOREIGN KEY)</li>
                </ul>
              </div>
            </details>

            {/* Section 3: Data Quality Disclaimer */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Accuracy and Discrepancy Reporting</h2>
            <p className="govuk-body">
              While data tables undergo rigorous validation cycles against gazetted notices before release, automated parsing updates may occasionally flag formatting discrepancies. If you identify a mismatched ward code or an unaligned expenditure figure within a CSV stream, please submit a structural data check on our <Link href="/contact" className="govuk-link">Contact page</Link> with the specific column reference.
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
