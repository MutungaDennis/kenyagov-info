"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export interface GovernmentServiceSummary {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  popularityWeight: number;
  categorySlug: string | string[];
  subcategorySlug?: string;
  providingBody: string;
}

export interface GovernmentCategoryFilter {
  title: string;
  slug: string;
  subcategories?: Array<{ title: string; slug: string }>;
}

interface ServicesClientViewProps {
  initialServices: GovernmentServiceSummary[];
  categories: GovernmentCategoryFilter[];
  pathCategorySlug?: string;
}

/**
 * Lightweight client-side fuzzy search to handle common typos and near matches.
 * Handles: exact matches, missing end characters, missing start characters, and transposed adjacent characters.
 */
const isFuzzyMatch = (text: string, query: string) => {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return true;
  
  const lowerText = text.toLowerCase();

  return queryWords.every(qWord => {
    // 1. Exact substring match
    if (lowerText.includes(qWord)) return true;
    
    // 2. Near match: allow 1 missing character at the end (e.g., "licens" -> "license")
    if (qWord.length >= 4 && lowerText.includes(qWord.slice(0, -1))) return true;
    
    // 3. Near match: allow 1 missing character at the beginning (e.g., "icense" -> "license")
    if (qWord.length >= 4 && lowerText.includes(qWord.slice(1))) return true;

    // 4. Near match: allow 1 transposed character (e.g., "lciense" -> "license")
    if (qWord.length >= 5) {
      for (let i = 1; i < qWord.length - 1; i++) {
        const swapped = qWord.slice(0, i - 1) + qWord[i] + qWord[i - 1] + qWord.slice(i + 1);
        if (lowerText.includes(swapped)) return true;
      }
    }
    
    return false;
  });
};

