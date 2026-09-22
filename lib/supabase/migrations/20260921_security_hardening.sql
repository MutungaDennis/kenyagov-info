-- REVIEW against the deployed schema before applying. Not automatically applied.
-- Prerequisites: profiles, page_views and search_queries legacy migrations.
BEGIN;

-- Privileged profile fields are service-role only. Row ownership alone is not
-- sufficient to protect is_admin; restrict column privileges as well.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
REVOKE UPDATE (id, email, is_admin, created_at) ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Restrictive policies bound submitted analytics even if an existing
-- permissive INSERT policy remains. They do not provide per-IP rate limiting.
DROP POLICY IF EXISTS "Bound public page view input" ON public.page_views;
CREATE POLICY "Bound public page view input" ON public.page_views
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(path) BETWEEN 1 AND 2048
    AND path LIKE '/%'
    AND path NOT LIKE '//%'
    AND viewed_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'
  );

DROP POLICY IF EXISTS "Bound public search input" ON public.search_queries;
CREATE POLICY "Bound public search input" ON public.search_queries
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(query) BETWEEN 1 AND 300
    AND (filter_type IS NULL OR length(filter_type) <= 100)
    AND result_count BETWEEN 0 AND 1000000
    AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'
  );
COMMIT;
