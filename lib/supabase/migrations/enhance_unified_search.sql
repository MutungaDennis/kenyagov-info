-- =====================================================
-- ENHANCE UNIFIED SEARCH - GOV.UK style
-- Run this in Supabase SQL Editor (or as migration)
-- Assumes extensions already enabled: pg_trgm, unaccent, fuzzystrmatch, vector, dict_xsyn
--
-- IMPORTANT: This file now includes the immutable wrapper
-- required for trigram expression indexes.
-- If you hit "functions in index expression must be marked IMMUTABLE",
-- run the smaller companion file first:
--   lib/supabase/migrations/fix_search_index_immutable.sql
-- =====================================================

-- 1. Add trigram indexes for fuzzy matching on key searchable columns
-- Note: index expressions must be IMMUTABLE, so we use a wrapper for array_to_string.

-- Helper immutable functions (required for expression indexes)
CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr text[], sep text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT array_to_string($1, $2);
$$;

-- Institutions (already has good schema with aliases, misspellings, search_boost)
CREATE INDEX IF NOT EXISTS idx_institutions_name_trgm 
  ON public.institutions USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_institutions_short_name_trgm 
  ON public.institutions USING gin (short_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_institutions_official_name_trgm 
  ON public.institutions USING gin (official_name gin_trgm_ops);

-- For array fields, use the immutable wrapper
CREATE INDEX IF NOT EXISTS idx_institutions_aliases_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(aliases, ' ')) gin_trgm_ops );
CREATE INDEX IF NOT EXISTS idx_institutions_common_misspellings_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(common_misspellings, ' ')) gin_trgm_ops );
CREATE INDEX IF NOT EXISTS idx_institutions_former_names_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(former_names, ' ')) gin_trgm_ops );

-- Leaders
CREATE INDEX IF NOT EXISTS idx_leaders_name_trgm 
  ON public.leaders USING gin (name gin_trgm_ops);

-- Officials
CREATE INDEX IF NOT EXISTS idx_officials_full_name_trgm 
  ON public.officials USING gin (full_name gin_trgm_ops);

-- Geo
CREATE INDEX IF NOT EXISTS idx_counties_name_trgm 
  ON public.counties USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_constituencies_name_trgm 
  ON public.constituencies USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_wards_name_trgm 
  ON public.wards USING gin (name gin_trgm_ops);

-- Political
CREATE INDEX IF NOT EXISTS idx_political_parties_name_trgm 
  ON public.political_parties USING gin (name gin_trgm_ops);

-- 2. Enhance / add search_vector columns + improved triggers using unaccent + weights

-- Institutions: improve the existing trigger/function to be richer
CREATE OR REPLACE FUNCTION public.institutions_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.short_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.official_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(array_to_string(NEW.aliases, ' '), ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(array_to_string(NEW.former_names, ' '), ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(array_to_string(NEW.common_misspellings, ' '), ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.mandate, ''))), 'C');
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on institutions
DROP TRIGGER IF EXISTS institutions_search_vector_trigger ON public.institutions;
CREATE TRIGGER institutions_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, short_name, official_name, aliases, former_names, common_misspellings, description, mandate
  ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.institutions_search_vector_update();

-- Recompute vectors for existing rows (touch a watched column so the trigger fires)
-- Run these after the main migration if some rows have stale/empty search_vector
UPDATE public.institutions 
SET name = name 
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

UPDATE public.leaders SET name = name WHERE search_vector IS NULL OR search_vector = ''::tsvector;
UPDATE public.officials SET full_name = full_name WHERE search_vector IS NULL OR search_vector = ''::tsvector;
UPDATE public.counties SET name = name WHERE search_vector IS NULL OR search_vector = ''::tsvector;
UPDATE public.constituencies SET name = name WHERE search_vector IS NULL OR search_vector = ''::tsvector;
UPDATE public.wards SET name = name WHERE search_vector IS NULL OR search_vector = ''::tsvector;
UPDATE public.political_parties SET name = name WHERE search_vector IS NULL OR search_vector = ''::tsvector;

-- 3. Add search_vector + triggers to other core tables for broad coverage

-- Leaders
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_leaders_search_vector ON public.leaders USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.leaders_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.organization, ''))), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leaders_search_vector_trigger ON public.leaders;
CREATE TRIGGER leaders_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, title, description, organization
  ON public.leaders FOR EACH ROW EXECUTE FUNCTION public.leaders_search_vector_update();

