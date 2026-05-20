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

  const hasActiveFilters = searchTerm !== "" || selectedRegion !== "All Regions";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All Regions");
  };

  // Safe client-side spreadsheet compilation mapping values strictly to valid tabular footprints
  const handleExportCSV = () => {
    const headers = ["County Code", "County Name", "County Capital", "Current Governor", "Geographic Region"];
    const rows = filteredCounties.map((county) => [
      county.code.toString(),
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

  // Helper to render explicit visual layout indicators for active sort column states
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
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Counties of Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Profiles, service listings, and administrative details for all 47 devolved county governments.
            </p>
          </div>
        </div>

        {/* Filters Grid Layout adjusted for quick scannability */}
        <div className="govuk-grid-row govuk-!-margin-bottom-2">
          <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search">
                Search
              </label>
              <input
                className="govuk-input"
                id="search"
                name="search"
                type="search"
                placeholder="County name, capital, or governor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
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

        {/* Custom Filter Tags Panel Layout */}
        {hasActiveFilters && (
          <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
            <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                >
                  Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                </button>
              )}
              {selectedRegion !== "All Regions" && (
                <button 
                  type="button"
                  onClick={() => setSelectedRegion("All Regions")}
                  style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                >
                  Region: {selectedRegion} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                </button>
              )}
              <button 
                type="button"
                onClick={clearAllFilters}
                className="govuk-link govuk-!-font-size-16"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Open Data Download Utility Bar Panel (GOV.UK Compliant) */}
        <div className="govuk-!-margin-bottom-4" style={{ background: '#f3f2f1', padding: '12px 15px', border: '1px solid #bfc1c3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span className="govuk-body-s govuk-!-margin-0">
            Machine-readable data access framework aligned with national open information disclosure guidelines.
          </span>
          <button 
            type="button" 
            onClick={handleExportCSV}
            className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
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
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '750px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">
                    List of Kenyan counties with active data sorting controls.
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '80px' }}>
                        <button type="button" onClick={() => handleSort('code')} style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, color: '#1d70b8', textDecoration: 'underline' }}>
                          Code{renderSortIndicator('code')}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-body-s">
                        <button type="button" onClick={() => handleSort('name')} style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, color: '#1d70b8', textDecoration: 'underline' }}>
                          County Name{renderSortIndicator('name')}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '160px' }}>
                        <button type="button" onClick={() => handleSort('capital')} style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, color: '#1d70b8', textDecoration: 'underline' }}>
                          Capital{renderSortIndicator('capital')}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '220px' }}>
                        <button type="button" onClick={() => handleSort('governor')} style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, color: '#1d70b8', textDecoration: 'underline' }}>
                          Current Governor{renderSortIndicator('governor')}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '160px' }}>
                        <button type="button" onClick={() => handleSort('region')} style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, color: '#1d70b8', textDecoration: 'underline' }}>
                          Region{renderSortIndicator('region')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {filteredCounties.map((county) => (
                      <tr key={county.code} className="govuk-table__row">
                        <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold">
                          {county.code.toString().padStart(2, '0')}
                        </td>
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                          <Link href={`/counties/${county.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {county.name}
                          </Link>
                        </th>
                        <td className="govuk-table__cell govuk-body-s">{county.capital}</td>
                        <td className="govuk-table__cell govuk-body-s">{county.governor}</td>
                        <td className="govuk-table__cell govuk-body-s">{county.region}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No county boundaries or registers match your active filter search parameters.</p>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
