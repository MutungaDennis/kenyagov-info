'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { matchesSearch as matchesText } from "@/lib/search/match";
import { useSearchParams } from "next/navigation";
type Member = {
  id: string;
  name: string;
  seat: string;
  party: string;
  type: string;
  slug: string | null;
};

const ITEMS_PER_PAGE = 50;

const formatName = (name: string) => {
  if (name.includes(",")) {
    const parts = name.split(",").map((p) => p.trim());
    return `${parts[1]} ${parts[0]}`;
  }
  return name;
};

export default function MembersClient() {
  const searchParams = useSearchParams();

  const initialType = searchParams.get("type") || "";
  const initialParty = searchParams.get("party") || "";
  const initialSearch = searchParams.get("q") || "";

  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedParty, setSelectedParty] = useState(initialParty);
  const [selectedType, setSelectedType] = useState(initialType);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/legislature/national-assembly/members")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json.success) {
          throw new Error(json.error || `Failed to load members (${r.status})`);
        }
        return json.data as Member[];
      })
      .then((data) => {
        if (!cancelled) setMembers(Array.isArray(data) ? data : []);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message || "Failed to load members");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parties = useMemo(() => {
    if (!members) return [];
    return Array.from(new Set(members.map((m) => m.party).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [members]);

  const sortedMembers = useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) =>
      formatName(a.name).toLowerCase().localeCompare(formatName(b.name).toLowerCase()),
    );
  }, [members]);

  const filteredMembers = useMemo(() => {
    return sortedMembers.filter((member) => {
      const formattedName = formatName(member.name);
      const matchesSearch = matchesText(searchTerm, formattedName, member.seat, member.party);

      const matchesParty = !selectedParty || member.party === selectedParty;
      const matchesType = !selectedType || member.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [sortedMembers, searchTerm, selectedParty, selectedType]);

  // Reset page index safely to page 1 whenever search criteria boundaries shift

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
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedParty("");
    setSelectedType("");
  };

  // Safe client-side spreadsheet compilation mapping values strictly to valid tabular footprints
  const handleExportCSV = () => {
    const headers = ["No.", "Name", "Constituency / County", "Political Party", "Representation Type"];
    const rows = filteredMembers.map((member, idx) => [
      (idx + 1).toString(),
      `"${formatName(member.name).replace(/"/g, '""')}"`,
      `"${(member.seat || "").replace(/"/g, '""')}"`,
      `"${(member.party || "").replace(/"/g, '""')}"`,
      `"${(member.type || "").replace(/"/g, '""')}"`,
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

  if (loadError) {
    return (
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <p className="govuk-body">Could not load the members list. {loadError}</p>
      </main>
    );
  }

  if (!members) {
    return (
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <p className="govuk-body">Loading members of the National Assembly…</p>
      </main>
    );
  }

  return (
    <main className="govuk-main-wrapper" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Members of the National Assembly</h1>
          <p className="govuk-body govuk-!-margin-bottom-6">
            Official public register of the 13th Parliament (2022–2027) legislative representatives. 
            Names are displayed in natural order (First Name, Surname) for easier reading.
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
                  placeholder="Name, constituency or party..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                  onChange={(e) => { setSelectedParty(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Parties</option>
                  {parties.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
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
                  onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
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
            <div className="govuk-!-margin-bottom-6" style={{ background: '#f3f2f1', padding: '16px', borderLeft: '4px solid #1d70b8' }}>
              <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                    style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderRadius: '4px' }}
                  >
                    Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                  </button>
                )}
                {selectedParty && (
                  <button 
                    type="button"
                    onClick={() => { setSelectedParty(""); setCurrentPage(1); }}
                    style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderRadius: '4px' }}
                  >
                    Party: {selectedParty} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                  </button>
                )}
                {selectedType && (
                  <button 
                    type="button"
                    onClick={() => { setSelectedType(""); setCurrentPage(1); }}
                    style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderRadius: '4px' }}
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
          <div className="govuk-inset-text govuk-!-margin-bottom-6">
            <p className="govuk-body govuk-!-margin-bottom-2">
              <strong>Open Data:</strong> Machine-readable data access aligned with national open information disclosure guidelines. The download reflects your current search and filter criteria.
            </p>
            <button 
              type="button" 
              onClick={handleExportCSV}
              className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
            >
              Download filtered roster as CSV
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
                          {member.slug ? (
                            <Link
                              href={`/government/people/${member.slug}`}
                              className="govuk-link govuk-!-font-weight-bold"
                            >
                              {formatName(member.name)}
                            </Link>
                          ) : (
                            <span className="govuk-!-font-weight-bold">
                              {formatName(member.name)}
                            </span>
                          )}
                        </th>
                        <td className="govuk-table__cell govuk-body-s">{member.seat}</td>
                        <td className="govuk-table__cell govuk-body-s">
                          <span className="govuk-!-font-weight-bold">{member.party}</span>
                        </td>
                        <td className="govuk-table__cell govuk-body-s">
                          <span className={`govuk-tag ${member.type === 'Constituency' ? 'govuk-tag--blue' : member.type === 'Women Representative' ? 'govuk-tag--purple' : 'govuk-tag--grey'}`}>
                            {member.type}
                          </span>
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
                        <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" viewBox="0 0 17 13">
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
                        <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" viewBox="0 0 17 13">
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
              <p>No parliamentary representatives match your specified search keywords or filter criteria.</p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}