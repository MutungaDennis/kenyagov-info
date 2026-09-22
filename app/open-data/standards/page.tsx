import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { OPEN_DATA_LICENCE, OPEN_DATA_MISSION } from "@/lib/open-data/catalogue";

export const revalidate = 86400;

export const metadata = {
  title: "Open data standards and guidance",
  description:
    "How CitizenGuide.KE publishes open data: metadata, formats, reuse, quality and what we do not publish.",
};

export default function OpenDataStandardsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Standards & guidance" },
        ]}
        title="Data standards and guidance"
        lead="How we choose, document and publish open data so it stays trustworthy and lightweight."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">Our role</h2>
          <p className="govuk-body">{OPEN_DATA_MISSION.role}</p>
          <p className="govuk-body">
            <strong>{OPEN_DATA_MISSION.principle}</strong>
          </p>

          <h2 className="govuk-heading-m">What we publish</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Structured extracts we maintain (Supabase / Sanity)</li>
            <li>Plain-language summaries and small visual aggregates</li>
            <li>CSV/JSON downloads where an export route exists</li>
            <li>Links to official portals we do not host</li>
          </ul>

          <h2 className="govuk-heading-m">What we never publish as open data</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Contact messages, feedback or usefulness votes</li>
            <li>Page-view or search analytics</li>
            <li>User accounts or admin content</li>
            <li>Draft or unpublished editorial material</li>
            <li>Personal data beyond public office-holder directories</li>
          </ul>

          <h2 className="govuk-heading-m">Metadata on every dataset</h2>
          <p className="govuk-body">Each dataset page should state:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>Title and plain-language description</li>
            <li>Publisher (original) and compiler (CitizenGuide.KE)</li>
            <li>Temporal and geographic coverage</li>
            <li>Update frequency</li>
            <li>Licence / reuse terms</li>
            <li>Formats (CSV, JSON) when available</li>
            <li>Field dictionary and known limitations</li>
            <li>Source links where we have them</li>
          </ul>

          <h2 className="govuk-heading-m">Formats and access</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>HTML summary</strong> — figures and accessible bar tables
              (small payloads)
            </li>
            <li>
              <strong>CSV</strong> — preferred for spreadsheets and analysis
            </li>
            <li>
              <strong>JSON</strong> — preferred for software
            </li>
            <li>
              <strong>Catalogue API</strong> —{" "}
              <code>/api/data/datasets</code>
            </li>
          </ul>

          <h2 className="govuk-heading-m">Licence and credit</h2>
          <p className="govuk-body">{OPEN_DATA_LICENCE}</p>
          <p className="govuk-body">Open formats do not require proprietary software. Open reuse also includes commercial use; a non-commercial-only restriction would not meet the <a className="govuk-link" href="https://opendefinition.org/od/2.1/en/">Open Definition</a>. Source attribution and any source-specific rights remain relevant.</p>

          <h2 className="govuk-heading-m">Using the downloads and API</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Use the dataset’s export link with <code>?format=csv</code> or <code>?format=json</code>. No account or API key is needed.</li>
            <li>CSV uses UTF-8, stable field names and quoted cells. Missing values are blank; zero remains zero. JSON preserves nulls, numbers and text identifiers.</li>
            <li>Import identifier columns as text to preserve leading zeros. CSV text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe; JSON preserves the original string.</li>
            <li>Ward exports accept <code>county</code>, <code>constituency</code> and <code>q</code>. Polling-station exports also accept <code>ward</code>. Use exact place names and URL-encode values.</li>
            <li>Example: <a className="govuk-link" href="/api/data/exports/wards?format=json&amp;county=Nairobi">Nairobi wards as JSON</a>.</li>
            <li>Downloads fetch all matching pages, rather than the first 1,000 records. Failed downloads return an error instead of a successful partial extract.</li>
            <li>Response headers include <code>X-Total-Count</code> and <code>X-Generated-At</code>. Generation time is not the date the underlying information was verified.</li>
            <li>These are live extracts, not versioned statistical releases. Records can change while a large download is being generated. Retain your downloaded file when citing it.</li>
          </ul>

          <h2 className="govuk-heading-m">Quality principles</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Prefer stable public sources over scraping private systems</li>
            <li>Mark snapshots (for example 2022 polling stations) clearly</li>
            <li>Do not imply KNBS, IEBC or other endorsement without agreement</li>
            <li>Keep interactive pages light; put bulk data on downloads</li>
            <li>
              Follow open-data maturity ideas (documentation, reuse, accessibility)
              without claiming formal certification
            </li>
          </ul>

          <h2 className="govuk-heading-m">Versioning</h2>
          <p className="govuk-body">
            Large electoral or census files should be treated as dated releases.
            When we replace a major extract, dataset notes should say what
            changed. Prefer citing the temporal coverage field on the dataset
            page.
          </p>

          <h2 className="govuk-heading-m">Related guidance</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/open-data/portals#standards" className="govuk-link">
                Standards links (ODI, DCAT, Five Stars)
              </Link>
            </li>
            <li>
              <Link href="/editorial-policy" className="govuk-link">
                Editorial policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="govuk-link">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/access-to-information" className="govuk-link">
                Access to information
              </Link>
            </li>
          </ul>

          <p className="govuk-body">
            <Link href="/open-data" className="govuk-link">
              Back to open data
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
