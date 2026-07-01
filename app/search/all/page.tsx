// app/search/all/page.tsx
'use client';

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "next-sanity";

// ==========================================
// 1. SANITY CLIENT & QUERIES
// ==========================================
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-06-19",
  useCdn: true,
});

// ✅ UPDATED: Added 'slug' to the query so it is fetched from Sanity
const VISITS_QUERY = `*[_type == "presidentialTrip"] | order(departureDate desc) {
  "id": _id,
  title,
  slug,
  "country": destinationCountry,
  "cities": destinationCities,
  tripType,
  departureDate,
  returnDate
}`;

// ==========================================
// 2. UNIFIED DATA TYPES & MAPPERS
// ==========================================
type SearchResult = {
  id: string;
  title: string;
  url: string;
  date: string; // ISO string for sorting
  displayDate: string; // Formatted for UI
  documentType: string; // Human readable (e.g., "Presidential Visit")
  documentTypeSlug: string; // Machine readable (e.g., "presidential_trip")
  summary: string;
  metadata: Record<string, string>;
};

// Utility to format trip dates
function formatTripDates(departure: string, returning?: string): string {
  if (!departure) return "Date unrecorded";
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const depDate = new Date(departure).toLocaleDateString('en-GB', options);
  if (!returning) return depDate;
  const retDate = new Date(returning).toLocaleDateString('en-GB', options);
  return `${depDate} to ${retDate}`;
}

// Utility to format visit classification
function formatClassification(typeString: string): string {
  const maps: Record<string, string> = {
    'state-visit': 'State Visit',
    'official-visit': 'Official Visit',
    'working-visit': 'Working Visit',
    'summit': 'Summit',
    'regional-mission': 'Regional Mission'
  };
  return maps[typeString] || typeString || 'Official Engagement';
}

// ✅ UPDATED: Mapper now points to the new /government/presidential-visits/[slug] URL
function mapVisitToResult(v: any): SearchResult {
  return {
    id: v.id,
    title: v.title || `Visit to ${v.country}`,
    // ✅ FIXED URL PATH: Now correctly points to the new route
    url: `/government/presidential-visits/${v.slug?.current || v.id}`,
    date: v.departureDate,
    displayDate: formatTripDates(v.departureDate, v.returnDate),
    documentType: 'Presidential Visit',
    documentTypeSlug: 'presidential_trip',
    summary: `Official ${formatClassification(v.tripType).toLowerCase()} to ${v.country}${v.cities && v.cities.length > 0 ? ` (${v.cities.join(', ')})` : ''}.`,
    metadata: {
      'Destination': v.country,
      'Classification': formatClassification(v.tripType)
    }
  };
}

// ==========================================
// 3. DATA FETCHING ENGINE
// ==========================================
async function fetchSearchResults(activeTypes: string[]): Promise<SearchResult[]> {
  let results: SearchResult[] = [];

  // Fetch Presidential Visits from Sanity
  if (activeTypes.includes('presidential_trip') || activeTypes.length === 0) {
    try {
      const visits = await sanityClient.fetch(VISITS_QUERY);
      results.push(...visits.map(mapVisitToResult));
    } catch (error) {
      console.error("Failed to fetch presidential visits:", error);
    }
  }

  // FUTURE: Fetch Cabinet Decisions from Supabase
  // if (activeTypes.includes('cabinet_decision') || activeTypes.length === 0) {
  //   const decisions = await supabase.from('documents').select('*').eq('type', 'cabinet_decision');
  //   results.push(...decisions.map(mapDecisionToResult));
  // }

  return results;
}

// ==========================================
// 4. MAIN PAGE COMPONENT (Suspense Wrapper)
// ==========================================
export default function SearchAllPage() {
  return (
    <Suspense fallback={
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading search engine...</p>
        </main>
      </div>
    }>
      <SearchEngineContent />
    </Suspense>
  );
}

