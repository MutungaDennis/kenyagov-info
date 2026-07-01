'use client';

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/client";

// Define the shape of the joined leader_roles data
type LeaderRole = {
  organization: string | null;
  status: string | null;
};

type Leader = {
  id: string;
  slug: string;
  first_name: string | null;
  surname: string | null;
  category: string | null;
  bio: string | null;
  current_organization: string | null;
  current_constituency: string | null;
  leader_roles: LeaderRole[] | null;
};

export default function GovernmentPeoplePage() {
  return (
    // Next.js requires a Suspense boundary when using useSearchParams()
    <Suspense fallback={
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading directory...</p>
        </main>
      </div>
    }>
      <PeopleDirectoryContent />
    </Suspense>
  );
}

function PeopleDirectoryContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Data States ---
  const [allLeaders, setAllLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filter & Search States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- Pagination States ---
  const itemsPerPage = 20;
  const currentPage = Number(searchParams.get('page')) || 1;

  // Helper to handle page changes and update the URL
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`?${params.toString()}`);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // 1. Fetch Data from Supabase (Joining leader_roles)
  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('leaders')
          .select(`
            id, slug, first_name, surname, category, bio, 
            current_organization, current_constituency,
            leader_roles!leader_roles_leader_id_fkey (
              organization,
              status
            )
          `)
          .eq('is_active', true)
          .eq('status', 'Active')
          .order('surname', { ascending: true });

        if (fetchError) throw fetchError;
        setAllLeaders(data || []);
      } catch (err: any) {
        console.error('Error fetching leaders:', err);
        setError('Failed to load government officials.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaders();
  }, [supabase]);

  // 2. Extract Unique Departments from ACTIVE leader_roles
  const departments = useMemo(() => {
    const depts = new Set<string>();
    allLeaders.forEach(leader => {
      if (leader.leader_roles) {
        leader.leader_roles.forEach(role => {
          // Only include organizations from active roles
          if (role.status === 'Active' && role.organization) {
            depts.add(role.organization);
          }
        });
      }
    });
    return ['All', ...Array.from(depts).sort()];
  }, [allLeaders]);

  // 3. Apply Search, Department Filter, and Sorting
  const filteredAndSortedLeaders = useMemo(() => {
    let result = [...allLeaders];

    // Filter by Department (checking active roles in leader_roles table)
    if (selectedDepartment !== 'All') {
      result = result.filter(l => 
        l.leader_roles?.some(role => role.status === 'Active' && role.organization === selectedDepartment)
      );
    }

    // Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l =>
        (l.first_name || '').toLowerCase().includes(term) ||
        (l.surname || '').toLowerCase().includes(term) ||
        (l.current_organization || '').toLowerCase().includes(term) ||
        (l.current_constituency || '').toLowerCase().includes(term) ||
        (l.category || '').toLowerCase().includes(term)
      );
    }

    // Sort A-Z or Z-A by surname
    result.sort((a, b) => {
      const nameA = (a.surname || '').toLowerCase();
      const nameB = (b.surname || '').toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    });

    return result;
  }, [allLeaders, selectedDepartment, searchTerm, sortOrder]);

  // 4. Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeaders.length / itemsPerPage));
  
  const paginatedLeaders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedLeaders.slice(startIndex, endIndex);
  }, [filteredAndSortedLeaders, currentPage]);

  // Reset URL to Page 1 whenever filters or search change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('page')) {
      params.delete('page');
      router.replace(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedDepartment, sortOrder]);

  // Helper to truncate bio (Increased to 280 chars for ~2.5 lines on desktop)
  const truncateBio = (bio: string | null) => {
    if (!bio) return null;
    return bio.length > 280 ? bio.substring(0, 280).trim() + '...' : bio;
  };

  // ==========================================
  // INLINE GOV.UK PAGINATION COMPONENT
  // ==========================================
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
        {currentPage > 1 && (
          <div className="govuk-pagination__prev">
            <a 
              className="govuk-link govuk-pagination__link" 
              href="#" 
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
              rel="prev"
            >
              <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
              </svg>
              <span className="govuk-pagination__link-title">Previous</span>
            </a>
          </div>
        )}

        <ul className="govuk-pagination__list">
          {startPage > 1 && (
            <>
              <li className="govuk-pagination__item">
                <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }} aria-label="Page 1">1</a>
              </li>
              {startPage > 2 && (
                <li className="govuk-pagination__item govuk-pagination__item--ellipses">⋯</li>
              )}
            </>
          )}

          {pages.map(page => (
            <li key={page} className={`govuk-pagination__item ${page === currentPage ? 'govuk-pagination__item--current' : ''}`}>
              <a 
                className="govuk-link govuk-pagination__link" 
                href="#" 
                onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </a>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="govuk-pagination__item govuk-pagination__item--ellipses">⋯</li>
              )}
              <li className="govuk-pagination__item">
                <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }} aria-label={`Page ${totalPages}`}>{totalPages}</a>
              </li>
            </>
          )}
        </ul>

        {currentPage < totalPages && (
          <div className="govuk-pagination__next">
            <a 
              className="govuk-link govuk-pagination__link" 
              href="#" 
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
              rel="next"
            >
              <span className="govuk-pagination__link-title">Next</span>
              <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
              </svg>
            </a>
          </div>
        )}
      </nav>
    );
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "People", href: "/government/people" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              All government officials
            </h1>

            <p className="govuk-body-l govuk-!-margin-bottom-8">
              Find contact details and biographies of all current Cabinet Secretaries, Principal Secretaries, Members of Parliament, Senators, and other senior government officials.
            </p>

            {/* ========================================== */}
            {/* SEARCH AND FILTER CONTROLS                 */}
            {/* ========================================== */}
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-form-group">
                  <label className="govuk-label govuk-label--s" htmlFor="search-officials">
                    Search officials
                  </label>
                  {/* Wrapped in relative div for the custom clear button */}
                  <div className="relative">
                    <input
                      className="govuk-input govuk-!-padding-right-6"
                      id="search-officials"
                      name="search-officials"
                      type="text" // Changed to 'text' to disable native hover-only X
                      placeholder="Search by name, role, or constituency..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* Custom Always-Visible Clear Button */}
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          document.getElementById("search-officials")?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 hover:text-black text-xl leading-none"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label govuk-label--s" htmlFor="filter-department">
                    Department
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="filter-department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-quarter">
                <div className="govuk-form-group">
                  <label className="govuk-label govuk-label--s" htmlFor="sort-order">
                    Sort by
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">A to Z</option>
                    <option value="desc">Z to A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ========================================== */}
            {/* RESULTS COUNT & LIST                       */}
            {/* ========================================== */}
            {isLoading && <p className="govuk-body">Loading officials...</p>}
            {error && <p className="govuk-error-message">{error}</p>}

            {!isLoading && !error && (
              <>
                {/* Updated to say "people" instead of "results found" */}
                <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold">
                  {filteredAndSortedLeaders.length} {filteredAndSortedLeaders.length === 1 ? 'person' : 'people'}
                  {selectedDepartment !== 'All' && ` in ${selectedDepartment}`}
                  {searchTerm && ` for "${searchTerm}"`}
                </p>

                <ul className="govuk-list govuk-!-padding-left-0">
                  {paginatedLeaders.map((leader) => {
                    // STRICT NAME FORMATTING: Uses only first_name and surname to remove titles like "Hon."
                    const displayName = `${leader.first_name || ''} ${leader.surname || ''}`.trim();
                    
                    const contextParts = [];
                    if (leader.category) contextParts.push(leader.category);
                    if (leader.current_organization) contextParts.push(leader.current_organization);
                    if (leader.current_constituency) contextParts.push(leader.current_constituency);

                    return (
                      <li key={leader.id} className="govuk-!-margin-bottom-6 pb-6" style={{ borderBottom: "1px solid #b1b4b6" }}>
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                          <Link 
                            href={`/government/people/${leader.slug}`} 
                            className="govuk-link govuk-link--no-visited-state"
                          >
                            {displayName}
                          </Link>
                        </h3>
                        
                        {contextParts.length > 0 && (
                          <p className="govuk-body-s govuk-!-margin-bottom-2 govuk-!-font-weight-bold">
                            {contextParts.join(' • ')}
                          </p>
                        )}

                        {/* BIOGRAPHY SNIPPET (Now longer for desktop) */}
                        {leader.bio && (
                          <p className="govuk-body-s govuk-!-margin-bottom-2 govuk-text-secondary">
                            {truncateBio(leader.bio)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Empty State */}
                {paginatedLeaders.length === 0 && (
                  <div className="govuk-inset-text">
                    <p className="govuk-body">No officials found matching your criteria. Try adjusting your search or filters.</p>
                  </div>
                )}

                {/* ========================================== */}
                {/* PAGINATION                                 */}
                {/* ========================================== */}
                {renderPagination()}
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}