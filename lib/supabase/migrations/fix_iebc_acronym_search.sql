-- Fix for "iebc" not showing in search (but full name + typos do)
-- Root cause: trigram similarity on long match_text string was too low for short 4-char acronyms.
-- Solution: use word_similarity (designed exactly for this - matching a short "word"/acronym inside longer text)
-- Also ensure vectors are fresh.

-- 1. Drop & recreate function with word_similarity
DROP FUNCTION IF EXISTS public.search_public(text, text, integer);

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

  -- Thresholds tuned for short acronyms
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

GRANT EXECUTE ON FUNCTION public.search_public(text, text, int) TO anon, authenticated;

-- 2. Force refresh of search_vector on institutions (important if vectors were built before full alias trigger)
UPDATE public.institutions 
SET name = name 
WHERE is_active = true;

-- 3. Quick test (run these)
-- SELECT * FROM search_public('iebc', NULL, 5);
-- SELECT * FROM search_public('IEBC', NULL, 5);
-- SELECT * FROM search_public('iebc', NULL, 5);   -- lower case

COMMENT ON FUNCTION public.search_public(text, text, int) IS 'Uses word_similarity for acronyms like IEBC inside match_text (aliases etc).';