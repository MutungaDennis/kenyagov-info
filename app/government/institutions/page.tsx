'use client';

import Link from "next/link";
import { isInstitutionHistorical } from "@/lib/institutions/fields";
import { enrichInstitutionHistory, type HistoricalLink } from "@/lib/institutions/directory-history";
import { useState, useMemo, useEffect } from "react";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PublicSchools from "@/components/schools/PublicSchools";
import { matchesSearch as matchesText } from "@/lib/search/match";

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
  predecessor_institution_id?: string | null;
  successor_institution_id?: string | null;
  name_history?: { name: string; end_date: string | null }[] | null;
  previousInstitutions?: HistoricalLink[];
  historySearchNames?: string[];
  is_active?: boolean | null;
  record_kind?: string | null;
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
  useParentAsTitle?: boolean;
};

const TOP_LEVEL_IDS = {
  EXECUTIVE: 'f1edab01-3192-490a-b702-dd37da993b80',
  PARLIAMENT: '93eb99f0-a50e-41a1-af7a-6d8d0fa4294e',
  JUDICIARY: '021131ba-a0c0-404a-8e40-21cbf3a0cf73',
  ELECTORATE: '9c92d157-35d0-4463-bb43-6e663a9364c0',
};

const isRoot = (inst: Institution): boolean => 
  !inst.parent_institution_id && !inst.supervising_ministry_id;

