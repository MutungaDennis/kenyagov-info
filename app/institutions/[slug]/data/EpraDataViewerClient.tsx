'use client';

import { useState, useMemo } from 'react';

interface Cycle {
  id: string;
  start_date: string;
  end_date: string;
  usd_kes_exchange_rate: number;
  is_active: boolean;
}

interface TownPrice {
  cycle_id: string;
  town_name: string;
  price_pms: number;
  price_ago: number;
  price_ik: number;
}

interface EpraClientProps {
  allCycles: Cycle[];
  defaultCycleId: string;
  globalTownPrices: TownPrice[];
  globalFormulaMatrix: any[];
  trendsLog: any[];
}

export default function EpraDataViewerClient({ 
  allCycles, 
  defaultCycleId, 
  globalTownPrices, 
  globalFormulaMatrix,
  trendsLog 
}: EpraClientProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string>(defaultCycleId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Extract metadata parameters matching our currently selected dropdown cycle configuration
  const currentCycle = useMemo(() => {
    return allCycles.find(c => c.id === selectedCycleId)!;
  }, [allCycles, selectedCycleId]);

  // Filter out towns belonging exclusively to the active chosen cycle
  const currentCycleTowns = useMemo(() => {
    return globalTownPrices.filter(t => t.cycle_id === selectedCycleId);
  }, [globalTownPrices, selectedCycleId]);

  // Extract itemized breakdown calculations for the current cycle
  const currentFormula = useMemo(() => {
    return globalFormulaMatrix.find(f => f.cycle_id === selectedCycleId);
  }, [globalFormulaMatrix, selectedCycleId]);

  // CRITICAL REQUIREMENT: Locate and extract Nairobi values to build our prominent Bank Holiday style cards
  const nairobiPrices = useMemo(() => {
    return currentCycleTowns.find(t => t.town_name === 'Nairobi') || { price_pms: 0, price_ago: 0, price_ik: 0 };
  }, [currentCycleTowns]);

  // Alphabet listing generator for sorting buttons
  const alphabet = useMemo(() => {
    const letters = new Set(currentCycleTowns.map(t => t.town_name.charAt(0).toUpperCase()));
    return ['All', ...Array.from(letters).sort()];
  }, [currentCycleTowns]);

  // Search and filter execution engine block
  const filteredTowns = useMemo(() => {
    return currentCycleTowns.filter(town => {
      const matchesSearch = town.town_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLetter = selectedLetter === 'All' || town.town_name.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesLetter;
    });
  }, [currentCycleTowns, searchTerm, selectedLetter]);

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
        
        {/* CYCLE CONTROLLER SELECT DROPDOWN */}
        <div className="govuk-form-group" style={{ background: '#f3f2f1', padding: '15px', borderLeft: '4px solid #002147', marginBottom: '30px' }}>
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="cycle-selector-dropdown">
            Select Price Announcement Cycle Window
          </label>
          <select 
            className="govuk-select" 
            id="cycle-selector-dropdown"
            value={selectedCycleId}
            onChange={(e) => { setSelectedCycleId(e.target.value); clearFilters(); }}
          >
            {allCycles.map((c) => (
              <option key={c.id} value={c.id}>
                {new Date(c.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} to {new Date(c.end_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} {c.is_active ? '(Current Live Period)' : '(Archived Log)'}
              </option>
            ))}
          </select>
        </div>

        {/* =========================================================================
            HIGH-VISIBILITY "BANK HOLIDAY" STYLE DISPLAY CARDS FOR NAIROBI BALANCES
           ========================================================================= */}
        <div style={{ background: '#002147', padding: '20px', marginBottom: '35px' }}>
          <h2 className="govuk-heading-m" style={{ color: '#ffffff', marginBottom: '15px' }}>
            Nairobi Baseline Maximum Pump Caps
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
            
            {/* Card 1: Super Petrol */}
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #ffbf47', position: 'relative' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Super Petrol (PMS)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_pms.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>Per Litre Retail Limit</span>
            </div>

            {/* Card 2: Diesel */}
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #00703c', position: 'relative' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Diesel (AGO)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_ago.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>Per Litre Retail Limit</span>
            </div>

            {/* Card 3: Kerosene */}
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #d4351c', position: 'relative' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Kerosene (IK)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0 0 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_ik.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>Per Litre Retail Limit</span>
            </div>

          </div>
        </div>

        {/* =========================================================================
            PURE SVG DYNAMIC ACCESSIBLE CRUDE BENCHMARKS CHART VIEWPORT
           ========================================================================= */}
        <h2 className="govuk-heading-l" id="trends">Crude Oil Price Trend Line</h2>
        <p className="govuk-body-s">Tracks international Murban Crude cost parameters ($/Bbl) leading up to calculation cycles.</p>
        
        <div style={{ background: '#ffffff', border: '1px solid #bfc1c3', padding: '20px', marginBottom: '40px' }}>
          {trendsLog.length === 0 ? (
            <p className="govuk-body-s govuk-hint">Insufficient macro rows populated to execute line trace plotting sequences.</p>
          ) : (
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f2f1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f2f1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#bfc1c3" />
              
              <text x="5" y="24" fill="#505a5f" fontSize="9">USD 80</text>
              <text x="5" y="74" fill="#505a5f" fontSize="9">USD 70</text>
              <text x="5" y="124" fill="#505a5f" fontSize="9">USD 60</text>

              {/* Dynamically draw vectors tracing rows loaded from epra_international_trends */}
              <polyline
                fill="none" stroke="#002147" strokeWidth="3"
                points={trendsLog.map((t, i) => `${60 + i * 80},${120 - (t.murban_crude_usd_bbl - 60) * 5}`).join(' ')}
              />
              {trendsLog.map((t, i) => (
                <g key={i}>
                  <circle cx={60 + i * 80} cy={120 - (t.murban_crude_usd_bbl - 60) * 5} r="4" fill="#ffbf47" />
                  <text x={60 + i * 80} y="145" fill="#0b0c0c" fontSize="9" textAnchor="middle">{t.trend_month_label}</text>
                  <text x={60 + i * 80} y={110 - (t.murban_crude_usd_bbl - 60) * 5} fill="#002147" fontSize="9" fontWeight="bold" textAnchor="middle">${t.murban_crude_usd_bbl}</text>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* =========================================================================
            ALPHABETICAL SEARCH AND SEARCH MATRIX FOR ALL COUNTRIES
           ========================================================================= */}
        <h2 className="govuk-heading-l" id="all-towns">All Registered Localities Price Index</h2>
        
        <div style={{ background: '#f3f2f1', padding: '20px', border: '1px solid #bfc1c3', marginBottom: '25px' }}>
          <div className="govuk-form-group">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="town-search-box">Locate specific town</label>
            <input 
              className="govuk-input govuk-input--width-20" 
              id="town-search-box" type="text" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Malindi, Moyale"
            />
          </div>

          <div className="govuk-form-group" style={{ margin: 0 }}>
            <span className="govuk-label govuk-!-font-weight-bold" style={{ display: 'block', marginBottom: '8px' }}>Filter alphabetically</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter(letter)}
                  style={{
                    padding: '5px 9px',
                    fontSize: '13px',
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

          {(searchTerm !== '' || selectedLetter !== 'All') && (
            <div className="govuk-!-margin-top-3" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bfc1c3', paddingTop: '10px' }}>
              <span className="govuk-body-s">Showing <strong>{filteredTowns.length}</strong> filtered results.</span>
              <button onClick={clearFilters} type="button" className="govuk-link govuk-!-font-size-14" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Clear filters</button>
            </div>
          )}
        </div>

        {/* COMPREHENSIVE PAGINATED AND NUMBERED DATATABLE */}
        {filteredTowns.length === 0 ? (
          <div className="govuk-inset-text">No location data items match your target filtration matrix fields.</div>
        ) : (
          <div>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header" style={{ width: '40px' }}>#</th>
                  <th scope="col" className="govuk-table__header">Town Designation</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Petrol</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Diesel</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Kerosene</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {paginatedTowns.map((town, idx) => {
                  const absoluteNumber = (currentPage - 1) * recordsPerPage + idx + 1;
                  return (
                    <tr key={idx} className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ color: '#505a5f', fontSize: '13px' }}>{absoluteNumber}</td>
                      <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>{town.town_name}</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_pms.toFixed(2)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_ago.toFixed(2)}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">KSh {town.price_ik.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION LINK CONTAINER SYSTEM */}
            {/* =========================================================================
    GOV.UK COMPLIANT TRUNCATED PAGINATION INTERFACE
   ========================================================================= */}
{totalPages > 1 && (
  <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation">
    
    {/* Previous Page Link Indicator */}
    {currentPage > 1 && (
      <div className="govuk-pagination__prev">
        <button 
          onClick={() => setCurrentPage(p => p - 1)} 
          className="govuk-link govuk-pagination__link" 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span className="govuk-pagination__link-title">‹ Previous page</span>
        </button>
      </div>
    )}

    {/* Truncated Page Numbers Number Matrix */}
    <ul className="govuk-pagination__list" style={{ display: 'inline-flex', gap: '5px', padding: 0, listStyle: 'none', alignItems: 'center' }}>
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        const isCurrent = currentPage === pageNum;

        // GOV.UK Pagination Rules: Always show first, last, current, and adjacent pages
        const isFirstPage = pageNum === 1;
        const isLastPage = pageNum === totalPages;
        const isAdjacentToCurrent = Math.abs(currentPage - pageNum) <= 1;

        // Logic check to figure out if an ellipsis indicator is required
        const isEllipsisSlot = (pageNum === 2 && currentPage > 3) || (pageNum === totalPages - 1 && currentPage < totalPages - 2);

        if (isFirstPage || isLastPage || isAdjacentToCurrent) {
          return (
            <li key={i} className={`govuk-pagination__item ${isCurrent ? 'govuk-pagination__item--current' : ''}`}>
              <button 
                onClick={() => setCurrentPage(pageNum)} 
                className="govuk-link govuk-pagination__link" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '4px 10px', 
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  textDecoration: isCurrent ? 'none' : 'underline',
                  cursor: 'pointer'
                }}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            </li>
          );
        }

        if (isEllipsisSlot) {
          return (
            <li key={i} className="govuk-pagination__item" style={{ padding: '4px 6px', color: '#505a5f' }} aria-hidden="true">
              &hellip;
            </li>
          );
        }

        return null;
      })}
    </ul>

    {/* Next Page Link Indicator */}
    {currentPage < totalPages && (
      <div className="govuk-pagination__next">
        <button 
          onClick={() => setCurrentPage(p => p + 1)} 
          className="govuk-link govuk-pagination__link" 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span className="govuk-pagination__link-title">Next page ›</span>
        </button>
      </div>
    )}
  </nav>
)}

          </div>
        )}

      </div>

      {/* FIXED SIDEBAR INDEX MONITOR BLOCK */}
      <div className="govuk-grid-column-one-third">
        <div style={{ borderTop: '5px solid #ffbf47', padding: '20px', background: '#f3f2f1' }}>
          <h3 className="govuk-heading-m">Macro Financials</h3>
          <ul className="govuk-list govuk-list--spaced govuk-!-font-size-14">
            <li>
              <span className="govuk-hint" style={{ display: 'block', fontSize: '11px' }}>Central Bank Mean Exchange Base:</span>
              <strong>1 USD = KSh {currentCycle.usd_kes_exchange_rate.toFixed(2)}</strong>
            </li>
            {currentFormula && (
              <>
                <hr className="govuk-section-break govuk-section-break--s govuk-section-break--visible" />
                <li>
                  <span className="govuk-hint" style={{ display: 'block', fontSize: '11px' }}>Nairobi Landed Premium:</span>
                  <span>Petrol Cost Base: <strong>KSh {currentFormula.landed_cost_kes_pms.toFixed(2)}</strong></span>
                </li>
                <li>
                  <span className="govuk-hint" style={{ display: 'block', fontSize: '11px' }}>VAT Statutory Matrix Rate:</span>
                  <span>{currentFormula.tax_vat_pms > 20 ? 'Standard 16% Energy Tax Floor' : 'Concessionary 8% Finance Act Split'}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