// ==========================================
// 5. SEARCH ENGINE UI & LOGIC
// ==========================================
function SearchEngineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State initialized from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTypes, setActiveTypes] = useState<string[]>(
    searchParams.get('document_type') ? [searchParams.get('document_type')!] : []
  );
  
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Available document types for the filter sidebar
  const availableDocumentTypes = [
    { slug: 'presidential_trip', label: 'Presidential Visits' },
    { slug: 'cabinet_decision', label: 'Cabinet Decisions' },
    { slug: 'executive_order', label: 'Executive Orders' },
    { slug: 'speech', label: 'Speeches' },
  ];

  // Fetch data when active types change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchSearchResults(activeTypes);
      setAllResults(data);
      setIsLoading(false);
    };
    loadData();
  }, [activeTypes]);

  // Filter results based on search term
  const filteredResults = useMemo(() => {
    if (!searchTerm) return allResults;
    const term = searchTerm.toLowerCase();
    return allResults.filter(r => 
      r.title.toLowerCase().includes(term) ||
      r.summary.toLowerCase().includes(term) ||
      Object.values(r.metadata).some(val => val.toLowerCase().includes(term))
    );
  }, [allResults, searchTerm]);

  // Sort results by date (newest first)
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredResults]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedResults.length / itemsPerPage));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedResults.slice(start, start + itemsPerPage);
  }, [sortedResults, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (activeTypes.length === 1) params.set('document_type', activeTypes[0]);
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    router.replace(`?${params.toString()}`);
  }, [searchTerm, activeTypes, router]);

  // Handle Document Type Checkbox changes
  const handleTypeToggle = (slug: string) => {
    setActiveTypes(prev => 
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    );
  };

  // Handle Search Form Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle updating the URL based on the searchTerm state
  };

  // Dynamic Page Title
  const pageTitle = activeTypes.length === 1 
    ? availableDocumentTypes.find(t => t.slug === activeTypes[0])?.label || 'Search'
    : 'Search all government content';

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Search", href: "/search/all" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">{pageTitle}</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="govuk-!-margin-bottom-6" role="search">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="search-main">
                  Search keywords
                </label>
                <div className="govuk-!-display-flex">
                  <input
                    className="govuk-input govuk-!-width-three-quarters"
                    id="search-main"
                    name="q"
                    type="search"
                    placeholder="e.g. MoUs, trade, security..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="govuk-button govuk-!-margin-bottom-0 govuk-!-margin-left-2">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* LEFT COLUMN: FILTERS */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Filter by document type</h2>
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    Select one or more types
                  </legend>
                  <div className="govuk-checkboxes govuk-checkboxes--small">
                    {availableDocumentTypes.map((type) => (
                      <div key={type.slug} className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={`type-${type.slug}`}
                          name="document-type"
                          type="checkbox"
                          value={type.slug}
                          checked={activeTypes.includes(type.slug)}
                          onChange={() => handleTypeToggle(type.slug)}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={`type-${type.slug}`}>
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              
              {activeTypes.length > 0 && (
                <button 
                  type="button" 
                  className="govuk-link govuk-!-font-size-16" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setActiveTypes([])}
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="govuk-grid-column-two-thirds">
            {isLoading ? (
              <p className="govuk-body">Loading results...</p>
            ) : (
              <>
                <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold" aria-live="polite">
                  {sortedResults.length} {sortedResults.length === 1 ? 'result' : 'results'} found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>

                {paginatedResults.length > 0 ? (
                  <ul className="govuk-list govuk-list--spaced">
                    {paginatedResults.map((result) => (
                      <li key={`${result.documentTypeSlug}-${result.id}`} className="govuk-!-margin-bottom-6" style={{ borderBottom: '1px solid #b1b4b6', paddingBottom: '15px' }}>
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                          <Link href={result.url} className="govuk-link">
                            {result.title}
                          </Link>
                        </h3>
                        
                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                          <strong className="govuk-tag govuk-tag--grey govuk-!-margin-right-2">
                            {result.documentType}
                          </strong>
                          <span className="govuk-!-font-weight-bold">{result.displayDate}</span>
                        </p>

                        <p className="govuk-body govuk-!-margin-bottom-2">
                          {result.summary}
                        </p>

                        <dl className="govuk-!-margin-bottom-0">
                          {Object.entries(result.metadata).map(([key, val]) => (
                            <span key={key} className="govuk-!-margin-right-4">
                              <dt className="govuk-!-display-inline govuk-!-font-weight-bold">{key}:</dt>
                              <dd className="govuk-!-display-inline govuk-!-margin-left-1">{val}</dd>
                            </span>
                          ))}
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="govuk-inset-text">
                    <p className="govuk-body">No documents match your search criteria. Try adjusting your keywords or filters.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage - 1); window.scrollTo(0,0); }} rel="prev">
                          <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13"><path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path></svg>
                          <span className="govuk-pagination__link-title">Previous</span>
                        </a>
                      </div>
                    )}

                    <ul className="govuk-pagination__list">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`govuk-pagination__item ${page === currentPage ? 'govuk-pagination__item--current' : ''}`}>
                          <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); window.scrollTo(0,0); }} aria-label={`Page ${page}`}>
                            {page}
                          </a>
                        </li>
                      ))}
                    </ul>

                    {currentPage < totalPages && (
                      <div className="govuk-pagination__next">
                        <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage + 1); window.scrollTo(0,0); }} rel="next">
                          <span className="govuk-pagination__link-title">Next</span>
                          <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13"><path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path></svg>
                        </a>
                      </div>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}