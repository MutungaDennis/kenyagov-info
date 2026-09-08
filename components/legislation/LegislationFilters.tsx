import Link from "next/link";

export function LegislationFilters({
  action,
  showChamber = false,
  counties = [],
  values = {},
}: {
  action: string;
  showChamber?: boolean;
  counties?: Array<{ code: string; name: string }>;
  values?: Record<string, string | undefined>;
}) {
  return (
    <form method="get" action={action} className="legislation-filters" aria-label="Filter legislation">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="query">Search legislation</label>
        <input className="govuk-input" id="query" name="query" type="search" defaultValue={values.query || ""} />
      </div>
      {showChamber ? (
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="chamber">Originating House</label>
          <select className="govuk-select" id="chamber" name="chamber" defaultValue={values.chamber || ""}>
            <option value="">All Houses</option>
            <option value="national_assembly">National Assembly</option>
            <option value="senate">Senate</option>
          </select>
        </div>
      ) : null}
      {counties.length ? (
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="county">County</label>
          <select className="govuk-select" id="county" name="county" defaultValue={values.county || ""}>
            <option value="">All counties</option>
            {counties.map((county) => <option key={county.code} value={county.code}>{county.name}</option>)}
          </select>
        </div>
      ) : null}
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="status">Status</label>
        <select className="govuk-select" id="status" name="status" defaultValue={values.status || ""}>
          <option value="">All statuses</option>
          <option>In force</option>
          <option>Partially in force</option>
          <option>Not yet commenced</option>
          <option>Repealed</option>
          <option>Revoked</option>
          <option>Historical</option>
        </select>
      </div>
      <button className="govuk-button" type="submit">Apply filters</button>
      <p className="govuk-body-s govuk-!-margin-bottom-0"><Link className="govuk-link" href={action}>Clear filters</Link></p>
    </form>
  );
}
