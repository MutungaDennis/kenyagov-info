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
  supervising_ministry_id?: string | null;
  description?: string | null;
  aliases?: string[] | null;
  former_names?: string[] | null;
  status?: string | null;
  is_active?: boolean | null;
};

type InstitutionNode = Institution & {
  children?: InstitutionNode[];
};

type CategoryGroup = {
  title: string;
  slug: string;
  description: string;
  count: number;
  institutions: InstitutionNode[];
};

type ViewMode = 'accordion' | 'table';

const isRoot = (inst: Institution): boolean => 
  !inst.parent_institution_id && !inst.supervising_ministry_id;

function buildFullHierarchy(
  all: Institution[],
  rootFilter: (inst: Institution) => boolean,
  searchTerm: string
): InstitutionNode[] {
  const term = searchTerm.toLowerCase();
  const byId = new Map(all.map((i) => [i.id, i]));

  const matchesSearch = (inst: Institution): boolean => {
    if (!term) return true;
    const hay = [
      inst.name, inst.short_name, inst.official_name, inst.description,
      inst.institution_type, inst.institution_category, inst.status,
      ...(Array.isArray(inst.aliases) ? inst.aliases : []),
      ...(Array.isArray(inst.former_names) ? inst.former_names : []),
    ].filter(Boolean).map((s) => String(s).toLowerCase());
    
    if (hay.some((s) => s.includes(term))) return true;
    
    const children = all.filter(c => c.parent_institution_id === inst.id || c.supervising_ministry_id === inst.id);
    return children.some(matchesSearch);
  };

  const ancestryDepth = (inst: Institution): number => {
    let d = 0;
    let cur: Institution | undefined = inst;
    const seen = new Set<string>();
    while (cur?.parent_institution_id && !seen.has(cur.id)) {
      seen.add(cur.id);
      cur = byId.get(cur.parent_institution_id);
      d += 1;
      if (d > 40) break;
    }
    return d;
  };

  const getDescendants = (parentId: string, assignedInTree: Set<string>): InstitutionNode[] => {
    return all
      .filter((inst) => {
        if (assignedInTree.has(inst.id)) return false;
        
        const isDirectChild = inst.parent_institution_id === parentId;
        const isSupervisedChild = !inst.parent_institution_id && inst.supervising_ministry_id === parentId;
        
        return isDirectChild || isSupervisedChild;
      })
      .filter((inst) => !term || matchesSearch(inst))
      .map((inst) => {
        assignedInTree.add(inst.id);
        return {
          ...inst,
          children: getDescendants(inst.id, assignedInTree),
        };
      })
      .sort((a, b) => {
        const aActive = !a.status || a.status.toLowerCase() === 'active';
        const bActive = !b.status || b.status.toLowerCase() === 'active';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return a.name.localeCompare(b.name);
      });
  };

  const candidates = all
    .filter((inst) => rootFilter(inst))
    .filter((inst) => !term || matchesSearch(inst))
    .sort((a, b) => {
      const depthDiff = ancestryDepth(a) - ancestryDepth(b);
      if (depthDiff !== 0) return depthDiff;
      const aActive = !a.status || a.status.toLowerCase() === "active";
      const bActive = !b.status || b.status.toLowerCase() === "active";
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return a.name.localeCompare(b.name);
    });

  const assignedGlobal = new Set<string>();
  
  return candidates.map((inst) => {
    assignedGlobal.add(inst.id);
    return {
      ...inst,
      children: getDescendants(inst.id, assignedGlobal),
    };
  });
}

