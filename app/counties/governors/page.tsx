'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { governors } from "@/data/governors";

type SortField = 'code_number' | 'name' | 'county' | 'party' | 'region' | 'deputyGovernor';
type SortOrder = 'asc' | 'desc';

export default function GovernorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  // Sorting state - default sorting alphabetically by County Name
  const [sortField, setSortField] = useState<SortField>('county');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredGovernors = useMemo(() => {
    return governors
      .filter((g) => {
        const matchesSearch = 
          g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.county.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesParty = !selectedParty || g.party === selectedParty;
        const matchesRegion = !selectedRegion || g.region === selectedRegion;

        return matchesSearch && matchesParty && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'code_number') {
          const indexA = governors.indexOf(a);
          const indexB = governors.indexOf(b);
          return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
        }

        const valueA = a[sortField] || '';
        const valueB = b[sortField] || '';

        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [searchTerm, selectedParty, selectedRegion, sortField, sortOrder]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== "" || selectedParty !== "" || selectedRegion !== "";

  // Clear helper functions
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedParty("");
    setSelectedRegion("");
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Governors", href: "/counties/governors" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">County Governors of Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Current Governors and Deputy Governors of Kenya’s 47 counties.
            </p>

            {/* Mobile Responsive Filter Controls Grid Layout */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search">Search</label>
                  <input
                    className="govuk-input"
                    id="search"
                    type="search"
                    placeholder="Governor or county name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="party">Party</label>
                  <select 
                    className="govuk-select govuk-!-width-full" 
                    id="party"
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                  >
                    <option value="">All Parties</option>
                    <option value="UDA">UDA</option>
                    <option value="ODM">ODM</option>
                    <option value="JUBILEE">JUBILEE</option>
                    <option value="WDM-K">WDM-K</option>
                    <option value="FORD-K">FORD-K</option>
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region">Region</label>
                  <select 
                    className="govuk-select govuk-!-width-full" 
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    <option value="Coast">Coast</option>
                    <option value="North Eastern">North Eastern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Central">Central</option>
                    <option value="Rift Valley">Rift Valley</option>
                    <option value="Western">Western</option>
                    <option value="Nyanza">Nyanza</option>
                    <option value="Nairobi">Nairobi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Filter Tags Row Block */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-6" style={{ background: '#f8f8f8', padding: '15px', border: '1px solid #bfc1c3' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={() => setSearchTerm("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '5px 10px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}

                  {selectedParty && (
                    <button 
                      type="button"
                      onClick={() => setSelectedParty("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '5px 10px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Party: {selectedParty} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}

                  {selectedRegion && (
                    <button 
                      type="button"
                      onClick={() => setSelectedRegion("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '5px 10px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Region: {selectedRegion} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={clearAllFilters}
                    className="govuk-link govuk-!-font-size-16"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '5px' }}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredGovernors.length} Governors
            </h2>

            {filteredGovernors.length > 0 ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '850px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">
                    List of current county governors and deputies with sorting toggles.
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      {/* Increased padding and added explicit font sizes to make headers pop out */}
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('code_number')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          No. {sortField === 'code_number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('name')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Governor {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('county')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          County {sortField === 'county' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('party')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Party {sortField === 'party' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('region')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Region {sortField === 'region' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                      <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                        <button 
                          type="button" 
                          onClick={() => handleSort('deputyGovernor')}
                          style={{ background: 'none', border: 'none', boxShadow: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Deputy Governor {sortField === 'deputyGovernor' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {filteredGovernors.map((g, index) => (
                      <tr key={g.id} className="govuk-table__row">
                        <td className="govuk-table__cell govuk-body-s">{index + 1}</td>
                        <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>
                          <Link href={`/counties/${g.countySlug}`} className="govuk-link govuk-!-font-weight-bold">
                            {g.name}
                          </Link>
                        </th>
                        <td className="govuk-table__cell">{g.county}</td>
                        <td className="govuk-table__cell">
                          <span className="govuk-body-s govuk-!-font-weight-bold">{g.party}</span>
                        </td>
                        <td className="govuk-table__cell govuk-body-s">{g.region}</td>
                        <td className="govuk-table__cell">{g.deputyGovernor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No governors match your search filters.</p>
              </div>
            )}

            <p className="govuk-body govuk-!-margin-top-2">
              Click on any Governor’s name to view the full county profile.
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
