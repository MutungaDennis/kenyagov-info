import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";
import { searchSanityContent } from "@/lib/sanity/client";
import { wordLikeSimilarity, isFuzzyMatch } from "@/lib/fuzzy";

interface SearchParams {
  q?: string;
  type?: string;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  const parsedParams = await searchParams;
  const q = parsedParams.q ? parsedParams.q.trim() : "";
  const selectedType = parsedParams.type || "";

  let results: any[] = [];
  let errorMsg = "";
  let didYouMean: string | null = null;

  // ============================================
  // GOV.UK-STYLE HYBRID SEARCH via RPC (FTS + trigram fuzzy)
  // ============================================
  if (q) {
    try {
      // Preferred: use the hybrid search_public function for typo tolerance + ranking
      const { data: rpcData, error: rpcError } = await supabase.rpc("search_public", {
        q,
        filter_type: selectedType || null,
        lim: 50,
      });

      if (rpcError) {
        // Fallback to view + textSearch if RPC not yet run / available
        let queryBuilder = supabase
          .from("global_search_view")
          .select("id, slug, name, snippet, entity_type, base_route")
          .textSearch("search_vector", q, { config: "english", type: "websearch" });

        if (selectedType) {
          queryBuilder = queryBuilder.eq("entity_type", selectedType);
        }

        const { data, error } = await queryBuilder.limit(50);
        if (error) throw error;
        results = data || [];
      } else {
        // Normalize Supabase ranks (they can be >1) to 0-1 range so rich Sanity content can compete fairly
        results = (rpcData || []).map((r: any) => ({
          ...r,
          rank: r.rank != null ? Math.min(1, (r.rank as number) / 6) : 0.5,
        }));
      }

      // Merge Sanity content for full site search (guides, services, news, constitution, acts, pages)
      try {
        // Expand q using the same expansions table as Supabase (for acronyms/misspellings)
        let searchTerm = q;
        try {
          const { data: exps } = await supabase
            .from('search_expansions')
            .select('expansion')
            .eq('original', q.toLowerCase().trim());
          if (exps && exps.length) {
            searchTerm = q + ' ' + exps.map((e: any) => e.expansion).join(' ');
          }
        } catch {}

        const sanityHits = await searchSanityContent(searchTerm, 20);

        // Apply fuzzy/trigram-like tolerance (mimics Supabase pg_trgm word_similarity)
        // This makes Sanity rich content (constitution text, trips, guides, laws, descriptions) typo tolerant
        const fuzzyThreshold = 0.08;  // lowered to allow more good content matches
        const fuzzySanity = (sanityHits || [])
          .map((r: any) => {
            const textForMatch = `${r.title || r.name || ''} ${r.snippet || r.shortTitle || ''}`;
            const sim = wordLikeSimilarity(q, textForMatch);

            let slug = r.slug || '';
            let base = r.base_route || '/';

            if (r._type === 'constitutionArticle' && r.chapter != null && r.articleNumber != null) {
              slug = `${r.chapter}/${r.articleNumber}`;
              base = '/constitution';
            }

            const isRichContent = ['constitutionArticle', 'actOfParliament', 'guide', 'presidentialTrip'].includes(r._type);
            const baseRank = isRichContent ? 0.75 : 0.4;  // higher for rich content

            // For constitution content queries, always include even if sim lower (GROQ already matched)
            // This ensures actual Kenyan Constitution text from Sanity shows for queries like “Kenyan constitution 2010”
            const isConstitutionQuery = q.toLowerCase().includes('constitution');
            const isConstitutionType = r._type === 'constitutionArticle';
            if (isConstitutionQuery && isConstitutionType) {
              return {
                id: r._id,
                slug,
                name: r.title || r.name || r.shortTitle || r.articleTitle || 'Untitled',
                snippet: r.snippet,
                entity_type: 'Constitutional Article',
                base_route: base,
                rank: Math.max(0.85, sim * 0.9),
              };
            }

            if (sim < fuzzyThreshold) return null;

            return {
              id: r._id,
              slug,
              name: r.title || r.name || r.shortTitle || r.articleTitle || 'Untitled',
              snippet: r.snippet,
              entity_type: r._type === 'guide' ? 'Guide' : 
                         r._type === 'service' ? 'Service' : 
                         r._type === 'news' ? 'News' : 
                         r._type === 'constitutionArticle' ? 'Constitutional Article' : 
                         r._type === 'actOfParliament' ? 'Act of Parliament' : 
                         r._type === 'presidentialTrip' ? 'Presidential Trip' :
                         r._type === 'courtPronouncement' ? 'Court Pronouncement' :
                         r._type === 'reportMandate' ? 'Report / Mandate' :
                         r._type === 'governmentMinistry' ? 'Government Ministry' :
                         r._type === 'governmentCategory' ? 'Service Category' :
                         r._type === 'institutionContent' ? 'Institution Detail' : 'Content',
              base_route: base,
              rank: Math.max(baseRank, sim * 0.9), // boost with fuzzy score
            };
          })
          .filter(Boolean) as any[];

        // Merge with balance so Sanity rich content (constitution, laws, trips, guides) shows well alongside Supabase
        const supabaseResults = results;  // already normalized <=1
        const sanityResults = fuzzySanity;

        const contentKeywords = ['constitution', 'article', 'part ', 'preamble', 'chapter', 'bill of rights', 'supremacy'];
        const isContentQuery = contentKeywords.some(k => q.toLowerCase().includes(k));

        // Always force-include constitution content from Sanity for relevant queries (even if not in top fuzzy)
        let finalSanity = sanityResults;
        if (isContentQuery) {
          // Ensure constitutionArticle are present with high rank
          const existingConstIds = new Set(sanityResults.filter(r => r.entity_type === 'Constitutional Article').map(r => r.id));
          // The fuzzySanity already has the special high rank for them from earlier map
          // Take more Sanity
          finalSanity = sanityResults.slice(0, 10);
        }

        // For content queries, take fewer Supabase and more Sanity 
        const supLimit = isContentQuery ? 3 : 7;
        const sanLimit = isContentQuery ? 9 : 7;

        const topSupabase = supabaseResults.slice(0, supLimit);
        const topSanity = finalSanity.slice(0, sanLimit);

        results = [...topSupabase, ...topSanity]
          .sort((a, b) => (b.rank || 0) - (a.rank || 0))
          .slice(0, 15);
      } catch (sanityErr) {
        // Silent - Sanity optional
      }

      if (selectedType) {
        results = results.filter((r: any) => r.entity_type === selectedType);
      }

      // Log search query (updated count includes Sanity content)
      try {
        await supabase.from('search_queries').insert({
          query: q,
          filter_type: selectedType || null,
          result_count: results.length,
        });
      } catch (logErr) {
        // Silent
      }

      // Simple "Did you mean" using trigram on name or match_text (aliases etc.) if very few results
      if (results.length < 3 && q.length > 3) {
        const { data: suggest } = await supabase
          .from("global_search_view")
          .select("name")
          .or(`name.ilike.%${q}%,match_text.ilike.%${q}%,name % ${q}`)
          .limit(1);
        if (suggest && suggest[0]?.name && suggest[0].name.toLowerCase() !== q.toLowerCase()) {
          didYouMean = suggest[0].name;
        }
      }

      // If top result has very low rank (common for pure acronym matches), still surface it prominently
      if (results.length > 0 && results[0].rank != null && results[0].rank < 0.3) {
        // re-sort or leave; the RPC already prioritizes
      }
    } catch (e: any) {
      errorMsg = e.message || "An error occurred while searching.";
    }
  }

