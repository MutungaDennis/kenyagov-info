'use client';

import { useState, useMemo } from 'react';

// =========================================================================
// DATA INTERFACES & SCHEMA CONTRACTS
// =========================================================================
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

  // Extract current dropdown configuration state metadata
  const currentCycle = useMemo(() => {
    return allCycles.find(c => c.id === selectedCycleId) || allCycles[0];
  }, [allCycles, selectedCycleId]);

  const currentCycleTowns = useMemo(() => {
    return globalTownPrices.filter(t => t.cycle_id === selectedCycleId);
  }, [globalTownPrices, selectedCycleId]);

  const currentFormula = useMemo(() => {
    return globalFormulaMatrix.find(f => f.cycle_id === selectedCycleId);
  }, [globalFormulaMatrix, selectedCycleId]);

  // Locate Nairobi pricing specifically to feed high-visibility cards
  const nairobiPrices = useMemo(() => {
    return currentCycleTowns.find(t => t.town_name === 'Nairobi') || { price_pms: 0, price_ago: 0, price_ik: 0 };
  }, [currentCycleTowns]);

  // =========================================================================
  // MANDATORY DATA TRANSFORMATION LOGIC FOR GOV.UK SEPARATED VISUALIZATIONS
  // =========================================================================
  
  // Chronological mapping array (oldest to newest) to process variations correctly
  const chronologicalCycles = useMemo(() => {
    return [...allCycles].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [allCycles]);

  // Table 1 Modeling: Historical Nairobi summary matrix
  const tableOneData = useMemo(() => {
    return chronologicalCycles.map(c => {
      const nrb = globalTownPrices.find(t => t.cycle_id === c.id && t.town_name === 'Nairobi') || { price_pms: 0, price_ago: 0, price_ik: 0 };
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      const dateText = `${start.getDate()} ${start.toLocaleString('en-KE', { month: 'short' })} to ${end.getDate()} ${end.toLocaleString('en-KE', { month: 'short', year: 'numeric' })}`;
      return { id: c.id, dateText, pms: nrb.price_pms, ago: nrb.price_ago, ik: nrb.price_ik };
    });
  }, [chronologicalCycles, globalTownPrices]);

  // Table 2 Modeling: Component adjustments tracking ( Isolating Landed vs Taxes vs Margins )
  const tableTwoData = useMemo(() => {
    return chronologicalCycles.map((c, idx) => {
      const start = new Date(c.start_date);
      const cycleLabel = `${start.toLocaleString('en-KE', { month: 'short' })} ${start.getFullYear()}${c.end_date === '2026-05-18' ? ' (Pre-Rev)' : c.start_date === '2026-05-19' ? ' (Revised)' : ''}`;
      
      const f = globalFormulaMatrix.find(form => form.cycle_id === c.id);
      const towns = globalTownPrices.filter(t => t.cycle_id === c.id);
      const nrb = towns.find(t => t.town_name === 'Nairobi') || { price_pms: 0, price_ago: 0, price_ik: 0 };

      if (!f) {
        return { label: cycleLabel, landedStr: "0.00", taxStr: "0.00", marginStr: "0.00", totalStr: "0.00", rawPms: nrb.price_pms };
      }

      const totalTaxes = (f.tax_vat_pms || 0) + (f.tax_excise_duty_pms || 0) + (f.levy_road_maintenance_pms || 0) + (f.levy_petroleum_dev_pms || 0) + (f.levy_petroleum_reg_pms || 0) + (f.levy_railway_dev_pms || 0) + (f.levy_anti_adulteration_pms || 0) + (f.levy_merchant_shipping_pms || 0) + (f.levy_import_declaration_pms || 0);
      const totalMargins = (f.importers_margin_pms || 0) + (f.dealers_margin_pms || 0);
      const currentLanded = f.landed_cost_kes_pms || 0;

      if (idx === 0) {
        return { label: cycleLabel, landedStr: "Baseline", taxStr: "Baseline", marginStr: "Baseline", totalStr: "Baseline", rawPms: nrb.price_pms };
      }

      // Compute variance from previous chronologically logged entry row
      const prevCycle = chronologicalCycles[idx - 1];
      const prevF = globalFormulaMatrix.find(form => form.cycle_id === prevCycle.id);
      const prevTowns = globalTownPrices.filter(t => t.cycle_id === prevCycle.id);
      const prevNrb = prevTowns.find(t => t.town_name === 'Nairobi') || { price_pms: 0, price_ago: 0, price_ik: 0 };

      const prevLanded = prevF ? (prevF.landed_cost_kes_pms || 0) : currentLanded;
      const prevTaxes = prevF ? ((prevF.tax_vat_pms || 0) + (prevF.tax_excise_duty_pms || 0) + (prevF.levy_road_maintenance_pms || 0) + (prevF.levy_petroleum_dev_pms || 0) + (prevF.levy_petroleum_reg_pms || 0) + (prevF.levy_railway_dev_pms || 0) + (prevF.levy_anti_adulteration_pms || 0) + (prevF.levy_merchant_shipping_pms || 0) + (prevF.levy_import_declaration_pms || 0)) : totalTaxes;
      const prevMargins = prevF ? ((prevF.importers_margin_pms || 0) + (prevF.dealers_margin_pms || 0)) : totalMargins;

      const diffLanded = currentLanded - prevLanded;
      const diffTax = totalTaxes - prevTaxes;
      const diffMargin = totalMargins - prevMargins;
      const diffTotal = nrb.price_pms - prevNrb.price_pms;

      return {
        label: cycleLabel,
        landedStr: diffLanded === 0 ? "0.00" : diffLanded > 0 ? `+${diffLanded.toFixed(2)}` : `-${Math.abs(diffLanded).toFixed(2)}`,
        taxStr: diffTax === 0 ? "0.00" : diffTax > 0 ? `+${diffTax.toFixed(2)}` : `-${Math.abs(diffTax).toFixed(2)}`,
        marginStr: diffMargin === 0 ? "0.00" : diffMargin > 0 ? `+${diffMargin.toFixed(2)}` : `-${Math.abs(diffMargin).toFixed(2)}`,
        totalStr: diffTotal === 0 ? "0.00" : diffTotal > 0 ? `Up +${diffTotal.toFixed(2)}` : `Down -${Math.abs(diffTotal).toFixed(2)}`,
        rawPms: nrb.price_pms
      };
    });
  }, [chronologicalCycles, globalFormulaMatrix, globalTownPrices]);

  // Table 3 Modeling: Annual extremes and historical aggregate volatility metrics
  const tableThreeData = useMemo(() => {
    const pmsValues = globalTownPrices.filter(t => t.town_name === 'Nairobi').map(t => t.price_pms);
    if (pmsValues.length === 0) return { year: "2026", high: "0.00", low: "0.00", avg: "0.00" };
    const high = Math.max(...pmsValues);
    const low = Math.min(...pmsValues);
    const avg = pmsValues.reduce((sum, v) => sum + v, 0) / pmsValues.length;
    return { year: "2026 (YTD)", high: high.toFixed(2), low: low.toFixed(2), avg: avg.toFixed(2) };
  }, [globalTownPrices]);

  // Alphabetical Indexer Matrix for the search engine
  const alphabet = useMemo(() => {
    const letters = new Set(currentCycleTowns.map(t => t.town_name.charAt(0).toUpperCase()));
    return ['All', ...Array.from(letters).sort()];
  }, [currentCycleTowns]);

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
        
        {/* CYCLE SELECTION CONTAINER CONTROLLER */}
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
                {new Date(c.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })} to {new Date(c.end_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} {c.is_active ? '(Current Active Overrides)' : '(Historical Archive Log)'}
              </option>
            ))}
          </select>
        </div>

        {/* HIGH-VISIBILITY PANEL DISPLAY FOR CURRENT CYCLES */}
        <div style={{ background: '#002147', padding: '20px', marginBottom: '35px' }}>
          <h2 className="govuk-heading-m" style={{ color: '#ffffff', marginBottom: '15px' }}>
            Nairobi Baseline Maximum Pump Caps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #ffbf47' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Super Petrol (PMS)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_pms.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block' }}>Per Litre Retail Limit</span>
            </div>
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #00703c' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Diesel (AGO)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_ago.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block' }}>Per Litre Retail Limit</span>
            </div>
            <div style={{ background: '#ffffff', padding: '15px', borderTop: '6px solid #d4351c' }}>
              <span className="govuk-caption-m" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: '#505a5f' }}>Kerosene (IK)</span>
              <p className="govuk-body" style={{ fontSize: '32px', fontWeight: 'bold', margin: '5px 0', color: '#0b0c0c', letterSpacing: '-1px' }}>
                KSh {nairobiPrices.price_ik.toFixed(2)}
              </p>
              <span className="govuk-hint" style={{ fontSize: '11px', display: 'block' }}>Per Litre Retail Limit</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TABLE 1: CURRENT & HISTORICAL CYCLE SUMMARY
           ========================================================================= */}
        <div className="govuk-table-wrapper" style={{ overflowX: 'auto', marginBottom: '35px' }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">Table 1: EPRA Maximum Fuel Retail Pump Price Timeline Summary for Nairobi</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Month Cycle Window</th>
                <th scope="col" className="govuk-table__header">Town/Location</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Super Petrol (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Diesel (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Kerosene (Ksh)</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {[...tableOneData].reverse().map((r, i) => (
                <tr key={i} className="govuk-table__row" style={{ background: r.id === selectedCycleId ? '#f3f2f1' : 'none' }}>
                  <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>{r.dateText}</th>
                  <td className="govuk-table__cell">Nairobi</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">KSh {r.pms.toFixed(2)}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">KSh {r.ago.toFixed(2)}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">KSh {r.ik.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GRAPH 1 VISUALIZATION LAYER: RETAIL MAX SLIDING CHARTS CRADLE */}
        <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Chart 1: Multi-Month Retail Price Trend Vectors for Nairobi</h3>
        <p className="govuk-body-s govuk-hint">Maps comparative trajectory paths of Super Petrol (Solid Blue Vector Line) over sequential cycle horizons.</p>
        <div style={{ background: '#ffffff', border: '1px solid #bfc1c3', padding: '25px', marginBottom: '40px' }}>
          {tableOneData.length < 2 ? (
            <p className="govuk-body-s govuk-hint">Insufficient historical nodes parsed to output sequential trends mappings.</p>
          ) : (
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <line x1="45" y1="20" x2="480" y2="20" stroke="#f3f2f1" />
              <line x1="45" y1="70" x2="480" y2="70" stroke="#f3f2f1" />
              <line x1="45" y1="120" x2="480" y2="120" stroke="#bfc1c3" />
              <text x="5" y="24" fill="#505a5f" fontSize="9">KSh 220</text>
              <text x="5" y="74" fill="#505a5f" fontSize="9">KSh 185</text>
              <text x="5" y="124" fill="#505a5f" fontSize="9">KSh 150</text>
              <polyline fill="none" stroke="#005ea5" strokeWidth="3" points={tableOneData.map((r, idx) => `${60 + idx * 80},${120 - (r.pms - 150) * 1.4}`).join(' ')} />
              {tableOneData.map((r, idx) => (
                <g key={idx}>
                  <circle cx={60 + idx * 80} cy={120 - (r.pms - 150) * 1.4} r="4" fill={r.id === selectedCycleId ? '#ffbf47' : '#005ea5'} stroke={r.id === selectedCycleId ? '#002147' : 'none'} strokeWidth="1.5" />
                  <text x={60 + idx * 80} y="145" fill="#0b0c0c" fontSize="8" textAnchor="middle" fontWeight={r.id === selectedCycleId ? 'bold' : 'normal'}>
                    {new Date(chronologicalCycles[idx].start_date).toLocaleString('en-KE', { month: 'short' })}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* =========================================================================
            TABLE 2: MONTH-OVER-MONTH PRICE BREAKDOWN (THE "WHY" TABLE)
           ========================================================================= */}
        <div className="govuk-table-wrapper" style={{ overflowX: 'auto', marginBottom: '35px' }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">Table 2: Month-over-Month Price Component Breakdowns and Driving Overheads Impact</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Month Cycle</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Landed Cost Change (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Tax/Levy Adjustments (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Oil Marketer Margin Change (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Total Pump Price Impact (Ksh)</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {tableTwoData.map((v, i) => (
                <tr key={i} className="govuk-table__row">
                  <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>{v.label}</th>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{v.landedStr}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{v.taxStr}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{v.marginStr}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: 'bold' }}>{v.totalStr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VISUALIZATION 2 CHART: BAR CHART INDICATOR OF COMPONENT SCALE VARIATION */}
        <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Chart 2: Volumetric Monthly Capping Variances Log</h3>
        <p className="govuk-body-s govuk-hint">Indicates structural variance distribution curves relative to the static zero baseline marker.</p>
        <div style={{ background: '#ffffff', border: '1px solid #bfc1c3', padding: '25px', marginBottom: '45px' }}>
          <svg viewBox="0 0 500 120" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <line x1="40" y1="60" x2="480" y2="60" stroke="#0b0c0c" strokeWidth="1.5" />
            {[...tableTwoData].reverse().map((v, idx) => {
              if (v.totalStr === "Baseline" || v.totalStr === "0.00") return null;
              const isUp = v.totalStr.includes('+');
              const rawDiff = parseFloat(v.totalStr.replace(/[^0-9.-]/g, '')) || 0;
              const heightFactor = Math.min(Math.abs(rawDiff) * 1.2, 50);
              return (
                <g key={idx}>
                  <rect x={60 + idx * 80} y={isUp ? 60 - heightFactor : 60} width="25" height={heightFactor} fill={isUp ? '#002147' : '#bfc1c3'} />
                  <text x={72 + idx * 80} y={isUp ? 50 - heightFactor : 75 + heightFactor} fill="#0b0c0c" fontSize="8" fontWeight="bold" textAnchor="middle">{v.totalStr.replace('Up ', '').replace('Down ', '')}</text>
                  <text x={72 + idx * 80} y="115" fill="#505a5f" fontSize="8" textAnchor="middle">{v.label.replace(' 2026', '')}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* =========================================================================
            TABLE 3: ANNUAL PRICE RANGE & EXTREMES
           ========================================================================= */}
        <div className="govuk-table-wrapper" style={{ overflowX: 'auto', marginBottom: '45px' }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">Table 3: Consolidated Annual Petroleum Boundary Parameters and Extrema Logs</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Year</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Highest Price Recorded (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Lowest Price Recorded (Ksh)</th>
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">Average Annual Price (Ksh)</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>{tableThreeData.year}</th>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {tableThreeData.high}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {tableThreeData.low}</td>
                <td className="govuk-table__cell govuk-table__cell--numeric">KSh {tableThreeData.avg}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PURE SVG DYNAMIC ACCESSIBLE CRUDE BENCHMARKS CHART VIEWPORT */}
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

        {/* ALPHABETICAL SEARCH AND FILTER SEGMENTS */}
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
            <div className="govuk-table-wrapper" style={{ overflowX: 'auto' }}>
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
            </div>

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

                    const isFirstPage = pageNum === 1;
                    const isLastPage = pageNum === totalPages;
                    const isAdjacentToCurrent = Math.abs(currentPage - pageNum) <= 1;

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
                  <span>{currentFormula.tax_vat_pms > 15 ? 'Standard 16% Energy Tax Floor' : currentFormula.tax_vat_pms > 10 ? 'Reduced 13% Emergency Cushion' : 'Concessionary 8% Finance Act Split'}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

