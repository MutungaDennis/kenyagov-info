'use client';

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

import React from "react";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  arm_of_government?: string | null;
  government_level?: string | null;
  mtef_sector?: string | null;
  description?: string | null;
};

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // 🔢 Pagination Configuration: Fixed 50 entries per page
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 50;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('institutions')
        .select(`
          id, slug, name, short_name, institution_type, institution_category,
          arm_of_government, government_level, mtef_sector, description
        `)
        .eq('is_active', true)
        .order('name');

      if (error) console.error("Error fetching institutions:", error);
      else setInstitutions(data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Reset pagination index window when filter values or search queries change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMainCategory, selectedSubCategory]);

  const mainCategories: string[] = useMemo(() => {
    const raw = institutions.map(
      (i) => i.arm_of_government ?? i.institution_category
    );

    const cleaned = raw.filter(
      (v): v is string => typeof v === "string" && v.trim() !== ""
    );

    const unique = Array.from(new Set(cleaned)).sort();
    return ["All", ...unique];
  }, [institutions]);

  const subCategoryOptions: string[] = useMemo(() => {
    if (selectedMainCategory === "All") return ["All"];

    const relevant = institutions.filter(
      (inst) =>
        inst.arm_of_government === selectedMainCategory ||
        inst.institution_category === selectedMainCategory
    );

    const subs = relevant
      .map((i) => i.institution_type)
      .filter((v): v is string => typeof v === "string" && v.trim() !== "");

    return ["All", ...Array.from(new Set(subs)).sort()];
  }, [selectedMainCategory, institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions
      .filter((inst) => {
        const searchMatch =
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inst.short_name &&
            inst.short_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (inst.description &&
            inst.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const mainMatch =
          selectedMainCategory === "All" ||
          inst.arm_of_government === selectedMainCategory ||
          inst.institution_category === selectedMainCategory;

        const subMatch =
          selectedSubCategory === "All" ||
          inst.institution_type === selectedSubCategory;

        return searchMatch && mainMatch && subMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [institutions, searchTerm, selectedMainCategory, selectedSubCategory]);

  // Compute sliced pagination parameters
  const paginatedInstitutions = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredInstitutions.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredInstitutions, currentPage]);

  const totalPages = Math.ceil(filteredInstitutions.length / entriesPerPage);
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Institutions", href: "/institutions" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Compact Typography Header Section */}
        <div className="govuk-!-margin-bottom-4">
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
            Government Institutions
          </h1>
          <p className="govuk-body govuk-!-font-size-17 govuk-!-text-colour-secondary govuk-!-margin-0">
            Complete directory of Kenyan public institutions — currently indexing {institutions.length} active public entities.
          </p>
        </div>

        {/* Downscaled Summary Stats Grid Banner */}
        <div className="govuk-grid-row govuk-!-margin-bottom-4">
          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <div className="govuk-inset-text">
              <span className="govuk-body govuk-!-font-weight-bold govuk-!-font-size-24 govuk-!-text-colour-blue govuk-!-display-block govuk-!-line-height-1">
                {loading ? "..." : filteredInstitutions.length}
              </span>
              <span className="govuk-body-s" style={{ color: "#505a5f" }}>
                {searchTerm || selectedMainCategory !== "All" || selectedSubCategory !== "All" ? "Matching results found" : "Total indexed entities"}
              </span>
            </div>
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <div style={{ backgroundColor: "#f3f2f1", borderLeft: "4px solid #505a5f", padding: "12px 15px" }}>
              <span className="govuk-body govuk-!-font-weight-bold" style={{ fontSize: "16px", color: "#0b0c0c", display: "block" }}>
                National Level: <strong>{institutions.filter((i) => i.government_level === "National").length}</strong>
              </span>
              <span className="govuk-body-s" style={{ color: "#505a5f", display: "block", marginTop: "2px" }}>
                County Level: <strong>{institutions.filter((i) => i.government_level === "County").length}</strong>
              </span>
            </div>
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <div style={{ backgroundColor: "#f3f2f1", borderLeft: "4px solid #00703c", padding: "12px 15px" }}>
              <span className="govuk-body govuk-!-font-weight-bold" style={{ fontSize: "16px", color: "#0b0c0c", display: "block" }}>
                State Corporations &amp; SAGAs
              </span>
              <span className="govuk-body-m govuk-!-font-weight-bold" style={{ color: "#00703c", display: "block", marginTop: "2px" }}>
                {institutions.filter((i) => i.institution_category === "State Corporation").length} Entities
              </span>
            </div>
          </div>
        </div>

        {/* ================= FILTERS FORM GROUP ROW ================= */}
        <div className="govuk-grid-row govuk-!-margin-bottom-4">
          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <label className="govuk-label govuk-label--s" htmlFor="search-input">Search institutions</label>
            <input
              id="search-input"
              className="govuk-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. KNEC, Ministry of Health..."
              type="search"
              autoComplete="off"
            />
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <label className="govuk-label govuk-label--s" htmlFor="main-cat-select">Main Category</label>
            <select
              id="main-cat-select"
              className="govuk-select govuk-!-width-full"
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory("All");
              }}
            >
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
            <label className="govuk-label govuk-label--s" htmlFor="sub-cat-select">Sub Category</label>
            <select
              id="sub-cat-select"
              className="govuk-select govuk-!-width-full"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={selectedMainCategory === "All"}
            >
              {subCategoryOptions.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Results Metric Tracker */}
        <div className="govuk-!-margin-bottom-4">
          <p className="govuk-body-s" style={{ margin: 0, color: "#2b2b2b" }}>
            Showing items <strong>{filteredInstitutions.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</strong> to <strong>{Math.min(currentPage * entriesPerPage, filteredInstitutions.length)}</strong> of <strong>{filteredInstitutions.length}</strong> filtered institutions
          </p>
        </div>

        {/* ================= COMPACT LINED RESPONSIVE DATA TABLE ================= */}
        <div className="govuk-table-responsive-container" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", borderBottom: "1px solid #b1b4b6", marginBottom: "20px" }}>
          <table className="govuk-table legislation-lined-table" style={{ minWidth: "720px", marginBottom: 0 }}>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header" style={{ width: "40px", fontSize: "15px", padding: "10px 8px" }}>#</th>
                <th scope="col" className="govuk-table__header" style={{ fontSize: "15px", padding: "10px 8px" }}>Institution Name</th>
                <th scope="col" className="govuk-table__header" style={{ width: "140px", fontSize: "15px", padding: "10px 8px" }}>Type</th>
                <th scope="col" className="govuk-table__header" style={{ width: "150px", fontSize: "15px", padding: "10px 8px" }}>Category / Arm</th>
                <th scope="col" className="govuk-table__header" style={{ width: "95px", fontSize: "15px", padding: "10px 8px" }}>Level</th>
                <th scope="col" className="govuk-table__header" style={{ width: "140px", fontSize: "15px", padding: "10px 8px" }}>MTEF Sector</th>
              </tr>
            </thead>

            <tbody className="govuk-table__body">
              {paginatedInstitutions.map((inst, index) => (
                <tr key={inst.id} className="govuk-table__row">
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px" }}>
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px" }}>
                    <Link href={`/institutions/${inst.slug}`} className="govuk-link govuk-link--no-underline" style={{ fontSize: "15px" }}>
                      <strong>{inst.name}</strong>
                      {inst.short_name && ` (${inst.short_name})`}
                    </Link>
                  </td>
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px", color: "#2b2b2b" }}>{inst.institution_type || "—"}</td>
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px", color: "#2b2b2b" }}>{inst.arm_of_government || inst.institution_category || "—"}</td>
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px", color: "#2b2b2b" }}>{inst.government_level || "—"}</td>
                  <td className="govuk-table__cell" style={{ fontSize: "15px", padding: "10px 8px", color: "#2b2b2b" }}>{inst.mtef_sector || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="govuk-body govuk-!-font-size-16">Loading database records...</p>}
        {/* ================= PAGINATION STEPPER CONTROLS ================= */}
        {!loading && totalPages > 1 && (
          <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation">
            <div className="govuk-pagination__prev" style={{ visibility: currentPage === 1 ? "hidden" : "visible" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="govuk-link govuk-link--no-underline govuk-pagination__link"
                style={{ background: "none", border: "none", font: "inherit", cursor: "pointer", fontWeight: "bold", padding: "5px 10px" }}
              >
                <span className="govuk-pagination__icon govuk-pagination__icon--prev" aria-hidden="true">◀</span>
                Previous <span className="govuk-visually-hidden">page</span>
              </button>
            </div>

            <ul className="govuk-pagination__list" style={{ display: "inline-flex", listStyle: "none", padding: 0, margin: "0 10px", alignItems: "center" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const isCurrent = page === currentPage;
                  return (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <li className="govuk-pagination__item govuk-pagination__item--ellipsis" style={{ padding: "0 8px", color: "#505a5f" }}>&hellip;</li>
                      )}
                      <li className={`govuk-pagination__item ${isCurrent ? "govuk-pagination__item--current" : ""}`} style={{ margin: "0 2px" }}>
                        <button
                          onClick={() => setCurrentPage(page)}
                          aria-current={isCurrent ? "page" : undefined}
                          aria-label={`Page ${page}`}
                          className="govuk-link govuk-link--no-underline"
                          style={{
                            background: isCurrent ? "#1d70b8" : "none",
                            border: "none",
                            font: "inherit",
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: isCurrent ? "#ffffff" : "#1d70b8", // ◄ FIXED: Strict high-contrast coloring visibility override
                            padding: "5px 10px",
                            display: "inline-block"
                          }}
                        >
                          {page}
                        </button>
                      </li>
                    </React.Fragment>
                  );
                })}
            </ul>

            <div className="govuk-pagination__next" style={{ visibility: currentPage === totalPages ? "hidden" : "visible" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="govuk-link govuk-link--no-underline govuk-pagination__link"
                style={{ background: "none", border: "none", font: "inherit", cursor: "pointer", fontWeight: "bold", padding: "5px 10px" }}
              >
                Next <span className="govuk-visually-hidden">page</span>
                <span className="govuk-pagination__icon govuk-pagination__icon--next" aria-hidden="true">▶</span>
              </button>
            </div>
          </nav>
        )}

        
      </main>

      {/* Global CSS Layout Overrides safe for Next App Architecture Layout Trees */}
      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        /* Clear horizontal border grid lines following standard GOV.UK tables rules */
        .legislation-lined-table th, .legislation-lined-table td {
          border-bottom: 1px solid #b1b4b6 !important;
          text-align: left;
        }
        .legislation-lined-table tr:hover {
          background-color: #f3f2f1;
        }

        /* Force high contrast white text over blue pagination markers to guarantee visibility */
        .govuk-pagination__item--current button {
          color: #ffffff !important;
        }

        /* Pagination structural distribution configurations */
        .govuk-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
          margin-bottom: 25px;
          border-top: 1px solid #b1b4b6;
          padding-top: 10px;
        }
      `}} />
    </div>
  );
}
