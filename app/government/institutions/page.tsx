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
  showCount?: boolean;
  useParentAsTitle?: boolean;
};

const TOP_LEVEL_IDS = {
  EXECUTIVE: 'f1edab01-3192-490a-b702-dd37da993b80',
  PARLIAMENT: '93eb99f0-a50e-41a1-af7a-6d8d0fa4294e',
  JUDICIARY: '021131ba-a0c0-404a-8e40-21cbf3a0cf73',
  ELECTORATE: '9c92d157-35d0-4463-bb43-6e663a9364c0',
};

const ALL_CATEGORY_SLUGS = [
  'executive', 'legislature', 'judiciary', 'independent', 
  'county-governments', 'intergovernmental', 'other-bodies'
];

const isRoot = (inst: Institution): boolean => 
  !inst.parent_institution_id && !inst.supervising_ministry_id;

function buildFullHierarchy(
  all: Institution[],
  rootFilter: (inst: Institution) => boolean,
  searchTerm: string
): InstitutionNode[] {
  const term = searchTerm.toLowerCase().trim();
  
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
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignedGlobal = new Set<string>();
  
  return candidates.map((inst) => {
    assignedGlobal.add(inst.id);
    return {
      ...inst,
      children: getDescendants(inst.id, assignedGlobal),
    };
  });
}

function countActiveNodes(nodes: InstitutionNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (!node.status || node.status.toLowerCase() === 'active') count += 1;
    if (node.children) count += countActiveNodes(node.children);
  }
  return count;
}