  const getFilterUrl = (type: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    return `/search?${params.toString()}`;
  };

  // GOV.UK-style snippet highlighting for matched terms
  function highlight(text: string | null | undefined, term: string): string {
    if (!text || !term) return text || '';
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, 'gi');
    return text.replace(regex, '<mark style="background:#ffeb3b; padding:1px 3px; font-weight:600; border-radius:2px;">$1</mark>');
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Search Results", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">Search Results</h1>

            {/* GOV.UK-style search with autocomplete */}
            <div className="govuk-form-group govuk-!-margin-bottom-6" style={{ background: '#f3f2f1', padding: '15px', borderLeft: '4px solid #002147' }}>
              <label className="govuk-label govuk-!-font-weight-bold">
                Search government entities, services or laws
              </label>
              <div style={{ maxWidth: '600px', marginTop: '6px' }}>
                <SearchAutocomplete 
                  initialQuery={q} 
                  placeholder="Try 'ministry', 'governor', 'IEBC' or a county..." 
                />
              </div>
              {selectedType && (
                <input type="hidden" name="type" value={selectedType} />
              )}
              <p className="govuk-body-s govuk-!-margin-top-1" style={{ color: '#505a5f' }}>
                Typo tolerant • Supports alternate names, aliases and partial matches across government data + guides/services
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Classification Categorization Faceted Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-4">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Filter by type</h2>
            
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href={getFilterUrl("")} className="govuk-link" style={{ fontWeight: selectedType === "" ? "bold" : "normal", textDecoration: selectedType === "" ? "none" : "underline" }}>
                    All results
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Institution")} className="govuk-link" style={{ fontWeight: selectedType === "Institution" ? "bold" : "normal", textDecoration: selectedType === "Institution" ? "none" : "underline" }}>
                    Institutions &amp; Bodies
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Leader")} className="govuk-link" style={{ fontWeight: selectedType === "Leader" ? "bold" : "normal", textDecoration: selectedType === "Leader" ? "none" : "underline" }}>
                    Leaders &amp; Profiles
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Official")} className="govuk-link" style={{ fontWeight: selectedType === "Official" ? "bold" : "normal", textDecoration: selectedType === "Official" ? "none" : "underline" }}>
                    Public Officials
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("County")} className="govuk-link" style={{ fontWeight: selectedType === "County" ? "bold" : "normal", textDecoration: selectedType === "County" ? "none" : "underline" }}>
                    Counties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Constituency")} className="govuk-link" style={{ fontWeight: selectedType === "Constituency" ? "bold" : "normal", textDecoration: selectedType === "Constituency" ? "none" : "underline" }}>
                    Constituencies
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Ward")} className="govuk-link" style={{ fontWeight: selectedType === "Ward" ? "bold" : "normal", textDecoration: selectedType === "Ward" ? "none" : "underline" }}>
                    Wards
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Political Party")} className="govuk-link" style={{ fontWeight: selectedType === "Political Party" ? "bold" : "normal", textDecoration: selectedType === "Political Party" ? "none" : "underline" }}>
                    Political Parties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Guide")} className="govuk-link" style={{ fontWeight: selectedType === "Guide" ? "bold" : "normal", textDecoration: selectedType === "Guide" ? "none" : "underline" }}>
                    Guides &amp; How-to
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Service")} className="govuk-link" style={{ fontWeight: selectedType === "Service" ? "bold" : "normal", textDecoration: selectedType === "Service" ? "none" : "underline" }}>
                    Public Services
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("News")} className="govuk-link" style={{ fontWeight: selectedType === "News" ? "bold" : "normal", textDecoration: selectedType === "News" ? "none" : "underline" }}>
                    News &amp; Updates
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Presidential Trip")} className="govuk-link" style={{ fontWeight: selectedType === "Presidential Trip" ? "bold" : "normal", textDecoration: selectedType === "Presidential Trip" ? "none" : "underline" }}>
                    Presidential Trips
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Act of Parliament")} className="govuk-link" style={{ fontWeight: selectedType === "Act of Parliament" ? "bold" : "normal", textDecoration: selectedType === "Act of Parliament" ? "none" : "underline" }}>
                    Acts &amp; Laws
                  </Link>
                </li>
              </ul>
          </div>

          {/* Results Output Stream Component */}
          <div className="govuk-grid-column-two-thirds">
            {errorMsg ? (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">Search Processing Error</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body-s">{errorMsg}</p>
                </div>
              </div>
            ) : q ? (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2" aria-live="polite">
                  {results.length} result{results.length !== 1 ? "s" : ""} for <strong>“{q}”</strong>
                </h2>

                {didYouMean && (
                  <p className="govuk-body-s govuk-!-margin-bottom-4">
                    Did you mean <Link href={`${getFilterUrl(selectedType)}&q=${encodeURIComponent(didYouMean)}`} className="govuk-link">{didYouMean}</Link>?
                  </p>
                )}

                {/* Enhanced low-confidence "Did you mean" banner (GOV.UK style) - only for really poor matches */}
                {results.length > 0 && results[0]?.rank != null && results[0].rank < 0.3 && !didYouMean && (
                  <div className="govuk-inset-text govuk-!-margin-bottom-4" style={{ background: '#f3f2f1', padding: '10px 12px', borderLeft: '4px solid #00703c' }}>
                    Showing lower confidence matches for “{q}”. Try a different spelling or more specific term.
                  </div>
                )}

                {results.length > 0 ? (
                  <ul className="govuk-list" style={{ borderTop: '1px solid #bfc1c3', padding: 0, margin: 0 }}>
                    {results.map((item, idx) => (
                      <li key={`${item.id || item.slug}-${idx}`} style={{ padding: '16px 0', borderBottom: '1px solid #e6e6e6' }}>
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f', display: 'block', marginBottom: '2px' }}>
                          {item.entity_type}
                        </span>
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link href={`${item.base_route}/${item.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            <span dangerouslySetInnerHTML={{ __html: highlight(item.name, q) }} />
                          </Link>
                        </h3>
                        {item.snippet && (
                          <p 
                            className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" 
                            style={{ color: '#353c3f', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            dangerouslySetInnerHTML={{ __html: highlight(item.snippet, q) }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="govuk-body govuk-!-margin-top-4">
                    <p>No matches found.</p>
                    <p className="govuk-body-s">Try a shorter term or different spelling. Search supports fuzzy matching and many typos automatically.</p>
                  </div>
                )}
              </>
            ) : (
              <p className="govuk-body govuk-!-margin-top-4">Type a term (e.g. "IEBC", "governor", "passport") to search government institutions, leaders, guides, services and official content.</p>
            )}

            
          </div>
        </div>
      </main>
    </div>
  );
}