function buildFullHierarchy(
  all: Institution[],
  rootFilter: (inst: Institution) => boolean,
  searchTerm: string,
  visibleIds: Set<string>
): InstitutionNode[] {
  const term = searchTerm.toLowerCase().trim();
  
  const matchesSearch = (inst: Institution) => !term || visibleIds.has(inst.id);
  const childrenByParent = new Map<string, Institution[]>();
  for (const inst of all) {
    const parent = inst.parent_institution_id || inst.supervising_ministry_id;
    if (parent) childrenByParent.set(parent, [...(childrenByParent.get(parent) || []), inst]);
  }

  const getDescendants = (parentId: string, assignedInTree: Set<string>): InstitutionNode[] => {
    return (childrenByParent.get(parentId) || [])
      .filter(inst => !assignedInTree.has(inst.id))
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

function countNodes(nodes: InstitutionNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1;
    if (node.children) count += countNodes(node.children);
  }
  return count;
}

function InstitutionHistory({ institution }: { institution: Institution }) {
  return <>
    {isInstitutionHistorical(institution.status) && <p className="govuk-body-s institution-history"><strong className="govuk-tag govuk-tag--grey">Historical</strong> {institution.status}</p>}
    {!!institution.former_names?.length && <p className="govuk-body-s institution-history">Former names: {institution.former_names.join("; ")}</p>}
    {!!institution.previousInstitutions?.length && <p className="govuk-body-s institution-history">Earlier organisations: {institution.previousInstitutions.map((previous, index) => <span key={previous.id}>{index > 0 && "; "}<Link className="govuk-link" href={`/government/institutions/${previous.slug}`}>{previous.name}</Link></span>)}</p>}
  </>;
}

// Recursive nested list using native GOV.UK <details> for progressive disclosure
const NestedInstitutionList = ({ nodes, isSearchActive, onBrowse }: { nodes: InstitutionNode[]; isSearchActive: boolean; onBrowse: (slug: string) => void }) => {
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
            {["directorate-primary-education", "directorate-secondary-education"].includes(node.slug) && (
              <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-2">
                <button type="button" className="govuk-button govuk-!-margin-top-2 govuk-!-margin-bottom-1" onClick={() => onBrowse(node.slug)} aria-controls="directorate-school-browser">Browse public schools under this directorate →</button>
              </p>
            )}
            {node.status && node.status.toLowerCase() !== 'active' && !isInstitutionHistorical(node.status) && (
              <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14 govuk-!-margin-left-1">
                {node.status}
              </span>
            )}
            
            <InstitutionHistory institution={node} />
            {hasChildren && (
              <details className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-2" open={isSearchActive}>
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    View {node.children!.length} {node.children!.length === 1 ? 'institution' : 'institutions'} under {node.short_name || node.name}
                  </span>
                </summary>
                <div className="govuk-details__text institution-children">
                  <NestedInstitutionList nodes={node.children!} isSearchActive={isSearchActive} onBrowse={onBrowse} />
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
  const [publishedInstitutions, setPublishedInstitutions] = useState<Institution[]>([]);
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const enrichedInstitutions = useMemo(() => enrichInstitutionHistory(publishedInstitutions), [publishedInstitutions]);
  const historicalCount = enrichedInstitutions.filter(inst => isInstitutionHistorical(inst.status)).length;
  const allInstitutions = useMemo(() => enrichedInstitutions.filter(inst => includeHistorical || !isInstitutionHistorical(inst.status)), [enrichedInstitutions, includeHistorical]);
  const institutionsById = useMemo(() => new Map(allInstitutions.map(institution => [institution.id, institution])), [allInstitutions]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const searchResults = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return [];
    return allInstitutions
      .filter(inst => matchesText(term, inst.name, inst.short_name, inst.official_name, inst.description, inst.institution_type, inst.aliases, inst.former_names, inst.historySearchNames))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allInstitutions, searchTerm]);

  const [includeSchools, setIncludeSchools] = useState(false);
  const [schoolCount, setSchoolCount] = useState<number | null>(null);
  const [schoolMatches, setSchoolMatches] = useState<number | null>(null);
  const [selectedDirectorate, setSelectedDirectorate] = useState("");
  const [schoolBrowserVersion, setSchoolBrowserVersion] = useState(0);
  const [loadError, setLoadError] = useState("");
  const browseSchools = (slug: string) => {
    setSelectedDirectorate(slug);
    setSchoolBrowserVersion(version => version + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("schools", "show"); url.searchParams.set("directorate", slug);
    url.hash = "directorate-school-browser";
    window.history.pushState(null, "", url);
    window.setTimeout(() => document.getElementById("directorate-school-browser")?.focus(), 0);
  };
  useEffect(() => {
    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("directorate") || "";
      const query = (params.get("q") || "").slice(0, 120);
      setSearchTerm(query);
      setIncludeHistorical(params.get("historical") === "include");
      setSelectedDirectorate(params.get("schools") === "show" && ["directorate-primary-education", "directorate-secondary-education"].includes(slug) ? slug : "");
    };
    const timer = window.setTimeout(readUrl, 0);
    window.addEventListener("popstate", readUrl);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", readUrl); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const db = await createBrowserClientAsync();
        const request = db.from("education_schools").select("id", { count: "exact", head: true }).eq("ownership", "public").eq("is_published", true).in("main_tier", ["primary", "junior", "senior_secondary"]);
        const { count, error } = await request;
        if (!cancelled && !error) setSchoolCount(count);
        if (includeSchools && searchTerm.trim()) {
          const responses = await Promise.all(["directorate-primary-education", "directorate-secondary-education"].map(directorate =>
            db.rpc("search_public_schools", { q: searchTerm, directorate, page_size: 1 })
          ));
          if (!cancelled) setSchoolMatches(responses.some(result => result.error) ? null : responses.reduce((total, result) => total + Number(result.data?.total || 0), 0));
        } else if (!cancelled) setSchoolMatches(count);
      } catch { if (!cancelled) setSchoolMatches(null); }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [includeSchools, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = await createBrowserClientAsync();
      const pageSize = 1000;
      const all: Institution[] = [];
      let from = 0;
      let legacySchema = false;
      
      for (let i = 0; i < 20; i++) {
        let data: Institution[] | null = null;
        let error: { message: string } | null = null;
        if (!legacySchema) {
          const result = await supabase
            .from("institutions")
            .select(
              `id, slug, name, short_name, official_name, institution_type, institution_category,
               arm_of_government, government_level, parent_institution_id, supervising_ministry_id,
               description, aliases, former_names, status, is_active, predecessor_institution_id, successor_institution_id,
               record_kind, name_history:institution_name_history(name,end_date)`
            )
            .eq("is_active", true)
            .eq("record_kind", "institution")
            .order("name")
            .range(from, from + pageSize - 1);
          if (
            result.error &&
            /record_kind|schema cache|column .* does not exist/i.test(
              result.error.message,
            )
          ) {
            legacySchema = true;
          } else {
            data = result.data as Institution[] | null;
            error = result.error;
          }
        }
        if (legacySchema && !data && !error) {
          const result = await supabase
            .from("institutions")
            .select(
              `id, slug, name, short_name, official_name, institution_type, institution_category,
               arm_of_government, government_level, parent_institution_id, supervising_ministry_id,
               description, aliases, former_names, status, is_active, predecessor_institution_id, successor_institution_id,
               name_history:institution_name_history(name,end_date)`
            )
            .eq("is_active", true)
            .order("name")
            .range(from, from + pageSize - 1);
          data = result.data as Institution[] | null;
          error = result.error;
        }

        if (error) { setLoadError("Institutions could not be loaded. Refresh this page to try again."); break; }
        if (!data || data.length < pageSize) {
          if (data) all.push(...data);
          break;
        }
        all.push(...data);
        from += data.length;
      }
      setPublishedInstitutions(all);
      setLoading(false);
    };
    fetchData().catch(() => { setLoadError("Institutions could not be loaded. Refresh this page to try again."); setLoading(false); });
  }, []);

  const visibleInstitutionIds = useMemo(() => {
    const byId = new Map(allInstitutions.map(inst => [inst.id, inst]));
    const ids = new Set<string>();
    for (const inst of allInstitutions) {
      if (!matchesText(searchTerm, inst.name, inst.short_name, inst.official_name, inst.description, inst.institution_type, inst.aliases, inst.former_names, inst.historySearchNames)) continue;
      let current: Institution | undefined = inst;
      const chain = new Set<string>();
      while (current && !chain.has(current.id)) {
        chain.add(current.id); ids.add(current.id);
        current = byId.get(current.parent_institution_id || current.supervising_ministry_id || "");
      }
    }
    return ids;
  }, [allInstitutions, searchTerm]);

  const categoryGroups = useMemo((): CategoryGroup[] => {
    if (allInstitutions.length === 0) return [];

    const term = searchTerm.trim();
    const assigned = new Set<string>();
    const groups: CategoryGroup[] = [];

    const categories = [
      {
        title: "The Executive (National Government)",
        slug: "executive",
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
        description: "The independent arm of government responsible for interpreting the Constitution, administering justice, and resolving disputes through courts and specialized tribunals.",
        filter: (inst: Institution): boolean => {
          if (inst.id === TOP_LEVEL_IDS.JUDICIARY) return true;
          return inst.arm_of_government === "Judiciary" && isRoot(inst);
        },
      },
      {
        title: "Independent Constitutional Commissions and Offices",
        slug: "independent",
        description: "Chapter 15 constitutional commissions and independent offices that act as the fourth arm of government.",
        filter: (inst: Institution): boolean => inst.arm_of_government === "Independent" && isRoot(inst),
      },
      {
        title: "County Governments (Devolved Units)",
        slug: "county-governments",
        description: "The 47 County Governments, County Assemblies, and their subordinate departments, agencies, and public bodies.",
        filter: (inst: Institution): boolean => {
          if (inst.government_level === "County" && inst.institution_type === "County Government") return true;
          return inst.government_level === "County" && isRoot(inst);
        },
      },
      {
        title: "Intergovernmental Bodies",
        slug: "intergovernmental",
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
      const roots = buildFullHierarchy(allInstitutions, cat.filter, term, visibleInstitutionIds);
      
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
        
        // Title becomes the parent's name when applicable
        const displayTitle = useParentAsTitle && topLevelParent
          ? `${topLevelParent.name}${topLevelParent.short_name ? ` (${topLevelParent.short_name})` : ''}`
          : cat.title;
        
        groups.push({
          title: displayTitle,
          slug: cat.slug,
          description: cat.description,
          count: countNodes(institutionsToRender),
          institutions: institutionsToRender,
          useParentAsTitle: !!useParentAsTitle,
        });
      }
    });

    if (term) {
      const leftovers = allInstitutions.filter((i) => !assigned.has(i.id) && matchesText(term, i.name, i.short_name, i.official_name, i.description, i.institution_type, i.aliases, i.former_names, i.historySearchNames));
      if (leftovers.length) {
        groups.push({
          title: "Additional Search Matches",
          slug: "search-other",
          description: "Institutions matching your search that are part of larger hierarchies above.",
          count: leftovers.length,
          institutions: leftovers.map((i) => ({ ...i })),
        });
      }
    }

    return groups;
  }, [allInstitutions, searchTerm, visibleInstitutionIds]);

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

      <main className="govuk-main-wrapper institution-directory" id="main-content" role="main">
        <header className="institution-directory-heading">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">Departments, agencies and public institutions</h1>
          <p className="govuk-body govuk-!-margin-bottom-0">Find the ministries, agencies, commissions and other public bodies that make up Kenya’s government.</p>
        </header>

        <section className="directory-search">
          <label className="govuk-label" htmlFor="search-institutions">Search for a government institution</label>
          <div className="directory-search__row">
            <input
              className="govuk-input"
              id="search-institutions"
              name="search-institutions"
              type="search"
              aria-describedby="search-hint"
              placeholder="For example, Ministry of Health or IEBC"
              value={searchTerm}
              maxLength={120}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                const url = new URL(window.location.href);
                if (event.target.value) url.searchParams.set("q", event.target.value); else url.searchParams.delete("q");
                window.history.replaceState(null, "", url);
              }}
            />
            {searchTerm && <button type="button" className="govuk-button govuk-button--secondary" onClick={() => {
              setSearchTerm("");
              const url = new URL(window.location.href);
              url.searchParams.delete("q");
              window.history.replaceState(null, "", url);
            }}>Clear search</button>}
          </div>
          <div className="govuk-hint govuk-!-margin-bottom-0" id="search-hint">Search by institution name, abbreviation, type or responsibility.</div>
        </section>

        <div className="govuk-grid-row directory-layout">
          <aside className="govuk-grid-column-one-third directory-sidebar" aria-label="Directory information">
            <div className="directory-counts">
              <p className="directory-result-count" role="status" aria-live="polite">
                <strong className="directory-counts__number">
                  {searchTerm.trim()
                    ? searchResults.length.toLocaleString()
                    : (enrichedInstitutions.length - historicalCount).toLocaleString()}
                </strong>
                <span>
                  {searchTerm.trim()
                    ? ` ${searchResults.length === 1 ? "result" : "results"} found`
                    : " current institutions"}
                </span>
                {searchTerm.trim() && <span className="directory-counts__subcount">for “{searchTerm.trim()}”</span>}
              </p>
              {!searchTerm.trim() && (
                <>
                  <p className="directory-counts__secondary">
                    <strong className="directory-counts__number">{historicalCount.toLocaleString()}</strong>
                    <span> historical institutions</span>
                  </p>
                  <p className="directory-counts__secondary">
                    <strong className="directory-counts__number">{schoolCount == null ? "…" : schoolCount.toLocaleString()}</strong>
                    <span> public schools</span>
                  </p>
                </>
              )}
            </div>

            <div className="govuk-checkboxes govuk-checkboxes--small directory-history-filter">
              <div className="govuk-checkboxes__item">
                <input className="govuk-checkboxes__input" id="include-historical" type="checkbox" checked={includeHistorical} aria-describedby="history-hint" onChange={event => {
                  setIncludeHistorical(event.target.checked);
                  const url = new URL(window.location.href);
                  if (event.target.checked) url.searchParams.set("historical", "include"); else url.searchParams.delete("historical");
                  window.history.replaceState(null, "", url);
                }} />
                <label className="govuk-label govuk-checkboxes__label" htmlFor="include-historical">Show historical and former institutions</label>
                <div id="history-hint" className="govuk-hint govuk-checkboxes__hint">Includes dissolved, merged, renamed, split and defunct bodies. Their public profiles and service histories remain available.</div>
              </div>
            </div>

            <details className="directory-options">
              <summary className="govuk-link">Public school count</summary>
              <div className="directory-options__content">
                <div className="govuk-checkboxes govuk-checkboxes--small">
                  <div className="govuk-checkboxes__item">
                    <input className="govuk-checkboxes__input" id="include-school-count" type="checkbox" checked={includeSchools} onChange={event => setIncludeSchools(event.target.checked)} />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="include-school-count">Include public schools in the total count</label>
                    {includeSchools && <div className="govuk-hint govuk-checkboxes__hint" role="status">{searchTerm.trim() ? schoolMatches == null ? "School count unavailable" : `${schoolMatches.toLocaleString()} public schools also match` : schoolCount == null ? "School count unavailable" : `${schoolCount.toLocaleString()} public schools`}</div>}
                  </div>
                </div>
                {!searchTerm.trim() && <p className="govuk-body-s govuk-!-margin-bottom-0">Public schools are listed under their education directorate.</p>}
              </div>
            </details>
          </aside>
          <div className="govuk-grid-column-two-thirds directory-main">
            <div id="directorate-school-browser" tabIndex={-1}>
              {selectedDirectorate && <PublicSchools key={`${selectedDirectorate}:${schoolBrowserVersion}`} fixedDirectorate={selectedDirectorate} autoOpen viewMode="accordion" />}
            </div>
            {loadError && <p className="govuk-body" role="alert">{loadError}</p>}
            <section aria-labelledby="directory-results-heading">
              <h2 className="govuk-heading-m govuk-visually-hidden" id="directory-results-heading">{searchTerm.trim() ? "Search results" : "Government institutions"}</h2>
              {searchTerm.trim() ? (
                searchResults.length === 0 ? <p className="govuk-inset-text">No institutions found. Try a different name, abbreviation or search term.</p> : (
                  <ul className="govuk-list directory-search-results">
                    {searchResults.map(institution => {
                      const parent = institutionsById.get(institution.parent_institution_id || institution.supervising_ministry_id || "");
                      return <li key={institution.id}>
                        <Link href={`/government/institutions/${institution.slug}`} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold">{institution.name}</Link>
                        {institution.short_name && <span className="govuk-body-s govuk-!-margin-left-1 govuk-text-secondary">({institution.short_name})</span>}
                        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                          {[institution.institution_type, parent ? `Part of ${parent.name}` : institution.arm_of_government, institution.government_level].filter(Boolean).join(" · ") || "Government institution"}
                        </p>
                      </li>;
                    })}
                  </ul>
                )
              ) : categoryGroups.length === 0 ? (
                <p className="govuk-inset-text">No institutions are available in this directory.</p>
              ) : (
                <div className="directory-categories">
                  {categoryGroups.map(group => (
                    <section id={`institutions-${group.slug}`} key={group.slug} className="directory-category" aria-labelledby={`institutions-heading-${group.slug}`}>
                      <h2 className="govuk-heading-m directory-category__heading" id={`institutions-heading-${group.slug}`}>
                        {group.title}
                        <span className="directory-category__count">{group.count.toLocaleString()} {group.count === 1 ? "institution" : "institutions"}</span>
                      </h2>
                      {group.description && <p className="govuk-body directory-category__description">{group.description}</p>}
                      <NestedInstitutionList nodes={group.institutions} isSearchActive={false} onBrowse={browseSchools} />
                    </section>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .institution-directory-heading { border-bottom: 1px solid #b1b4b6; margin-bottom: 24px; padding-bottom: 16px; max-width: 100%; }
        .institution-directory-heading h1 { max-width: 900px; }
        .institution-directory .govuk-grid-column-one-third, .institution-directory .govuk-grid-column-two-thirds { min-width: 0; }
        .institution-directory .govuk-table-responsive { overflow-x: auto; }
        .institution-directory .govuk-table { min-width: 540px; }
        .institution-history { color: #505a5f; margin: 6px 0 10px; line-height: 1.5; }
        .institution-directory .govuk-link, .institution-directory .govuk-details__summary-text { overflow-wrap: anywhere; }
        .institution-directory nav li { padding: 5px 0; }
        .institution-directory .govuk-accordion__section-content > ul > li { padding: 12px 0; border-bottom: 1px solid #d8dde0; }
        @media(max-width: 640px) { .institution-directory-heading h1 { font-size: 32px; line-height: 1.15; } .institution-directory .govuk-button { white-space: normal; } }

        .institution-children { margin-left: 12px; padding-left: 24px !important; border-left: 3px solid #b1b4b6 !important; }
        .institution-children .institution-children { border-left-color: #00703c !important; }
        #directorate-school-browser { scroll-margin-top: 24px; }
        .institution-directory .govuk-accordion__section { scroll-margin-top: 20px; }
        .institution-directory .govuk-accordion__section-header:focus-visible { outline: 3px solid #ffdd00; }
        @media (max-width: 640px) { .institution-children { margin-left: 4px; padding-left: 12px !important; } }
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

        .institution-directory .govuk-accordion {
          border-bottom: 1px solid #b1b4b6;
        }
        .institution-directory .govuk-accordion__section {
          border-top: 1px solid #b1b4b6;
        }
        .institution-directory .govuk-accordion__section-header {
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          cursor: pointer;
        }
        .institution-directory .govuk-accordion__section-header:hover .govuk-accordion__section-heading-text {
          text-decoration: underline;
        }
        .institution-directory .govuk-accordion__section-heading {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          line-height: 1.3;
          flex-grow: 1;
        }
        .institution-directory .govuk-accordion__section-heading-text {
          display: inline;
        }
        .institution-directory .govuk-accordion__section-heading-count {
          font-weight: 400;
          color: #505a5f;
          margin-left: 5px;
        }
        .institution-directory .govuk-accordion__section-toggle {
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
        .institution-directory .govuk-accordion__section-toggle:hover {
          background: #1d70b8;
          color: #ffffff;
        }
        .institution-directory .govuk-accordion__section-toggle:hover .govuk-accordion-nav__chevron {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23ffffff' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
        }
        .institution-directory .govuk-accordion__section-toggle:focus {
          outline: 3px solid #ffdd00;
          outline-offset: 2px;
          background: #1d70b8;
          color: #ffffff;
        }
        .institution-directory .govuk-accordion__section-toggle:focus .govuk-accordion-nav__chevron {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23ffffff' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
        }
        .institution-directory .govuk-accordion-nav__chevron {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%230b0c0c' d='M10 14l-6-6h12z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          transition: transform 0.3s ease;
        }
        .institution-directory .govuk-accordion__section--expanded .govuk-accordion-nav__chevron {
          transform: rotate(180deg);
        }
        .institution-directory .govuk-accordion__section-content {
          padding: 15px 0 30px 0;
          display: none;
        }
        .institution-directory .govuk-accordion__section--expanded .govuk-accordion__section-content {
          display: block;
        }

        /* GOV.UK Details Component Styling */
        .institution-directory .govuk-details {
          font-family: Arial, sans-serif;
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
        .institution-directory .govuk-details__summary {
          display: inline-block;
          margin-bottom: 5px;
        }
        .institution-directory .govuk-details__summary-text {
          color: #1d70b8;
          cursor: pointer;
        }
        .institution-directory .govuk-details__summary-text:hover {
          color: #003078;
        }
        .institution-directory .govuk-details__summary:focus {
          outline: 3px solid #ffdd00;
          background-color: #ffdd00;
          box-shadow: 0 -2px #ffdd00, 0 4px #0b0c0c;
          color: #0b0c0c;
          text-decoration: none;
        }
        .institution-directory .govuk-details__text {
          padding-top: 15px;
          padding-bottom: 15px;
          padding-left: 20px;
          border-left: 4px solid #1d70b8;
        }
        .institution-directory .govuk-details[open] .govuk-details__summary {
          margin-bottom: 10px;
        }

        .institution-directory .govuk-table__row--section-header {
          background: #f3f2f1;
        }
        .institution-directory .govuk-table__row--section-header td {
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

          .institution-directory .govuk-accordion__section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .institution-directory .govuk-accordion__section-toggle {
            margin-top: 10px;
            width: 100%;
            justify-content: flex-start;
          }
        }

        .institution-directory-heading {
          border-bottom: 1px solid #b1b4b6;
          margin-bottom: 24px;
          padding-bottom: 20px;
        }
        .directory-search {
          margin-bottom: 16px;
        }
        .directory-search__row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 5px;
        }
        .directory-search__row .govuk-input {
          flex: 1;
          min-width: 0;
        }
        .directory-search__row .govuk-button {
          flex: 0 0 auto;
          margin: 0;
        }
        .directory-result-count {
          font-size: 16px;
          margin: 0 0 18px;
          padding: 0 0 16px;
        }
        .directory-options {
          border-bottom: 1px solid #b1b4b6;
          border-top: 1px solid #b1b4b6;
          margin-bottom: 24px;
        }
        .directory-options > details + details {
          border-top: 1px solid #d8dde0;
        }
        .directory-options summary {
          cursor: pointer;
          padding: 12px 0;
        }
        .directory-options summary:focus-visible,
        .directory-category__summary:focus-visible {
          background: #ffdd00;
          box-shadow: 0 -2px #ffdd00, 0 4px #0b0c0c;
          outline: 3px solid transparent;
        }
        .directory-options__content {
          padding: 4px 0 16px;
        }
        .directory-sidebar {
          padding-top: 8px;
        }
        .directory-counts {
          margin-bottom: 24px;
        }
        .directory-counts__number {
          display: block;
          font-size: 28px;
          line-height: 1.15;
        }
        .directory-counts__secondary {
          border-top: 1px solid #d8dde0;
          font-size: 16px;
          margin: 0;
          padding: 12px 0;
        }
        .directory-counts__subcount {
          display: block;
          font-weight: 400;
          margin-top: 4px;
        }
        .directory-main {
          min-width: 0;
          padding-left: 30px;
        }
        .directory-area-links {
          display: grid;
          gap: 10px 24px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          padding: 4px 0 16px;
        }
        .institutions-controls {
          justify-content: flex-start;
          padding: 0;
        }
        .directory-category {
          border-top: 1px solid #b1b4b6;
          scroll-margin-top: 20px;
        }
        .directory-category:last-child {
          border-bottom: 1px solid #b1b4b6;
        }
        .directory-category__summary {
          align-items: baseline;
          cursor: pointer;
          display: flex;
          font-size: 19px;
          font-weight: 700;
          gap: 12px;
          justify-content: space-between;
          line-height: 1.3;
          padding: 16px 4px;
        }
        .directory-category__summary:hover {
          text-decoration: underline;
        }
        .directory-category__count {
          color: #505a5f;
          flex: 0 0 auto;
          font-size: 16px;
          font-weight: 400;
        }
        .directory-category__content {
          padding: 0 4px 16px;
        }
        .directory-category__content > .govuk-body {
          margin-bottom: 16px;
          max-width: 75ch;
        }
        .directory-category {
          border-top: 1px solid #b1b4b6;
          padding: 18px 0 12px;
          scroll-margin-top: 20px;
        }
        .directory-category:last-child {
          border-bottom: 1px solid #b1b4b6;
        }
        .directory-category__heading {
          margin-bottom: 8px;
        }
        .directory-category__count {
          color: #505a5f;
          display: block;
          font-size: 16px;
          font-weight: 400;
          margin-top: 4px;
        }
        .directory-category__description {
          margin-bottom: 8px;
          max-width: 75ch;
        }
        .directory-category > ul > li {
          border-bottom: 1px solid #d8dde0;
          margin-bottom: 0 !important;
          padding: 12px 4px;
        }
        .directory-category > ul > li:last-child {
          border-bottom: 0;
        }
        .directory-search-results {
          margin-top: 0;
        }
        .directory-search-results > li {
          border-bottom: 1px solid #b1b4b6;
          margin: 0;
          padding: 14px 4px;
        }
        .directory-search-results > li:first-child {
          border-top: 1px solid #b1b4b6;
        }
        @media (max-width: 640px) {
          .directory-sidebar {
            padding-bottom: 8px;
          }
          .directory-counts {
            align-items: flex-start;
            display: flex;
            flex-wrap: wrap;
            gap: 12px 24px;
          }
          .directory-result-count {
            flex-basis: 100%;
            margin-bottom: 0;
          }
          .directory-counts__secondary {
            border-top: 0;
            padding: 0;
          }
          .directory-counts__number {
            font-size: 22px;
          }
          .directory-main {
            padding-left: 15px;
          }
          .directory-search__row {
            align-items: stretch;
            flex-direction: column;
          }
          .directory-search__row .govuk-button {
            align-self: flex-start;
          }
          .directory-area-links {
            grid-template-columns: 1fr;
          }
          .directory-category__summary {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
