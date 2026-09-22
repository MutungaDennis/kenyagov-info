-- Separate editorial publication from ownership and real-world school status.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE public.education_schools ADD COLUMN is_published boolean NOT NULL DEFAULT true;
COMMENT ON COLUMN public.education_schools.is_published IS 'Editorial visibility; public pages require both public ownership and publication.';
ALTER POLICY public_read ON public.education_schools USING (ownership='public' AND is_published);
ALTER POLICY authenticated_read ON public.education_schools USING ((ownership='public' AND is_published) OR (SELECT private.cg_is_admin()));
DO $related$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['education_school_aliases','education_school_identifiers','education_school_offerings','education_school_source_records','education_school_slug_aliases'] LOOP
    EXECUTE format('ALTER POLICY public_read ON public.%I USING (EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=%I.school_id AND s.ownership=''public'' AND s.is_published))',table_name,table_name);
    EXECUTE format('ALTER POLICY authenticated_read ON public.%I USING ((SELECT private.cg_is_admin()) OR EXISTS(SELECT 1 FROM public.education_schools s WHERE s.id=%I.school_id AND s.ownership=''public'' AND s.is_published))',table_name,table_name);
  END LOOP;
END $related$;
-- Append publication to the existing admin view, retaining every existing column.
DO $view$
DECLARE definition text;
BEGIN
  SELECT rtrim(pg_get_viewdef('public.education_school_directory'::regclass,true),'; '||chr(10)) INTO definition;
  EXECUTE 'CREATE OR REPLACE VIEW public.education_school_directory WITH (security_invoker=true) AS SELECT directory.*, school.is_published FROM ('||definition||') directory JOIN public.education_schools school ON school.id=directory.id';
