import Link from "next/link";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";
import { searchSanityContent } from "@/lib/sanity/client";
import { wordLikeSimilarity } from "@/lib/fuzzy";
import { searchStaticPages } from "@/lib/data/site-search-pages.utils";

interface SearchParams {
  q?: string;
  type?: string;
}

/** Short revalidate — search is dynamic via searchParams but keep Worker light */
export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  if (term) {
    return {
      title: `Search results for “${term}”`,
      description: `Search CitizenGuide.KE for “${term}” — government institutions, leaders, counties, laws, elections and guides.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: "Search",
    description:
      "Search CitizenGuide.KE for government institutions, leaders, counties, the Constitution, elections, services and guides.",
    alternates: { canonical: "/search" },
  };
}

/** Result href — supports static pages (path) and Supabase/Sanity (base_route + slug). */
function resultHref(item: {
  path?: string;
  base_route?: string;
  slug?: string;
}): string {
  if (item.path) return item.path;
  const base = (item.base_route || "/").replace(/\/$/, "") || "";
  const slug = (item.slug || "").replace(/^\//, "");
  if (!slug) return base || "/";
  if (base === "" || base === "/") return `/${slug}`;
  return `${base}/${slug}`;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parsedParams = await searchParams;
  const q = parsedParams.q ? parsedParams.q.trim() : "";
  const selectedType = parsedParams.type || "";

  let results: any[] = [];
  let errorMsg = "";
  let didYouMean: string | null = null;
  /** True when remote sources failed but static pages may still show */
  let partialFailure = false;

  // ============================================
  // GOV.UK-STYLE HYBRID SEARCH
  // 1) Static pages (always — concurrent-safe, no external I/O)
  // 2) Supabase FTS/trigram (institutions, leaders, counties…)
  // 3) Sanity (constitution, guides, acts…)
  // Failures in 2/3 never take down the page under multi-user load.
  // ============================================
  if (q) {
    // Static pages first — works even if Supabase/Sanity are slow or down
    const staticHits = searchStaticPages(q, 8).map((h) => ({
      ...h,
      // Prefer path for linking
      path: h.path,
    }));

    try {
      const supabase = createPublicClient();

      // Preferred: hybrid search_public RPC (typo tolerance + ranking)
      // Keep lim modest for Cloudflare Worker CPU / response size under concurrent load
      let remoteResults: any[] = [];
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "search_public",
          {
            q,
            filter_type: selectedType || null,
            lim: 20,
          },
        );

        if (rpcError) {
          let queryBuilder = supabase
            .from("global_search_view")
            .select("id, slug, name, snippet, entity_type, base_route")
            .textSearch("search_vector", q, {
              config: "english",
              type: "websearch",
            });

          if (selectedType) {
            queryBuilder = queryBuilder.eq("entity_type", selectedType);
          }

          const { data, error } = await queryBuilder.limit(20);
          if (error) throw error;
          remoteResults = data || [];
        } else {
          remoteResults = (rpcData || []).map((r: any) => ({
            ...r,
            rank: r.rank != null ? Math.min(1, (r.rank as number) / 6) : 0.5,
          }));
        }
      } catch {
        partialFailure = true;
        remoteResults = [];
      }

      // Sanity (optional)
      let sanityResults: any[] = [];
      try {
        let searchTerm = q;
        try {
          const { data: exps } = await supabase
            .from("search_expansions")
            .select("expansion")
            .eq("original", q.toLowerCase().trim());
          if (exps && exps.length) {
            searchTerm =
              q + " " + exps.map((e: any) => e.expansion).join(" ");
          }
        } catch {
          /* expansions optional */
        }

        const sanityHits = await searchSanityContent(searchTerm, 10);
        const fuzzyThreshold = 0.08;
        sanityResults = (sanityHits || [])
          .map((r: any) => {
            const textForMatch = `${r.title || r.name || ""} ${r.snippet || r.shortTitle || ""}`;
            const sim = wordLikeSimilarity(q, textForMatch);

            let slug = r.slug || "";
            let base = r.base_route || "/";

            if (
              r._type === "constitutionArticle" &&
              r.chapter != null &&
              r.articleNumber != null
            ) {
              slug = `${r.chapter}/${r.articleNumber}`;
              base = "/constitution";
            }

            const isRichContent = [
              "constitutionArticle",
              "actOfParliament",
              "guide",
              "presidentialTrip",
            ].includes(r._type);
            const baseRank = isRichContent ? 0.75 : 0.4;

            const isConstitutionQuery = q
              .toLowerCase()
              .includes("constitution");
            const isConstitutionType = r._type === "constitutionArticle";
            if (isConstitutionQuery && isConstitutionType) {
              return {
                id: r._id,
                slug,
                name:
                  r.title ||
                  r.name ||
                  r.shortTitle ||
                  r.articleTitle ||
                  "Untitled",
                snippet: r.snippet,
                entity_type: "Constitutional Article",
                base_route: base,
                rank: Math.max(0.85, sim * 0.9),
              };
            }

            if (sim < fuzzyThreshold) return null;

            return {
              id: r._id,
              slug,
              name:
                r.title ||
                r.name ||
                r.shortTitle ||
                r.articleTitle ||
                "Untitled",
              snippet: r.snippet,
              entity_type:
                r._type === "guide"
                  ? "Guide"
                  : r._type === "service"
                    ? "Service"
                    : r._type === "news"
                      ? "News"
                      : r._type === "constitutionArticle"
                        ? "Constitutional Article"
                        : r._type === "actOfParliament"
                          ? "Act of Parliament"
                          : r._type === "presidentialTrip"
                            ? "Presidential Trip"
                            : r._type === "courtPronouncement"
                              ? "Court Pronouncement"
                              : r._type === "reportMandate"
                                ? "Report / Mandate"
                                : r._type === "governmentMinistry"
                                  ? "Government Ministry"
                                  : r._type === "governmentCategory"
                                    ? "Service Category"
                                    : r._type === "institutionContent"
                                      ? "Institution Detail"
                                      : "Content",
              base_route: base,
              rank: Math.max(baseRank, sim * 0.9),
            };
          })
          .filter(Boolean) as any[];
      } catch {
        /* Sanity optional under load */
      }

      const contentKeywords = [
        "constitution",
        "article",
        "part ",
        "preamble",
        "chapter",
        "bill of rights",
        "supremacy",
      ];
      const isContentQuery = contentKeywords.some((k) =>
        q.toLowerCase().includes(k),
      );

      const pageLimit = 6;
      const supLimit = isContentQuery ? 3 : 6;
      const sanLimit = isContentQuery ? 8 : 5;

      results = [
        ...staticHits.slice(0, pageLimit),
        ...remoteResults.slice(0, supLimit),
        ...sanityResults.slice(0, sanLimit),
      ]
        .sort((a, b) => (b.rank || 0) - (a.rank || 0))
        .slice(0, 18);

      // De-dupe by href
      const seen = new Set<string>();
      results = results.filter((item) => {
        const href = resultHref(item);
        if (seen.has(href)) return false;
        seen.add(href);
        return true;
      });

      if (selectedType) {
        results = results.filter(
          (r: any) =>
            r.entity_type === selectedType ||
            (selectedType === "Page" && r.entity_type === "Page"),
        );
      }

      // Analytics insert — fire-and-forget; never fail the response under load
      void (async () => {
        try {
          await supabase.from("search_queries").insert({
            query: q,
            filter_type: selectedType || null,
            result_count: results.length,
          });
        } catch {
          /* ignore */
        }
      })();

      if (results.length < 3 && q.length > 3) {
        try {
          const { data: suggest } = await supabase
            .from("global_search_view")
            .select("name")
            .or(`name.ilike.%${q}%,match_text.ilike.%${q}%`)
            .limit(1);
          if (
            suggest?.[0]?.name &&
            suggest[0].name.toLowerCase() !== q.toLowerCase()
          ) {
            didYouMean = suggest[0].name;
          }
        } catch {
          /* ignore */
        }
      }
    } catch (e: unknown) {
      // Absolute fallback: static pages only (multi-user / Cloudflare resilience)
      partialFailure = true;
      results = staticHits;
      if (!results.length) {
        errorMsg =
          e instanceof Error
            ? e.message
            : "An error occurred while searching.";
      }
    }
  }

  const getFilterUrl = (type: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    return `/search?${params.toString()}`;
  };

  // GOV.UK-style snippet highlighting (focus yellow #ffdd00)
  function highlight(text: string | null | undefined, term: string): string {
    if (!text || !term) return text || "";
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeTerm})`, "gi");
    return text.replace(
      regex,
      '<mark class="app-search-highlight">$1</mark>',
    );
  }

  return (
  <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Search", href: "/search" },
          ...(q ? [{ text: `Results for “${q}”` }] : []),
        ]}
      />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">
              {q ? "Search results" : "Search"}
            </h1>

            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label govuk-label--m" htmlFor="site-search-input">
                Search this website
              </label>
              <div id="search-hint" className="govuk-hint">
                For example: IEBC, Constitution Article 47, passport, or Nairobi County
              </div>
              <div className="govuk-!-max-width-two-thirds">
                <SearchAutocomplete
                  initialQuery={q}
                  placeholder="Search institutions, services, laws, elections…"
                  inputId="site-search-input"
                />
              </div>
              <p className="govuk-body-s govuk-!-margin-top-2">
                Searches pages, institutions, leaders, counties, political parties,
                the Constitution, Acts and guides.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Classification Categorization Faceted Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-4">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Filter by type</h2>
            
              <ul className="govuk-list govuk-list--spaced govuk-!-margin-0 govuk-!-padding-0">
                <li>
                  <Link href={getFilterUrl("")} className={`govuk-link ${selectedType === "" ? 'govuk-!-font-weight-bold' : ''}`}>
                    All results
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Institution")} className={`govuk-link ${selectedType === "Institution" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Institutions &amp; Bodies
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Leader")} className={`govuk-link ${selectedType === "Leader" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Leaders &amp; Profiles
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Official")} className={`govuk-link ${selectedType === "Official" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Public Officials
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("County")} className={`govuk-link ${selectedType === "County" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Counties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Constituency")} className={`govuk-link ${selectedType === "Constituency" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Constituencies
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Ward")} className={`govuk-link ${selectedType === "Ward" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Wards
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Political Party")} className={`govuk-link ${selectedType === "Political Party" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Political Parties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Guide")} className={`govuk-link ${selectedType === "Guide" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Guides &amp; How-to
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Service")} className={`govuk-link ${selectedType === "Service" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Public Services
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("News")} className={`govuk-link ${selectedType === "News" ? 'govuk-!-font-weight-bold' : ''}`}>
                    News &amp; Updates
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Presidential Trip")} className={`govuk-link ${selectedType === "Presidential Trip" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Presidential Trips
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Act of Parliament")} className={`govuk-link ${selectedType === "Act of Parliament" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Acts &amp; Laws
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Page")} className={`govuk-link ${selectedType === "Page" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Site pages
                  </Link>
                </li>
              </ul>
          </div>

          <div className="govuk-grid-column-two-thirds">
            {errorMsg ? (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">Search is temporarily unavailable. Try again in a few minutes.</p>
                  <p className="govuk-body-s">{errorMsg}</p>
                </div>
              </div>
            ) : q ? (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2" aria-live="polite">
                  {results.length} result{results.length !== 1 ? "s" : ""} for <strong>“{q}”</strong>
                </h2>

                {partialFailure && results.length > 0 && (
                  <div className="govuk-inset-text govuk-!-margin-bottom-4">
                    Some search sources were slow or unavailable. Showing the best matches we could load.
                  </div>
                )}

                {didYouMean && (
                  <p className="govuk-body-s govuk-!-margin-bottom-4">
                    Did you mean{" "}
                    <Link
                      href={`/search?q=${encodeURIComponent(didYouMean)}${selectedType ? `&type=${encodeURIComponent(selectedType)}` : ""}`}
                      className="govuk-link"
                    >
                      {didYouMean}
                    </Link>
                    ?
                  </p>
                )}

                {results.length > 0 && results[0]?.rank != null && results[0].rank < 0.3 && !didYouMean && (
                  <div className="govuk-inset-text govuk-!-margin-bottom-4">
                    Showing lower confidence matches for “{q}”. Try a different spelling or a more specific term.
                  </div>
                )}

                {results.length > 0 ? (
                  <ul className="govuk-list govuk-!-margin-top-0">
                    {results.map((item, idx) => (
                      <li
                        key={`${item.id || item.slug || item.path}-${idx}`}
                        className="govuk-!-padding-top-3 govuk-!-padding-bottom-3 app-search-result"
                      >
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold govuk-!-display-block govuk-!-margin-bottom-1">
                          {item.entity_type}
                        </span>
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link
                            href={resultHref(item)}
                            className="govuk-link govuk-!-font-weight-bold"
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlight(item.name, q),
                              }}
                            />
                          </Link>
                        </h3>
                        {item.snippet && (
                          <p
                            className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 truncate-2-lines"
                            dangerouslySetInnerHTML={{
                              __html: highlight(item.snippet, q),
                            }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="govuk-body govuk-!-margin-top-4">
                    <p>No matches found.</p>
                    <p className="govuk-body-s">
                      Try a shorter term or different spelling. Search supports
                      fuzzy matching across government data and site pages.
                    </p>
                    <p className="govuk-body-s">
                      Popular starting points:{" "}
                      <Link href="/services" className="govuk-link">Services</Link>
                      {", "}
                      <Link href="/elections" className="govuk-link">Elections</Link>
                      {", "}
                      <Link href="/constitution" className="govuk-link">Constitution</Link>
                      {", "}
                      <Link href="/government" className="govuk-link">Government</Link>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="govuk-body">
                <p>
                  Type a term to search institutions, leaders, counties, laws,
                  elections and guides.
                </p>
                <h2 className="govuk-heading-s">Popular searches</h2>
                <ul className="govuk-list govuk-list--bullet">
                  <li>
                    <Link href="/search?q=IEBC" className="govuk-link">IEBC</Link>
                  </li>
                  <li>
                    <Link href="/search?q=Constitution" className="govuk-link">
                      Constitution
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=2027+election" className="govuk-link">
                      2027 election
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=passport" className="govuk-link">
                      Passport
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=Nairobi" className="govuk-link">
                      Nairobi County
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

      <style>{`
        .app-search-highlight {
          background-color: #ffdd00;
          color: #0b0c0c;
          padding: 0 2px;
          font-weight: 700;
        }
        .app-search-result {
          border-bottom: 1px solid #b1b4b6;
        }
        .app-search-result:last-child {
          border-bottom: 0;
        }
      `}</style>
  </>
);
}

