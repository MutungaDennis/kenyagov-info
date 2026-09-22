BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='120s';

ALTER TABLE public.education_schools ADD COLUMN public_search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english'::regconfig,
    coalesce(official_name,'') || ' ' || coalesce(short_name,'') || ' ' || coalesce(county,'') || ' ' || coalesce(sub_county,''))) STORED;
CREATE INDEX education_schools_public_fts_idx ON public.education_schools USING gin(public_search_vector) WHERE ownership='public';
CREATE INDEX IF NOT EXISTS institutions_search_name_trgm_idx ON public.institutions USING gin(name extensions.gin_trgm_ops);

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
FROM public.education_schools s WHERE s.ownership='public'
UNION ALL
SELECT d.id::text,d.slug,d.title,coalesce(d.summary,d.description),'Document','/documents',
  to_tsvector('english',concat_ws(' ',d.title,d.short_title,d.summary)),4,concat_ws(' ',d.title,d.short_title)
FROM public.documents d WHERE d.published_at IS NOT NULL AND d.status<>'Draft' AND d.slug IS NOT NULL
UNION ALL
SELECT a.id::text,a.article_number::text,'Article '||a.article_number||': '||a.title,a.title,'Constitutional Article','/constitution/article',
  to_tsvector('english','Constitution Article '||a.article_number||' '||a.title),5,'Constitution Article '||a.article_number||' '||a.title
FROM public.constitution_articles a;

CREATE OR REPLACE FUNCTION public.search_public(q text, filter_type text DEFAULT NULL, lim integer DEFAULT 40)
RETURNS TABLE(id text,slug text,name text,snippet text,entity_type text,base_route text,rank double precision)
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public,extensions
SET pg_trgm.word_similarity_threshold='0.45'
SET pg_trgm.similarity_threshold='0.3'
AS $function$
DECLARE term text; tsq tsquery; expansion_query tsquery;
BEGIN
  term := left(btrim(regexp_replace(coalesce(q,''),'\s+',' ','g')),120);
  IF term !~ '[[:alnum:]]' THEN RETURN; END IF;
  tsq := websearch_to_tsquery('english',term);
  -- An acronym OR its expansion may match; never require both together.
  SELECT websearch_to_tsquery('english',string_agg(expansion,' OR ')) INTO expansion_query
    FROM public.search_expansions WHERE lower(original)=lower(term);
  IF expansion_query IS NOT NULL THEN tsq := tsq || expansion_query; END IF;
  RETURN QUERY
  SELECT v.id,v.slug,v.name,left(v.snippet,350),v.entity_type,v.base_route,
    (CASE WHEN lower(v.name)=lower(term) THEN 20 ELSE 0 END
      + CASE WHEN lower(v.name) LIKE lower(replace(replace(term,'%','\%'),'_','\_'))||'%' THEN 8 ELSE 0 END
      + coalesce(ts_rank(v.search_vector,tsq),0)*v.rank_boost*4
      + extensions.word_similarity(term,coalesce(v.match_text,v.name))*2)::double precision AS score
  FROM public.global_search_view v
  WHERE (nullif(filter_type,'') IS NULL OR v.entity_type=filter_type)
    AND (v.search_vector @@ tsq
      OR v.name ILIKE '%'||replace(replace(replace(term,'\','\\'),'%','\%'),'_','\_')||'%'
      OR (length(term)>=4 AND term OPERATOR(extensions.<%) v.match_text))
  ORDER BY score DESC,v.name,v.entity_type,v.id
  LIMIT greatest(1,least(coalesce(lim,40),100));
END $function$;
REVOKE ALL ON FUNCTION public.search_public(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_public(text,text,integer) TO anon,authenticated,service_role;
GRANT SELECT ON public.global_search_view TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
