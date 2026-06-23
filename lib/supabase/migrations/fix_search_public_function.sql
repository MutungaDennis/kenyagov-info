-- ===================================================================
-- FIX: cannot change return type of existing function
-- + Improve "IEBC"-style acronym / alias matching
--
-- Run this entire block in Supabase SQL Editor.
-- ===================================================================

-- 1. Must DROP the old function first (Postgres rule for changing return type)
DROP FUNCTION IF EXISTS public.search_public(text, text, integer);

-- 2. Recreate the VIEW with match_text column
--    (concatenates name + short_name + official_name + aliases + common_misspellings + former_names)
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

-- 3. Recreate the function (correct return type + match_text + lower trigram threshold)
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

  -- Lower threshold is important for short acronyms like "IEBC"
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
      OR coalesce(v.match_text, v.name) % q
      OR (v.snippet IS NOT NULL AND v.snippet % q)
    )
  ORDER BY rank DESC
  LIMIT lim;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_public(text, text, int) TO anon, authenticated;

-- 4. Light touch to keep vectors fresh
UPDATE public.institutions SET name = name WHERE is_active = true;

-- Test after running:
-- SELECT * FROM search_public('IEBC', NULL, 5);
-- SELECT * FROM search_public('governer', NULL, 5);