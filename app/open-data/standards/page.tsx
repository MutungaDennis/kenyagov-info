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
