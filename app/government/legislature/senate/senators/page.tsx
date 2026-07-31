'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { senateMembers, type Senator } from "@/data/senate-members";

// Helper to format "Surname, Firstname" to "Firstname Surname" for better readability
const formatName = (name: string) => {
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    return `${parts[1]} ${parts[0]}`;
  }
  return name;
};

export default function SenateSenatorsPage() {
  const searchParams = useSearchParams();
  
  // Pre-fill filters from URL parameters (e.g., ?type=Elected)
  const initialType = searchParams.get('type') || "";
  const initialParty = searchParams.get('party') || "";
  const initialSearch = searchParams.get('q') || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedParty, setSelectedParty] = useState(initialParty);
  const [selectedType, setSelectedType] = useState(initialType);

  // Sort senators alphabetically by formatted name (First Last) for better UX
  const sortedSenators = useMemo(() => {
    return [...senateMembers].sort((a, b) => {
      const nameA = formatName(a.name).toLowerCase();
      const nameB = formatName(b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, []);

  // Filter full array based on user interactions
  const filteredSenators = useMemo(() => {
    return sortedSenators.filter((sen) => {
      const formattedName = formatName(sen.name);
      const matchesSearch =
        formattedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sen.county || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        sen.party.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || sen.party === selectedParty;
      const matchesType = !selectedType || sen.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [sortedSenators, searchTerm, selectedParty, selectedType]);

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
      `"${formatName(sen.name).replace(/"/g, '""')}"`, // ✅ Uses formatted name in CSV too
      `"${(sen.county || "National Representation").replace(/"/g, '""')}"`,
      `"${sen.party.replace(/"/g, '""')}"`,
      `"${sen.type.replace(/"/g, '""')}"`
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

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "The Legislature", href: "/government/legislature" },
          { text: "Senate", href: "/government/legislature/senate" },
          { text: "Senators" },
        ]}
      />

      <div className="govuk-width-container">
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
                    <option value="ANC">ANC - Amani National Congress</option>
                    <option value="DAP-K">DAP-K - Democratic Action Party</option>
                    <option value="DP">DP - Democratic Party</option>
                    <option value="FORD-K">FORD-K - Forum for the Restoration of Democracy</option>
                    <option value="Independent">Independent</option>
                    <option value="JP">JP - Jubilee Party</option>
                    <option value="KANU">KANU - Kenya African National Union</option>
                    <option value="NRA">NRA - National Reconstruction Alliance</option>
                    <option value="ODM">ODM - Orange Democratic Movement</option>
                    <option value="UDA">UDA - United Democratic Alliance</option>
                    <option value="UDM">UDM - United Democratic Movement</option>
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
              Showing {filteredSenators.length} of {senateMembers.length} senators
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
                          <Link href={`/government/people/${sen.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {formatName(sen.name)} {/* ✅ Displays "Firstname Surname" */}
                          </Link>
                        </th>
                        <td className="govuk-table__cell govuk-body-s">{sen.county || "National Representation"}</td>
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
      </div>
    </>
  );
}