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
}

export default function ServicesClientView({ initialServices, categories }: ServicesClientViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search Engine Core States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"popular" | "az">("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // GOV.UK Filter States synchronized with Search URL Parameters
  const selectedCategory = searchParams.get("category") || "all";
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
  
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedServices, currentPage]);

  // URL Parameter Mutators
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
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 font-sans text-[#0b0c0c] bg-white antialiased selection:bg-[#ffdd00] selection:text-[#0b0c0c]">
      {/* GOV.UK Home Breadcrumb Rule */}
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }]} />

      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-6 mb-8 text-[#0b0c0c]">
        Services and guidance
      </h1>

      {/* Top Controller Search Bar & Sort Toggle Header Node */}
      <div className="border-b-2 border-[#b1b4b6] pb-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="md:col-span-2">
          <label htmlFor="search-input" className="block text-base font-bold text-[#0b0c0c] mb-2">
            Search services
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="e.g. passport, driving license"
            className="w-full bg-white text-base border-2 border-[#0b0c0c] px-3 py-2 text-[#0b0c0c] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] rounded-none appearance-none"
          />
        </div>

        <div className="md:col-span-2 md:justify-self-end w-full max-w-xs">
          <label htmlFor="sort-select" className="block text-sm font-normal text-[#505a5f] mb-1">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value as "popular" | "az"); setCurrentPage(1); }}
            className="w-full bg-white text-base border-2 border-[#0b0c0c] px-2 py-1.5 text-[#0b0c0c] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] rounded-none h-[40px]"
          >
            <option value="popular">Most viewed</option>
            <option value="az">A to Z</option>
          </select>
        </div>
      </div>
{/* Main Core Layout: 1/3 Sidebar Filter + 2/3 Stream Column Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTER INTERACTIVE SUITE */}
        <aside className="space-y-6 md:col-span-1">
          
          {/* 1. TOPICS & SUBTOPICS DROPDOWN FILTER SEGMENT */}
<div className="border-b border-[#b1b4b6] pb-4 space-y-4">
  {/* Main Topic Level Selection Dropdown */}
  <div className="govuk-form-group">
    <label htmlFor="category-select" className="block text-base font-bold text-[#0b0c0c] mb-2">
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
        <label htmlFor="subcategory-select" className="block text-sm font-bold uppercase tracking-wider text-[#505a5f] mb-1.5">
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
              className="w-full text-left font-bold text-lg text-[#0b0c0c] py-2 flex justify-between items-center focus:outline-none focus:bg-[#ffdd00]"
              aria-expanded={orgsOpen}
            >
              <span>Organization</span>
              <span className="text-sm text-[#1d70b8] font-normal" aria-hidden="true">
                {orgsOpen ? "Hide" : "Show"}
              </span>
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
                      <label htmlFor={`org-${org}`} className="ml-2 text-sm text-[#0b0c0c] cursor-pointer leading-tight">
                        {org}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
        {/* STREAM FEED SELECTION PORTION */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Results Summary Metadata Row */}
          <div className="text-base text-[#0b0c0c] border-b border-[#b1b4b6] pb-3 font-bold flex justify-between items-center">
            <span>{totalServicesCount.toLocaleString()} service{totalServicesCount === 1 ? '' : 's'} verified</span>
            <span className="text-sm font-normal text-[#505a5f]">Page {currentPage} of {totalPages}</span>
          </div>

          {/* Empty Lookup Fallback */}
          {totalServicesCount === 0 ? (
            <div className="border-l-4 border-[#d4351c] pl-5 py-2 mt-8" role="alert">
              <h3 className="text-xl font-bold text-[#0b0c0c] mb-2">No results found</h3>
              <p className="text-base text-[#505a5f] leading-relaxed max-w-xl">
                Try removing sidebar filters, modifying your search text keywords, or selecting another high-level topic.
              </p>
            </div>
          ) : (
            /* Document Results Display Array Feed */
            <div className="divide-y divide-[#b1b4b6]">
              {paginatedServices.map((service) => (
                <div key={service._id} className="py-6 first:pt-0 last:pb-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    <Link 
                      href={`/${service.slug}`}
                      className="text-[#1d70b8] underline decoration-2 font-bold hover:text-[#003078] focus:bg-[#ffdd00] focus:text-[#0b0c0c] focus:no-underline"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-[#505a5f] mb-2 font-medium">
                    {service.providingBody}
                  </p>
                  <p className="text-base md:text-lg text-[#0b0c0c] leading-relaxed max-w-3xl">
                    {service.summary}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Stepped Clean Navigation Toggles */}
          {totalPages > 1 && (
            <nav className="border-t-2 border-[#b1b4b6] pt-4 mt-8 flex items-center justify-between font-bold" aria-label="Pagination Navigation">
              <div className="w-1/3 text-left">
                {currentPage > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="text-base text-[#1d70b8] hover:text-[#003078] focus:outline-none focus:bg-[#ffdd00] focus:text-[#0b0c0c] py-2"
                  >
                    <span className="block text-xs font-normal text-[#505a5f] uppercase mb-0.5">Previous</span>
                    <span>Page {currentPage - 1}</span>
                  </button>
                )}
              </div>

              <div className="w-1/3 text-center text-sm font-normal text-[#505a5f]">
                Page {currentPage} of {totalPages}
              </div>

              <div className="w-1/3 text-right">
                {currentPage < totalPages && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="text-base text-[#1d70b8] hover:text-[#003078] focus:outline-none focus:bg-[#ffdd00] focus:text-[#0b0c0c] py-2"
                  >
                    <span className="block text-xs font-normal text-[#505a5f] uppercase mb-0.5">Next</span>
                    <span>Page {currentPage + 1}</span>
                  </button>
                )}
              </div>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
}