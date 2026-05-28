'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import { OfficialsList } from '@/components/officials/OfficialsList';
import { OfficialWithRelations, County, PoliticalParty, Position } from '@/lib/supabase/officials';

function OfficialsPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [officials, setOfficials] = useState<OfficialWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counties, setCounties] = useState<County[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await fetch('/api/officials/filters/options');
        const data = await response.json();
        setCounties(data.counties);
        setParties(data.parties);
        setPositions(data.positions);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // Load officials based on filters
  useEffect(() => {
    const loadOfficials = async () => {
      setIsLoading(true);
      try {
        const offset = (page - 1) * itemsPerPage;
        let url = `/api/officials?limit=${itemsPerPage}&offset=${offset}`;

        if (searchQuery) {
          url = `/api/officials?q=${encodeURIComponent(searchQuery)}&limit=${itemsPerPage}&offset=${offset}`;
        } else if (selectedCounty) {
          url = `/api/officials/county/${selectedCounty}?limit=${itemsPerPage}&offset=${offset}`;
        } else if (selectedParty) {
          url = `/api/officials/party/${selectedParty}?limit=${itemsPerPage}&offset=${offset}`;
        } else if (selectedPosition) {
          url = `/api/officials/position/${selectedPosition}?limit=${itemsPerPage}&offset=${offset}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setOfficials(data.data || []);
      } catch (error) {
        console.error('Error loading officials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficials();
  }, [searchQuery, selectedCounty, selectedParty, selectedPosition, page]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedParty('');
    setSelectedPosition('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCounty || selectedParty || selectedPosition;

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Government Officials', href: '/officials' },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Government Officials Directory</h1>
        <p className="govuk-body-l">
          Search and filter elected and appointed officials across national, county, and independent government institutions.
        </p>

        {/* Search & Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-full">
            {/* Search */}
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label" htmlFor="search-officials">
                Search officials
              </label>
              <input
                className="govuk-input"
                id="search-officials"
                type="text"
                placeholder="Search by name, title, or office..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
              <p className="govuk-body-s govuk-hint">
                You can search by official name, position title, or office location.
              </p>
            </div>

            {/* Filters */}
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
                    onChange={(e) => {
                      setSelectedPosition(e.target.value);
                      setPage(1);
                    }}
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
                    onChange={(e) => {
                      setSelectedCounty(e.target.value);
                      setPage(1);
                    }}
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
                    onChange={(e) => {
                      setSelectedParty(e.target.value);
                      setPage(1);
                    }}
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
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <OfficialsList
          officials={officials}
          isLoading={isLoading}
          showParty={true}
        />

        {/* Pagination placeholder */}
        <div className="govuk-!-margin-top-8">
          <p className="govuk-body-s text-gray-600">
            Page {page} • Showing up to {itemsPerPage} results per page
          </p>
        </div>

      </main>
    </div>
  );
}

export default function OfficialsPage() {
  return (
    <Suspense fallback={<div className="govuk-body">Loading...</div>}>
      <OfficialsPageContent />
    </Suspense>
  );
}