// Recursive nested list using native GOV.UK <details> for progressive disclosure
const NestedInstitutionList = ({ nodes, isSearchActive }: { nodes: InstitutionNode[]; isSearchActive: boolean }) => {
  return (
    <ul className="govuk-list govuk-!-margin-bottom-0">
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        return (
          <li key={node.id} className="govuk-!-margin-bottom-3">
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
            
            {hasChildren && (
              <details className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-2" open={isSearchActive}>
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    {node.children!.length} subordinate {node.children!.length === 1 ? 'entity' : 'entities'}
                  </span>
                </summary>
                <div className="govuk-details__text">
                  <NestedInstitutionList nodes={node.children!} isSearchActive={isSearchActive} />
                </div>
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default function GovernmentInstitutionsPage() {
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Default: all categories expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(ALL_CATEGORY_SLUGS));
  // Default: nested details collapsed
  const [expandAllNested, setExpandAllNested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'accordion' | 'table'>('accordion');

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

        if (error || !data || data.length < pageSize) {
          if (data) all.push(...data);
          break;
        }
        all.push(...data);
        from += data.length;
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
        slug: "executive",
        showCount: false,
        description: "Ministries, State Departments, and their subordinate agencies, authorities, and public bodies.",
        filter: (inst: Institution): boolean => {
          if (inst.id === TOP_LEVEL_IDS.EXECUTIVE) return true;
          if (inst.institution_type === 'Cabinet Ministry' || inst.institution_type === 'State Department') return true;
          return inst.arm_of_government === "Executive" && inst.government_level === "National" && isRoot(inst);
        },
      },
      {
        title: "The Legislature (Parliament)",
        slug: "legislature",
        showCount: false,
        description: "The National Assembly, the Senate, the Parliamentary Service Commission, and related legislative bodies.",
        filter: (inst: Institution): boolean => {
          if (inst.id === TOP_LEVEL_IDS.PARLIAMENT) return true;
          const slug = inst.slug || '';
          return (inst.arm_of_government === "Legislature" || slug.includes("parliament")) && isRoot(inst);
        },
      },
      {
        title: "The Judiciary",
        slug: "judiciary",
        showCount: false,
        description: "The independent arm of government responsible for interpreting the Constitution, administering justice, and resolving disputes through courts and specialized tribunals.",
        filter: (inst: Institution): boolean => {
          if (inst.id === TOP_LEVEL_IDS.JUDICIARY) return true;
          return inst.arm_of_government === "Judiciary" && isRoot(inst);
        },
      },
      {
        title: "Independent Constitutional Commissions and Offices",
        slug: "independent",
        showCount: true,
        description: "Chapter 15 constitutional commissions and independent offices that act as the fourth arm of government.",
        filter: (inst: Institution): boolean => inst.arm_of_government === "Independent" && isRoot(inst),
      },
      {
        title: "County Governments (Devolved Units)",
        slug: "county-governments",
        showCount: true,
        description: "The 47 County Governments, County Assemblies, and their subordinate departments, agencies, and public bodies.",
        filter: (inst: Institution): boolean => {
          if (inst.government_level === "County" && inst.institution_type === "County Government") return true;
          return inst.government_level === "County" && isRoot(inst);
        },
      },
      {
        title: "Intergovernmental Bodies",
        slug: "intergovernmental",
        showCount: true,
        description: "Bodies that facilitate consultation, coordination, and technical support between the National and County governments.",
        filter: (inst: Institution): boolean => {
          const name = (inst.name || '').toLowerCase();
          const type = (inst.institution_type || '').toLowerCase();
          const isIntergov = name.includes('council of governors') || 
                             name.includes('intergovernmental') ||
                             type.includes('intergovernmental');
          return isIntergov && isRoot(inst);
        },
      },
      {
        title: "Other Public Bodies",
        slug: "other-bodies",
        showCount: true,
        description: "Government-associated bodies, task forces, or organizations pending formal categorization.",
        filter: (inst: Institution): boolean => {
          if (!isRoot(inst)) return false;
          if (inst.id === TOP_LEVEL_IDS.EXECUTIVE) return false;
          if (inst.id === TOP_LEVEL_IDS.PARLIAMENT) return false;
          if (inst.id === TOP_LEVEL_IDS.JUDICIARY) return false;
          if (inst.id === TOP_LEVEL_IDS.ELECTORATE) return false;
          if (inst.arm_of_government === "Independent") return false;
          if (inst.government_level === "County") return false;
          if (inst.institution_type === "Cabinet Ministry" || inst.institution_type === "State Department") return false;
          
          const name = (inst.name || '').toLowerCase();
          if (name.includes('council of governors') || name.includes('intergovernmental')) return false;
          
          return true;
        },
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
        const activeRootCount = uniqueRoots.filter((r) => !r.status || r.status.toLowerCase() === "active").length;
        
        // Detect if this category should use the top-level parent's name as title
        const topLevelParent = uniqueRoots.length === 1 ? uniqueRoots[0] : null;
        const useParentAsTitle = topLevelParent !== null && (
          (cat.slug === 'legislature' && topLevelParent.id === TOP_LEVEL_IDS.PARLIAMENT) ||
          (cat.slug === 'judiciary' && topLevelParent.id === TOP_LEVEL_IDS.JUDICIARY)
        );
        
        // When using parent as title, render only its children (not the parent itself)
        const institutionsToRender = useParentAsTitle && topLevelParent 
          ? (topLevelParent.children || [])
          : uniqueRoots;
        
        // Count reflects what's actually rendered
        const displayCount = useParentAsTitle && topLevelParent
          ? countActiveNodes(topLevelParent.children || [])
          : activeRootCount;
        
        // Title becomes the parent's name when applicable
        const displayTitle = useParentAsTitle && topLevelParent
          ? `${topLevelParent.name}${topLevelParent.short_name ? ` (${topLevelParent.short_name})` : ''}`
          : cat.title;
        
        groups.push({
          title: displayTitle,
          slug: cat.slug,
          description: cat.description,
          count: displayCount,
          institutions: institutionsToRender,
          showCount: cat.showCount,
          useParentAsTitle: !!useParentAsTitle,
        });
      }
    });

    if (term) {
      const leftovers = allInstitutions.filter((i) => !assigned.has(i.id));
      if (leftovers.length) {
        groups.push({
          title: "Additional Search Matches",
          slug: "search-other",
          description: "Institutions matching your search that are part of larger hierarchies above.",
          count: leftovers.filter((i) => !i.status || i.status.toLowerCase() === "active").length,
          institutions: leftovers.map((i) => ({ ...i })),
          showCount: true,
        });
      }
    }

    return groups;
  }, [allInstitutions, searchTerm]);

  const displayedActiveCount = useMemo(() => {
    return categoryGroups.reduce((sum, group) => sum + countActiveNodes(group.institutions), 0);
  }, [categoryGroups]);

  // Auto-expand categories and nested details when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(ALL_CATEGORY_SLUGS));
      setExpandAllNested(true);
    }
  }, [searchTerm]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) newSet.delete(slug);
      else newSet.add(slug);
      return newSet;
    });
  };

  const allExpanded = expandedCategories.size === categoryGroups.length && expandAllNested;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
      setExpandAllNested(false);
    } else {
      setExpandedCategories(new Set(ALL_CATEGORY_SLUGS));
      setExpandAllNested(true);
    }
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Government", href: "/government" }, { text: "Institutions", href: "/government/institutions" }]} />
        <main className="govuk-main-wrapper"><p className="govuk-body">Loading institutions...</p></main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Institutions", href: "/government/institutions" },
      ]} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          {/* LEFT SIDEBAR */}
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

          {/* RIGHT CONTENT */}
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
                placeholder="e.g. Ministry of Health, IEBC, Nairobi County..."
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
                  const shouldExpandNested = searchTerm.trim().length > 0 || expandAllNested;
                  
                  return (
                    <div key={group.slug} className={`govuk-accordion__section ${isExpanded ? 'govuk-accordion__section--expanded' : ''}`}>
                      <div className="govuk-accordion__section-header" onClick={() => toggleCategory(group.slug)} role="button" tabIndex={0} aria-expanded={isExpanded}>
                        <h2 className="govuk-accordion__section-heading">
                          <span className="govuk-accordion__section-heading-text">
                            {group.title}
                            {group.showCount && (
                              <span className="govuk-accordion__section-heading-count">({group.count})</span>
                            )}
                          </span>
                        </h2>
                        <span className="govuk-accordion__section-toggle" aria-hidden="true">
                          <span className="govuk-accordion__section-toggle-text">{isExpanded ? 'Hide' : 'Show'}</span>
                          <span className="govuk-accordion-nav__chevron"></span>
                        </span>
                      </div>
                      
                      <div className="govuk-accordion__section-content" aria-hidden={!isExpanded}>
                        {group.description && <p className="govuk-body govuk-!-margin-bottom-4 govuk-text-secondary">{group.description}</p>}
                        
                        <NestedInstitutionList 
                          key={`list-${shouldExpandNested}-${searchTerm.trim()}-${group.slug}`}
                          nodes={group.institutions} 
                          isSearchActive={shouldExpandNested}
                        />
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
                  {categoryGroups.map((group) => {
                    const flatten = (node: InstitutionNode, depth = 0): (InstitutionNode & { depth: number })[] => {
                      let result: (InstitutionNode & { depth: number })[] = [{ ...node, depth }];
                      if (node.children) {
                        node.children.forEach(child => {
                          result = result.concat(flatten(child, depth + 1));
                        });
                      }
                      return result;
                    };

                    return (
                      <tbody key={group.slug} className="govuk-table__body">
                        <tr className="govuk-table__row govuk-table__row--section-header">
                          <td colSpan={4} className="govuk-table__cell">
                            <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
                              {group.title}
                              {group.showCount && (
                                <span className="govuk-body-s govuk-text-secondary govuk-!-margin-left-2">
                                  ({group.count} active institutions)
                                </span>
                              )}
                            </h3>
                          </td>
                        </tr>
                        {group.institutions.flatMap((inst, rootIndex) => {
                          return flatten(inst).map((node, idx) => (
                            <tr key={`${group.slug}-${rootIndex}-${node.id}-${idx}`} className="govuk-table__row">
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
                              </td>
                              <td className="govuk-table__cell">{node.institution_type || "—"}</td>
                              <td className="govuk-table__cell">{node.arm_of_government || "—"}</td>
                              <td className="govuk-table__cell">{node.government_level || "—"}</td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    );
                  })}
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
          margin: 0;
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
          cursor: pointer;
        }
        .govuk-accordion__section-header:hover .govuk-accordion__section-heading-text {
          text-decoration: underline;
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
        }
        .govuk-accordion__section-toggle:hover .govuk-accordion-nav__chevron {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23ffffff' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
        }
        .govuk-accordion__section-toggle:focus {
          outline: 3px solid #ffdd00;
          outline-offset: 2px;
          background: #1d70b8;
          color: #ffffff;
        }
        .govuk-accordion__section-toggle:focus .govuk-accordion-nav__chevron {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23ffffff' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
        }
        .govuk-accordion-nav__chevron {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%230b0c0c' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
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

        /* GOV.UK Details Component Styling */
        .govuk-details {
          font-family: "GDS Transport", arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-weight: 400;
          font-size: 16px;
          font-size: 1rem;
          line-height: 1.25;
          color: #0b0c0c;
          margin-bottom: 15px;
          display: block;
        }
        .govuk-details__summary {
          display: inline-block;
          margin-bottom: 5px;
        }
        .govuk-details__summary-text {
          color: #1d70b8;
          cursor: pointer;
        }
        .govuk-details__summary-text:hover {
          color: #003078;
        }
        .govuk-details__summary:focus {
          outline: 3px solid #ffdd00;
          background-color: #ffdd00;
          box-shadow: 0 -2px #ffdd00, 0 4px #0b0c0c;
          color: #0b0c0c;
          text-decoration: none;
        }
        .govuk-details__text {
          padding-top: 15px;
          padding-bottom: 15px;
          padding-left: 20px;
          border-left: 4px solid #1d70b8;
        }
        .govuk-details[open] .govuk-details__summary {
          margin-bottom: 10px;
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
        }
      `}</style>
    </div>
  );
}