END $view$;
CREATE INDEX education_schools_published_directory_idx ON public.education_schools(main_tier,county_code,official_name,id) WHERE ownership='public' AND is_published;
CREATE OR REPLACE FUNCTION public.search_public_schools(
  q text DEFAULT '', directorate text DEFAULT NULL, county_filter integer DEFAULT NULL,
  level_filter text DEFAULT NULL, category_filter text DEFAULT NULL, page_number integer DEFAULT 1,
  page_size integer DEFAULT 20
) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public,extensions
AS $function$
WITH matching AS MATERIALIZED (
  SELECT s.id,s.slug,s.official_name,s.short_name,s.ownership,s.main_tier,s.county,s.sub_county,s.county_code,
    s.moe_category,s.gender_type,s.accommodation_type,s.operational_status,
    CASE WHEN nullif(btrim(q),'') IS NULL THEN 0 ELSE
      CASE WHEN lower(s.official_name)=lower(btrim(q)) THEN 10 ELSE 0 END
      + extensions.word_similarity(left(q,120),s.official_name) END AS relevance
  FROM public.education_schools s
  WHERE s.ownership='public' AND s.is_published=true
    AND (directorate IS NULL
      OR (directorate='directorate-primary-education' AND s.main_tier IN('primary','junior'))
      OR (directorate='directorate-secondary-education' AND s.main_tier='senior_secondary'))
    AND (county_filter IS NULL OR s.county_code=county_filter)
    AND (nullif(level_filter,'') IS NULL OR s.main_tier=level_filter)
    AND (nullif(category_filter,'') IS NULL OR s.moe_category=category_filter)
    AND (nullif(btrim(q),'') IS NULL OR (
      (s.public_search_vector @@ websearch_to_tsquery('english',left(q,120))
        OR extensions.word_similarity(left(q,120),s.official_name)>=0.45
        OR s.official_name ILIKE '%'||replace(replace(replace(left(q,120),'\','\\'),'%','\%'),'_','\_')||'%')
      AND public.search_tokens_match(q,concat_ws(' ',s.official_name,s.short_name,s.county,s.sub_county))
    ))
), page_rows AS (
  SELECT * FROM matching ORDER BY relevance DESC,official_name,id
  LIMIT greatest(1,least(coalesce(page_size,20),50))
  OFFSET (greatest(1,least(coalesce(page_number,1),100000))-1)*greatest(1,least(coalesce(page_size,20),50))
)
SELECT jsonb_build_object('total',(SELECT count(*) FROM matching),'schools',coalesce((SELECT jsonb_agg(to_jsonb(r)-'relevance') FROM page_rows r),'[]'::jsonb));
$function$;
REVOKE ALL ON FUNCTION public.search_public_schools(text,text,integer,text,text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_public_schools(text,text,integer,text,text,integer,integer) TO anon,authenticated,service_role;


CREATE OR REPLACE VIEW public.global_search_view WITH (security_invoker=true) AS
SELECT i.id::text,id_slug.slug,i.name,i.description AS snippet,'Institution'::text AS entity_type,
  '/government/institutions'::text AS base_route,i.search_vector,coalesce(i.search_boost,10) AS rank_boost,
  concat_ws(' ',i.name,i.short_name,i.official_name,array_to_string(i.aliases,' '),array_to_string(i.common_misspellings,' '),array_to_string(i.former_names,' ')) AS match_text
FROM public.institutions i CROSS JOIN LATERAL (SELECT i.slug) id_slug WHERE i.is_active=true
UNION ALL
SELECT l.id::text,l.slug,l.full_name,l.bio,'Leader','/government/people',l.search_vector,5,
  concat_ws(' ',l.full_name,l.title,l.current_organization,l.current_county,l.current_constituency,l.current_party)
FROM public.leaders l WHERE l.is_active=true AND l.slug IS NOT NULL
UNION ALL
SELECT m.id::text,m.slug,concat_ws(' ',m.first_name,m.other_names,m.surname),m.bio,'Official','/government/people',
  to_tsvector('english',concat_ws(' ',m.first_name,m.other_names,m.surname,m.assembly_role,c.name,w.name)),5,
  concat_ws(' ',m.first_name,m.other_names,m.surname,m.assembly_role,c.name,w.name)
FROM public.mcas m LEFT JOIN public.counties c ON c.id=m.county_id LEFT JOIN public.wards w ON w.id=m.ward_id
WHERE m.status='Active' AND m.slug IS NOT NULL
UNION ALL
SELECT c.id::text,c.slug,c.name,NULL::text,'County','/government/institutions',c.search_vector,6,
  concat_ws(' ',c.name,c.headquarters,c.region)
FROM public.counties c WHERE c.is_active=true
UNION ALL
SELECT c.id::text,''::text,c.name,'Browse wards in this constituency','Constituency',
  '/government/counties/wards?constituency='||replace(c.name,' ','%20'),c.search_vector,4,c.name
FROM public.constituencies c WHERE c.is_active IS DISTINCT FROM false
UNION ALL
SELECT w.id::text,w.slug||'/about',w.name,NULL::text,'Ward','/government/counties/wards',w.search_vector,3,
  concat_ws(' ',w.name,w.county_name,w.constituency_name)
FROM public.wards w WHERE w.is_active IS DISTINCT FROM false
UNION ALL
SELECT p.id::text,p.slug,p.name,p.slogan,'Political Party','/elections/political-parties',p.search_vector,4,
  concat_ws(' ',p.name,p.abbreviation)
FROM public.political_parties p WHERE p.slug IS NOT NULL
UNION ALL
SELECT s.id::text,s.slug,s.official_name,concat_ws(' · ',s.main_tier,s.sub_county,s.county),'School','/government/institutions',
  s.public_search_vector,3,concat_ws(' ',s.official_name,s.short_name,s.county,s.sub_county)
FROM public.education_schools s WHERE s.ownership='public' AND s.is_published=true
UNION ALL
SELECT d.id::text,d.slug,d.title,coalesce(d.summary,d.description),'Document','/documents',
  to_tsvector('english',concat_ws(' ',d.title,d.short_title,d.summary)),4,concat_ws(' ',d.title,d.short_title)
FROM public.documents d WHERE d.published_at IS NOT NULL AND d.status<>'Draft' AND d.slug IS NOT NULL
UNION ALL
SELECT a.id::text,a.article_number::text,'Article '||a.article_number||': '||a.title,a.title,'Constitutional Article','/constitution/article',
  to_tsvector('english','Constitution Article '||a.article_number||' '||a.title),5,'Constitution Article '||a.article_number||' '||a.title
FROM public.constitution_articles a
UNION ALL
SELECT ld.id::text,legal.slug,legal.title,coalesce(ld.long_title,legal.short_title),
  CASE ld.category WHEN 'act' THEN 'Act of Parliament' WHEN 'county_act' THEN 'County Law' WHEN 'subsidiary' THEN 'Subsidiary Legislation' ELSE 'Treaty' END,
  CASE ld.category WHEN 'act' THEN '/legislation/acts' WHEN 'county_act' THEN '/legislation/counties/'||county.slug WHEN 'subsidiary' THEN '/legislation/subsidiary' ELSE '/legislation/treaties' END,
  to_tsvector('english',concat_ws(' ',legal.title,legal.short_title,legal.citation,ld.long_title)),6,
  concat_ws(' ',legal.title,legal.short_title,legal.citation,legal.year,county.name)
FROM public.legislation_documents ld JOIN public.legal_documents legal ON legal.id=ld.legal_document_id
LEFT JOIN public.kenya_counties county ON county.code=ld.county_code
WHERE ld.status IN ('In force','Partially in force','Not yet commenced','Repealed','Spent','Revoked','Superseded','Historical') AND legal.slug IS NOT NULL
  AND (ld.category<>'county_act' OR county.slug IS NOT NULL)
UNION ALL
SELECT b.id::text,b.slug,b.title,b.summary,'Cabinet Brief','/government/cabinet/briefs',b.search_vector,4,concat_ws(' ',b.title,b.summary)
FROM public.cabinet_briefs b WHERE b.is_published=true
UNION ALL
SELECT s.id::text,s.slug,s.title,s.summary,'Presidential Speech','/government/presidency/speeches',s.search_vector,4,concat_ws(' ',s.title,s.summary)
FROM public.presidential_speeches s WHERE s.is_published=true
UNION ALL
SELECT g.id::text,g.year::text||'/'||g.issue_number::text,'Kenya Gazette '||g.year||' issue '||g.issue_number,NULL::text,'Gazette Issue','/kenya-gazette',
  to_tsvector('english','Kenya Gazette '||g.year||' issue '||g.issue_number),3,'Kenya Gazette '||g.year||' issue '||g.issue_number
FROM public.gazette_issues g WHERE g.year IS NOT NULL AND g.issue_number IS NOT NULL;


NOTIFY pgrst,'reload schema';
COMMIT;
