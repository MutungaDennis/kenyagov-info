"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface County {
  name: string;
}

interface Constituency {
  name: string;
}

interface Props {
  counties: County[];
  constituencies: Constituency[];
  selectedCounty?: string;
  selectedConstituency?: string;
  search?: string;
}

export default function WardsFilters({
  counties,
  constituencies,
  selectedCounty,
  selectedConstituency,
  search,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(
    key: string,
    value: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      `/counties/wards?${params.toString()}`
    );
  }

  return (
    <div style={{ marginBottom: 30 }}>
      {/* SEARCH */}
      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--m"
          htmlFor="q"
        >
          Search wards
        </label>

        <input
          id="q"
          type="text"
          defaultValue={search || ""}
          className="govuk-input"
          placeholder="Search ward, constituency or county"
          onChange={(e) =>
            updateParams("q", e.target.value)
          }
        />
      </div>

      {/* FILTERS */}
      <div className="govuk-grid-row">
        {/* COUNTY */}
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label">
              County
            </label>

            <select
              className="govuk-select"
              value={selectedCounty || ""}
              onChange={(e) =>
                updateParams(
                  "county",
                  e.target.value
                )
              }
            >
              <option value="">
                All counties
              </option>

              {counties.map((county) => (
                <option
                  key={county.name}
                  value={county.name}
                >
                  {county.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONSTITUENCY */}
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label">
              Constituency
            </label>

            <select
              className="govuk-select"
              value={
                selectedConstituency || ""
              }
              onChange={(e) =>
                updateParams(
                  "constituency",
                  e.target.value
                )
              }
            >
              <option value="">
                All constituencies
              </option>

              {constituencies.map(
                (constituency) => (
                  <option
                    key={
                      constituency.name
                    }
                    value={
                      constituency.name
                    }
                  >
                    {constituency.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}