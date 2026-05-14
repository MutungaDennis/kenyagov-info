'use client';

import { County, PoliticalParty, Position } from '@/lib/supabase/officials';

interface OfficialFiltersProps {
  positions: Position[];
  counties: County[];
  parties: PoliticalParty[];
  selectedPosition?: string;
  selectedCounty?: string;
  selectedParty?: string;
  onPositionChange: (code: string) => void;
  onCountyChange: (code: string) => void;
  onPartyChange: (code: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OfficialFilters({
  positions,
  counties,
  parties,
  selectedPosition = '',
  selectedCounty = '',
  selectedParty = '',
  onPositionChange,
  onCountyChange,
  onPartyChange,
  onClearFilters,
  hasActiveFilters,
}: OfficialFiltersProps) {
  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-6">
      <div className="govuk-grid-column-one-quarter">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="position-filter">
            Position
          </label>
          <select
            className="govuk-select"
            id="position-filter"
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
          >
            <option value="">All positions</option>
            {positions.map((pos) => (
              <option key={pos.code} value={pos.code}>
                {pos.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="govuk-grid-column-one-quarter">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="county-filter">
            County
          </label>
          <select
            className="govuk-select"
            id="county-filter"
            value={selectedCounty}
            onChange={(e) => onCountyChange(e.target.value)}
          >
            <option value="">All counties</option>
            {counties.map((county) => (
              <option key={county.code} value={county.code}>
                {county.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="govuk-grid-column-one-quarter">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="party-filter">
            Political Party
          </label>
          <select
            className="govuk-select"
            id="party-filter"
            value={selectedParty}
            onChange={(e) => onPartyChange(e.target.value)}
          >
            <option value="">All parties</option>
            {parties.map((party) => (
              <option key={party.code} value={party.code}>
                {party.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="govuk-grid-column-one-quarter flex items-end">
          <button
            className="govuk-button govuk-button--secondary w-full"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
