-- Execute as postgres after all 20260922_search_* migrations. No persistent writes.
BEGIN;
SET LOCAL statement_timeout='120s';
DO $checks$
DECLARE slug_found text; total bigint; result jsonb;
BEGIN
  SET LOCAL ROLE anon;
  SELECT slug INTO slug_found FROM public.search_public('IEBC',NULL,1);
  IF slug_found IS DISTINCT FROM 'iebc' THEN RAISE EXCEPTION 'Acronym ranking failed'; END IF;
  SELECT slug INTO slug_found FROM public.search_public('minstry educaton','Institution',1);
  IF slug_found IS DISTINCT FROM 'ministry-education' THEN RAISE EXCEPTION 'Institution typo search failed'; END IF;
  SELECT slug INTO slug_found FROM public.search_public('Allaince High','School',1);
  IF slug_found IS DISTINCT FROM 'alliance-high' THEN RAISE EXCEPTION 'Transposed school name failed'; END IF;
  SELECT count(*) INTO total FROM public.search_public('Constitution Article 47','Constitutional Article',100) WHERE slug<>'47';
  IF total<>0 THEN RAISE EXCEPTION 'Article numbers not exact'; END IF;
  IF EXISTS(SELECT 1 FROM public.global_search_view WHERE entity_type='School' AND name='MAGENCHE ALLIANCE')
  THEN RAISE EXCEPTION 'Private school in global search'; END IF;
  SELECT public.search_public_schools('Allaince High','directorate-secondary-education',NULL,NULL,NULL,1,20) INTO result;
  IF result->>'total'<>'1' OR result->'schools'->0->>'slug'<>'alliance-high' THEN RAISE EXCEPTION 'Scoped school search failed'; END IF;
  SELECT public.search_public_schools('Allaince High','directorate-primary-education',NULL,NULL,NULL,1,20) INTO result;
  IF result->>'total'<>'0' THEN RAISE EXCEPTION 'School directorate filter ignored'; END IF;
  SELECT public.search_public_schools('MAGENCHE ALLIANCE',NULL,NULL,NULL,NULL,1,20) INTO result;
  IF result->>'total'<>'0' THEN RAISE EXCEPTION 'Private school returned by public school RPC'; END IF;
  IF EXISTS(SELECT 1 FROM public.search_public('   % () ',NULL,20)) THEN RAISE EXCEPTION 'Punctuation-only query matched'; END IF;
  SELECT count(*) INTO total FROM public.search_public('primary','School',10000);
  IF total>100 THEN RAISE EXCEPTION 'Search limit is unbounded'; END IF;
  SET LOCAL ROLE postgres;
  IF EXISTS(SELECT 1 FROM public.global_search_view v JOIN public.documents d ON d.id::text=v.id WHERE v.entity_type='Document' AND (d.published_at IS NULL OR d.status='Draft'))
  THEN RAISE EXCEPTION 'Unpublished document exposed'; END IF;
  IF EXISTS(SELECT 1 FROM public.global_search_view WHERE base_route IN('/institutions','/leaders','/officials','/counties','/politics/political-parties'))
  THEN RAISE EXCEPTION 'Legacy result destinations remain'; END IF;
END $checks$;
ROLLBACK;
