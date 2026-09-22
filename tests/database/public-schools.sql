-- Run after the public_school_directory migration. All test edits roll back.
BEGIN;
SET LOCAL statement_timeout = '120s';
DO $tests$
DECLARE school_id uuid; admin_id uuid; private_id uuid; expected_parent uuid; observed bigint; relation text;
BEGIN
  IF EXISTS(SELECT slug FROM public.education_schools GROUP BY slug HAVING count(*)>1)
    OR EXISTS(SELECT 1 FROM public.education_schools WHERE slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    OR EXISTS(SELECT 1 FROM public.education_schools s JOIN public.institutions i USING(slug))
  THEN RAISE EXCEPTION 'Invalid or colliding school URLs'; END IF;
  IF public.education_school_slug_base('The Example Primary School') <> 'example-primary-school'
    OR public.education_school_slug_base('A.I.C. Example Primary') <> 'aic-example-primary'
  THEN RAISE EXCEPTION 'Slug normalization regression'; END IF;
  SELECT id INTO STRICT admin_id FROM public.profiles WHERE is_admin IS TRUE LIMIT 1;
  SELECT id INTO STRICT school_id FROM public.education_schools WHERE ownership='public' AND main_tier='primary' LIMIT 1;
  SELECT id INTO STRICT private_id FROM public.education_schools WHERE ownership='private' LIMIT 1;
  SELECT id INTO STRICT expected_parent FROM public.institutions WHERE slug='directorate-secondary-education';
  PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  UPDATE public.education_schools SET main_tier='senior_secondary' WHERE id=school_id;
  IF NOT EXISTS(SELECT 1 FROM public.education_schools WHERE id=school_id AND parent_institution_id=expected_parent AND supervising_ministry_id IS NOT NULL)
  THEN RAISE EXCEPTION 'School level change did not update governance'; END IF;
  UPDATE public.education_schools SET ownership='private' WHERE id=school_id;
  IF NOT EXISTS(SELECT 1 FROM public.education_schools WHERE id=school_id AND parent_institution_id IS NULL AND supervising_ministry_id IS NULL)
  THEN RAISE EXCEPTION 'Ownership change did not clear public governance'; END IF;
  SET LOCAL ROLE postgres;
  PERFORM set_config('request.jwt.claim.sub','',true);
  PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
  SET LOCAL ROLE anon;
  IF EXISTS(SELECT 1 FROM public.education_schools WHERE id IN(school_id,private_id))
    OR EXISTS(SELECT 1 FROM public.education_school_directory WHERE ownership<>'public')
  THEN RAISE EXCEPTION 'Private school is publicly visible'; END IF;
  FOREACH relation IN ARRAY ARRAY['education_school_aliases','education_school_identifiers','education_school_offerings','education_school_source_records','education_school_slug_aliases'] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I WHERE school_id IN($1,$2)',relation) INTO observed USING school_id,private_id;
    IF observed<>0 THEN RAISE EXCEPTION 'Private school child rows exposed: %',relation; END IF;
  END LOOP;
  SET LOCAL ROLE postgres;
END $tests$;
ROLLBACK;