function flattenTree(nodes: InstitutionNode[], depth = 0): (InstitutionNode & { depth: number })[] {
  let result: (InstitutionNode & { depth: number })[] = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.children) {
      result = result.concat(flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

function countActiveNodes(nodes: InstitutionNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (!node.status || node.status.toLowerCase() === 'active') {
      count += 1;
    }
    if (node.children) {
      count += countActiveNodes(node.children);
    }
  }
  return count;
}

function countActiveDescendants(node: InstitutionNode): number {
  let count = 0;
  if (node.children) {
    for (const child of node.children) {
      if (!child.status || child.status.toLowerCase() === 'active') {
        count += 1;
      }
      count += countActiveDescendants(child);
    }
  }
  return count;
}

const InstitutionTree = ({ nodes }: { nodes: InstitutionNode[] }) => (
  <ul className="govuk-list govuk-!-margin-bottom-0 govuk-!-margin-top-2 app-nested-list">
    {nodes.map((node) => (
      <li key={node.id} className="govuk-!-margin-bottom-2">
        <Link href={`/government/institutions/${node.slug}`} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">
          {node.name}
        </Link>
        {node.short_name && (
          <span className="govuk-body-s govuk-!-margin-left-1 govuk-text-secondary">({node.short_name})</span>
        )}
        {node.status && node.status.toLowerCase() !== 'active' && (
          <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14 govuk-!-margin-left-1">
            {node.status}
          </span>
        )}
        {node.children && node.children.length > 0 && (
          <InstitutionTree nodes={node.children} />
        )}
      </li>
    ))}
  </ul>
);

export default function GovernmentInstitutionsPage() {
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedInstitutions, setExpandedInstitutions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('accordion');
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = await createBrowserClientAsync();
      const pageSize = 1000;
      const all: Institution[] = [];
      let from = 0;
      
      for (let i = 0; i < 20; i++) {
        const { data, error } = await supabase
          .from("institutions")
          .select(
            `id, slug, name, short_name, official_name, institution_type, institution_category,
             arm_of_government, government_level, parent_institution_id, supervising_ministry_id,
             description, aliases, former_names, status, is_active`
          )
          .eq("is_active", true)
          .order("name")
          .range(from, from + pageSize - 1);

        if (error) {
          const basic = await supabase
            .from("institutions")
            .select(
              `id, slug, name, short_name, official_name, institution_type, institution_category,
               arm_of_government, government_level, parent_institution_id, supervising_ministry_id,
               description, status, is_active`
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

  const globalActiveCount = useMemo(() => {
    return allInstitutions.filter(i => !i.status || i.status.toLowerCase() === 'active').length;
  }, [allInstitutions]);

  const categoryGroups = useMemo((): CategoryGroup[] => {
    if (allInstitutions.length === 0) return [];

    const term = searchTerm.trim();
    const assigned = new Set<string>();
    const groups: CategoryGroup[] = [];

    const categories = [
      {
        title: "The Executive (National Government)",
        slug: "executive-national",
        description: "Ministries, State Departments, and their subordinate agencies, SAGAs, and authorities.",
        filter: (inst: Institution) => 
          inst.arm_of_government === "Executive" && 
          inst.government_level === "National" && 
          isRoot(inst),
      },
      {
        title: "The Legislature (Parliament)",
        slug: "legislature",
        description: "The National Assembly, the Senate, and their administrative bodies.",
        filter: (inst: Institution) => 
          (inst.arm_of_government === "Legislature" || inst.arm_of_government === "Parliament") && 
          isRoot(inst),
      },
      {
        title: "The Judiciary",
        slug: "judiciary",
        description: "Courts and judicial administrative bodies.",
        filter: (inst: Institution) => 
          inst.arm_of_government === "Judiciary" && 
          isRoot(inst),
      },
      {
        title: "Independent Commissions & Offices",
        slug: "independent",
        description: "Chapter 15 constitutional bodies independent of executive control.",
        filter: (inst: Institution) => 
          inst.arm_of_government === "Independent" && 
          isRoot(inst),
      },
      {
        title: "County Governments",
        slug: "county-governments",
        description: "The 47 County Governments and their subordinate departments and agencies.",
        filter: (inst: Institution) => 
          inst.government_level === "County" && 
          isRoot(inst),
      },
      {
        title: "Other Public Bodies",
        slug: "other-bodies",
        description: "Other government-associated bodies and organizations not fitting the above categories.",
        filter: (inst: Institution) => isRoot(inst),
      },
    ];

    categories.forEach((cat) => {
      const roots = buildFullHierarchy(allInstitutions, cat.filter, term);
      
      const uniqueRoots = roots.filter((r) => {
        if (assigned.has(r.id)) return false;
        assigned.add(r.id);
        
        const markAssigned = (node: InstitutionNode) => {
          assigned.add(node.id);
          node.children?.forEach(markAssigned);
        };
        markAssigned(r);
        return true;
      });

      if (uniqueRoots.length > 0) {
        const activeRootCount = uniqueRoots.filter(
          (r) => !r.status || r.status.toLowerCase() === "active"
        ).length;

        groups.push({
          title: cat.title,
          slug: cat.slug,
          description: cat.description,
          count: activeRootCount,
          institutions: uniqueRoots,
        });
      }
    });

    if (term) {
      const leftovers = allInstitutions.filter((i) => !assigned.has(i.id));
      if (leftovers.length) {
        groups.push({
          title: "Other matches",
          slug: "search-other",
          description: "Additional institutions matching your search",
          count: leftovers.filter((i) => !i.status || i.status.toLowerCase() === "active").length,
          institutions: leftovers.map((i) => ({ ...i })),
        });
      }
    }

    return groups;
  }, [allInstitutions, searchTerm]);

  const displayedActiveCount = useMemo(() => {
    return categoryGroups.reduce((sum, group) => sum + countActiveNodes(group.institutions), 0);
  }, [categoryGroups]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(categoryGroups.map((g) => g.slug)));
      const expandIds = new Set<string>();
      for (const g of categoryGroups) {
        for (const inst of g.institutions) {
          if (inst.children?.length) expandIds.add(inst.id);
        }
      }
      setExpandedInstitutions(expandIds);
      setAllExpanded(true);
    }
  }, [searchTerm, categoryGroups]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) newSet.delete(slug);
      else newSet.add(slug);
      return newSet;
    });
  };

  const toggleInstitution = (id: string) => {
    setExpandedInstitutions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
      setExpandedInstitutions(new Set());
      setAllExpanded(false);
    } else {
      setExpandedCategories(new Set(categoryGroups.map(g => g.slug)));
      const expandIds = new Set<string>();
      for (const g of categoryGroups) {
        for (const inst of g.institutions) {
          if (inst.children?.length) expandIds.add(inst.id);
        }
      }
      setExpandedInstitutions(expandIds);
      setAllExpanded(true);
    }
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "Institutions", href: "/government/institutions" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading institutions...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Departments, agencies and public bodies
            </h1>
            
            <div className="govuk-inset-text govuk-!-margin-bottom-4">
              <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0">
                {searchTerm.trim()
                  ? `${displayedActiveCount} active institutions matching`
                  : `${globalActiveCount} active institutions published`}
              </p>
              {searchTerm.trim() && (
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  of {globalActiveCount} total
                </p>
              )}
            </div>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label govuk-label--s" htmlFor="search-institutions">
                Search institutions
              </label>
              <div className="govuk-hint" id="search-hint">
                Search by name, type, or description
              </div>
              <input
                className="govuk-input govuk-!-width-full"
                id="search-institutions"
                name="search-institutions"
                type="search"
                aria-describedby="search-hint"
                placeholder="e.g. Ministry of Health, IEBC, Kenya Ports Authority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
                    className="govuk-button institutions-controls__toggle-all" 
                    onClick={toggleAll}
                  >
                    {allExpanded ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
              )}
            </div>

            {categoryGroups.length === 0 ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">No institutions found matching your search criteria.</p>
              </div>
            ) : viewMode === 'accordion' ? (
              <div className="govuk-accordion" data-module="govuk-accordion" id="institutions-accordion">
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
                        {group.description && (
                          <p className="govuk-body govuk-!-margin-bottom-4 govuk-text-secondary">
                            {group.description}
                          </p>
                        )}
                        
                        <ul className="govuk-list govuk-list--spaced">
                          {group.institutions.map((inst) => {
                            const hasChildren = inst.children && inst.children.length > 0;
                            const isInstExpanded = expandedInstitutions.has(inst.id);
                            const descendantCount = hasChildren ? countActiveDescendants(inst) : 0;
                            
                            return (
                              <li key={inst.id} className="institution-list-item">
                                <div className="institution-list-item__header">
                                  {hasChildren && (
                                    <button
                                      type="button"
                                      className="institution-list-item__expand"
                                      onClick={() => toggleInstitution(inst.id)}
                                      aria-expanded={isInstExpanded}
                                      aria-label={`${isInstExpanded ? 'Hide' : 'Show'} entities under ${inst.name}`}
                                    >
                                      <span className="institution-list-item__expand-icon" aria-hidden="true">
                                        {isInstExpanded ? '−' : '+'}
                                      </span>
                                    </button>
                                  )}
                                  
                                  <div className="institution-list-item__content">
                                    <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                                      <Link href={`/government/institutions/${inst.slug}`} className="govuk-link govuk-link--no-visited-state">
                                        {inst.name}
                                      </Link>
                                      {inst.short_name && (
                                        <span className="govuk-body-s govuk-!-margin-left-1 govuk-text-secondary">({inst.short_name})</span>
                                      )}
                                      {inst.status && inst.status.toLowerCase() !== 'active' && (
                                        <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14 govuk-!-margin-left-1">
                                          {inst.status}
                                        </span>
                                      )}
                                    </h3>
                                    
                                    {hasChildren && !isInstExpanded && (
                                      <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                                        {descendantCount > 0 
                                          ? `${descendantCount} ${descendantCount !== 1 ? 'subordinate entities' : 'subordinate entity'}` 
                                          : 'Contains former/dissolved bodies'}
                                      </p>
                                    )}
                                    
                                    {inst.description && !hasChildren && (
                                      <p className="govuk-body-s govuk-!-margin-bottom-2 govuk-text-secondary">
                                        {inst.description.length > 150 ? `${inst.description.substring(0, 150)}...` : inst.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {hasChildren && isInstExpanded && (
                                  <div className="govuk-!-margin-top-2 govuk-!-margin-left-4">
                                    <InstitutionTree nodes={inst.children!} />
                                  </div>
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
              <div className="govuk-table-responsive">
                <table className="govuk-table">
                  <caption className="govuk-table__caption govuk-visually-hidden">
                    List of all government institutions
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Institution name</th>
                      <th scope="col" className="govuk-table__header">Type</th>
                      <th scope="col" className="govuk-table__header">Arm of government</th>
                      <th scope="col" className="govuk-table__header">Level</th>
                    </tr>
                  </thead>
                  {categoryGroups.map((group) => (
                    <tbody key={group.slug} className="govuk-table__body">
                      <tr className="govuk-table__row govuk-table__row--section-header">
                        <td colSpan={4} className="govuk-table__cell">
                          <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
                            {group.title}
                          </h3>
                          <p className="govuk-body-s govuk-text-secondary govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                            {group.count} active institutions
                          </p>
                        </td>
                      </tr>
                      {group.institutions.flatMap((inst, rootIndex) => {
                        const flat = flattenTree([inst]);
                        return flat.map((node, rowIndex) => (
                          <tr
                            key={`${group.slug}-${rootIndex}-${node.id}-${node.depth}-${rowIndex}`}
                            className="govuk-table__row"
                          >
                            <td className="govuk-table__cell">
                              {node.depth > 0 && (
                                <span className="govuk-!-margin-right-1 govuk-text-secondary">
                                  {"↳ ".repeat(node.depth)}
                                </span>
                              )}
                              <Link href={`/government/institutions/${node.slug}`} className="govuk-link govuk-link--no-visited-state">
                                {node.name}
                              </Link>
                              {node.short_name && (
                                <span className="govuk-body-s govuk-!-margin-left-1 govuk-text-secondary">({node.short_name})</span>
                              )}
                              {node.status && node.status.toLowerCase() !== 'active' && (
                                <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14 govuk-!-margin-left-1">
                                  {node.status}
                                </span>
                              )}
                            </td>
                            <td className="govuk-table__cell">
                              {node.institution_type || "—"}
                            </td>
                            <td className="govuk-table__cell">
                              {node.arm_of_government || "—"}
                            </td>
                            <td className="govuk-table__cell">
                              {node.government_level || "—"}
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  ))}
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
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

        .institutions-controls__toggle-all {
          background-color: #ffdd00;
          color: #0b0c0c;
          border: 2px solid #0b0c0c;
          font-weight: 600;
          padding: 10px 20px;
          box-shadow: 0 2px 0 #0b0c0c;
        }

        .institutions-controls__toggle-all:hover {
          background-color: #ffcc00;
          box-shadow: 0 3px 0 #0b0c0c;
          transform: translateY(-1px);
        }

        .institutions-controls__toggle-all:active {
          background-color: #ffb800;
          box-shadow: 0 1px 0 #0b0c0c;
          transform: translateY(1px);
        }

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
          background: transparent;
          border: 2px solid #1d70b8;
          border-radius: 4px;
          cursor: pointer;
          padding: 8px 16px;
          color: #1d70b8;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .govuk-accordion__section-toggle:hover {
          background: #1d70b8;
          color: #ffffff;
          border-color: #003078;
        }

        .govuk-accordion__section-toggle:focus {
          outline: 3px solid #fd0;
          outline-offset: 2px;
          background: #1d70b8;
          color: #ffffff;
        }

        .govuk-accordion-nav__chevron {
          display: inline-block;
          width: 16px;
          height: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='currentColor' d='M8 10L3 5h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          transition: transform 0.3s ease;
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

        .institution-list-item__expand-icon {
          line-height: 1;
        }

        .app-nested-list {
          border-left: 4px solid #1d70b8;
          padding-left: 15px;
          margin-left: 10px;
          margin-top: 10px !important;
        }

        .app-nested-list .app-nested-list {
          border-left: 4px solid #b1b4b6;
          margin-left: 5px;
        }

        .govuk-table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: 20px;
        }

        .govuk-table {
          min-width: 100%;
          border-collapse: collapse;
        }

        .govuk-table__header,
        .govuk-table__cell {
          padding: 12px 20px 12px 0;
          border-bottom: 1px solid #b1b4b6;
          text-align: left; 
          vertical-align: top;
          white-space: nowrap;
        }

        .govuk-table__header:last-child,
        .govuk-table__cell:last-child {
          padding-right: 20px;
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
          white-space: normal;
        }

        @media (max-width: 640px) {
          .institutions-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .institutions-controls__left {
            width: 100%;
            margin-bottom: 15px;
          }

          .institutions-controls__button {
            flex: 1;
            text-align: center;
          }

          .institutions-controls__right {
            width: 100%;
            justify-content: flex-start;
          }

          .institutions-controls__toggle-all {
            width: 100%;
          }

          .govuk-accordion__section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .govuk-accordion__section-toggle {
            margin-top: 10px;
            width: 100%;
            justify-content: flex-start;
          }

          .institution-list-item__header {
            flex-direction: column;
          }

          .institution-list-item__expand {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}