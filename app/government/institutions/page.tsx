// app/government/institutions/page.tsx
'use client';

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  arm_of_government?: string | null;
  government_level?: string | null;
  parent_institution_id?: string | null;
  description?: string | null;
  aliases?: string[] | null;
  former_names?: string[] | null;
};

type InstitutionWithChildren = Institution & {
  children?: Institution[];
};

type CategoryGroup = {
  title: string;
  slug: string;
  count: number;
  institutions: InstitutionWithChildren[];
};

type ViewMode = 'accordion' | 'table';

export default function GovernmentInstitutionsPage() {
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedInstitutions, setExpandedInstitutions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('accordion');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = await createBrowserClientAsync();
      // Published only — is_active is the public publish flag
      const pageSize = 1000;
      const all: Institution[] = [];
      let from = 0;
      for (let i = 0; i < 20; i++) {
        const { data, error } = await supabase
          .from("institutions")
          .select(
            `
            id, slug, name, short_name, official_name, institution_type, institution_category,
            arm_of_government, government_level, parent_institution_id, description,
            aliases, former_names
          `,
          )
          .eq("is_active", true)
          .order("name")
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("Error fetching institutions:", error);
          // Retry without array columns if missing
          const basic = await supabase
            .from("institutions")
            .select(
              `id, slug, name, short_name, official_name, institution_type, institution_category,
               arm_of_government, government_level, parent_institution_id, description`,
            )
            .eq("is_active", true)
            .order("name")
            .range(from, from + pageSize - 1);
          if (basic.error) break;
          all.push(...((basic.data || []) as Institution[]));
          if ((basic.data || []).length < pageSize) break;
          from += (basic.data || []).length;
          continue;
        }
        all.push(...((data || []) as Institution[]));
        if ((data || []).length < pageSize) break;
        from += (data || []).length;
      }

      setAllInstitutions(all);
      setLoading(false);
    };

    fetchData();
  }, []);

  const matchesSearch = (inst: Institution, term: string): boolean => {
    if (!term) return true;
    const t = term.toLowerCase();
    const hay = [
      inst.name,
      inst.short_name,
      inst.official_name,
      inst.description,
      inst.institution_type,
      inst.institution_category,
      ...(Array.isArray(inst.aliases) ? inst.aliases : []),
      ...(Array.isArray(inst.former_names) ? inst.former_names : []),
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    return hay.some((s) => s.includes(t));
  };

  // Group institutions into GOV.UK-style categories.
  // Child institutions (with parents) remain first-class for search & discovery.
  const categoryGroups = useMemo((): CategoryGroup[] => {
    if (allInstitutions.length === 0) return [];

    const term = searchTerm.trim();
    const searching = term.length > 0;

    // Pool: every published institution is discoverable in its own right
    const pool = searching
      ? allInstitutions.filter((i) => matchesSearch(i, term))
      : allInstitutions;

    const byId = new Map(allInstitutions.map((i) => [i.id, i]));
    const childrenOf = (parentId: string) =>
      allInstitutions.filter((c) => c.parent_institution_id === parentId);

    const categories: {
      title: string;
      slug: string;
      filter: (inst: Institution) => boolean;
    }[] = [
      {
        title: "Ministries",
        slug: "ministries",
        filter: (inst) => inst.institution_type === "Ministry",
      },
      {
        title: "State Departments",
        slug: "state-departments",
        filter: (inst) => inst.institution_type === "State Department",
      },
      {
        title: "Independent Commissions",
        slug: "independent-commissions",
        filter: (inst) =>
          inst.arm_of_government === "Independent" ||
          inst.institution_type === "Commission" ||
          inst.institution_category === "Constitutional Commission" ||
          inst.institution_category === "Independent Office",
      },
      {
        title: "State Corporations and Parastatals",
        slug: "state-corporations",
        filter: (inst) =>
          inst.institution_category === "State Corporation" ||
          inst.institution_type === "State Corporation",
      },
      {
        title: "Judicial Bodies",
        slug: "judicial-bodies",
        filter: (inst) => inst.arm_of_government === "Judiciary",
      },
      {
        title: "Parliamentary Bodies",
        slug: "parliamentary-bodies",
        filter: (inst) =>
          inst.arm_of_government === "Parliament" ||
          inst.arm_of_government === "Legislature",
      },
      {
        title: "County Governments",
        slug: "county-governments",
        filter: (inst) => inst.government_level === "County",
      },
      {
        title: "Other Public Bodies",
        slug: "other-bodies",
        filter: (inst) =>
          !inst.institution_type ||
          (![
            "Ministry",
            "State Department",
            "Commission",
            "State Corporation",
          ].includes(inst.institution_type) &&
            inst.arm_of_government !== "Independent" &&
            inst.arm_of_government !== "Judiciary" &&
            inst.arm_of_government !== "Parliament" &&
            inst.arm_of_government !== "Legislature" &&
            inst.government_level !== "County" &&
            inst.institution_category !== "State Corporation" &&
            inst.institution_category !== "Constitutional Commission" &&
            inst.institution_category !== "Independent Office"),
      },
    ];

    const assigned = new Set<string>();
    const groups: CategoryGroup[] = [];

    categories.forEach((cat) => {
      let institutions: InstitutionWithChildren[] = [];

      if (cat.slug === "ministries" && !searching) {
        // Browse: ministries as parents with nested children
        institutions = pool
          .filter(cat.filter)
          .filter((i) => !i.parent_institution_id || i.institution_type === "Ministry")
          .map((ministry) => {
            const children = childrenOf(ministry.id).sort((a, b) =>
              a.name.localeCompare(b.name),
            );
            return {
              ...ministry,
              children: children.length ? children : undefined,
            };
          });
      } else if (cat.slug === "ministries" && searching) {
        // Search: ministries that match OR have a matching child, plus show matching children nested
        const ministryHits = new Map<string, InstitutionWithChildren>();
        for (const inst of pool.filter(cat.filter)) {
          ministryHits.set(inst.id, { ...inst, children: undefined });
        }
        // Parents of matching non-ministry children that are ministries
        for (const inst of pool) {
          if (!inst.parent_institution_id) continue;
          const parent = byId.get(inst.parent_institution_id);
          if (parent && parent.institution_type === "Ministry") {
            const existing = ministryHits.get(parent.id) || {
              ...parent,
              children: [],
            };
            const kids = existing.children || [];
            if (!kids.some((k) => k.id === inst.id) && matchesSearch(inst, term)) {
              kids.push(inst);
            }
            existing.children = kids.length ? kids : undefined;
            ministryHits.set(parent.id, existing);
          }
        }
        institutions = Array.from(ministryHits.values());
      } else {
        // All other categories: every matching institution is listed in its own right
        // (including those that have a parent)
        institutions = pool.filter(cat.filter).map((inst) => ({ ...inst }));
      }

      institutions = institutions
        .filter((i) => {
          if (assigned.has(i.id) && cat.slug !== "ministries") return false;
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const i of institutions) {
        assigned.add(i.id);
        if (i.children) for (const c of i.children) assigned.add(c.id);
      }

      if (institutions.length > 0) {
        // Count leaf-visible rows: parents + (for search) top-level children already in list
        const count =
          cat.slug === "ministries" && !searching
            ? institutions.reduce(
                (n, m) => n + 1 + (m.children?.length || 0),
                0,
              )
            : institutions.length +
              institutions.reduce((n, m) => n + (m.children?.length || 0), 0);

        groups.push({
          title: cat.title,
          slug: cat.slug,
          count: searching
            ? institutions.reduce(
                (n, m) =>
                  n +
                  (matchesSearch(m, term) ? 1 : 0) +
                  (m.children?.filter((c) => matchesSearch(c, term)).length ||
                    0),
                0,
              ) || institutions.length
            : count,
          institutions,
        });
      }
    });

    // Any published institution that matched search but was not assigned (edge types)
    if (searching) {
      const leftovers = pool.filter((i) => !assigned.has(i.id));
      if (leftovers.length) {
        groups.push({
          title: "Other matches",
          slug: "search-other",
          count: leftovers.length,
          institutions: leftovers
            .map((i) => ({ ...i }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        });
      }
    }

    return groups;
  }, [allInstitutions, searchTerm]);

  // Auto-expand categories while searching
  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(categoryGroups.map((g) => g.slug)));
      // Expand nested children under ministries when search hits them
      const expandIds = new Set<string>();
      for (const g of categoryGroups) {
        for (const inst of g.institutions) {
          if (inst.children?.length) expandIds.add(inst.id);
        }
      }
      setExpandedInstitutions(expandIds);
    }
  }, [searchTerm, categoryGroups]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const toggleInstitution = (id: string) => {
    setExpandedInstitutions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categoryGroups.map(g => g.slug)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedInstitutions(new Set());
  };

  const totalInstitutions = categoryGroups.reduce((sum, group) => sum + group.count, 0);

  if (loading) {
    return (
  <>
      
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "Institutions", href: "/government/institutions" },
          ]}
        />
        
          <p className="govuk-body">Loading institutions...</p>
        
      
    
  </>
);
  }

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
        ]}
      />

      
        {/* GOV.UK Style Layout: Title on left, content on right */}
        <div className="govuk-grid-row">
          {/* Left Sidebar - Large Title */}
          <div className="govuk-grid-column-one-third">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">
              Departments, agencies and public bodies
            </h1>
            
            <p className="govuk-body govuk-!-margin-bottom-4">
              Get a list of government institutions with links to their services and information.
            </p>

            <p className="govuk-body govuk-!-font-weight-bold">
              {searchTerm.trim()
                ? `${totalInstitutions} matching (of ${allInstitutions.length} published)`
                : `${allInstitutions.length} published institutions`}
            </p>
          </div>

          {/* Right Content Area */}
          <div className="govuk-grid-column-two-thirds">
            {/* Search Bar */}
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label govuk-label--s" htmlFor="search-institutions">
                Search
              </label>
              <input
                className="govuk-input"
                id="search-institutions"
                name="search-institutions"
                type="search"
                placeholder="e.g. Ministry of Health, IEBC, KRA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View Toggle and Expand/Collapse Controls */}
            <div className="institutions-controls govuk-!-margin-bottom-6">
              <div className="institutions-controls__left">
                <button
                  type="button"
                  className={`institutions-controls__button ${viewMode === 'accordion' ? 'institutions-controls__button--active' : ''}`}
                  onClick={() => setViewMode('accordion')}
                  aria-pressed={viewMode === 'accordion'}
                >
                  List view
                </button>
                <button
                  type="button"
                  className={`institutions-controls__button ${viewMode === 'table' ? 'institutions-controls__button--active' : ''}`}
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                >
                  Table view
                </button>
              </div>

              {viewMode === 'accordion' && (
                <div className="institutions-controls__right">
                  <button
                    type="button"
                    className="govuk-link institutions-controls__link"
                    onClick={expandAll}
                  >
                    Expand all
                  </button>
                  <span className="institutions-controls__separator">|</span>
                  <button
                    type="button"
                    className="govuk-link institutions-controls__link"
                    onClick={collapseAll}
                  >
                    Collapse all
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {categoryGroups.length === 0 ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">No institutions found matching your search criteria.</p>
              </div>
            ) : viewMode === 'accordion' ? (
              /* ACCORDION VIEW */
              <div className="govuk-accordion" data-module="govuk-accordion">
                {categoryGroups.map((group) => {
                  const isExpanded = expandedCategories.has(group.slug);
                  
                  return (
                    <div key={group.slug} className={`govuk-accordion__section ${isExpanded ? 'govuk-accordion__section--expanded' : ''}`}>
                      <div className="govuk-accordion__section-header">
                        <h2 className="govuk-accordion__section-heading">
                          <span className="govuk-accordion__section-heading-text">
                            {group.title}
                            <span className="govuk-accordion__section-heading-count">
                              ({group.count})
                            </span>
                          </span>
                        </h2>
                        <button
                          type="button"
                          className="govuk-accordion__section-toggle"
                          aria-expanded={isExpanded}
                          onClick={() => toggleCategory(group.slug)}
                        >
                          <span className="govuk-accordion__section-toggle-text">
                            {isExpanded ? 'Hide' : 'Show'}
                          </span>
                          <span className="govuk-accordion-nav__chevron" aria-hidden="true"></span>
                        </button>
                      </div>
                      
                      <div className="govuk-accordion__section-content" aria-hidden={!isExpanded}>
                        <ul className="govuk-list govuk-list--spaced">
                          {group.institutions.map((inst) => {
                            const hasChildren = inst.children && inst.children.length > 0;
                            const isInstExpanded = expandedInstitutions.has(inst.id);
                            
                            return (
                              <li key={inst.id} className="institution-list-item">
                                <div className="institution-list-item__header">
                                  {hasChildren && (
                                    <button
                                      type="button"
                                      className="institution-list-item__expand"
                                      onClick={() => toggleInstitution(inst.id)}
                                      aria-expanded={isInstExpanded}
                                      aria-label={`${isInstExpanded ? 'Hide' : 'Show'} ${inst.children!.length} state departments under ${inst.name}`}
                                    >
                                      <span className="institution-list-item__expand-icon" aria-hidden="true">
                                        {isInstExpanded ? '−' : '+'}
                                      </span>
                                    </button>
                                  )}
                                  
                                  <div className="institution-list-item__content">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                                      <Link 
                                        href={`/government/institutions/${inst.slug}`} 
                                        className="govuk-link govuk-link--no-visited-state"
                                      >
                                        {inst.name}
                                      </Link>
                                      {inst.short_name && (
                                        <span className="institution-list-item__short-name">
                                          ({inst.short_name})
                                        </span>
                                      )}
                                    </h3>
                                    
                                    {inst.description && (
                                      <p className="govuk-body-s govuk-!-margin-bottom-2">
                                        {inst.description.length > 150 
                                          ? `${inst.description.substring(0, 150)}...` 
                                          : inst.description}
                                      </p>
                                    )}
                                    
                                    {hasChildren && !isInstExpanded && (
                                      <p className="govuk-body-s govuk-!-margin-top-1">
                                        <strong>{inst.children!.length}</strong> state department{inst.children!.length !== 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {hasChildren && isInstExpanded && (
                                  <ul className="govuk-list govuk-list--bullet institution-list-item__children">
                                    {inst.children!.map((child) => (
                                      <li key={child.id} className="govuk-!-margin-bottom-1">
                                        <Link 
                                          href={`/government/institutions/${child.slug}`} 
                                          className="govuk-link govuk-link--no-visited-state govuk-!-font-size-16"
                                        >
                                          {child.name}
                                        </Link>
                                        {child.short_name && (
                                          <span className="govuk-body-s govuk-!-margin-left-1">
                                            ({child.short_name})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="govuk-table-responsive">
                <table className="govuk-table">
                  <caption className="govuk-table__caption govuk-visually-hidden">
                    List of all government institutions
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Institution name</th>
                      <th scope="col" className="govuk-table__header">Type</th>
                      <th scope="col" className="govuk-table__header">Category</th>
                    </tr>
                  </thead>
                  {/* FIXED: Removed the outer <tbody>. Each group is now its own valid <tbody> */}
                  {categoryGroups.map((group) => (
                    <tbody key={group.slug} className="govuk-table__body">
                      <tr className="govuk-table__row govuk-table__row--section-header">
                        <td colSpan={3} className="govuk-table__cell">
                          <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
                            {group.title} ({group.count})
                          </h3>
                        </td>
                      </tr>
                      {group.institutions.flatMap((inst) => {
                        const rows = [
                          <tr key={inst.id} className="govuk-table__row">
                            <td className="govuk-table__cell">
                              <Link
                                href={`/government/institutions/${inst.slug}`}
                                className="govuk-link govuk-link--no-visited-state"
                              >
                                {inst.name}
                              </Link>
                              {inst.short_name && (
                                <span className="institution-table__short-name">
                                  ({inst.short_name})
                                </span>
                              )}
                            </td>
                            <td className="govuk-table__cell">
                              {inst.institution_type || "—"}
                            </td>
                            <td className="govuk-table__cell">
                              {inst.arm_of_government ||
                                inst.institution_category ||
                                "—"}
                            </td>
                          </tr>,
                        ];
                        // Child bodies are full institutions — list them too
                        for (const child of inst.children || []) {
                          rows.push(
                            <tr key={child.id} className="govuk-table__row">
                              <td className="govuk-table__cell">
                                <span className="govuk-!-margin-left-4">↳ </span>
                                <Link
                                  href={`/government/institutions/${child.slug}`}
                                  className="govuk-link govuk-link--no-visited-state"
                                >
                                  {child.name}
                                </Link>
                                {child.short_name && (
                                  <span className="institution-table__short-name">
                                    ({child.short_name})
                                  </span>
                                )}
                              </td>
                              <td className="govuk-table__cell">
                                {child.institution_type || "—"}
                              </td>
                              <td className="govuk-table__cell">
                                {child.arm_of_government ||
                                  child.institution_category ||
                                  "—"}
                              </td>
                            </tr>,
                          );
                        }
                        return rows;
                      })}
                    </tbody>
                  ))}
                </table>
              </div>
            )}
          </div>
        </div>
      

      {/* CSS Styles */}
      <style jsx>{`
        /* Controls Bar */
        .institutions-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #b1b4b6;
        }

        .institutions-controls__left {
          display: flex;
          gap: 0;
        }

        .institutions-controls__button {
          background: #f3f2f1;
          border: 1px solid #b1b4b6;
          padding: 8px 15px;
          cursor: pointer;
          font-family: inherit;
          font-size: 16px;
          color: #1d70b8;
          transition: background-color 0.2s ease;
        }

        .institutions-controls__button:first-child {
          border-right: none;
        }

        .institutions-controls__button:hover {
          background: #e0dede;
        }

        .institutions-controls__button--active {
          background: #1d70b8;
          color: #ffffff;
          border-color: #1d70b8;
        }

        .institutions-controls__button--active:hover {
          background: #003078;
        }

        .institutions-controls__right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .institutions-controls__link {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          font-size: 16px;
        }

        .institutions-controls__separator {
          color: #b1b4b6;
        }

        /* Accordion Styles */
        .govuk-accordion {
          border-bottom: 1px solid #b1b4b6;
        }

        .govuk-accordion__section {
          border-top: 1px solid #b1b4b6;
        }

        .govuk-accordion__section-header {
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .govuk-accordion__section-heading {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          line-height: 1.3;
          flex-grow: 1;
        }

        .govuk-accordion__section-heading-text {
          display: inline;
        }

        .govuk-accordion__section-heading-count {
          font-weight: 400;
          color: #505a5f;
          margin-left: 5px;
        }

        .govuk-accordion__section-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 10px;
          color: #1d70b8;
          font-family: inherit;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .govuk-accordion__section-toggle:hover {
          color: #003078;
        }

        .govuk-accordion__section-toggle:focus {
          outline: 3px solid #fd0;
          outline-offset: 0;
          background-color: #fd0;
          color: #0b0c0c;
        }

        .govuk-accordion-nav__chevron {
          display: inline-block;
          width: 12px;
          height: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231d70b8' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          transition: transform 0.2s ease;
        }

        .govuk-accordion__section--expanded .govuk-accordion-nav__chevron {
          transform: rotate(180deg);
        }

        .govuk-accordion__section-content {
          padding: 15px 0 30px 0;
          display: none;
        }

        .govuk-accordion__section--expanded .govuk-accordion__section-content {
          display: block;
        }

        /* Institution List Items */
        .institution-list-item {
          padding: 15px 0;
          border-bottom: 1px solid #f3f2f1;
        }

        .institution-list-item:last-child {
          border-bottom: none;
        }

        .institution-list-item__header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .institution-list-item__expand {
          background: none;
          border: 1px solid #b1b4b6;
          width: 28px;
          height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          color: #1d70b8;
          font-size: 18px;
          font-weight: bold;
          transition: background-color 0.2s ease;
        }

        .institution-list-item__expand:hover {
          background: #f3f2f1;
        }

        .institution-list-item__expand:focus {
          outline: 3px solid #fd0;
          outline-offset: 0;
          background-color: #fd0;
          color: #0b0c0c;
        }

        .institution-list-item__content {
          flex-grow: 1;
        }

        .institution-list-item__short-name {
          margin-left: 8px;
          color: #505a5f;
        }

        .institution-list-item__children {
          margin-top: 10px;
          margin-left: 38px;
          padding-left: 15px;
          border-left: 3px solid #1d70b8;
        }

        /* ========================================== */
        /* TABLE VIEW STYLES (FIXED & LEFT-ALIGNED)   */
        /* ========================================== */
        .govuk-table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .govuk-table {
          width: 100%;
          border-collapse: collapse;
        }

        /* STRICT LEFT ALIGNMENT FOR ALL CELLS */
        .govuk-table__header,
        .govuk-table__cell {
          padding: 12px 20px 12px 0;
          border-bottom: 1px solid #b1b4b6;
          text-align: left; 
          vertical-align: top;
        }

        .govuk-table__header {
          font-weight: 700;
          border-bottom: 2px solid #0b0c0c;
        }

        .govuk-table__row--section-header {
          background: #f3f2f1;
        }

        .govuk-table__row--section-header td {
          padding: 12px 15px;
          border-top: 2px solid #0b0c0c;
          border-bottom: 2px solid #0b0c0c;
        }

        /* Clean formatting for short names in the table */
        .institution-table__short-name {
          display: block;
          color: #505a5f;
          font-size: 14px;
          margin-top: 2px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .institutions-controls {
            flex-direction: column;
            align-items: flex-start;
          }

          .institutions-controls__left {
            width: 100%;
          }

          .institutions-controls__button {
            flex: 1;
            text-align: center;
          }

          .govuk-accordion__section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .govuk-accordion__section-toggle {
            margin-top: 10px;
          }

          .institution-list-item__header {
            flex-direction: column;
          }

          .institution-list-item__expand {
            align-self: flex-start;
          }

          .institution-list-item__children {
            margin-left: 0;
          }
        }
      `}</style>
    
  
  </>
);
}