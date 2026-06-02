// app/services/ServicesClientView.tsx (Part 2 of 2)
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GovernmentServiceSummary, GovernmentCategoryFilter } from "./page";

interface ServicesClientViewProps {
  initialServices: GovernmentServiceSummary[];
  categories: GovernmentCategoryFilter[];
}

export default function ServicesClientView({ initialServices, categories }: ServicesClientViewProps) {
  // Navigation filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"popular" | "az">("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  // Filter and sort tracking state machine
  const filteredAndSortedServices = useMemo(() => {
    let results = [...initialServices];

    // 1. Text Search matching across title, summary, or custom keys
    if (searchQuery.trim() !== "") {
      const cleanQuery = searchQuery.toLowerCase();
      results = results.filter(
        (service) =>
          service.title.toLowerCase().includes(cleanQuery) ||
          service.summary.toLowerCase().includes(cleanQuery)
      );
    }

    // 2. Structural Category Filtering
    if (selectedCategory !== "all") {
      results = results.filter((service) => {
        // Handle sanity array response parsing safely
        if (Array.isArray(service.categorySlug)) {
          return service.categorySlug.includes(selectedCategory);
        }
        return service.categorySlug === selectedCategory;
      });
    }

    // 3. Sorting Execution (Most Viewed vs Alphabetical)
    if (sortOrder === "popular") {
      results.sort((a, b) => b.popularityWeight - a.popularityWeight);
    } else if (sortOrder === "az") {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [initialServices, searchQuery, selectedCategory, sortOrder]);

  // Pagination bounds calculation
  const totalServicesCount = filteredAndSortedServices.length;
  const totalPages = Math.ceil(totalServicesCount / ITEMS_PER_PAGE) || 1;
  
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedServices, currentPage]);

  // Reset pagination indexes on active search modifications
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "popular" | "az");
    setCurrentPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
      
      {/* LEFT COLUMN: Sidebar Navigation and Query Filters */}
      <div className="space-y-6 lg:col-span-1 bg-[#f3f4f4] p-4 h-fit border-t-4 border-[#0b0c0c]">
        <h2 className="text-xl font-bold text-[#0b0c0c] mb-2">Filter results</h2>
        
        {/* Search Input Box */}
        <div>
          <label htmlFor="search-input" className="block text-sm font-bold text-[#0b0c0c] mb-1">
            Keywords search
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="e.g. passport, license..."
            className="w-full bg-white text-base border-2 border-[#0b0c0c] px-3 py-2 text-[#0b0c0c] focus:outline-none focus:ring-4 focus:ring-[#ffdd00]"
          />
        </div>

        {/* Category Topic Selection Dropdown */}
        <div>
          <label htmlFor="category-select" className="block text-sm font-bold text-[#0b0c0c] mb-1">
            Filter by topic
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full bg-white text-base border-2 border-[#0b0c0c] px-2 py-2 text-[#0b0c0c] focus:outline-none focus:ring-4 focus:ring-[#ffdd00]"
          >
            <option value="all">All Topics</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat.slug}>{cat.title}</option>
            ))}
          </select>
        </div>

        {/* Sort Order Selector Block */}
        <div>
          <label htmlFor="sort-select" className="block text-sm font-bold text-[#0b0c0c] mb-1">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortOrder}
            onChange={handleSortChange}
            className="w-full bg-white text-base border-2 border-[#0b0c0c] px-2 py-2 text-[#0b0c0c] focus:outline-none focus:ring-4 focus:ring-[#ffdd00]"
          >
            <option value="popular">Most viewed services</option>
            <option value="az">Alphabetical (A to Z)</option>
          </select>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Counter Indicators and Feed Output Area */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Dynamic Services Count Header Label */}
        <div className="text-base text-[#0b0c0c] border-b border-[#b1b4b6] pb-2 font-bold flex justify-between items-center">
          <span>{totalServicesCount.toLocaleString()} service{totalServicesCount === 1 ? '' : 's'} verified</span>
          <span className="text-sm font-normal text-[#505a5f]">Page {currentPage} of {totalPages}</span>
        </div>

        {/* EMPTY STATE GRACEFUL HANDLING BLOCK */}
        {totalServicesCount === 0 ? (
          <div className="bg-[#fff7e6] border-l-4 border-[#f47738] p-6 text-center lg:text-left mt-8">
            <h3 className="text-xl font-bold text-[#0b0c0c] mb-2">
              Government Guides Are Coming Soon
            </h3>
            <p className="text-base text-[#505a5f]">
              We are actively verifying step-by-step documentation for these services. No content matches your current query selections. Try removing filters or changing your keywords.
            </p>
          </div>
        ) : (
          /* Services Output List Loop */
          <div className="divide-y divide-[#b1b4b6]">
            {paginatedServices.map((service) => (
              <div key={service._id} className="py-5 first:pt-0 last:pb-0 group">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  <Link 
                    href={`/${service.slug}`}
                    className="text-[#1d70b8] underline hover:text-[#003078] focus:bg-[#ffdd00] focus:text-[#0b0c0c] transition-colors"
                  >
                    {service.title}
                  </Link>
                </h3>
                <p className="text-base text-[#0b0c0c] leading-relaxed max-w-3xl">
                  {service.summary}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* GOV.UK SEAMLESS STEPPED PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="border-t border-[#b1b4b6] pt-4 mt-8 flex items-center justify-between">
            {currentPage > 1 ? (
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="text-base font-bold text-[#1d70b8] hover:text-[#003078] flex items-center focus:outline-none focus:bg-[#ffdd00] px-2 py-1"
              >
                ◀ Previous page
              </button>
            ) : (
              <div />
            )}

            <span className="text-sm font-bold text-[#505a5f]">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="text-base font-bold text-[#1d70b8] hover:text-[#003078] flex items-center focus:outline-none focus:bg-[#ffdd00] px-2 py-1"
              >
                Next page ▶
              </button>
            ) : (
              <div />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
