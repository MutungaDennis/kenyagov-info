BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='120s';

-- Every meaningful word must match. Numeric identifiers are always exact.
CREATE OR REPLACE FUNCTION public.search_tokens_match(query_text text, document_text text)
RETURNS boolean LANGUAGE sql IMMUTABLE PARALLEL SAFE SECURITY INVOKER
SET search_path=pg_catalog,extensions
AS $function$
  SELECT NOT EXISTS (
    SELECT 1 FROM regexp_split_to_table(lower(left(coalesce(query_text,''),120)), '[^[:alnum:]]+') AS token
    WHERE token<>'' AND token NOT IN ('a','an','the','of','and','for','in','to')
    AND NOT (
      CASE WHEN token ~ '^[0-9]+$' THEN lower(coalesce(document_text,'')) ~ ('\m'||token||'\M')
        ELSE position(token in lower(coalesce(document_text,'')))>0
          OR (length(token)>=4 AND extensions.word_similarity(token,lower(coalesce(document_text,'')))>=0.5)
      END
    )
  );
$function$;
REVOKE ALL ON FUNCTION public.search_tokens_match(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tokens_match(text,text) TO anon,authenticated,service_role;

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
  WHERE s.ownership='public'
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

-- search_public definition appended below with precision checks.

CREATE OR REPLACE FUNCTION public.search_public(q text, filter_type text DEFAULT NULL, lim integer DEFAULT 40)
RETURNS TABLE(id text,slug text,name text,snippet text,entity_type text,base_route text,rank double precision)
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public,extensions
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
    AND (public.search_tokens_match(term,coalesce(v.match_text,v.name)||' '||coalesce(v.snippet,'')) OR (expansion_query IS NOT NULL AND v.search_vector @@ expansion_query))
    AND (v.search_vector @@ tsq
      OR v.name ILIKE '%'||replace(replace(replace(term,'\','\\'),'%','\%'),'_','\_')||'%'
      OR (length(term)>=4 AND extensions.word_similarity(term,v.match_text)>=0.45))
  ORDER BY score DESC,v.name,v.entity_type,v.id
  LIMIT greatest(1,least(coalesce(lim,40),100));
END $function$;
REVOKE ALL ON FUNCTION public.search_public(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_public(text,text,integer) TO anon,authenticated,service_role;
GRANT SELECT ON public.global_search_view TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
