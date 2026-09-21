export default function CabinetBriefsFilter({
  query,
  label,
  year,
  labels,
  years,
}: {
  query?: string;
  label?: string;
  year?: string;
  labels: string[];
  years: number[];
}) {
  return (
    <form method="get" className="govuk-!-margin-bottom-8">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="query">Search Cabinet briefs</label>
        <div className="govuk-hint">Search titles, summaries and full text.</div>
        <input className="govuk-input" id="query" name="query" type="search" defaultValue={query} />
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="label">Publication label</label>
            <select className="govuk-select" id="label" name="label" defaultValue={label || ""}>
              <option value="">All labels</option>
              {labels.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="year">Year</label>
            <select className="govuk-select" id="year" name="year" defaultValue={year || ""}>
              <option value="">All years</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button className="govuk-button" type="submit" data-module="govuk-button">Apply filters</button>
    </form>
  );
}
