import Link from "next/link";

type Props = {
  exportEndpoint?: string;
  title: string;
};

/** CSV / JSON / XML download buttons for a dataset export route */
export default function DatasetDownloads({ exportEndpoint, title }: Props) {
  if (!exportEndpoint) {
    return (
      <p className="govuk-inset-text">
        A bulk CSV, JSON or XML export is not published for <strong>{title}</strong>{" "}
        yet. You can still use the summary and tables on this page.{" "}
        <Link href="/contact" className="govuk-link">
          Contact us
        </Link>{" "}
        if you need a bulk extract.
      </p>
    );
  }

  const csv = `${exportEndpoint}?format=csv`;
  const json = `${exportEndpoint}?format=json`;
  const xml = `${exportEndpoint}?format=xml`;

  return (
    <div className="govuk-!-margin-bottom-6">
      <h2 className="govuk-heading-m">Download full dataset</h2>
      <p className="govuk-body">
        CSV, JSON and XML are open, machine-readable formats for spreadsheets, applications and systems integration. No account is
        needed. Downloads contain all matching published records; large files may
        take a moment to generate.
      </p>
      <div className="govuk-button-group">
        <a href={csv} className="govuk-button govuk-button--secondary" download>
          Download CSV
        </a>
        <a href={json} className="govuk-button govuk-button--secondary" download>
          Download JSON
        </a>
        <a href={xml} className="govuk-button govuk-button--secondary" download>
          Download XML
        </a>
      </div>
    </div>
  );
}
