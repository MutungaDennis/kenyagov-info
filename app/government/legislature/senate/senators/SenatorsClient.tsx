'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { matchesSearch as matchesText } from "@/lib/search/match";
import { useSearchParams } from "next/navigation";
type Senator = {
  id: string;
  name: string;
  seat: string;
  party: string;
  type: string;
  slug: string | null;
};

const formatName = (name: string) => {
  if (name.includes(",")) {
    const parts = name.split(",").map((p) => p.trim());
    return `${parts[1]} ${parts[0]}`;
  }
  return name;
};

export default function SenatorsClient() {
  const searchParams = useSearchParams();

  const initialType = searchParams.get("type") || "";
  const initialParty = searchParams.get("party") || "";
  const initialSearch = searchParams.get("q") || "";

  const [senators, setSenators] = useState<Senator[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedParty, setSelectedParty] = useState(initialParty);
  const [selectedType, setSelectedType] = useState(initialType);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/legislature/senate/members")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json.success) {
          throw new Error(json.error || `Failed to load senators (${r.status})`);
        }
        return json.data as Senator[];
      })
      .then((data) => {
        if (!cancelled) setSenators(Array.isArray(data) ? data : []);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message || "Failed to load senators");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parties = useMemo(() => {
    if (!senators) return [];
    return Array.from(new Set(senators.map((s) => s.party).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [senators]);

  const sortedSenators = useMemo(() => {
    if (!senators) return [];
    return [...senators].sort((a, b) =>
      formatName(a.name).toLowerCase().localeCompare(formatName(b.name).toLowerCase()),
    );
  }, [senators]);

  const filteredSenators = useMemo(() => {
    return sortedSenators.filter((sen) => {
      const formattedName = formatName(sen.name);
      const matchesSearch = matchesText(searchTerm, formattedName, sen.seat, sen.party);

      const matchesParty = !selectedParty || sen.party === selectedParty;
      const matchesType = !selectedType || sen.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [sortedSenators, searchTerm, selectedParty, selectedType]);


  const totalSenators = filteredSenators.length;
  const hasActiveFilters = searchTerm !== "" || selectedParty !== "" || selectedType !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedParty("");
    setSelectedType("");
  };

  const handleExportCSV = () => {
    const headers = ["No.", "Name", "County Delegation", "Political Party", "Representation Type"];
    const rows = filteredSenators.map((sen, idx) => [
      (idx + 1).toString(),
      `"${formatName(sen.name).replace(/"/g, '""')}"`,
      `"${(sen.seat || "National Representation").replace(/"/g, '""')}"`,
      `"${(sen.party || "").replace(/"/g, '""')}"`,
      `"${(sen.type || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `senate_senators_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadError) {
    return (
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <p className="govuk-body">Could not load the senators list. {loadError}</p>
      </main>
    );
  }

  if (!senators) {
    return (
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <p className="govuk-body">Loading senators…</p>
      </main>
    );
  }

  return (
    <main className="govuk-main-wrapper" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Senators of Kenya</h1>
          <p className="govuk-body govuk-!-margin-bottom-6">
            Official public register of the 13th Parliament legislative representatives. 
            Names are displayed in natural order (First Name, Surname) for easier reading.
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
                  placeholder="Name, county or party..."
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
            <div className="govuk-!-margin-bottom-6" style={{ background: '#f3f2f1', padding: '16px', borderLeft: '4px solid #1d70b8' }}>
              <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => setSearchTerm("")}
                    style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderRadius: '4px' }}
                  >
                    Keywords: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                  </button>
                )}
                {selectedParty && (
                  <button 
                    type="button"
                    onClick={() => setSelectedParty("")}
                    style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderRadius: '4px' }}
                  >
                    Party: {selectedParty} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                  </button>
                )}
                {selectedType && (
                  <button 
                    type="button"
                    onClick={() => setSelectedType("")}
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
              Download filtered list as CSV
            </button>
          </div>

          {/* Results Live Announcer Counter */}
          <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
            Showing {totalSenators.toLocaleString()} of {senators.length} senators
          </h2>

          {filteredSenators.length > 0 ? (
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
                  {filteredSenators.map((sen, index) => (
                    <tr key={sen.id} className="govuk-table__row">
                      <td className="govuk-table__cell govuk-body-s">{index + 1}</td>
                      <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                        {sen.slug ? (
                          <Link href={`/government/people/${sen.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {formatName(sen.name)}
                          </Link>
                        ) : (
                          <span className="govuk-!-font-weight-bold">{formatName(sen.name)}</span>
                        )}
                      </th>
                      <td className="govuk-table__cell govuk-body-s">{sen.seat || "National Representation"}</td>
                      <td className="govuk-table__cell govuk-body-s">
                        <span className="govuk-!-font-weight-bold">{sen.party}</span>
                      </td>
                      <td className="govuk-table__cell govuk-body-s">
                        <span className={`govuk-tag ${sen.type === 'Elected' ? 'govuk-tag--blue' : 'govuk-tag--grey'}`}>
                          {sen.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="govuk-body govuk-!-margin-top-4">
              <p>No senators match your active keyword or filtering configurations.</p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}