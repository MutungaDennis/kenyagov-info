'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { senateMembers, type Senator } from "@/data/senate-members";

const ITEMS_PER_PAGE = 50;

export default function SenateSenatorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSenators = useMemo(() => {
    return senateMembers.filter((sen) => {
      const matchesSearch =
        sen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sen.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sen.party.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || sen.party === selectedParty;
      const matchesType = !selectedType || sen.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [searchTerm, selectedParty, selectedType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedParty, selectedType]);

  const totalSenators = filteredSenators.length;
  const totalPages = Math.ceil(totalSenators / ITEMS_PER_PAGE);
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE;
  const paginatedSenators = useMemo(() => {
    return filteredSenators.slice(fromOffset, toOffset);
  }, [filteredSenators, fromOffset, toOffset]);

  const hasActiveFilters = searchTerm !== "" || selectedParty !== "" || selectedType !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedParty("");
    setSelectedType("");
  };

  // Safe client-side spreadsheet compilation mapping values strictly to valid tabular footprints
  const handleExportCSV = () => {
    const headers = ["No.", "Name", "County Delegation", "Political Party", "Representation Type"];
    const rows = filteredSenators.map((sen, idx) => [
      (idx + 1).toString(),
      `"${sen.name.replace(/"/g, '""')}"`,
      `"${(sen.county || "National Nomination").replace(/"/g, '""')}"`,
      `"${sen.party.replace(/"/g, '""')}"`,
      `"${sen.type.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_senators_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "Senate", href: "/legislature/senate" },
          { text: "Senators", href: "" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Senators of Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public register of the 13th Parliament legislative representatives.
            </p>

            {/* Mobile Responsive Filter Controls Grid Layout */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-senator">
                    Search Senators
                  </label>
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="search-senator"
                    type="search"
                    placeholder="Name or county..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="party-select">
                    Political Party
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="party-select"
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                  >
                    <option value="">All Parties</option>
                    <option value="ODM">ODM - Orange Democratic Movement</option>
                    <option value="UDA">UDA - United Democratic Alliance</option>
                    <option value="JUBILEE">JUBILEE - Jubilee Party</option>
                    <option value="WDM-K">WDM-K - Wiper Democratic Movement</option>
                    <option value="FORD-K">FORD-K - Forum for the Restoration of Democracy</option>
                    <option value="UDM">UDM - United Democratic Movement</option>
                    <option value="DP">DP - Democratic Party</option>
                    <option value="NRA">NRA - National Reconstruction Alliance</option>
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="type-select">
                    Representation Type
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="type-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Elected">Elected Senator</option>
                    <option value="Nominated">Nominated Senator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Filter Tags Row Block */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>
                      Keywords: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  {selectedParty && (
                    <button type="button" onClick={() => setSelectedParty("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>
                      Party: {selectedParty} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  {selectedType && (
                    <button type="button" onClick={() => setSelectedType("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>
                      Type: {selectedType} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  <button type="button" onClick={clearAllFilters} className="govuk-link govuk-!-font-size-16" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {/* Open Data Download Utility Bar Component Panel */}
            <div className="govuk-!-margin-bottom-4" style={{ background: '#f3f2f1', padding: '12px 15px', border: '1px solid #bfc1c3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span className="govuk-body-s govuk-!-margin-0">
                Machine-readable access framework complying with national disclosure guidelines.
              </span>
              <button 
                type="button" 
                onClick={handleExportCSV}
                className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Download filtered list as CSV text spreadsheet format
              </button>
            </div>

            {/* Results Live Announcer Counter */}
            <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
              Showing {totalSenators > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset, totalSenators)} of {totalSenators.toLocaleString()} senators
            </h2>

            {paginatedSenators.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                  <table className="govuk-table" style={{ minWidth: '750px' }}>
                    <caption className="govuk-table__caption govuk-visually-hidden">List of sitting Senators.</caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '60px' }}>No.</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '220px' }}>County Delegation</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '100px' }}>Party</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '160px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {paginatedSenators.map((sen, index) => (
                        <tr key={sen.id} className="govuk-table__row">
                          <td className="govuk-table__cell govuk-body-s">{fromOffset + index + 1}</td>
                          <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                            <Link href={`/legislature/senate/senators/${sen.slug}`} className="govuk-link govuk-!-font-weight-bold">
                              {sen.name}
                            </Link>
                          </th>
                          <td className="govuk-table__cell govuk-body-s">{sen.county || "National Representation"}</td>
                          <td className="govuk-table__cell govuk-body-s">
                            <span className="govuk-!-font-weight-bold">{sen.party}</span>
                          </td>
                          <td className="govuk-table__cell govuk-body-s">
                            <strong className={`govuk-tag ${sen.type === 'Elected' ? 'govuk-tag--blue' : 'govuk-tag--purple'}`}>
                              {sen.type}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation Menu">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="govuk-link govuk-pagination__link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://w3.org" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m3.3 7 4.1 4.1-1.4 1.4L0 6.5 6 0l1.4 1.4L3.3 5.5H17v2H3.3z"></path>
                          </svg>
                          <span className="govuk-pagination__link-title" style={{ marginLeft: '8px', fontSize: '19px', fontWeight: 'bold' }}>Previous</span>
                        </button>
                      </div>
                    )}
                    
                    <ul className="govuk-pagination__list" style={{ display: 'inline-flex', padding: 0, margin: 0, listStyle: 'none', alignItems: 'center' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p} className={`govuk-pagination__item ${p === currentPage ? 'govuk-pagination__item--current' : ''}`}>
                          <button
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className="govuk-link govuk-pagination__link"
                            aria-label={`Page ${p}`}
                            aria-current={p === currentPage ? 'page' : undefined}
                            style={{ 
                              background: p === currentPage ? '#1d70b8' : 'none', 
                              color: p === currentPage ? '#ffffff' : '#1d70b8',
                              border: 'none', 
                              cursor: 'pointer',
                              padding: '5px 12px',
                              fontSize: '19px',
                              fontWeight: p === currentPage ? 'bold' : 'normal',
                              textDecoration: p === currentPage ? 'none' : 'underline'
                            }}
                          >
                            {p}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {currentPage < totalPages && (
                      <div className="govuk-pagination__next">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="govuk-link govuk-pagination__link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <span className="govuk-pagination__link-title" style={{ marginRight: '8px', fontSize: '19px', fontWeight: 'bold' }}>Next</span>
                          <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://w3.org" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m13.7 5.5-4.1-4.1 1.4-1.4L17 6.5 11 13l-1.4-1.4 4.1-4.1H0v-2h13.7z"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No senators match your active keyword or filtering configurations.</p>
              </div>
            )}

          </div>
        </div>
      
    
  
  </>
);
}
