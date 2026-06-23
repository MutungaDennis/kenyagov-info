-- Run this to add acronym/keyword/misspelling expansion + update the search function.
-- This will make "iebc" strongly match "Independent Electoral and Boundaries Commission".

-- 1. Create / seed the expansions table (safe to re-run)
CREATE TABLE IF NOT EXISTS public.search_expansions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original TEXT NOT NULL UNIQUE,
  expansion TEXT NOT NULL,
  boost NUMERIC DEFAULT 2.0,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_search_expansions_original ON public.search_expansions (original);

ALTER TABLE public.search_expansions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read expansions" ON public.search_expansions;
CREATE POLICY "Public can read expansions"
  ON public.search_expansions FOR SELECT USING (true);

-- Seed / update common ones (add more from your search_logs over time)
INSERT INTO public.search_expansions (original, expansion, boost, notes) VALUES
  ('iebc', 'Independent Electoral and Boundaries Commission', 3.5, 'Primary election body - very high volume acronym search'),
  ('kra', 'Kenya Revenue Authority', 3.0, 'Tax - extremely common'),
  ('cbk', 'Central Bank of Kenya', 2.5, ''),
  ('eacc', 'Ethics and Anti-Corruption Commission', 2.5, ''),
  ('cra', 'Commission on Revenue Allocation', 2.0, ''),
  ('src', 'Salaries and Remuneration Commission', 2.0, ''),
  ('odm', 'Orange Democratic Movement', 2.0, ''),
  ('uda', 'United Democratic Alliance', 2.0, ''),
  ('governer', 'governor', 2.0, 'Extremely common misspelling'),
  ('minstry', 'ministry', 2.0, 'Extremely common misspelling'),
  ('electrol', 'electoral', 1.5, ''),
  ('boundry', 'boundary', 1.5, ''),
  ('comission', 'commission', 1.8, ''),
  ('judicary', 'judiciary', 1.5, ''),
  ('parliment', 'parliament', 1.8, ''),
  ('mca', 'member of county assembly', 1.5, '')
ON CONFLICT (original) DO UPDATE SET 
  expansion = EXCLUDED.expansion,
  boost = GREATEST(search_expansions.boost, EXCLUDED.boost);

-- 2. Drop and recreate search_public with expansion logic + word_similarity
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
  expanded_terms text;
BEGIN
  IF q IS NULL OR trim(q) = '' THEN
    RETURN;
  END IF;

  -- Expand using our Kenyan-specific expansions table (acronyms + misspellings)
  SELECT string_agg(DISTINCT expansion, ' ')
  INTO expanded_terms
  FROM public.search_expansions
  WHERE lower(trim(original)) = lower(trim(q));

  IF expanded_terms IS NOT NULL THEN
    q := q || ' ' || expanded_terms;
  END IF;

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

-- 3. Refresh vectors so expansions + aliases are active
UPDATE public.institutions SET name = name WHERE is_active = true;

COMMENT ON TABLE public.search_expansions IS 'Kenyan-specific acronyms, common searches and misspellings to improve short-query recall (Google-style).';
COMMENT ON FUNCTION public.search_public(text, text, int) IS 'Now expands queries using search_expansions table + prioritizes word_similarity for acronyms.';