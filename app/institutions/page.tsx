'use client';

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

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

  // ✅ FIXED: strict string array (NO nulls allowed)
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

  // Dynamic Subcategories
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

  // Filtered Results
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
  }, [
    institutions,
    searchTerm,
    selectedMainCategory,
    selectedSubCategory,
  ]);

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Institutions", href: "/institutions" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Government Institutions</h1>

        <p className="govuk-body-l">
          Complete directory of Kenyan public institutions — currently showing {institutions.length} active entities.
        </p>

        {/* Summary Stats */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-panel govuk-panel--confirmation">
              <div className="govuk-panel__body">
                <strong className="govuk-!-font-size-36">{institutions.length}</strong>
                <br />
                Total Institutions
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-panel">
              <div className="govuk-panel__body">
                National:{" "}
                {institutions.filter((i) => i.government_level === "National").length}
                <br />
                County:{" "}
                {institutions.filter((i) => i.government_level === "County").length}
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-panel">
              <div className="govuk-panel__body">
                State Corporations & SAGAs:{" "}
                {
                  institutions.filter(
                    (i) => i.institution_category === "State Corporation"
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">Search institutions</label>
            <input
              className="govuk-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. KNEC, Ministry of Health..."
            />
          </div>

          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">Main Category</label>
            <select
              className="govuk-select"
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory("All");
              }}
            >
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="govuk-grid-column-one-third">
            <label className="govuk-label">Sub Category</label>
            <select
              className="govuk-select"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={selectedMainCategory === "All"}
            >
              {subCategoryOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="govuk-body-s">
          Showing <strong>{filteredInstitutions.length}</strong> institutions
        </p>

        {/* TABLE */}
        <div className="govuk-table-wrapper">
          <table className="govuk-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Institution</th>
                <th>Type</th>
                <th>Category</th>
                <th>Level</th>
                <th>MTEF Sector</th>
              </tr>
            </thead>

            <tbody>
              {filteredInstitutions.map((inst, index) => (
                <tr key={inst.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link href={`/institutions/${inst.slug}`}>
                      <strong>{inst.name}</strong>
                      {inst.short_name && ` (${inst.short_name})`}
                    </Link>
                  </td>
                  <td>{inst.institution_type}</td>
                  <td>{inst.arm_of_government || inst.institution_category}</td>
                  <td>{inst.government_level}</td>
                  <td>{inst.mtef_sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <p className="govuk-body">Loading...</p>}

        <GovUKFeedback />
      </main>
    </div>
  );
}