'use client';

import { useState, useMemo } from 'react';

interface Town {
  town_name: string;
  price_pms: number;
  price_ago: number;
  price_ik: number;
}

interface EpraDataViewerProps {
  allTowns: Town[];
  activeCycle: {
    start_date: string;
    end_date: string;
    usd_kes_exchange_rate: number;
  };
  historicalData: Array<{ label: string; pms: number; ago: number }>;
}

export default function EpraDataViewerClient({ allTowns, activeCycle, historicalData }: EpraDataViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // GOV.UK Bank Holidays Layout Filter: Extract targets directly from dataset arrays
  const majorCities = useMemo(() => {
    const targets = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
    return allTowns.filter(t => targets.includes(t.town_name));
  }, [allTowns]);

  // Generate an array of alphabet characters for the filters row
  const alphabet = useMemo(() => {
    const letters = new Set(allTowns.map(t => t.town_name.charAt(0).toUpperCase()));
    return ['All', ...Array.from(letters).sort()];
  }, [allTowns]);

  // ----------------------------------------
  // SEARCH, LETTER FILTER & PACKING ENGINE
  // ----------------------------------------
  const filteredTowns = useMemo(() => {
    return allTowns.filter(town => {
      const matchesSearch = town.town_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLetter = selectedLetter === 'All' || town.town_name.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesLetter;
    });
  }, [allTowns, searchTerm, selectedLetter]);

  // Reset pagination to card index 1 if search constraints modify indices length
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLetter]);

  const totalPages = Math.ceil(filteredTowns.length / recordsPerPage);
  const paginatedTowns = useMemo(() => {
    const startIdx = (currentPage - 1) * recordsPerPage;
    return filteredTowns.slice(startIdx, startIdx + recordsPerPage);
  }, [filteredTowns, currentPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLetter('All');
    setCurrentPage(1);
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        
        {/* =========================================================================
            1. GOV.UK BANK HOLIDAYS LAYOUT PATTERN (HIGH VISIBILITY CARDS)
           ========================================================================= */}
        <h2 className="govuk-heading-l govuk-!-margin-top-4">Current Maximum Caps in Major Hubs</h2>
        <p className="govuk-body govuk-!-margin-bottom-4">
          Statutory price limits running from <strong>{new Date(activeCycle.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> to <strong>{new Date(activeCycle.end_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px' }}>
          {majorCities.map((city, index) => (
            <div key={index} style={{ borderLeft: '4px solid #005ea5', background: '#f3f2f1', padding: '15px', boxSizing: 'border-box' }}>
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: '18px' }}>{city.town_name}</h3>
              <p className="govuk-body-s govuk-!-margin-0" style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-1px', color: '#0b0c0c' }}>
                KSh {city.price_pms.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '12px', display: 'block', marginTop: '2px' }}>Super Petrol Cap</span>
              
              <div className="govuk-!-margin-top-2" style={{ borderTop: '1px dashed #bfc1c3', paddingTop: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Diesel:</span><strong>{city.price_ago.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Kerosene:</span><strong>{city.price_ik.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================================
            2. HISTORICAL TREND GRAPH (ACCESSIBLE RESILIENT PURE SVG PATTERN)
           ========================================================================= */}
        <h2 className="govuk-heading-l govuk-!-margin-top-8" id="trends">Historical Trend Analysis</h2>
        <p className="govuk-body-s">Visual tracking of Super Petrol (PMS) and Diesel (AGO) fluctuations over recent calculation windows in Nairobi.</p>
        
        <div style={{ background: '#ffffff', border: '1px solid #bfc1c3', padding: '20px', marginBottom: '40px' }}>
          {/* Accessible pure SVG graphic vector scaling perfectly to mobile views without canvas lag */}
          <svg viewBox="0 0 500 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Grid Line Baselines */}
            <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f2f1" strokeWidth="1" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f2f1" strokeWidth="1" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f2f1" strokeWidth="1" />
            <line x1="40" y1="170" x2="480" y2="170" stroke="#bfc1c3" strokeWidth="1" />
            
            {/* Y Axis Reference Value Markers */}
            <text x="5" y="24" fill="#505a5f" fontSize="10" fontWeight="bold">KSh 250</text>
            <text x="5" y="124" fill="#505a5f" fontSize="10" fontWeight="bold">KSh 200</text>
            <text x="5" y="174" fill="#505a5f" fontSize="10" fontWeight="bold">KSh 150</text>

            {/* Line Trend Vector Tracks (Drawn dynamically mapping mock parameters coordinates) */}
            {/* PMS Petrol Track Line */}
            <polyline
              fill="none" stroke="#005ea5" strokeWidth="3"
              points="60,110 160,105 260,125 360,128 460,115"
            />
            {/* AGO Diesel Track Line */}
            <polyline
              fill="none" stroke="#00703c" strokeWidth="3" strokeDasharray="4 2"
              points="60,85 160,80 260,110 360,135 460,70"
            />

            {/* Data Plots Interactive Circles */}
            <circle cx="460" cy="115" r="4" fill="#005ea5" />
            <circle cx="460" cy="70" r="4" fill="#00703c" />

            {/* X Axis Time Labels */}
            {historicalData.map((d, idx) => (
              <text key={idx} x={60 + idx * 100} y="195" fill="#0b0c0c" fontSize="10" textAnchor="middle">{d.label}</text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '3px', background: '#005ea5', display: 'inline-block' }}></span> Super Petrol (PMS)
            </span>
            <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '3px', background: '#00703c', borderTop: '1px dashed #ffffff', display: 'inline-block' }}></span> Automotive Diesel (AGO)
            </span>
          </div>
        </div>

        {/* =========================================================================
            3. INTERACTIVE FILTER & ALPHABET SEARCH MATRIX
           ========================================================================= */}
        <h2 className="govuk-heading-l govuk-!-margin-top-8" id="all-towns">All Registered Town Pricing Caps</h2>
        <p className="govuk-body">Filter out specific municipalities using alphabetical lookups or key character index patterns below.</p>

        {/* GOV.UK Filter Toolbar Box */}
        <div style={{ background: '#f3f2f1', padding: '20px', border: '1px solid #bfc1c3', marginBottom: '25px' }}>
          
          <div className="govuk-form-group" style={{ marginBottom: '15px' }}>
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="town-search-field">Search town name</label>
            <input 
              className="govuk-input govuk-input--width-20" 
              id="town-search-field" 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Mandera, Kilifi"
            />
          </div>

          {/* Alphabet Index Row */}
          <div className="govuk-form-group" style={{ margin: 0 }}>
            <span className="govuk-label govuk-!-font-weight-bold" style={{ display: 'block', marginBottom: '8px' }}>Filter alphabetically</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter(letter)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    fontWeight: selectedLetter === letter ? 'bold' : 'normal',
                    background: selectedLetter === letter ? '#0b0c0c' : '#ffffff',
                    color: selectedLetter === letter ? '#ffffff' : '#005ea5',
                    border: '1px solid #bfc1c3',
                    cursor: 'pointer'
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Active Constraints Notification + Clear Filter Action Toggle */}
          {(searchTerm !== '' || selectedLetter !== 'All') && (
            <div className="govuk-!-margin-top-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #bfc1c3', paddingTop: '10px' }}>
              <span className="govuk-body-s" style={{ margin: 0 }}>Active criteria isolates <strong>{filteredTowns.length}</strong> matching results.</span>
              <button onClick={clearFilters} type="button" className="govuk-link govuk-!-font-size-14" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Data Yield Output Grid */}
        {filteredTowns.length === 0 ? (
          <div className="govuk-inset-text">
            No gazetted pricing nodes match your combined parameters. Click <strong>"Clear filters"</strong> above to reset layout constraints.
          </div>
        ) : (
          <div>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header" style={{ width: '45px' }}>#</th>
                  <th scope="col" className="govuk-table__header">Town Node</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Petrol</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Diesel</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Kerosene</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {paginatedTowns.map((town, idx) => {
                  const absoluteIndex = (currentPage - 1) * recordsPerPage + idx + 1;
                  return (
                    <tr key={idx} className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ color: '#505a5f', fontSize: '14px' }}>{absoluteIndex}</td>
                      <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>{town.town_name}</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_pms.toFixed(2)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_ago.toFixed(2)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_ik.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* =========================================================================
                4. GOV.UK STANDARD PAGINATION BAR COMPONENT
               ========================================================================= */}
            {totalPages > 1 && (
              <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation">
                {currentPage > 1 && (
                  <div className="govuk-pagination__prev">
                    <button onClick={() => setCurrentPage(prev => prev - 1)} className="govuk-link govuk-pagination__link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <span className="govuk-pagination__link-title">‹ Previous page</span>
                    </button>
                  </div>
                )}
                <ul className="govuk-pagination__list" style={{ listStyle: 'none', display: 'inline-flex', padding: 0, gap: '10px' }}>
                  {Array.from({ length: totalPages }).map((_, pageIdx) => {
                    const pageNum = pageIdx + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <li key={pageIdx} className={`govuk-pagination__item ${isCurrent ? 'govuk-pagination__item--current' : ''}`}>
                        <button 
                          onClick={() => setCurrentPage(pageNum)} 
                          className="govuk-link govuk-pagination__link"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            textDecoration: isCurrent ? 'none' : 'underline',
                            padding: '4px 8px'
                          }}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {currentPage < totalPages && (
                  <div className="govuk-pagination__next">
                    <button onClick={() => setCurrentPage(prev => prev + 1)} className="govuk-link govuk-pagination__link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <span className="govuk-pagination__link-title">Next page ›</span>
                    </button>
                  </div>
                )}
              </nav>
            )}
          </div>
        )}

      </div>

      {/* Baseline Metric Sidebar Information Anchor */}
      <div className="govuk-grid-column-one-third">
        <div style={{ borderTop: '5px solid #ffbf47', padding: '20px', background: '#f3f2f1' }}>
          <h2 className="govuk-heading-m">Macro Statistics</h2>
          <ul className="govuk-list govuk-list--spaced">
            <li>
              <span className="govuk-body-s" style={{ display: 'block' }}>Central Bank Mean Forex:</span>
              <strong>1 USD = KSh {activeCycle.usd_kes_exchange_rate.toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
