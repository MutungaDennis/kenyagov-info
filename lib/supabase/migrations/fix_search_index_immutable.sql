-- QUICK FIX for:
-- ERROR: 42P17: functions in index expression must be marked IMMUTABLE
--
-- Cause: array_to_string() is STABLE, not IMMUTABLE.
-- Solution: immutable wrapper function + correct index expressions.

-- 1. Create the required IMMUTABLE wrapper (safe to run multiple times)
CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr text[], sep text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT array_to_string($1, $2);
$$;

-- 2. (Optional) Drop any partially-created bad indexes if they exist
-- These will only succeed if the bad indexes were created before the error.
DROP INDEX IF EXISTS idx_institutions_aliases_trgm;
DROP INDEX IF EXISTS idx_institutions_common_misspellings_trgm;
DROP INDEX IF EXISTS idx_institutions_former_names_trgm;

-- 3. Recreate the trigram indexes on array-derived text using the immutable wrapper
CREATE INDEX IF NOT EXISTS idx_institutions_aliases_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(aliases, ' ')) gin_trgm_ops );

CREATE INDEX IF NOT EXISTS idx_institutions_common_misspellings_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(common_misspellings, ' ')) gin_trgm_ops );

CREATE INDEX IF NOT EXISTS idx_institutions_former_names_trgm 
  ON public.institutions USING gin ( (public.immutable_array_to_string(former_names, ' ')) gin_trgm_ops );

-- The other indexes in the main migration (name, short_name, official_name, and the ones on leaders/officials/etc.)
-- use direct columns so they do not have this problem and should already be fine or will succeed.

COMMENT ON FUNCTION public.immutable_array_to_string(text[], text) IS 'IMMUTABLE wrapper so we can use array_to_string inside GIN trigram index expressions.';

-- After running this, the indexes that were failing should now be creatable.
-- You can then continue with (or re-run) the rest of enhance_unified_search.sql.