export default function ServicesClientView({
  initialServices,
  categories,
  pathCategorySlug,
}: ServicesClientViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search Engine Core States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"popular" | "az">("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // GOV.UK Filter States synchronized with Search URL Parameters / clean path
  const selectedCategory = pathCategorySlug || searchParams.get("category") || "all";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const selectedOrganization = searchParams.get("organization") || "all";

  // Accordion toggle states
  const [orgsOpen, setOrgsOpen] = useState(true);

  // Extract unique providing bodies for organization filtering
  const uniqueOrganizations = useMemo(() => {
    const orgs = initialServices.map((s) => s.providingBody).filter(Boolean);
    return Array.from(new Set(orgs)).sort();
  }, [initialServices]);

  // Combined Search, Sort, and Multi-Tier Filtering Matrix Engine
  const filteredAndSortedServices = useMemo(() => {
    let results = [...initialServices];

    // 1. Fuzzy Text Search matching (Title and Summary)
    if (searchQuery.trim() !== "") {
      results = results.filter(
        (service) =>
          isFuzzyMatch(service.title, searchQuery) ||
          isFuzzyMatch(service.summary, searchQuery)
      );
    }

    // 2. Topic Category Filtering
    if (selectedCategory !== "all") {
      results = results.filter((service) => {
        if (Array.isArray(service.categorySlug)) {
          return service.categorySlug.includes(selectedCategory);
        }
        return service.categorySlug === selectedCategory;
      });
    }

    // 3. Subtopic Filtering
    if (selectedSubcategory !== "all") {
      results = results.filter((service) => service.subcategorySlug === selectedSubcategory);
    }

    // 4. Strict Single-Organization Filtering Check
    if (selectedOrganization !== "all") {
      results = results.filter((service) => service.providingBody === selectedOrganization);
    }

    // 5. GOV.UK Sorting Matrix Execution
    if (sortOrder === "popular") {
      results.sort((a, b) => b.popularityWeight - a.popularityWeight);
    } else if (sortOrder === "az") {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [initialServices, searchQuery, selectedCategory, selectedSubcategory, selectedOrganization, sortOrder]);

  const totalServicesCount = filteredAndSortedServices.length;
  const totalPages = Math.ceil(totalServicesCount / ITEMS_PER_PAGE) || 1;
  const resultsAnnouncement = `${totalServicesCount} service${totalServicesCount === 1 ? "" : "s"} found`;
  
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedServices, currentPage]);

  // URL Parameter Mutators — prefer clean category paths for SEO
  const updateUrlParams = (key: string, value: string, clearSub = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (clearSub) {
      params.delete("subcategory");
    }
    setCurrentPage(1);

    const category = params.get("category");
    if (category && category !== "all") {
      params.delete("category");
      const qs = params.toString();
      router.push(`/services/categories/${encodeURIComponent(category)}${qs ? `?${qs}` : ""}`);
      return;
    }

    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  };

  return (
    <div>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services and guidance" },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Services and guidance</h1>
          
          {/* 
            TODO: Uncomment this introductory text when needed.
            <p className="govuk-body-l govuk-!-margin-bottom-2">
              Find services from across government. Search or filter by topic.
            </p>
            <p className="govuk-body govuk-!-margin-bottom-6">
              You can also{" "}
              <Link href="/services/popular" className="govuk-link">
                popular services
              </Link>
              ,{" "}
              <Link href="/services/a-z" className="govuk-link">
                services A to Z
              </Link>
              ,{" "}
              <Link href="/topics" className="govuk-link">
                browse topics
              </Link>
              , or{" "}
              <Link href="/guides" className="govuk-link">
                life-event guides
              </Link>
              . This website does not process applications.
            </p>
          */}
        </div>
      </div>

            {/* Search and sort controls - using GOV.UK form patterns */}
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="search-input">Search services</label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="e.g. passport, driving license"
                className="govuk-input w-full pr-10" // pr-10 ensures text doesn't overlap the right-side icon
              />
              
              {/* Right-side Icon Container */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {searchQuery ? (
                  // Clear (X) Button - Visible when there is text
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[#b1b4b6] transition-colors"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <svg 
                      className="h-4 w-4 text-[#0b0c0c]" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  // Search Icon - Visible when empty
                  <svg 
                    className="h-5 w-5 text-[#505a5f]" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value as "popular" | "az"); setCurrentPage(1); }}
              className="govuk-select w-full"
            >
              <option value="popular">Most viewed</option>
              <option value="az">A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main layout: filters in one-third sidebar, results in two-thirds (GOV.UK grid pattern) */}
      <div className="govuk-grid-row">
        
        {/* SIDEBAR FILTERS */}
        <div className="govuk-grid-column-one-third">
          
          {/* 1. TOPICS & SUBTOPICS DROPDOWN FILTER SEGMENT */}
          <div className="govuk-!-margin-bottom-6" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "1rem" }}>
            <div className="govuk-form-group">
              <label htmlFor="category-select" className="govuk-label govuk-!-font-weight-bold">
                Topic
              </label>
              <div className="relative">
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => updateUrlParams("category", e.target.value, true)}
                  className="govuk-select w-full pr-10"
                >
                  <option value="all">All topics</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#0b0c0c]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Contextual Subtopic Layer Selection Dropdown */}
            {(() => {
              const currentActiveCat = categories.find((c) => c.slug === selectedCategory);
              if (!currentActiveCat || !currentActiveCat.subcategories || currentActiveCat.subcategories.length === 0) return null;

              return (
                <div className="govuk-form-group govuk-!-margin-top-4" style={{ paddingLeft: "1rem", borderLeft: "2px solid #b1b4b6" }}>
                  <label htmlFor="subcategory-select" className="govuk-label govuk-label--s">
                    Subtopic
                  </label>
                  <div className="relative">
                    <select
                      id="subcategory-select"
                      value={selectedSubcategory}
                      onChange={(e) => updateUrlParams("subcategory", e.target.value)}
                      className="govuk-select w-full pr-10"
                    >
                      <option value="all">All {currentActiveCat.title}</option>
                      {currentActiveCat.subcategories.map((sub) => (
                        <option key={sub.slug} value={sub.slug}>
                          {sub.title}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#505a5f]">
                      <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2. ORGANIZATIONS ACCORDION */}
          <div className="govuk-!-margin-bottom-6" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => setOrgsOpen(!orgsOpen)}
              className="govuk-link w-full text-left govuk-!-font-weight-bold"
              aria-expanded={orgsOpen}
            >
              <span>Organisation</span>
              <span className="govuk-body-s govuk-!-margin-left-1">({orgsOpen ? "hide" : "show"})</span>
            </button>

            {orgsOpen && (
              <div className="govuk-!-margin-top-3 space-y-3" style={{ paddingLeft: "0.25rem", maxHeight: "16rem", overflowY: "auto", paddingRight: "0.25rem" }}>
                {uniqueOrganizations.map((org) => {
                  const isChecked = selectedOrganization === org;
                  return (
                    <div key={org} className="govuk-checkboxes__item">
                      <input
                        id={`org-${org}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const nextVal = isChecked ? "all" : org;
                          updateUrlParams("organization", nextVal);
                        }}
                        className="govuk-checkboxes__input"
                      />
                      <label className="govuk-label govuk-checkboxes__label govuk-body-s" htmlFor={`org-${org}`}>
                        {org}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS LIST (two-thirds) */}
        <div className="govuk-grid-column-two-thirds">
          
          {/* Results count + live region for screen readers */}
          <p
            className="govuk-body govuk-!-margin-bottom-4"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            <strong>{totalServicesCount.toLocaleString()}</strong>{" "}
            {resultsAnnouncement.replace(/^\d+\s*/, "")}
            <span className="govuk-body-s govuk-!-margin-left-2 govuk-!-text-colour-secondary">
              — page {currentPage} of {totalPages}
            </span>
          </p>

          {/* No results */}
          {totalServicesCount === 0 ? (
            <div className="govuk-inset-text" role="alert">
              <p className="govuk-body">No results found.</p>
              <p className="govuk-body-s">Try clearing some filters or using different search words.</p>
            </div>
          ) : (
            <ul className="govuk-list govuk-list--spaced">
              {paginatedServices.map((service) => (
                <li key={service._id} className="govuk-!-padding-bottom-4" style={{ borderBottom: "1px solid #b1b4b6" }}>
                  <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                    <Link href={`/${service.slug}`} className="govuk-link govuk-!-font-weight-bold">
                      {service.title}
                    </Link>
                  </h3>
                  <p className="govuk-body-s govuk-!-text-colour-secondary govuk-!-margin-bottom-1">{service.providingBody}</p>
                  <p className="govuk-body">{service.summary}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="govuk-!-margin-top-6" aria-label="Pagination">
              <ul className="govuk-list govuk-list--inline govuk-!-margin-bottom-0">
                {currentPage > 1 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="govuk-link"
                    >
                      Previous page
                    </button>
                  </li>
                )}
                <li className="govuk-body-s govuk-!-margin-left-2 govuk-!-text-colour-secondary">
                  Page {currentPage} of {totalPages}
                </li>
                {currentPage < totalPages && (
                  <li className="govuk-!-margin-left-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="govuk-link"
                    >
                      Next page
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
}