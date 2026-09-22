-- Public schools join the institution directory without duplicating school rows.
-- Preserve imported names and old URLs; private schools remain admin-only.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';

ALTER TABLE public.education_schools
  ADD COLUMN IF NOT EXISTS parent_institution_id uuid REFERENCES public.institutions(id),
  ADD COLUMN IF NOT EXISTS supervising_ministry_id uuid REFERENCES public.institutions(id);

CREATE TABLE public.education_school_slug_aliases (
  slug text PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.education_schools(id) ON DELETE CASCADE
);
ALTER TABLE public.education_school_slug_aliases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.education_school_slug_aliases FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.education_school_slug_aliases TO anon, authenticated;
GRANT ALL ON public.education_school_slug_aliases TO service_role;
CREATE INDEX education_school_slug_aliases_school_idx ON public.education_school_slug_aliases(school_id);
INSERT INTO public.education_school_slug_aliases(slug,school_id)
SELECT slug,id FROM public.education_schools;

CREATE OR REPLACE FUNCTION public.education_school_slug_base(school_name text)
RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, extensions
AS $function$
DECLARE value text;
BEGIN
  -- Preserve initials (A.I.C., A I C) rather than mistaking A for an article.
  value := regexp_replace(school_name, '\m([A-Z])[. ]+([A-Z])[. ]+([A-Z])\M', '\1\2\3', 'g');
  value := regexp_replace(value, '\m([A-Z])[. ]+([A-Z])\M', '\1\2', 'g');
  value := lower(extensions.unaccent(value));
  value := regexp_replace(value, '[''’]', '', 'g');
  value := regexp_replace(value, '[^a-z0-9]+', ' ', 'g');
  value := regexp_replace(value, '\m(a|an|the)\M', '', 'g');
  value := trim(both '-' from regexp_replace(btrim(value), '\s+', '-', 'g'));
  RETURN coalesce(nullif(rtrim(left(value,160),'-'),''),'school');
END $function$;
REVOKE ALL ON FUNCTION public.education_school_slug_base(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.education_school_slug_base(text) TO service_role;

-- County names disambiguate schools with the same name. A short stable ID is
-- used only if the name and county still collide, including institution URLs.
CREATE TEMP TABLE school_slug_plan ON COMMIT DROP AS
WITH names AS (
  SELECT id, public.education_school_slug_base(official_name) AS base,
    public.education_school_slug_base(coalesce(county,'kenya')) AS county_slug
  FROM public.education_schools
), grouped AS (
  SELECT *, count(*) OVER (PARTITION BY base) AS duplicates FROM names
), candidates AS (
  SELECT id, CASE WHEN duplicates>1 OR EXISTS(SELECT 1 FROM public.institutions i WHERE i.slug=g.base)
    THEN base || '-' || county_slug ELSE base END AS candidate FROM grouped g
), ranked AS (
  SELECT *, count(*) OVER(PARTITION BY candidate) AS duplicates FROM candidates
)
SELECT id, CASE WHEN duplicates>1
  OR EXISTS(SELECT 1 FROM public.institutions i WHERE i.slug=r.candidate)
  OR EXISTS(SELECT 1 FROM public.education_school_slug_aliases a WHERE a.slug=r.candidate AND a.school_id<>r.id)
  THEN candidate || '-' || left(id::text,8) ELSE candidate END AS slug FROM ranked r;
DO $check_slugs$
BEGIN
  IF EXISTS(SELECT slug FROM school_slug_plan GROUP BY slug HAVING count(*)>1)
    OR EXISTS(SELECT 1 FROM school_slug_plan p JOIN public.institutions i USING(slug))
    OR EXISTS(SELECT 1 FROM school_slug_plan p JOIN public.education_school_slug_aliases a USING(slug) WHERE a.school_id<>p.id)
  THEN RAISE EXCEPTION 'School URL collision: aborting migration'; END IF;
END $check_slugs$;
-- Two passes avoid unique conflicts when one new slug matches another old slug.
UPDATE public.education_schools SET slug='school-url-transition-'||id::text;
UPDATE public.education_schools s SET slug=p.slug FROM school_slug_plan p WHERE p.id=s.id;

CREATE OR REPLACE FUNCTION public.education_school_governance()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $function$
DECLARE parent_slug text;
BEGIN
  IF NEW.ownership='public' AND NEW.main_tier IN ('primary','junior','senior_secondary') THEN
    parent_slug := CASE WHEN NEW.main_tier='senior_secondary' THEN 'directorate-secondary-education' ELSE 'directorate-primary-education' END;
    SELECT id INTO STRICT NEW.parent_institution_id FROM public.institutions WHERE slug=parent_slug;
    SELECT id INTO STRICT NEW.supervising_ministry_id FROM public.institutions WHERE slug='ministry-education';
  ELSE
    NEW.parent_institution_id := NULL;
    NEW.supervising_ministry_id := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.education_school_governance() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.education_school_governance() TO service_role;
CREATE TRIGGER education_school_governance
  BEFORE INSERT OR UPDATE OF ownership, main_tier, parent_institution_id, supervising_ministry_id
  ON public.education_schools FOR EACH ROW EXECUTE FUNCTION public.education_school_governance();
UPDATE public.education_schools SET main_tier=main_tier;

-- Lock a URL namespace shared by institutions, schools and legacy school URLs.
-- Keep canonical URLs stable when an administrator corrects a display name.
CREATE OR REPLACE FUNCTION public.guard_school_institution_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('institution-url:'||NEW.slug,0));
  IF TG_TABLE_NAME='education_schools' THEN
    IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Invalid school slug'; END IF;
    IF EXISTS(SELECT 1 FROM public.institutions WHERE slug=NEW.slug)
      OR EXISTS(SELECT 1 FROM public.education_school_slug_aliases WHERE slug=NEW.slug AND school_id<>NEW.id)
    THEN RAISE EXCEPTION 'School slug conflicts with an existing URL'; END IF;
    IF TG_OP='UPDATE' AND OLD.slug<>NEW.slug THEN
      INSERT INTO public.education_school_slug_aliases(slug,school_id) VALUES(OLD.slug,NEW.id)
      ON CONFLICT(slug) DO NOTHING;
    END IF;
  ELSE
    IF EXISTS(SELECT 1 FROM public.education_schools WHERE slug=NEW.slug)
      OR EXISTS(SELECT 1 FROM public.education_school_slug_aliases WHERE slug=NEW.slug)
    THEN RAISE EXCEPTION 'Institution slug conflicts with an existing school URL'; END IF;
  END IF;
  RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.guard_school_institution_slug() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_school_institution_slug() TO service_role;
