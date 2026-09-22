'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { matchesSearch as matchesText } from "@/lib/search/match";

type County = {
  slug: string;
  name: string;
  code: number | null;
  headquarters: string | null;
  region: string | null;
};

const regions = [
  "All Regions",
  "Coast",
  "North Eastern",
  "Eastern",
  "Central",
  "Rift Valley",
  "Western",
  "Nyanza",
  "Nairobi"
] as const;

type SortField = 'code' | 'name' | 'headquarters' | 'region';
type SortOrder = 'asc' | 'desc';

export default function AllCountiesClient({ initialCounties }: { initialCounties: County[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredCounties = useMemo(() => {
    return initialCounties
      .filter((county) => {
        const matchesSearch = matchesText(searchTerm, county.name, county.headquarters, county.region, county.code);

        const matchesRegion = 
          selectedRegion === "All Regions" || 
          county.region === selectedRegion;

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'code') {
          return sortOrder === 'asc' 
            ? Number(a.code) - Number(b.code) 
            : Number(b.code) - Number(a.code);
        }

        const valueA = (a[sortField] || "").toString().toLowerCase();
        const valueB = (b[sortField] || "").toString().toLowerCase();

        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [initialCounties, searchTerm, selectedRegion, sortField, sortOrder]);

  const statisticsBannerData = useMemo(() => {
    const total = filteredCounties.length;
    const uniqueRegions = new Set(filteredCounties.map(c => c.region).filter(Boolean)).size;
    return { total, uniqueRegions };
  }, [filteredCounties]);

  const hasActiveFilters = searchTerm !== "" || selectedRegion !== "All Regions";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All Regions");
  };

  const handleExportCSV = () => {
    const headers = ["County Code", "County Name", "County Capital", "Geographic Region"];
    const rows = filteredCounties.map((county) => [
      county.code != null ? county.code.toString().padStart(2, "0") : "",
      `"${county.name.replace(/"/g, '""')}"`,
      `"${(county.headquarters || "").replace(/"/g, '""')}"`,
      `"${(county.region || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kenya_counties_register_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortOrder === 'asc' ? " ▲" : " ▼";
  };

  return (
    <>
      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-2">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search">
              Search
            </label>
            <input
              className="govuk-input"
              id="search"
              name="search"
              type="search"
              placeholder="County name or capital…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-2">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region">
              Region
            </label>
            <select
              className="govuk-select govuk-!-width-full"
              id="region"
              name="region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="govuk-!-margin-bottom-4">
          <button
            type="button"
            onClick={clearAllFilters}
            className="govuk-link govuk-!-font-size-16 cursor-pointer bg-transparent border-0 underline p-0"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="govuk-!-margin-bottom-4 flex justify-between items-center flex-wrap gap-2">
        <p className="govuk-body govuk-!-margin-0" aria-live="polite">
          Showing <strong>{filteredCounties.length}</strong> of{" "}
          {initialCounties.length} counties
          {statisticsBannerData.uniqueRegions
            ? ` · ${statisticsBannerData.uniqueRegions} regions`
            : ""}
        </p>
        <button
          type="button"
          onClick={handleExportCSV}
          className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold bg-transparent border-0 cursor-pointer underline p-0"
        >
          Download CSV
        </button>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">

          {filteredCounties.length > 0 ? (
            <div className="w-full overflow-x-auto scrolling-touch mb-8 border-b-2 border-gray-200 shadow-sm">
              <table className="govuk-table min-w-[850px] w-full mb-0">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  List of Kenyan counties with active data sorting controls.
                </caption>
                <thead className="govuk-table__head bg-gray-50 border-b-2 border-black">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-body-s py-3 px-3 w-[100px]">
                      <button type="button" onClick={() => handleSort('code')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                        Code{renderSortIndicator('code')}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2">
                      <button type="button" onClick={() => handleSort('name')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                        County Name{renderSortIndicator('name')}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2 w-[180px]">
                      <button type="button" onClick={() => handleSort('headquarters')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                        Capital{renderSortIndicator('headquarters')}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2 w-[180px]">
                      <button type="button" onClick={() => handleSort('region')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                        Region{renderSortIndicator('region')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body divide-y divide-gray-200">
                  {filteredCounties.map((county) => (
                    <tr
                      key={county.slug}
                      className="govuk-table__row hover:bg-gray-50 transition-colors"
                    >
                      <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold py-3 px-3 text-gray-600 font-mono">
                        {county.code != null
                          ? county.code.toString().padStart(2, "0")
                          : "—"}
                      </td>
                      <th scope="row" className="govuk-table__header govuk-body-s py-3 px-2 text-left font-normal">
                        <Link
                          href={`/government/institutions/${county.slug}`}
                          className="govuk-link govuk-!-font-weight-bold"
                        >
                          {county.name}
                        </Link>
                      </th>
                      <td className="govuk-table__cell govuk-body-s py-3 px-2 text-gray-700 font-medium">
                        {county.headquarters || "Pending"}
                      </td>
                      <td className="govuk-table__cell govuk-body-s py-3 px-2">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 font-medium">
                          {county.region || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="govuk-body">No counties match your search filters.</p>
          )}
        </div>
      </div>
    </>
  );
}