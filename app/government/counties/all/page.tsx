'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { counties } from "@/data/counties";

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

type SortField = 'index_no' | 'name' | 'code' | 'capital' | 'governor' | 'region';
type SortOrder = 'asc' | 'desc';

export default function AllCountiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  
  // Default sorting alphabetically by County Name
  const [sortField, setSortField] = useState<SortField>('name');
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
    return counties
      .filter((county) => {
        const matchesSearch = 
          county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          county.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
          county.governor.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRegion = 
          selectedRegion === "All Regions" || 
          county.region === selectedRegion;

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'index_no') {
          const indexA = counties.indexOf(a);
          const indexB = counties.indexOf(b);
          return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
        }

        if (sortField === 'code') {
          return sortOrder === 'asc' 
            ? Number(a.code) - Number(b.code) 
            : Number(b.code) - Number(a.code);
        }

        const valueA = a[sortField] || '';
        const valueB = b[sortField] || '';

        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [searchTerm, selectedRegion, sortField, sortOrder]);

  // Client-side execution tracking summary stats based on filtered scopes
  const statisticsBannerData = useMemo(() => {
    const total = filteredCounties.length;
    const uniqueRegions = new Set(filteredCounties.map(c => c.region)).size;
    return { total, uniqueRegions };
  }, [filteredCounties]);

  const hasActiveFilters = searchTerm !== "" || selectedRegion !== "All Regions";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All Regions");
  };

  const handleExportCSV = () => {
    const headers = ["County Code", "County Name", "County Capital", "Current Governor", "Geographic Region"];
    const rows = filteredCounties.map((county) => [
      county.code.toString().padStart(2, '0'),
      `"${county.name.replace(/"/g, '""')}"`,
      `"${county.capital.replace(/"/g, '""')}"`,
      `"${county.governor.replace(/"/g, '""')}"`,
      `"${county.region.replace(/"/g, '""')}"`
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
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "All 47 Counties", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Counties of Kenya</h1>
            <p className="govuk-body-l">
              Profiles, assembly mappings, service channels, and administrative frameworks for all 47 devolved county governments.
            </p>
          </div>
        </div>

        {/* Enhanced Analytics Banner Panel (GOV.UK Highlight Layout) */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-full">
            <div className="bg-blue-50 p-6 border-l-4 border-blue-800 flex flex-wrap gap-6 justify-between items-center shadow-sm">
              <div>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-1 text-blue-900">National Register Framework Summary</h2>
                <p className="govuk-body-s govuk-!-margin-bottom-0 text-gray-700">
                  Tracking devolved units, regional distributions, and active legislative county-assembly boundaries.
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <span className="block govuk-heading-xl font-bold text-blue-800 govuk-!-margin-0">{statisticsBannerData.total}</span>
                  <span className="govuk-body-s text-xs font-semibold text-gray-600 uppercase tracking-wider">Counties Listed</span>
                </div>
                <div className="text-center border-l border-blue-200 pl-6">
                  <span className="block govuk-heading-xl font-bold text-blue-800 govuk-!-margin-0">{statisticsBannerData.uniqueRegions}</span>
                  <span className="govuk-body-s text-xs font-semibold text-gray-600 uppercase tracking-wider font-medium">Regions Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Grid Layout */}
        <div className="govuk-grid-row govuk-!-margin-bottom-4">
          <div className="govuk-grid-column-one-half govuk-!-margin-bottom-2">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search">
                Filter by Keyword
              </label>
              <input
                className="govuk-input"
                id="search"
                name="search"
                type="search"
                placeholder="e.g. Mombasa, Johnson Sakaja, Capital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-half govuk-!-margin-bottom-2">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region">
                Filter by Region
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

        {/* Custom Filter Tags Panel Layout */}
        {hasActiveFilters && (
          <div className="govuk-!-margin-bottom-6 p-4 border-2 border-gray-200 bg-gray-50">
            <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
            <div className="flex flex-wrap gap-2 items-center">
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="bg-white border-2 border-blue-700 hover:border-red-600 px-3 py-1 font-semibold text-sm cursor-pointer transition-colors inline-flex items-center gap-2"
                >
                  Search: &ldquo;{searchTerm}&rdquo; <span className="text-red-600 font-bold">&times;</span>
                </button>
              )}
              {selectedRegion !== "All Regions" && (
                <button 
                  type="button"
                  onClick={() => setSelectedRegion("All Regions")}
                  className="bg-white border-2 border-blue-700 hover:border-red-600 px-3 py-1 font-semibold text-sm cursor-pointer transition-colors inline-flex items-center gap-2"
                >
                  Region: {selectedRegion} <span className="text-red-600 font-bold">&times;</span>
                </button>
              )}
              <button 
                type="button"
                onClick={clearAllFilters}
                className="govuk-link govuk-!-font-size-16 ml-2 cursor-pointer bg-transparent border-0 underline p-1 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
        {/* Open Data Download Utility Bar Panel (GOV.UK Compliant) */}
        <div className="govuk-!-margin-bottom-6 p-4 border border-gray-300 bg-gray-100 flex justify-between items-center flex-wrap gap-3">
          <span className="govuk-body-s govuk-!-margin-0 text-gray-700">
            Machine-readable data access framework aligned with national open information disclosure guidelines.
          </span>
          <button 
            type="button" 
            onClick={handleExportCSV}
            className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold bg-transparent border-0 cursor-pointer underline p-0"
          >
            Download filtered list as CSV text spreadsheet
          </button>
        </div>

        {/* Results Metadata Summary Hook */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredCounties.length} of 47 counties
            </h2>

            {filteredCounties.length > 0 ? (
              /* GOV.UK Mobile Responsive Layout Table with Active Sort Buttons */
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
                        <button type="button" onClick={() => handleSort('capital')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                          Capital{renderSortIndicator('capital')}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-body-s py-3 px-2 w-[240px]">
                        <button type="button" onClick={() => handleSort('governor')} className="bg-transparent border-0 font-bold cursor-pointer p-0 text-blue-700 underline text-left hover:text-blue-900 transition-colors">
                          Current Governor{renderSortIndicator('governor')}
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
                      <tr key={county.code} className="govuk-table__row hover:bg-gray-50 transition-colors">
                        <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold py-3 px-3 text-gray-600 font-mono">
                          {county.code.toString().padStart(2, '0')}
                        </td>
                        <th scope="row" className="govuk-table__header govuk-body-s py-3 px-2 text-left font-normal">
                          <Link href={`/counties/${county.slug}`} className="govuk-link govuk-!-font-weight-bold text-blue-700 font-bold hover:text-blue-900 transition-colors">
                            {county.name}
                          </Link>
                        </th>
                        <td className="govuk-table__cell govuk-body-s py-3 px-2 text-gray-700 font-medium">
                          {county.capital}
                        </td>
                        <td className="govuk-table__cell govuk-body-s py-3 px-2 text-gray-800">
                          {county.governor}
                        </td>
                        <td className="govuk-table__cell govuk-body-s py-3 px-2">
                          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 font-medium">
                            {county.region}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-inset-text govuk-!-margin-top-4">
                <p className="govuk-body mb-0 italic text-gray-600">
                  No county boundaries, capitals, or governors match your active keyword filter parameters.
                </p>
              </div>
            )}

            <div className="govuk-!-margin-top-8">
              <GovUKFeedback />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