-- Officials (primary current officials table)
ALTER TABLE public.officials ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_officials_search_vector ON public.officials USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.officials_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.full_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.bio, ''))), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS officials_search_vector_trigger ON public.officials;
CREATE TRIGGER officials_search_vector_trigger
  BEFORE INSERT OR UPDATE OF full_name, bio
  ON public.officials FOR EACH ROW EXECUTE FUNCTION public.officials_search_vector_update();

-- Counties
ALTER TABLE public.counties ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_counties_search_vector ON public.counties USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.counties_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.headquarters, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.region, ''))), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS counties_search_vector_trigger ON public.counties;
CREATE TRIGGER counties_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, headquarters, region
  ON public.counties FOR EACH ROW EXECUTE FUNCTION public.counties_search_vector_update();

-- Constituencies
ALTER TABLE public.constituencies ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_constituencies_search_vector ON public.constituencies USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.constituencies_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS constituencies_search_vector_trigger ON public.constituencies;
CREATE TRIGGER constituencies_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name
  ON public.constituencies FOR EACH ROW EXECUTE FUNCTION public.constituencies_search_vector_update();

-- Wards
ALTER TABLE public.wards ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_wards_search_vector ON public.wards USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.wards_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wards_search_vector_trigger ON public.wards;
CREATE TRIGGER wards_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name
  ON public.wards FOR EACH ROW EXECUTE FUNCTION public.wards_search_vector_update();

-- Political parties
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_political_parties_search_vector ON public.political_parties USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.political_parties_search_vector_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS political_parties_search_vector_trigger ON public.political_parties;
CREATE TRIGGER political_parties_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name
  ON public.political_parties FOR EACH ROW EXECUTE FUNCTION public.political_parties_search_vector_update();

-- 4. Recompute vectors for existing data (force trigger)
UPDATE public.leaders SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE public.officials SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE public.counties SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE public.constituencies SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE public.wards SET search_vector = NULL WHERE search_vector IS NOT NULL;
UPDATE public.political_parties SET search_vector = NULL WHERE search_vector IS NOT NULL;
-- Institutions already handled by its trigger on prior changes

-- 5. Create / replace a rich global_search_view (broad coverage)
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

-- 6. Optional: simple search RPC for hybrid FTS + fuzzy (recommended for best gov.uk-like ranking + typo tolerance)
-- You can call via supabase.rpc('search_public', { q: 'ministry', filter_type: null, lim: 40 })

-- IMPORTANT: Drop first to allow changing return type (double precision vs real from previous versions)
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

  -- Expand short queries using known Kenyan acronyms & common misspellings
  SELECT string_agg(DISTINCT expansion, ' ')
  INTO expanded_terms
  FROM public.search_expansions
  WHERE lower(trim(original)) = lower(trim(q));

  IF expanded_terms IS NOT NULL THEN
    q := q || ' ' || expanded_terms;   -- search both the typed term and its expansion
  END IF;

  -- Lower thresholds for short acronyms like "IEBC" (use word_similarity for substring/acronym matches inside longer text)
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
    -- Hybrid rank: FTS rank * boost + word_similarity (better for acronyms inside aliases/match_text) + regular similarity
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
      OR word_similarity(q, coalesce(v.match_text, v.name)) >= 0.1   -- word trigram for acronyms/aliases in long text
      OR (v.snippet IS NOT NULL AND word_similarity(q, v.snippet) >= 0.1)
      OR coalesce(v.match_text, v.name) % q   -- fallback regular similarity
    )
  ORDER BY rank DESC
  LIMIT lim;
END;
$$;

-- Grant for anon (public search)
GRANT EXECUTE ON FUNCTION public.search_public(text, text, int) TO anon, authenticated;

-- 7. (Optional future) Example synonym dictionary setup using dict_xsyn (advanced)
-- You can create a custom dictionary later for things like ministry<->department.
-- For now the trigram + FTS + aliases in data give excellent tolerance.

COMMENT ON VIEW public.global_search_view IS 'Broad unified searchable content across institutions, leaders, officials, geo, parties. Use with search_public() RPC for best results.';
COMMENT ON FUNCTION public.search_public(text, text, int) IS 'Gov.uk-style hybrid search: full-text + trigram fuzzy + boost. Typo tolerant.';

-- After running, re-seed or UPDATE existing rows so triggers populate vectors if data exists.
-- Then test: SELECT * FROM search_public('ministry of', null, 10); 

-- Done. Now update the frontend to use search_public() rpc where possible + improved UX.