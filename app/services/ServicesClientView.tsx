// app/services/ServicesClientView.tsx (Part 1 of 3)
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
  /** When set (from /services/categories/[slug]), overrides ?category= */
  pathCategorySlug?: string;
}

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
  const selectedCategory =
    pathCategorySlug || searchParams.get("category") || "all";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const selectedOrganization = searchParams.get("organization") || "all";

  // Accordion toggle states
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [orgsOpen, setOrgsOpen] = useState(true);

  // Extract unique providing bodies for organization filtering
  const uniqueOrganizations = useMemo(() => {
    const orgs = initialServices.map((s) => s.providingBody).filter(Boolean);
    return Array.from(new Set(orgs)).sort();
  }, [initialServices]);

  // Combined Search, Sort, and Multi-Tier Filtering Matrix Engine
  const filteredAndSortedServices = useMemo(() => {
    let results = [...initialServices];

    // 1. Text Search matching
    if (searchQuery.trim() !== "") {
      const cleanQuery = searchQuery.toLowerCase();
      results = results.filter(
        (service) =>
          service.title.toLowerCase().includes(cleanQuery) ||
          service.summary.toLowerCase().includes(cleanQuery)
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
  const resultsAnnouncement = `${totalServicesCount} service${
    totalServicesCount === 1 ? "" : "s"
  } found`;
  
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
      router.push(
        `/services/categories/${encodeURIComponent(category)}${qs ? `?${qs}` : ""}`,
      );
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
            <h1 className="govuk-heading-xl">
              Services and guidance
            </h1>
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
          </div>
        </div>

      {/* Top Controller Search Bar & Sort Toggle Header Node */}
      {/* Search and sort controls - using GOV.UK form patterns */}
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="search-input">Search services</label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="e.g. passport, driving license"
              className="govuk-input"
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value as "popular" | "az"); setCurrentPage(1); }}
              className="govuk-select"
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
<div className="border-b border-[#b1b4b6] pb-4 space-y-4">
  {/* Main Topic Level Selection Dropdown */}
  <div className="govuk-form-group">
    <label htmlFor="category-select" className="govuk-label">
      Topic
    </label>
    <div className="relative">
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => updateUrlParams("category", e.target.value, true)}
        className="w-full bg-white text-base font-bold border-2 border-[#0b0c0c] px-3 py-2.5 text-[#0b0c0c] appearance-none focus:outline-none focus:ring-4 focus:ring-[#ffdd00] cursor-pointer pr-10"
      >
        <option value="all">All topics</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.title}
          </option>
        ))}
      </select>
      
      {/* GOV.UK Standard Downward Chevron Indicator */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#0b0c0c] font-bold">
        <svg className="fill-current h-4 w-4" xmlns="http://w3.org" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  </div>

  {/* Contextual Subtopic Layer Selection Dropdown (Only appears when parent topic selection is active and has valid subgroups) */}
  {(() => {
    const currentActiveCat = categories.find((c) => c.slug === selectedCategory);
    if (!currentActiveCat || !currentActiveCat.subcategories || currentActiveCat.subcategories.length === 0) return null;

    return (
      <div className="govuk-form-group pl-4 border-l-2 border-[#b1b4b6] animate-fadeIn">
        <label htmlFor="subcategory-select" className="govuk-label govuk-label--s">
          Subtopic
        </label>
        <div className="relative">
          <select
            id="subcategory-select"
            value={selectedSubcategory}
            onChange={(e) => updateUrlParams("subcategory", e.target.value)}
            className="w-full bg-white text-sm font-bold border-2 border-[#0b0c0c] px-3 py-2 text-[#0b0c0c] appearance-none focus:outline-none focus:ring-4 focus:ring-[#ffdd00] cursor-pointer pr-10"
          >
            <option value="all">All {currentActiveCat.title}</option>
            {currentActiveCat.subcategories.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.title}
              </option>
            ))}
          </select>

          {/* Subtopic Chevron Overlay */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#505a5f] font-bold">
            <svg className="fill-current h-3 w-3" xmlns="http://w3.org" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
    );
  })()}
</div>


          {/* 2. ORGANIZATIONS ACCORDION (Enforces single-selection checkbox rule) */}
          <div className="border-b border-[#b1b4b6] pb-4">
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
              <div className="mt-3 space-y-3 pl-1 max-h-64 overflow-y-auto pr-1">
                {uniqueOrganizations.map((org) => {
                  const isChecked = selectedOrganization === org;
                  return (
                    <div key={org} className="flex items-start">
                      <input
                        id={`org-${org}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          // Toggle logic: selecting an active checkbox clears it back to "all"
                          const nextVal = isChecked ? "all" : org;
                          updateUrlParams("organization", nextVal);
                        }}
                        className="w-5 h-5 border-2 border-[#0b0c0c] accent-[#0b0c0c] rounded-none focus:ring-4 focus:ring-[#ffdd00] mt-0.5 shrink-0"
                      />
                      <label htmlFor={`org-${org}`} className="govuk-body-s govuk-!-margin-left-1">
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
            className="govuk-body govuk-!-margin-bottom-2"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            <strong>{totalServicesCount.toLocaleString()}</strong>{" "}
            {resultsAnnouncement.replace(/^\d+\s*/, "")}
            <span className="govuk-body-s govuk-!-margin-left-2 govuk-!-color-grey">
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
                <li key={service._id} className="govuk-!-padding-bottom-4 govuk-!-border-bottom-1">
                  <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                    <Link href={`/${service.slug}`} className="govuk-link govuk-!-font-weight-bold">
                      {service.title}
                    </Link>
                  </h3>
                  <p className="govuk-body-s govuk-!-color-grey govuk-!-margin-bottom-1">{service.providingBody}</p>
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
                <li className="govuk-body-s govuk-!-margin-left-2 govuk-!-color-grey">
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