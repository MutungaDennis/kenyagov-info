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

/** Every organisation this person has been under (any role, any status). */
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
    (leader.current_organization
      ? leader.current_organization
      : leader.category) ||
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
  /** default = as loaded; az / za = display name */
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za">(
    "default",
  );

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

    const fetchLeaders = async () => {
      try {
        const supabase = await createBrowserClientAsync();
        const { data, error: fetchError } = await supabase
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
          `,
          )
          .eq("is_active", true)
          .order("surname", { ascending: true });

        if (fetchError) {
          // Fallback: simpler join; drop name_titles if column not migrated yet
          const fallback = await supabase
            .from("leaders")
            .select(
              `
              id, slug, first_name, other_names, surname, full_name, title,
              name_titles, national_honours, category, bio, current_organization, current_constituency,
              current_county, current_party,
              leader_roles (
                id, title, organization, constituency, county, party,
                status, term_start_date, term_end_date
              )
            `,
            )
            .order("surname", { ascending: true });
          if (
            fallback.error &&
            /name_titles|national_honours|column|schema/i.test(
              fallback.error.message || "",
            )
          ) {
            const bare = await supabase
              .from("leaders")
              .select(
                `
                id, slug, first_name, other_names, surname, full_name, title,
                category, bio, current_organization, current_constituency,
                current_county, current_party,
                leader_roles (
                  id, title, organization, constituency, county, party,
                  status, term_start_date, term_end_date
                )
              `,
              )
              .order("surname", { ascending: true });
            if (bare.error) throw bare.error;
            if (!cancelled) {
              setAllLeaders((bare.data as unknown as Leader[]) || []);
            }
          } else if (fallback.error) {
            throw fallback.error;
          } else if (!cancelled) {
            setAllLeaders((fallback.data as unknown as Leader[]) || []);
          }
        } else if (!cancelled) {
          setAllLeaders((data as unknown as Leader[]) || []);
        }
      } catch (err: unknown) {
        console.error("Error fetching leaders:", err);
        if (!cancelled) setError("Failed to load government officials.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchLeaders();
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
    // Keep original index for stable "default" order
    let result = allLeaders.map((l, index) => ({ leader: l, index }));

    if (selectedDepartment !== "All") {
      const dept = selectedDepartment.toLowerCase();
      result = result.filter(({ leader: l }) => {
        if ((l.current_organization || "").toLowerCase() === dept) return true;
        return (l.leader_roles || []).some(
          (role) => (role.organization || "").toLowerCase() === dept,
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
        const roleTitles = (l.leader_roles || [])
          .map((r) => r.title || "")
          .filter(Boolean);
        const roleConstituencies = (l.leader_roles || [])
          .map((r) => r.constituency || "")
          .filter(Boolean);
        const roleCounties = (l.leader_roles || [])
          .map((r) => r.county || "")
          .filter(Boolean);
        const roleParties = (l.leader_roles || [])
          .map((r) => r.party || "")
          .filter(Boolean);

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
          // All organisations (current + historical roles)
          orgs.some((o) => o.toLowerCase().includes(term)) ||
          roleTitles.some((t) => t.toLowerCase().includes(term)) ||
          roleConstituencies.some((c) => c.toLowerCase().includes(term)) ||
          roleCounties.some((c) => c.toLowerCase().includes(term)) ||
          roleParties.some((p) => p.toLowerCase().includes(term))
        );
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "default") {
        // Stable: original fetch order (surname from API)
        return a.index - b.index;
      }
      const nameA = sortNameKey(a.leader);
      const nameB = sortNameKey(b.leader);
      const cmp = nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      if (sortOrder === "az") return cmp;
      return -cmp; // za
    });

    return result.map((r) => r.leader);
  }, [allLeaders, selectedDepartment, searchTerm, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedLeaders.length / itemsPerPage),
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedDepartment, sortOrder]);

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
      <nav
        className="govuk-pagination"
        role="navigation"
        aria-label="Pagination"
      >
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
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--prev"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
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
                <a
                  className="govuk-link govuk-pagination__link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                  aria-label="Page 1"
                >
                  1
                </a>
              </li>
              {startPage > 2 && (
                <li className="govuk-pagination__item govuk-pagination__item--ellipses">
                  ⋯
                </li>
              )}
            </>
          )}

          {pages.map((page) => (
            <li
              key={page}
              className={`govuk-pagination__item ${page === currentPage ? "govuk-pagination__item--current" : ""}`}
            >
              <a
                className="govuk-link govuk-pagination__link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
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
                <li className="govuk-pagination__item govuk-pagination__item--ellipses">
                  ⋯
                </li>
              )}
              <li className="govuk-pagination__item">
                <a
                  className="govuk-link govuk-pagination__link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                  aria-label={`Page ${totalPages}`}
                >
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
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              rel="next"
            >
              <span className="govuk-pagination__link-title">Next</span>
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--next"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
              </svg>
            </a>
          </div>
        )}
      </nav>
    );
  };

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "People", href: "/government/people" },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
            All government officials
          </h1>

          <p className="govuk-body-l govuk-!-margin-bottom-4">
            Find Kenya’s leaders by the office they hold now — or last held —
            including Cabinet Secretaries, Principal Secretaries, Members of
            Parliament, Senators, governors and other senior officials.
          </p>
          <p className="govuk-body govuk-!-margin-bottom-8">
            Each profile summarises their current or most recent position first.
            Open a name for full biography, career history (moves between
            offices over time), and academic qualifications where available.
          </p>

          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="search-officials"
                >
                  Search officials
                </label>
                <div className="govuk-hint">
                  Name, organisation, position, constituency, or county
                </div>
                <div className="relative">
                  <input
                    className="govuk-input govuk-!-padding-right-6"
                    id="search-officials"
                    name="search-officials"
                    type="search"
                    placeholder="e.g. Ruto, Ministry of Health, Kisii…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="filter-department"
                >
                  Organisation
                </label>
                <div className="govuk-hint">
                  All organisations people serve or have served under
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
            </div>

            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="sort-order"
                >
                  Sort by
                </label>
                <div className="govuk-hint">Name order</div>
                <select
                  className="govuk-select govuk-!-width-full"
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "default" || v === "az" || v === "za") {
                      setSortOrder(v);
                    }
                  }}
                >
                  <option value="default">Default</option>
                  <option value="az">A to Z</option>
                  <option value="za">Z to A</option>
                </select>
              </div>
            </div>
          </div>

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

              <ul className="govuk-list govuk-!-padding-left-0">
                {paginatedLeaders.map((leader) => {
                  const name = displayNameWithTitles(leader);
                  const primary = leaderPrimary(leader);
                  const term =
                    primary.role &&
                    formatTermRange(
                      primary.role.term_start_date,
                      primary.role.term_end_date,
                    );

                  return (
                    <li
                      key={leader.id}
                      className="govuk-!-margin-bottom-6 pb-6"
                      style={{ borderBottom: "1px solid #b1b4b6" }}
                    >
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                        <Link
                          href={`/government/people/${leader.slug}`}
                          className="govuk-link govuk-link--no-visited-state"
                        >
                          {name}
                        </Link>
                      </h2>

                      <p className="govuk-body govuk-!-margin-bottom-1 govuk-!-font-weight-bold">
                        {primary.isCurrent ? (
                          <>
                            <span className="govuk-visually-hidden">
                              Current position:{" "}
                            </span>
                            {primary.label}
                          </>
                        ) : (
                          <>
                            <span className="govuk-caption-m">
                              Last held:{" "}
                            </span>
                            {primary.label}
                          </>
                        )}
                      </p>

                      {(term ||
                        primary.role?.party ||
                        leader.current_party) && (
                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                          {[
                            term,
                            primary.role?.party || leader.current_party,
                            primary.role?.county || leader.current_county,
                          ]
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
                        <Link
                          href={`/government/people/${leader.slug}`}
                          className="govuk-link"
                        >
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
                    No officials found matching your criteria. Try adjusting
                    your search or filters.
                  </p>
                </div>
              )}

              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </>
  );
}
