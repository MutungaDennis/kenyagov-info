import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";

export const revalidate = 86400;

export const metadata = {
  title: "Suggest an open dataset",
  description:
    "Suggest a public Kenyan government dataset for CitizenGuide.KE to document or summarise.",
};

export default function SuggestDatasetPage() {
  const contactHref =
    "/contact?subject=" +
    encodeURIComponent("Open data: dataset suggestion");

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Suggest a dataset" },
        ]}
        title="Suggest a dataset"
        lead="Help us grow Kenya’s best independent civic open-data guide. Tell us about public data that should be easier to find."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">What to include</h2>
          <p className="govuk-body">In your message, please mention:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>Dataset name and publisher (for example IEBC, KNBS, a county)</li>
            <li>Link to the official page or file if you have one</li>
            <li>Why it matters for citizens or researchers</li>
            <li>Whether it is already free to download publicly</li>
            <li>Any licence or reuse terms you know of</li>
          </ul>

          <h2 className="govuk-heading-m">What we prioritise</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>National and county government structure</li>
            <li>Elections and democratic geography</li>
            <li>Public finance and service delivery (when openly published)</li>
            <li>Data with a clear public licence and stable source</li>
          </ul>

          <h2 className="govuk-heading-m">What we generally cannot host</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Personal data or confidential administrative files</li>
            <li>Scraped content that violates terms of use</li>
            <li>Unlicensed commercial databases</li>
          </ul>

          <div className="govuk-button-group">
            <Link href={contactHref} className="govuk-button">
              Contact us with a suggestion
            </Link>
            <Link href="/open-data" className="govuk-button govuk-button--secondary">
              Back to open data
            </Link>
          </div>

          <p className="govuk-body-s">
            Suggestions go to the CitizenGuide.KE team only. We cannot process
            government applications.
          </p>
        </div>
      </div>
    </>
  );
}
