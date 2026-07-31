"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import {
  displayName,
  displayNameWithTitles,
  formatRoleHeadline,
  formatTermRange,
  resolvePrimaryRole,
  type LeaderRoleLike,
} from "@/lib/leaders/display";

type LeaderRole = LeaderRoleLike & {
  organization: string | null;
  status: string | null;
  title?: string | null;
  constituency?: string | null;
  county?: string | null;
  party?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
};

type Leader = {
  id: string;
  slug: string;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
  title: string | null;
  name_titles?: unknown;
  national_honours?: unknown;
  category: string | null;
  bio: string | null;
  current_organization: string | null;
  current_constituency: string | null;
  current_county: string | null;
  current_party: string | null;
  leader_roles: LeaderRole[] | null;
};

function leaderOrganizations(leader: Leader): string[] {
  const orgs = new Set<string>();
  if (leader.current_organization?.trim()) {
    orgs.add(leader.current_organization.trim());
  }
  for (const role of leader.leader_roles || []) {
    if (role.organization?.trim()) orgs.add(role.organization.trim());
  }
  return Array.from(orgs);
}

function leaderPrimary(leader: Leader) {
  const primary = resolvePrimaryRole(leader.leader_roles);
  if (primary.role) {
    return {
      ...primary,
      label: formatRoleHeadline(primary.role),
      summaryBits: [
        primary.role.title,
        primary.role.organization,
        primary.role.constituency,
        primary.role.party,
      ].filter(Boolean) as string[],
    };
  }
  const snapshotTitle =
    leader.title ||
    (leader.current_organization ? leader.current_organization : leader.category) ||
    null;
  return {
    role: snapshotTitle
      ? {
          title: leader.title,
          organization: leader.current_organization,
          constituency: leader.current_constituency,
          county: leader.current_county,
          party: leader.current_party,
        }
      : null,
    isCurrent: Boolean(leader.title || leader.current_organization),
    label: snapshotTitle || "Position not recorded",
    summaryBits: [
      leader.title,
      leader.current_organization,
      leader.current_constituency,
      leader.current_party,
    ].filter(Boolean) as string[],
  };
}

function sortNameKey(l: Leader) {
  const surname = (l.surname || "").trim().toLowerCase();
  const first = (l.first_name || "").trim().toLowerCase();
  const full = displayName(l).toLowerCase();
  if (surname) return `${surname} ${first}`.trim();
  return full;
}

export default function GovernmentPeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="govuk-width-container">
          <p className="govuk-body">Loading directory...</p>
        </div>
      }
    >
      <PeopleDirectoryContent />
    </Suspense>
  );
}

function PeopleDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allLeaders, setAllLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [sortOrder, setSortOrder] = useState<"az" | "za" | "newest" | "oldest">("az");

  const itemsPerPage = 20;
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const supabase = await createBrowserClientAsync();

        // 1. Fetch Leaders
        const { data: leadersData, error: leadersError } = await supabase
          .from("leaders")
          .select(
            `
            id, slug, first_name, other_names, surname, full_name, title,
            name_titles, national_honours, category, bio, current_organization, current_constituency,
            current_county, current_party,
            leader_roles!leader_roles_leader_id_fkey (
              id, title, organization, constituency, county, party,
              status, term_start_date, term_end_date
            )
          `
          )
          .eq("is_active", true)
          .order("surname", { ascending: true });

        // 2. Fetch MCAs and map them to the Leader shape
        const { data: mcasData, error: mcasError } = await supabase
          .from("mcas")
          .select(`
            id, slug, first_name, other_names, surname, bio, image_url, 
            assembly_role, status, term_start_date, term_end_date, seat_type,
            counties (name),
            wards (name),
            political_parties (name, abbreviation)
          `)
          .order("surname", { ascending: true });

        if (leadersError) throw leadersError;
        if (mcasError) throw mcasError;

        if (!cancelled) {
          const mappedMCAs: Leader[] = (mcasData || []).map((mca: any) => {
            // ✅ Clean county name to prevent "Mombasa County County Assembly"
            const rawCountyName = mca.counties?.name || "";
            const cleanCountyName = rawCountyName.replace(/\s+County$/i, "").trim();
            
            const wardName = mca.wards?.name || (mca.seat_type === 'Nominated' ? 'County-wide' : "");
            const partyName = mca.political_parties?.abbreviation || mca.political_parties?.name || "Independent";
            const roleTitle = mca.assembly_role || "Member of County Assembly";
            const orgName = cleanCountyName ? `${cleanCountyName} County Assembly` : null;

            return {
              id: mca.id,
              slug: mca.slug,
              first_name: mca.first_name,
              other_names: mca.other_names || null,
              surname: mca.surname,
              full_name: `${mca.first_name} ${mca.surname}`.trim(),
              title: roleTitle,
              name_titles: null,
              national_honours: null,
              category: "Member of County Assembly",
              bio: mca.bio || null,
              current_organization: orgName,
              current_constituency: wardName || null,
              current_county: rawCountyName || null,
              current_party: partyName || null,
              leader_roles: [{
                id: mca.id,
                title: roleTitle,
                organization: orgName,
                constituency: wardName || null,
                county: rawCountyName || null,
                party: partyName || null,
                status: mca.status || "Active",
                term_start_date: mca.term_start_date,
                term_end_date: mca.term_end_date,
              }],
            };
          });

          // Merge both arrays
          const combined = [...(leadersData || []), ...mappedMCAs];
          setAllLeaders(combined as Leader[]);
        }
      } catch (err: unknown) {
        console.error("Error fetching people:", err);
        if (!cancelled) setError("Failed to load government officials.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    allLeaders.forEach((leader) => {
      leaderOrganizations(leader).forEach((o) => depts.add(o));
    });
    return ["All", ...Array.from(depts).sort((a, b) => a.localeCompare(b))];
  }, [allLeaders]);

  const filteredAndSortedLeaders = useMemo(() => {
    let result = allLeaders.map((l, index) => ({ leader: l, index }));

    if (selectedDepartment !== "All") {
      const dept = selectedDepartment.toLowerCase();
      result = result.filter(({ leader: l }) => {
        if ((l.current_organization || "").toLowerCase() === dept) return true;
        return (l.leader_roles || []).some(
          (role) => (role.organization || "").toLowerCase() === dept
        );
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(({ leader: l }) => {
        const name = displayName(l).toLowerCase();
        const withTitles = displayNameWithTitles(l).toLowerCase();
        const primary = leaderPrimary(l);
        const orgs = leaderOrganizations(l);
        const roleTitles = (l.leader_roles || []).map((r) => r.title || "").filter(Boolean);
        const roleConstituencies = (l.leader_roles || []).map((r) => r.constituency || "").filter(Boolean);
        const roleCounties = (l.leader_roles || []).map((r) => r.county || "").filter(Boolean);
        const roleParties = (l.leader_roles || []).map((r) => r.party || "").filter(Boolean);

        return (
          name.includes(term) ||
          withTitles.includes(term) ||
          (l.first_name || "").toLowerCase().includes(term) ||
          (l.other_names || "").toLowerCase().includes(term) ||
          (l.surname || "").toLowerCase().includes(term) ||
          (l.full_name || "").toLowerCase().includes(term) ||
          (l.current_organization || "").toLowerCase().includes(term) ||
          (l.current_constituency || "").toLowerCase().includes(term) ||
          (l.current_county || "").toLowerCase().includes(term) ||
          (l.current_party || "").toLowerCase().includes(term) ||
          (l.category || "").toLowerCase().includes(term) ||
          (l.title || "").toLowerCase().includes(term) ||
          (l.bio || "").toLowerCase().includes(term) ||
          primary.label.toLowerCase().includes(term) ||
          primary.summaryBits.some((b) => b.toLowerCase().includes(term)) ||
          orgs.some((o) => o.toLowerCase().includes(term)) ||
          roleTitles.some((t) => t.toLowerCase().includes(term)) ||
          roleConstituencies.some((c) => c.toLowerCase().includes(term)) ||
          roleCounties.some((c) => c.toLowerCase().includes(term)) ||
          roleParties.some((p) => p.toLowerCase().includes(term))
        );
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "az") {
        const nameA = sortNameKey(a.leader);
        const nameB = sortNameKey(b.leader);
        return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      }
      if (sortOrder === "za") {
        const nameA = sortNameKey(a.leader);
        const nameB = sortNameKey(b.leader);
        return nameB.localeCompare(nameA, "en", { sensitivity: "base" });
      }
      
      const primaryA = leaderPrimary(a.leader);
      const primaryB = leaderPrimary(b.leader);
      const dateA = primaryA.role?.term_start_date || "";
      const dateB = primaryB.role?.term_start_date || "";
      
      if (sortOrder === "newest") {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA);
      }
      if (sortOrder === "oldest") {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
      }
      
      return 0;
    });

    return result.map((r) => r.leader);
  }, [allLeaders, selectedDepartment, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeaders.length / itemsPerPage));

  const paginatedLeaders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedLeaders.slice(startIndex, endIndex);
  }, [filteredAndSortedLeaders, currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("page")) {
      params.delete("page");
      router.replace(`?${params.toString()}`);
    }
  }, [searchTerm, selectedDepartment, sortOrder, router, searchParams]);

  const truncateBio = (bio: string | null) => {
    if (!bio) return null;
    return bio.length > 220 ? bio.substring(0, 220).trim() + "…" : bio;
  };

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
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
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
              {startPage > 2 && <li className="govuk-pagination__item govuk-pagination__item--ellipses">⋯</li>}
            </>
          )}

          {pages.map((page) => (
            <li key={page} className={`govuk-pagination__item ${page === currentPage ? "govuk-pagination__item--current" : ""}`}>
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
              {endPage < totalPages - 1 && <li className="govuk-pagination__item govuk-pagination__item--ellipses">⋯</li>}
              <li className="govuk-pagination__item">
                <a className="govuk-link govuk-pagination__link" href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }} aria-label={`Page ${totalPages}`}>
                  {totalPages}
                </a>
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
          
          {/* Left Sidebar: Filters */}
          <div className="govuk-grid-column-one-third">
            <aside className="app-filter-sidebar" role="complementary">
              <h2 className="govuk-heading-m">Filter</h2>
              
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="search-officials">
                  Search
                </label>
                <div className="govuk-hint">
                  Name, organisation, position, constituency, or county
                </div>
                <input
                  className="govuk-input govuk-!-width-full"
                  id="search-officials"
                  name="search-officials"
                  type="search"
                  placeholder="e.g. Ruto, Ministry of Health…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="filter-department">
                  Organisation
                </label>
                <div className="govuk-hint">
                  Current or past organisation
                </div>
                <select
                  className="govuk-select govuk-!-width-full"
                  id="filter-department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="sort-order">
                  Sort by
                </label>
                <select
                  className="govuk-select govuk-!-width-full"
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "az" | "za" | "newest" | "oldest")}
                >
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </aside>
          </div>

          {/* Right Column: Results */}
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              All government officials
            </h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Find Kenya’s leaders by the office they hold now, or last held. 
              Each profile summarises their current or most recent position.
            </p>

            {isLoading && <p className="govuk-body">Loading officials...</p>}
            {error && <p className="govuk-error-message">{error}</p>}

            {!isLoading && !error && (
              <>
                <p className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-font-weight-bold">
                  {filteredAndSortedLeaders.length}{" "}
                  {filteredAndSortedLeaders.length === 1 ? "person" : "people"}
                  {selectedDepartment !== "All" && ` in ${selectedDepartment}`}
                  {searchTerm && ` for "${searchTerm}"`}
                </p>

                <ul className="govuk-list">
                  {paginatedLeaders.map((leader) => {
                    const name = displayNameWithTitles(leader);
                    const primary = leaderPrimary(leader);
                    const term = primary.role && formatTermRange(primary.role.term_start_date, primary.role.term_end_date);

                    return (
                      <li key={leader.id} className="govuk-!-margin-bottom-6 govuk-!-padding-bottom-6 govuk-!-border-bottom-1">
                        <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                          <Link href={`/government/people/${leader.slug}`} className="govuk-link govuk-link--no-visited-state">
                            {name}
                          </Link>
                        </h2>

                        <p className="govuk-body govuk-!-margin-bottom-1 govuk-!-font-weight-bold">
                          {primary.isCurrent ? (
                            <>{primary.label}</>
                          ) : (
                            <>
                              <span className="govuk-caption-m">Last held: </span>
                              {primary.label}
                            </>
                          )}
                        </p>

                        {(term || primary.role?.party || leader.current_party) && (
                          <p className="govuk-body-s govuk-!-margin-bottom-2">
                            {[term, primary.role?.party || leader.current_party, primary.role?.county || leader.current_county]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        {leader.bio && (
                          <p className="govuk-body-s govuk-!-margin-bottom-2 govuk-text-secondary">
                            {truncateBio(leader.bio)}
                          </p>
                        )}

                        <p className="govuk-body-s">
                          <Link href={`/government/people/${leader.slug}`} className="govuk-link">
                            Full biography and career history
                          </Link>
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {paginatedLeaders.length === 0 && (
                  <div className="govuk-inset-text">
                    <p className="govuk-body">
                      No officials found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                )}

                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .app-filter-sidebar {
          padding-right: 15px;
        }
        @media (min-width: 40.0625rem) {
          .app-filter-sidebar {
            padding-right: 30px;
            border-right: 1px solid #b1b4b6;
          }
        }
      `}</style>
    </div>
  );
}