type Props = {
  exportEndpoint?: string;
  title: string;
};

/** CSV / JSON download buttons for a dataset export route */
export default function DatasetDownloads({ exportEndpoint, title }: Props) {
  if (!exportEndpoint) {
    return (
      <p className="govuk-inset-text">
        A bulk CSV/JSON export is not published for <strong>{title}</strong>{" "}
        yet. You can still use the summary and tables on this page.{" "}
        <a href="/contact" className="govuk-link">
          Contact us
        </a>{" "}
        if you need a bulk extract.
      </p>
    );
  }

  const csv = `${exportEndpoint}?format=csv`;
  const json = `${exportEndpoint}?format=json`;

  return (
    <div className="govuk-!-margin-bottom-6">
      <h2 className="govuk-heading-m">Download full dataset</h2>
      <p className="govuk-body">
        CSV and JSON are non-proprietary, machine-readable formats. No account is
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
      </div>
    </div>
  );
}
