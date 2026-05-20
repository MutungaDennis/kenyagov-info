'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface FilterItem {
  name: string;
}

interface WardsFiltersProps {
  counties: FilterItem[];
  constituencies: FilterItem[];
  selectedCounty: string;
  selectedConstituency: string;
  search: string;
}

export default function WardsFilters({
  counties,
  constituencies,
  selectedCounty,
  selectedConstituency,
  search,
}: WardsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper to dynamically update parameters while resetting the page marker back to 1
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    params.set("page", "1"); // Always reset page index on parameters shift

    startTransition(() => {
      router.push(`/counties/wards?${params.toString()}`);
    });
  };

  return (
    /* Tight wrapper margins to prevent breaking the vertical page fold */
    <div className="govuk-!-margin-bottom-4" style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
      <div className="govuk-grid-row">
        
        {/* Keyword Search Field Column Container */}
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-q" style={{ fontSize: '16px' }}>
              Search wards
            </label>
            <span id="search-q-hint" className="govuk-hint govuk-!-margin-bottom-1" style={{ fontSize: '14px' }}>
              Ward, constituency or county
            </span>
            <input
              className="govuk-input"
              id="search-q"
              name="q"
              type="search"
              aria-describedby="search-q-hint"
              defaultValue={search}
              onChange={(e) => updateFilters({ q: e.target.value })}
              placeholder="e.g. Biashara"
            />
          </div>
        </div>

        {/* County Select Menu Dropdown Column Container */}
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="filter-county" style={{ fontSize: '16px' }}>
              County
            </label>
            <span className="govuk-hint govuk-!-margin-bottom-1" style={{ fontSize: '14px', visibility: 'hidden', display: 'block' }}>
              Spacer
            </span>
            <select
              className="govuk-select govuk-!-width-full"
              id="filter-county"
              name="county"
              value={selectedCounty}
              onChange={(e) => updateFilters({ county: e.target.value, constituency: "" })} // Clear constituency when county alters
            >
              <option value="">All counties</option>
              {counties.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Constituency Select Menu Dropdown Column Container */}
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="filter-constituency" style={{ fontSize: '16px' }}>
              Constituency
            </label>
            <span className="govuk-hint govuk-!-margin-bottom-1" style={{ fontSize: '14px', visibility: 'hidden', display: 'block' }}>
              Spacer
            </span>
            <select
              className="govuk-select govuk-!-width-full"
              id="filter-constituency"
              name="constituency"
              value={selectedConstituency}
              onChange={(e) => updateFilters({ constituency: e.target.value })}
            >
              <option value="">All constituencies</option>
              {constituencies.map((constituencyItem) => (
                <option key={constituencyItem.name} value={constituencyItem.name}>
                  {constituencyItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
