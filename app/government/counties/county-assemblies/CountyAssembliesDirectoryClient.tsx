"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchesSearch as matchesText } from "@/lib/search/match";
import {
  assemblyDisplayName,
  assemblyInstitutionHref,
} from "@/lib/counties/assembly";

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
  "Nairobi",
] as const;

type SortField = "code" | "name" | "headquarters" | "region";
type SortOrder = "asc" | "desc";

export default function CountyAssembliesDirectoryClient({
  initialCounties,
}: {
  initialCounties: County[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [sortField, setSortField] = useState<SortField>("code");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return initialCounties
      .filter((county) => {
        const assemblyName = assemblyDisplayName(county.name).toLowerCase();
        const matchesSearch = matchesText(q, county.name, assemblyName, county.headquarters, county.region);

        const matchesRegion =
          selectedRegion === "All Regions" || county.region === selectedRegion;

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === "code") {
          return sortOrder === "asc"
            ? Number(a.code) - Number(b.code)
            : Number(b.code) - Number(a.code);
        }
        const valueA =
          sortField === "name"
            ? assemblyDisplayName(a.name).toLowerCase()
            : (a[sortField] || "").toString().toLowerCase();
        const valueB =
          sortField === "name"
            ? assemblyDisplayName(b.name).toLowerCase()
            : (b[sortField] || "").toString().toLowerCase();
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [initialCounties, searchTerm, selectedRegion, sortField, sortOrder]);

  const hasActiveFilters =
    searchTerm !== "" || selectedRegion !== "All Regions";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All Regions");
  };

  const sortMark = (field: SortField) =>
    sortField === field ? (sortOrder === "asc" ? " ▲" : " ▼") : " ↕";

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
              type="search"
              placeholder="Assembly or county name…"
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

      <p className="govuk-body govuk-!-margin-bottom-4" aria-live="polite">
        Showing <strong>{filtered.length}</strong> of {initialCounties.length}{" "}
        county assemblies
      </p>

      {filtered.length > 0 ? (
        <div className="w-full overflow-x-auto scrolling-touch mb-8 border-b-2 border-gray-200 shadow-sm">
          <table className="govuk-table min-w-[850px] w-full mb-0">
            <caption className="govuk-table__caption govuk-visually-hidden">
              County assemblies of Kenya
            </caption>
            <thead className="govuk-table__head bg-gray-50 border-b-2 border-black">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header govuk-body-s py-3 px-3 w-[100px]">
                  <button
                    type="button"
                    onClick={() => handleSort("code")}
                    className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left"
                  >
                    Code{sortMark("code")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left"
                  >
                    County Assembly{sortMark("name")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2 w-[180px]">
                  <button
                    type="button"
                    onClick={() => handleSort("headquarters")}
                    className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left"
                  >
                    HQ{sortMark("headquarters")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2 w-[180px]">
                  <button
                    type="button"
                    onClick={() => handleSort("region")}
                    className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left"
                  >
                    Region{sortMark("region")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body divide-y divide-gray-200">
              {filtered.map((county) => (
                <tr
                  key={county.slug}
                  className="govuk-table__row hover:bg-gray-50 transition-colors"
                >
                  <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold py-3 px-3 text-gray-600 font-mono">
                    {county.code != null
                      ? county.code.toString().padStart(2, "0")
                      : "—"}
                  </td>
                  <th
                    scope="row"
                    className="govuk-table__header govuk-body-s py-3 px-2 text-left font-normal"
                  >
                    <Link
                      href={assemblyInstitutionHref(county.slug)}
                      className="govuk-link govuk-!-font-weight-bold"
                    >
                      {assemblyDisplayName(county.name)}
                    </Link>
                  </th>
                  <td className="govuk-table__cell govuk-body-s py-3 px-2 text-gray-700">
                    {county.headquarters || "—"}
                  </td>
                  <td className="govuk-table__cell govuk-body-s py-3 px-2">
                    {county.region || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="govuk-body">No county assemblies match your search filters.</p>
      )}
    </>
  );
}
