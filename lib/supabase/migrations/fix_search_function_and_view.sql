-- FIX for:
-- 1. ERROR: structure of query does not match function result type
--    (Returned type double precision does not match expected type real in column 7)
-- 2. Improve matching for short acronyms like "IEBC" (when it's in aliases/short_name/common_misspellings)

-- Re-create the view with a match_text column that includes aliases etc. for trigram
DROP VIEW IF EXISTS public.global_search_view;

CREATE OR REPLACE VIEW public.global_search_view AS
  -- Institutions (primary rich source) - include match_text so trigram can hit aliases, short names, misspellings
  SELECT 
    id::text AS id,
    slug,
    name,
    description AS snippet,
    'Institution' AS entity_type,
    '/institutions' AS base_route,
    search_vector,
    COALESCE(search_boost, 10) AS rank_boost,   -- institutions get higher default boost
    (COALESCE(name,'') || ' ' || COALESCE(short_name,'') || ' ' || COALESCE(official_name,'') || ' ' || 
     COALESCE(array_to_string(aliases, ' '), '') || ' ' || COALESCE(array_to_string(common_misspellings, ' '), '') || ' ' ||
     COALESCE(array_to_string(former_names, ' '), '')) AS match_text
  FROM public.institutions 
  WHERE is_active = true

  UNION ALL

  -- Leaders
  SELECT 
    id::text,
    slug,
    name,
    description AS snippet,
    'Leader' AS entity_type,
    '/leaders' AS base_route,
    search_vector,
    5,
    (COALESCE(name,'') || ' ' || COALESCE(title,'') || ' ' || COALESCE(organization,'')) AS match_text
  FROM public.leaders

  UNION ALL

  -- Officials
  SELECT 
    id::text,
    id AS slug,  -- officials use id for routing
    full_name AS name,
    bio AS snippet,
    'Official' AS entity_type,
    '/officials' AS base_route,
    search_vector,
    8,
    (COALESCE(full_name,'') || ' ' || COALESCE(bio,'')) AS match_text
  FROM public.officials 
  WHERE is_active = true

  UNION ALL

  -- Counties
  SELECT 
    id::text,
    slug,
    name,
    NULL AS snippet,
    'County' AS entity_type,
    '/counties' AS base_route,
    search_vector,
    6,
    (COALESCE(name,'') || ' ' || COALESCE(headquarters,'') || ' ' || COALESCE(region,'')) AS match_text
  FROM public.counties 
  WHERE is_active = true

  UNION ALL

  -- Constituencies
  SELECT 
    id::text,
    slug,
    name,
    NULL,
    'Constituency' AS entity_type,
    '/counties' AS base_route,
    search_vector,
    4,
    name AS match_text
  FROM public.constituencies

  UNION ALL

  -- Wards
  SELECT 
    id::text,
    slug,
    name,
    NULL,
    'Ward' AS entity_type,
    '/counties' AS base_route,
    search_vector,
    3,
    name AS match_text
  FROM public.wards

  UNION ALL

  -- Political Parties
  SELECT 
    id::text,
    id::text AS slug,
    name,
    NULL,
    'Political Party' AS entity_type,
    '/politics/political-parties' AS base_route,
    search_vector,
    4,
    name AS match_text
  FROM public.political_parties;

-- Re-create the fixed search_public function
CREATE OR REPLACE FUNCTION public.search_public(
  q text,
  filter_type text DEFAULT NULL,
  lim int DEFAULT 40
)
RETURNS TABLE (
  id text,
  slug text,
  name text,
  snippet text,
  entity_type text,
  base_route text,
  rank double precision
) 
LANGUAGE plpgsql AS $$
DECLARE
  tsq tsquery;
BEGIN
  IF q IS NULL OR trim(q) = '' THEN
    RETURN;
  END IF;

  -- Lower threshold helps very short terms and acronyms like "IEBC", "KRA"
  PERFORM set_config('pg_trgm.similarity_threshold', '0.15', true);

  tsq := websearch_to_tsquery('english', q);

  RETURN QUERY
  SELECT 
    v.id,
    v.slug,
    v.name,
    v.snippet,
    v.entity_type,
    v.base_route,
    -- Hybrid rank: FTS rank * boost + trigram similarity boost (now using match_text which includes aliases etc.)
    (
      COALESCE(ts_rank(v.search_vector, tsq), 0) * v.rank_boost +
      GREATEST(
        similarity(coalesce(v.match_text, v.name), q),
        similarity(coalesce(v.snippet, ''), q)
      ) * 2.0
    ) AS rank
  FROM public.global_search_view v
  WHERE 
    (filter_type IS NULL OR v.entity_type = filter_type)
    AND (
      v.search_vector @@ tsq
      OR coalesce(v.match_text, v.name) % q   -- trigram fuzzy on rich text (name + aliases + variants)
      OR (v.snippet IS NOT NULL AND v.snippet % q)
    )
  ORDER BY rank DESC
  LIMIT lim;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_public(text, text, int) TO anon, authenticated;

-- Optional: force a quick recompute for institutions so match_text is reflected in vectors if needed
-- (the trigger already includes aliases in search_vector)
UPDATE public.institutions SET name = name WHERE is_active = true;

COMMENT ON VIEW public.global_search_view IS 'Broad view with match_text for better fuzzy/acronym support.';
COMMENT ON FUNCTION public.search_public(text, text, int) IS 'Hybrid search (FTS + trigram on match_text). Fixed rank type + lower trigram threshold + alias support.';