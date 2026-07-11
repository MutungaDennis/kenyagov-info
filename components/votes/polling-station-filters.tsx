// components/votes/polling-station-filters.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface County {
  name: string;
  code: string | number;
}

interface Constituency {
  name: string;
  county_code: string | number;
  constituency_code: string;
}

interface Ward {
  name: string;
  ward_code: string;
  constituency_code: string;
}

interface PollingStationFiltersProps {
  counties: County[];
  constituencies: Constituency[];
  wards: Ward[];
  selectedCounty: string;
  selectedConstituency: string;
  selectedWard: string;
  search: string;
  totalResults: number;
  action?: string;
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
  action = '/elections/polling-stations',
}: PollingStationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [county, setCounty] = useState(selectedCounty);
  const [constituency, setConstituency] = useState(selectedConstituency);
  const [ward, setWard] = useState(selectedWard);
  const [searchQuery, setSearchQuery] = useState(search);

  // Filter constituencies based on selected county
  const filteredConstituencies = useMemo(() => {
    if (!county) return constituencies;
    const countyObj = counties.find(co => co.name === county);
    if (!countyObj) return [];
    return constituencies.filter(c => String(c.county_code) === String(countyObj.code));
  }, [county, counties, constituencies]);

  // Filter wards based on selected constituency or county
  // Deduplicate by ward_code to prevent React key errors
  const filteredWards = useMemo(() => {
    let result: Ward[];

    if (constituency) {
      const constObj = constituencies.find(c => c.name === constituency);
      if (!constObj) return [];
      result = wards.filter(w => w.constituency_code === constObj.constituency_code);
    } else if (county) {
      const countyObj = counties.find(co => co.name === county);
      if (!countyObj) return [];
      const constCodes = constituencies
        .filter(c => String(c.county_code) === String(countyObj.code))
        .map(c => c.constituency_code);
      result = wards.filter(w => constCodes.includes(w.constituency_code));
    } else {
      result = wards;
    }

    // Deduplicate by ward_code — keep the first occurrence of each
    const seen = new Set<string>();
    return result.filter(w => {
      if (seen.has(w.ward_code)) return false;
      seen.add(w.ward_code);
      return true;
    });
  }, [county, constituency, counties, constituencies, wards]);

  // Reset dependent filters when parent changes
  useEffect(() => {
    if (!county) {
      setConstituency('');
      setWard('');
    }
  }, [county]);

  useEffect(() => {
    if (!constituency) {
      setWard('');
    }
  }, [constituency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (county) params.set('county', county);
    if (constituency) params.set('constituency', constituency);
    if (ward) params.set('ward', ward);
    if (searchQuery) params.set('q', searchQuery);
    
    // Preserve year parameter if it exists
    const year = searchParams.get('year');
    if (year) params.set('year', year);
    
    const queryString = params.toString();
    router.push(`${action}${queryString ? `?${queryString}` : ''}`);
  };

  const handleReset = () => {
    setCounty('');
    setConstituency('');
    setWard('');
    setSearchQuery('');
    router.push(action);
  };

  return (
    <div className="app-filters-panel govuk-!-margin-bottom-6">
      <form onSubmit={handleSubmit} className="app-filters-form">
        <div className="app-filters-grid">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="county">
              County
            </label>
            <select
              id="county"
              name="county"
              className="govuk-select"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              <option value="">All counties</option>
              {counties.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="constituency">
              Constituency
            </label>
            <select
              id="constituency"
              name="constituency"
              className="govuk-select"
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              disabled={!county && constituencies.length > 0}
            >
              <option value="">All constituencies</option>
              {filteredConstituencies.map((c) => (
                <option key={c.constituency_code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="ward">
              Ward
            </label>
            <select
              id="ward"
              name="ward"
              className="govuk-select"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              disabled={!constituency && wards.length > 0}
            >
              <option value="">All wards</option>
              {filteredWards.map((w) => (
                <option key={w.ward_code} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="text"
              className="govuk-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Station name or code"
            />
          </div>
        </div>

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button govuk-!-margin-bottom-0">
            Apply filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}