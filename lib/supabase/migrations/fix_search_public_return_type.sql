-- ============================================================
-- FIX: cannot change return type of existing function
-- Run this entire block in Supabase SQL Editor
-- ============================================================

-- 1. Drop the old function (required when return type changed, e.g. real -> double precision)
DROP FUNCTION IF EXISTS public.search_public(text, text, integer);

-- 2. Recreate view with match_text (so trigram can match aliases, short_name, misspellings, etc.)
DROP VIEW IF EXISTS public.global_search_view;

CREATE OR REPLACE VIEW public.global_search_view AS
  SELECT 
    id::text AS id,
    slug,
    name,
    description AS snippet,
    'Institution' AS entity_type,
    '/institutions' AS base_route,
    search_vector,
    COALESCE(search_boost, 10) AS rank_boost,
    (COALESCE(name,'') || ' ' || COALESCE(short_name,'') || ' ' || COALESCE(official_name,'') || ' ' || 
     COALESCE(array_to_string(aliases, ' '), '') || ' ' || COALESCE(array_to_string(common_misspellings, ' '), '') || ' ' ||
     COALESCE(array_to_string(former_names, ' '), '')) AS match_text
  FROM public.institutions 
  WHERE is_active = true

  UNION ALL

  SELECT 
    id::text, slug, name, description, 'Leader', '/leaders', search_vector, 5,
    (COALESCE(name,'') || ' ' || COALESCE(title,'') || ' ' || COALESCE(organization,'')) AS match_text
  FROM public.leaders

  UNION ALL

  SELECT 
    id::text, id, full_name, bio, 'Official', '/officials', search_vector, 8,
    (COALESCE(full_name,'') || ' ' || COALESCE(bio,'')) AS match_text
  FROM public.officials 
  WHERE is_active = true

  UNION ALL

  SELECT 
    id::text, slug, name, NULL, 'County', '/counties', search_vector, 6,
    (COALESCE(name,'') || ' ' || COALESCE(headquarters,'') || ' ' || COALESCE(region,'')) AS match_text
  FROM public.counties 
  WHERE is_active = true

  UNION ALL

  SELECT id::text, slug, name, NULL, 'Constituency', '/counties', search_vector, 4, name AS match_text
  FROM public.constituencies

  UNION ALL

  SELECT id::text, slug, name, NULL, 'Ward', '/counties', search_vector, 3, name AS match_text
  FROM public.wards

  UNION ALL

  SELECT id::text, id::text, name, NULL, 'Political Party', '/politics/political-parties', search_vector, 4, name AS match_text
  FROM public.political_parties;

-- 3. Recreate the function with correct return type + match_text support + lower trigram threshold for acronyms
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

  -- Lower thresholds for short acronyms like "IEBC" (word_similarity for substring/acronym in long text)
  PERFORM set_config('pg_trgm.similarity_threshold', '0.15', true);
  PERFORM set_config('pg_trgm.word_similarity_threshold', '0.1', true);

  tsq := websearch_to_tsquery('english', q);

  RETURN QUERY
  SELECT 
    v.id,
    v.slug,
    v.name,
    v.snippet,
    v.entity_type,
    v.base_route,
    (
      COALESCE(ts_rank(v.search_vector, tsq), 0) * v.rank_boost +
      GREATEST(
        word_similarity(q, coalesce(v.match_text, v.name)),
        word_similarity(q, coalesce(v.snippet, '')),
        similarity(coalesce(v.match_text, v.name), q) * 0.5
      ) * 2.0
    ) AS rank
  FROM public.global_search_view v
  WHERE 
    (filter_type IS NULL OR v.entity_type = filter_type)
    AND (
      v.search_vector @@ tsq
      OR word_similarity(q, coalesce(v.match_text, v.name)) >= 0.1
      OR (v.snippet IS NOT NULL AND word_similarity(q, v.snippet) >= 0.1)
      OR coalesce(v.match_text, v.name) % q
    )
  ORDER BY rank DESC
  LIMIT lim;
END;
$$;

-- 4. Permissions
GRANT EXECUTE ON FUNCTION public.search_public(text, text, int) TO anon, authenticated;

-- 5. Optional: touch rows to refresh vectors (harmless)
UPDATE public.institutions SET name = name WHERE is_active = true;

-- Test after running:
-- SELECT * FROM search_public('IEBC', NULL, 5);
-- SELECT * FROM search_public('governer', NULL, 5);

COMMENT ON FUNCTION public.search_public(text, text, int) IS 'Hybrid search (FTS + trigram on match_text for aliases). Fixed return type.';