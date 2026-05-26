"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

interface CountyItem {
  name: string;
  code: number;
}

interface ConstituencyItem {
  name: string;
  county_code: number;
  constituency_code: string;
}

interface WardItem {
  name: string;
  ward_code: string;
  constituency_code: string;
}

interface FilterProps {
  counties: CountyItem[];
  constituencies: ConstituencyItem[];
  wards: WardItem[];
  selectedCounty: string;
  selectedConstituency: string;
  selectedWard: string;
  search: string;
  totalResults: number; // Injected to show live filter matches dynamically
}

export default function PollingStationFilters({
  counties,
  constituencies,
  wards,
  selectedCounty,
  selectedConstituency,
  selectedWard,
  search,
  totalResults,
}: FilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Core filter form states
  const [county, setCounty] = useState(selectedCounty);
  const [constituency, setConstituency] = useState(selectedConstituency);
  const [ward, setWard] = useState(selectedWard);
  const [q, setQ] = useState(search);

  // Dynamic lists that change based on user context selection
  const [visibleConstituencies, setVisibleConstituencies] = useState<ConstituencyItem[]>(constituencies);
  const [visibleWards, setVisibleWards] = useState<WardItem[]>(wards);

  // ============================================
  // CASCADING RELATIONSHIP ENGINE
  // ============================================
  useEffect(() => {
    let activeCountyCode: number | null = null;
    let activeConstituencyCode: string | null = null;

    // 1. If a County is selected, discover its code
    if (county) {
      const match = counties.find(c => c.name === county);
      if (match) activeCountyCode = match.code;
    }

    // 2. Handle Constituency cross-linking
    if (constituency) {
      const match = constituencies.find(c => c.name === constituency);
      if (match) {
        activeConstituencyCode = match.constituency_code;
        
        // BACK-FILL COUNTY: If no county is selected, auto-select the parent county
        const parentCounty = counties.find(c => c.code === match.county_code);
        if (parentCounty && county !== parentCounty.name) {
          setCounty(parentCounty.name);
          activeCountyCode = parentCounty.code;
        }
      }
    }

    // 3. Narrow constituencies dropdown list down dynamically
    if (activeCountyCode !== null) {
      const filtered = constituencies.filter(c => c.county_code === activeCountyCode);
      setVisibleConstituencies(filtered);
      
      // Clear selection if current selection is orphaned outside the selected county
      if (constituency && !filtered.some(c => c.name === constituency)) {
        setConstituency("");
        setWard("");
        activeConstituencyCode = null;
      }
    } else {
      setVisibleConstituencies(constituencies);
    }

    // 4. Narrow wards dropdown list down dynamically
    if (activeConstituencyCode !== null) {
      const filtered = wards.filter(w => w.constituency_code === activeConstituencyCode);
      setVisibleWards(filtered);

      // Clear ward selection if orphaned outside the current constituency boundary
      if (ward && !filtered.some(w => w.name === ward)) {
        setWard("");
      }
    } else if (activeCountyCode !== null) {
      // If a county is selected but no constituency, show all wards belonging to that county's constituencies
      const allowedConstituencies = constituencies.filter(c => c.county_code === activeCountyCode).map(c => c.constituency_code);
      const filtered = wards.filter(w => allowedConstituencies.includes(w.constituency_code));
      setVisibleWards(filtered);
      
      if (ward && !filtered.some(w => w.name === ward)) {
        setWard("");
      }
    } else {
      setVisibleWards(wards);
    }

  }, [county, constituency, counties, constituencies, wards]);

  // Submit and route layout updates
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      if (county) params.set("county", county);
      if (constituency) params.set("constituency", constituency);
      if (ward) params.set("ward", ward);
      if (q) params.set("q", q.trim());
      
      router.push(`/politics/votes?${params.toString()}`);
    });
  };

  // Reset form helper utility
  const handleReset = () => {
    setCounty("");
    setConstituency("");
    setWard("");
    setQ("");
    startTransition(() => {
      router.push("/politics/votes");
    });
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ background: '#f3f2f1', padding: '20px', border: '1px solid #bfc1c3', marginBottom: '25px' }}>
      
      {/* REAL-TIME STATE DATA MONITORS */}
      <div style={{ background: '#fff', borderLeft: '4px solid #1d70b8', padding: '10px 15px', marginBottom: '20px' }}>
        <p className="govuk-body-s govuk-!-margin-0" aria-live="polite">
          <strong>Database Insight:</strong> Your criteria matches <strong>{totalResults.toLocaleString()}</strong> distinct IEBC polling stream centers in real-time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'end' }}>
        
        {/* SELECT COUNTY */}
        <div>
          <label className="govuk-label govuk-body-s govuk-!-font-weight-bold" htmlFor="filter-county">
            County
          </label>
          <select
            id="filter-county"
            className="govuk-select"
            style={{ width: '100%', height: '38px', borderColor: '#464d51' }}
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          >
            <option value="">All 47 Counties</option>
            {counties.map((c, idx) => (
              <option key={idx} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* SELECT CONSTITUENCY */}
        <div>
          <label className="govuk-label govuk-body-s govuk-!-font-weight-bold" htmlFor="filter-constituency">
            Constituency
          </label>
          <select
            id="filter-constituency"
            className="govuk-select"
            style={{ width: '100%', height: '38px', borderColor: '#464d51' }}
            value={constituency}
            onChange={(e) => setConstituency(e.target.value)}
          >
            <option value="">All Constituencies</option>
            {visibleConstituencies.map((c, idx) => (
              <option key={idx} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* SELECT ELECTORAL WARD */}
        <div>
          <label className="govuk-label govuk-body-s govuk-!-font-weight-bold" htmlFor="filter-ward">
            Electoral Ward
          </label>
          <select
            id="filter-ward"
            className="govuk-select"
            style={{ width: '100%', height: '38px', borderColor: '#464d51' }}
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          >
            <option value="">All Wards</option>
            {visibleWards.map((w, idx) => (
              <option key={idx} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* SEARCH STATIONS */}
        <div>
          <label className="govuk-label govuk-body-s govuk-!-font-weight-bold" htmlFor="filter-search">
            Search center name or code
          </label>
          <input
            id="filter-search"
            type="text"
            className="govuk-input"
            style={{ width: '100%', height: '38px', padding: '5px', boxSizing: 'border-box' }}
            placeholder="e.g., BOMU PRIMARY"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* CTA SUBMIT AND RESET BLOCK */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            className="govuk-button"
            disabled={isPending}
            style={{ flex: 2, margin: 0, height: '38px', background: '#00703c', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isPending ? "Updating..." : "Filter results"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="govuk-button govuk-button--secondary"
            style={{ flex: 1, margin: 0, height: '38px', background: '#e0e0e0', color: '#0b0c0c', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>

      </div>
    </form>
  );
}