CREATE TRIGGER guard_school_slug BEFORE INSERT OR UPDATE OF slug ON public.education_schools
  FOR EACH ROW EXECUTE FUNCTION public.guard_school_institution_slug();
CREATE TRIGGER guard_institution_school_slug BEFORE INSERT OR UPDATE OF slug ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.guard_school_institution_slug();

ALTER POLICY public_read ON public.education_schools USING (ownership='public');
ALTER POLICY authenticated_read ON public.education_schools
  USING (ownership='public' OR (SELECT private.cg_is_admin()));
DO $related$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['education_school_aliases','education_school_identifiers','education_school_offerings','education_school_source_records'] LOOP
    EXECUTE format('ALTER POLICY public_read ON public.%I USING (EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=%I.school_id AND s.ownership=''public''))',table_name,table_name);
    EXECUTE format('ALTER POLICY authenticated_read ON public.%I USING ((SELECT private.cg_is_admin()) OR EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=%I.school_id AND s.ownership=''public''))',table_name,table_name);
  END LOOP;
END $related$;
CREATE POLICY public_read ON public.education_school_slug_aliases FOR SELECT TO anon
  USING(EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=school_id AND s.ownership='public'));
CREATE POLICY authenticated_read ON public.education_school_slug_aliases FOR SELECT TO authenticated
  USING((SELECT private.cg_is_admin()) OR EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=school_id AND s.ownership='public'));
ALTER VIEW public.education_school_directory SET(security_invoker=true);

CREATE INDEX education_schools_public_name_idx ON public.education_schools(official_name,id) WHERE ownership='public';
CREATE INDEX education_schools_public_filters_idx ON public.education_schools(county_code,main_tier,official_name,id) WHERE ownership='public';
CREATE INDEX education_schools_parent_idx ON public.education_schools(parent_institution_id);
CREATE INDEX education_schools_ministry_idx ON public.education_schools(supervising_ministry_id);
CREATE INDEX education_schools_public_search_idx ON public.education_schools USING gin(official_name extensions.gin_trgm_ops) WHERE ownership='public';

DO $verify$
DECLARE total_count bigint; public_count bigint; visible_count bigint; admin_id uuid;
BEGIN
  SELECT count(*),count(*) FILTER(WHERE ownership='public') INTO total_count,public_count FROM public.education_schools;
  IF EXISTS(SELECT 1 FROM public.education_schools s LEFT JOIN public.institutions p ON p.id=s.parent_institution_id LEFT JOIN public.institutions m ON m.id=s.supervising_ministry_id
    WHERE s.ownership='public' AND s.main_tier IN('primary','junior','senior_secondary') AND
      (p.slug IS DISTINCT FROM CASE WHEN s.main_tier='senior_secondary' THEN 'directorate-secondary-education' ELSE 'directorate-primary-education' END OR m.slug IS DISTINCT FROM 'ministry-education'))
  THEN RAISE EXCEPTION 'Incorrect school hierarchy'; END IF;
  SELECT id INTO STRICT admin_id FROM public.profiles WHERE is_admin IS TRUE LIMIT 1;
  PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
  PERFORM set_config('request.jwt.claim.sub','',true);
  SET LOCAL ROLE anon;
  SELECT count(*) INTO visible_count FROM public.education_schools;
  IF visible_count<>public_count THEN RAISE EXCEPTION 'Public school visibility mismatch'; END IF;
  IF EXISTS(SELECT 1 FROM public.education_school_directory WHERE ownership<>'public') THEN RAISE EXCEPTION 'Private school view leakage'; END IF;
  SET LOCAL ROLE postgres;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',gen_random_uuid(),'user_metadata',jsonb_build_object('role','admin'))::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO visible_count FROM public.education_schools;
  IF visible_count<>public_count THEN RAISE EXCEPTION 'Ordinary user can see private schools'; END IF;
  SET LOCAL ROLE postgres;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',admin_id)::text,true);
  PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO visible_count FROM public.education_schools;
  IF visible_count<>total_count THEN RAISE EXCEPTION 'Admin cannot see all schools'; END IF;
  SET LOCAL ROLE postgres;
END $verify$;
NOTIFY pgrst, 'reload schema';
COMMIT;
