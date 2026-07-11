'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { nationalAssemblyMembers, type Member } from "@/data/national-assembly-members";

const ITEMS_PER_PAGE = 50;

export default function NationalAssemblyMembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter full array based on user interactions
  const filteredMembers = useMemo(() => {
    return nationalAssemblyMembers.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.party.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || member.party === selectedParty;
      const matchesType = !selectedType || member.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [searchTerm, selectedParty, selectedType]);

  // Reset page index safely to page 1 whenever search criteria boundaries shift
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedParty, selectedType]);

  // Calculate mathematical boundary slices for active page pagination windowing
  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / ITEMS_PER_PAGE);
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE;
  const paginatedMembers = useMemo(() => {
    return filteredMembers.slice(fromOffset, toOffset);
  }, [filteredMembers, fromOffset, toOffset]);

  const hasActiveFilters = searchTerm !== "" || selectedParty !== "" || selectedType !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedParty("");
    setSelectedType("");
  };

  // Safe client-side spreadsheet compilation mapping values strictly to valid tabular footprints
  const handleExportCSV = () => {
    const headers = ["No.", "Name", "Constituency / County", "Political Party", "Representation Type"];
    const rows = filteredMembers.map((member, idx) => [
      (idx + 1).toString(),
      `"${member.name.replace(/"/g, '""')}"`,
      `"${member.constituency.replace(/"/g, '""')}"`,
      `"${member.party.replace(/"/g, '""')}"`,
      `"${member.type.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `national_assembly_members_${new Date().toISOString().slice(0,10)}.csv`);
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
          { text: "National Assembly", href: "/legislature/national-assembly" },
          { text: "Members", href: "" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Members of the National Assembly</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public register of the 13th Parliament (2022–2027) legislative representatives.
            </p>

            {/* Mobile Responsive Filter Controls Grid Layout */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-member">
                    Search Members
                  </label>
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="search-member"
                    type="search"
                    placeholder="Name, constituency or county..."
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
                    <option value="ANC">ANC - Amani National Congress</option>
                    <option value="CCM">CCM - Chama Cha Mashinani</option>
                    <option value="DAP-K">DAP-K - Democratic Action Party</option>
                    <option value="DP">DP - Democratic Party of Kenya</option>
                    <option value="FORD-K">FORD-K - Forum for the Restoration of Democracy</option>
                    <option value="GDDP">GDDP - Grand Dream Development Party</option>
                    <option value="Independent">Independent</option>
                    <option value="JP">JP - Jubilee Party</option>
                    <option value="KANU">KANU - Kenya African National Union</option>
                    <option value="KUP">KUP - Kenya Union Party</option>
                    <option value="MCCP">MCCP - Maendeleo Chap Chap Party</option>
                    <option value="MDG">MDG - Movement for Democracy and Growth</option>
                    <option value="NAP-K">NAP-K - National Alliance Party</option>
                    <option value="NOPEU">NOPEU - National Ordinary People Empowerment Union</option>
                    <option value="ODM">ODM - Orange Democratic Movement</option>
                    <option value="PAA">PAA - Pamoja African Alliance</option>
                    <option value="TSP">TSP - The Service Party</option>
                    <option value="UDA">UDA - United Democratic Alliance</option>
                    <option value="UDM">UDM - United Democratic Movement</option>
                    <option value="UPA">UPA - United Progressive Alliance</option>
                    <option value="UPIA">UPIA - United Party of Independent Alliance</option>
                    <option value="WDM-K">WDM-K - Wiper Democratic Movement</option>
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
                    <option value="Constituency">Constituency MP</option>
                    <option value="Women Representative">Women Representative</option>
                    <option value="Nominated">Nominated Member</option>
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
                    <button 
                      type="button"
                      onClick={() => setSearchTerm("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}

                  {selectedParty && (
                    <button 
                      type="button"
                      onClick={() => setSelectedParty("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Party: {selectedParty} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}

                  {selectedType && (
                    <button 
                      type="button"
                      onClick={() => setSelectedType("")}
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Type: {selectedType} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
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

            {/* Open Data Download Panel (GOV.UK Compliant) */}
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
                Download filtered roster list as CSV text spreadsheet
              </button>
            </div>

            {/* Results Live Announcer Tracker */}
            <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
              Showing {totalMembers > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset, totalMembers)} of {totalMembers.toLocaleString()} members
            </h2>

            {paginatedMembers.length > 0 ? (
              <>
                {/* Mobile Safe Horizontal Scroll Layer Wrapper */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                  <table className="govuk-table" style={{ minWidth: '750px' }}>
                    <caption className="govuk-table__caption govuk-visually-hidden">List of National Assembly members.</caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '60px' }}>No.</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '220px' }}>Constituency / County</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '100px' }}>Party</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '160px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {paginatedMembers.map((member, index) => (
                        <tr key={member.id} className="govuk-table__row">
                          <td className="govuk-table__cell govuk-body-s">{fromOffset + index + 1}</td>
                          <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                            <Link 
                              href={`/legislature/national-assembly/members/${member.slug}`} 
                              className="govuk-link govuk-!-font-weight-bold"
                            >
                              {member.name}
                            </Link>
                          </th>
                          <td className="govuk-table__cell govuk-body-s">{member.constituency}</td>
                          <td className="govuk-table__cell govuk-body-s">
                            <span className="govuk-!-font-weight-bold">{member.party}</span>
                          </td>
                          <td className="govuk-table__cell govuk-body-s">
                            <strong className={`govuk-tag ${member.type === 'Constituency' ? 'govuk-tag--blue' : member.type === 'Women Representative' ? 'govuk-tag--purple' : 'govuk-tag--grey'}`}>
                              {member.type}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* GOV.UK Design System Compliant Client Pagination Block Controls */}
                {totalPages > 1 && (
                  <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation Menu">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="govuk-link govuk-pagination__link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '5px 0' }}
                        >
                          <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://w3.org" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m3.3 7 4.1 4.1-1.4 1.4L0 6.5 6 0l1.4 1.4L3.3 5.5H17v2H3.3z"></path>
                          </svg>
                          <span className="govuk-pagination__link-title" style={{ marginLeft: '8px', fontSize: '19px', fontWeight: 'bold' }}>Previous</span>
                        </button>
                      </div>
                    )}
                    
                    <ul className="govuk-pagination__list" style={{ display: 'inline-flex', padding: 0, margin: 0, listStyle: 'none', alignItems: 'center' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => {
                          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <div key={p} style={{ display: 'contents' }}>
                              {showEllipsis && (
                                <li className="govuk-pagination__item govuk-pagination__item--ellipsis" style={{ display: 'inline-block', padding: '0 12px', color: '#1d70b8', fontSize: '19px' }}>
                                  ...
                                </li>
                              )}
                              <li className={`govuk-pagination__item ${p === currentPage ? 'govuk-pagination__item--current' : ''}`} style={{ display: 'inline-block' }}>
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
                            </div>
                          );
                        })}
                    </ul>

                    {currentPage < totalPages && (
                      <div className="govuk-pagination__next">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="govuk-link govuk-pagination__link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '5px 0' }}
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
                <p>No parliamentary representatives match your specified search keywords or filter criteria configurations.</p>
              </div>
            )}

          </div>
        </div>
      
    
  
  </>
);
}
