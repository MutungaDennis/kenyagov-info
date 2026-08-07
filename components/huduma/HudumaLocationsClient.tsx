"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TableScroll from "@/components/govuk/TableScroll";
import type { HudumaCentre } from "@/lib/data/huduma-centres";
import {
  countyAnchor,
  filterHudumaCentres,
  formatHudumaHours,
  groupCentresByCounty,
  groupCentresByRegion,
  regionAnchor,
} from "@/lib/data/huduma-centres.utils";

type Props = {
  centres: HudumaCentre[];
  regions: string[];
};

type ViewMode = "region" | "county" | "table";

export default function HudumaLocationsClient({
  centres,
  regions,
}: Props) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [county, setCounty] = useState("");
  const [hours, setHours] = useState("");
  const [view, setView] = useState<ViewMode>("region");

  /** Counties that have a centre in the selected region (or all counties if no region). */
  const availableCounties = useMemo(() => {
    const pool = region
      ? centres.filter((c) => c.region === region)
      : centres;
    return Array.from(new Set(pool.map((c) => c.county))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [centres, region]);

  const filtered = useMemo(
    () => filterHudumaCentres({ q, region, county, hours }, centres),
    [q, region, county, hours, centres],
  );

  const byRegion = useMemo(
    () => groupCentresByRegion(filtered),
    [filtered],
  );
  const byCounty = useMemo(
    () => groupCentresByCounty(filtered),
    [filtered],
  );

  const handleRegionChange = (nextRegion: string) => {
    setRegion(nextRegion);
    // Drop county if it is not in the new region
    if (county) {
      const stillValid = centres.some(
        (c) =>
          c.county === county &&
          (!nextRegion || c.region === nextRegion),
      );
      if (!stillValid) setCounty("");
    }
  };

  const clearFilters = () => {
    setQ("");
    setRegion("");
    setCounty("");
    setHours("");
  };

  const hasFilters = Boolean(q || region || county || hours);

  return (
    <>
      <form
        className="govuk-!-margin-bottom-6"
        role="search"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter Huduma Centres"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="huduma-q">
                Search by name, town, county or address
              </label>
              <div id="huduma-q-hint" className="govuk-hint">
                For example: Eldoret, GPO, Post Office, or Kajiado
              </div>
              <input
                className="govuk-input"
                id="huduma-q"
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-describedby="huduma-q-hint"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="huduma-region">
                Region
              </label>
              <select
                className="govuk-select"
                id="huduma-region"
                name="region"
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
              >
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="huduma-county">
                County
              </label>
              <select
                className="govuk-select"
                id="huduma-county"
                name="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                aria-describedby={
                  region ? "huduma-county-hint" : undefined
                }
              >
                <option value="">
                  {region ? "All counties in region" : "All counties"}
                </option>
                {availableCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {region ? (
                <div id="huduma-county-hint" className="govuk-hint">
                  Showing counties in {region} only
                </div>
              ) : null}
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="huduma-hours">
                Opening hours
              </label>
              <select
                className="govuk-select"
                id="huduma-hours"
                name="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              >
                <option value="">All hours</option>
                <option value="extended">Extended (7am–7pm)</option>
                <option value="standard">Standard (8am–5pm)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              View
            </legend>
            <div className="govuk-radios govuk-radios--inline govuk-radios--small">
              {(
                [
                  ["region", "By region"],
                  ["county", "By county"],
                  ["table", "Full table"],
                ] as const
              ).map(([value, label]) => (
                <div key={value} className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id={`view-${value}`}
                    name="view"
                    type="radio"
                    value={value}
                    checked={view === value}
                    onChange={() => setView(value)}
                  />
                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor={`view-${value}`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {hasFilters && (
          <p className="govuk-body">
            <button
              type="button"
              className="govuk-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                textDecoration: "underline",
              }}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </p>
        )}
      </form>

      <p className="govuk-body" aria-live="polite">
        <strong>{filtered.length}</strong>{" "}
        {filtered.length === 1 ? "centre" : "centres"}
        {hasFilters ? " match your filters" : " listed"}
      </p>

      {filtered.length === 0 ? (
        <div className="govuk-inset-text">
          <p className="govuk-body">
            No centres match. Try a different county or clear filters.
          </p>
        </div>
      ) : view === "table" ? (
        <CentresTable centres={filtered} caption="All matching Huduma Centres" />
      ) : view === "county" ? (
        <>
          <nav className="govuk-!-margin-bottom-6" aria-label="Counties">
            <h2 className="govuk-heading-s">Jump to county</h2>
            <p className="govuk-body">
              {byCounty.map(({ county: c }, index) => (
                <span key={c}>
                  {index > 0 ? " · " : null}
                  <a className="govuk-link" href={`#${countyAnchor(c)}`}>
                    {c}
                  </a>
                </span>
              ))}
            </p>
          </nav>
          {byCounty.map(({ county: c, centres: list }) => (
            <section
              key={c}
              id={countyAnchor(c)}
              className="govuk-!-margin-bottom-6"
            >
              <h2 className="govuk-heading-m">
                {c}{" "}
                <span className="govuk-body-s govuk-!-font-weight-regular">
                  ({list.length})
                </span>
              </h2>
              <CentresTable
                centres={list}
                caption={`Huduma Centres in ${c} County`}
              />
            </section>
          ))}
        </>
      ) : (
        <>
          <nav className="govuk-!-margin-bottom-6" aria-label="Regions">
            <h2 className="govuk-heading-s">Jump to region</h2>
            <p className="govuk-body">
              {byRegion.map(({ region: r }, index) => (
                <span key={r}>
                  {index > 0 ? " · " : null}
                  <a className="govuk-link" href={`#${regionAnchor(r)}`}>
                    {r}
                  </a>
                </span>
              ))}
            </p>
          </nav>
          {byRegion.map(({ region: r, centres: list }) => (
            <section
              key={r}
              id={regionAnchor(r)}
              className="govuk-!-margin-bottom-6"
            >
              <h2 className="govuk-heading-m">
                {r} Region{" "}
                <span className="govuk-body-s govuk-!-font-weight-regular">
                  ({list.length})
                </span>
              </h2>
              <CentresTable
                centres={list}
                caption={`Huduma Centres in ${r} Region`}
              />
            </section>
          ))}
        </>
      )}

      <p className="govuk-body-s govuk-!-margin-top-6">
        Looking for services online instead? See{" "}
        <Link href="/ecitizen" className="govuk-link">
          eCitizen explained
        </Link>
        .
      </p>
    </>
  );
}

function CentresTable({
  centres,
  caption,
}: {
  centres: HudumaCentre[];
  caption: string;
}) {
  return (
    <TableScroll caption={caption}>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-visually-hidden">
          {caption}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Centre
            </th>
            <th scope="col" className="govuk-table__header">
              County
            </th>
            <th scope="col" className="govuk-table__header">
              Address
            </th>
            <th scope="col" className="govuk-table__header">
              Hours
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {centres.map((c) => (
            <tr key={c.id} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                {c.name}
                {c.extendedHours && (
                  <>
                    {" "}
                    <strong className="govuk-tag govuk-tag--green">
                      Extended hours
                    </strong>
                  </>
                )}
                <span className="govuk-body-s govuk-!-display-block govuk-!-font-weight-regular">
                  {c.cityOrTown}
                </span>
              </th>
              <td className="govuk-table__cell">{c.county}</td>
              <td className="govuk-table__cell">{c.address}</td>
              <td className="govuk-table__cell">
                {formatHudumaHours(c)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
