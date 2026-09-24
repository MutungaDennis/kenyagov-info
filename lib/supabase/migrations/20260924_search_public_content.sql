BEGIN;
SET LOCAL lock_timeout = '5s';

-- Reuse maintained GIN-backed vectors. No copied corpus can retain unpublished text.
CREATE OR REPLACE FUNCTION public.search_public_content(q text, filter_type text DEFAULT NULL, lim integer DEFAULT 30)
RETURNS TABLE(id text, slug text, name text, snippet text, entity_type text, base_route text, rank double precision)
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = pg_catalog, public
SET statement_timeout = '4s'
AS $function$
DECLARE term text := left(trim(coalesce(q,'')),120); query tsquery;
BEGIN
  IF length(term)<2 OR term !~ '[[:alnum:]]' THEN RETURN; END IF;
  -- Quoted phrases retain web-search semantics. Plain queries support unfinished words.
  IF term LIKE '%"%' THEN query := websearch_to_tsquery('english',term);
  ELSE
    SELECT to_tsquery('english',string_agg(quote_literal(word)||':*',' & ')) INTO query
    FROM (SELECT unnest(tsvector_to_array(to_tsvector('english',term))) AS word LIMIT 12) words;
  END IF;
  IF query IS NULL OR numnode(query)=0 THEN RETURN; END IF;
  RETURN QUERY
  WITH matches AS (
    SELECT s.id::text id,d.slug,d.title||coalesce(' — '||nullif(s.heading,''),'') name,s.body_text body,
      'Document'::text entity_type,'/documents'::text base_route,ts_rank_cd(s.search_document,query,32)::double precision score
    FROM public.document_sections s JOIN public.documents d ON d.id=s.document_id
    WHERE s.search_document @@ query AND s.is_public=true AND d.published_at IS NOT NULL AND lower(d.status)<>'draft' AND d.slug IS NOT NULL
    UNION ALL
    SELECT d.id::text,d.slug,d.title,concat_ws(' ',d.summary,d.description,d.purpose),'Document','/documents',ts_rank_cd(d.search_document,query,32)
    FROM public.documents d WHERE d.search_document @@ query AND d.published_at IS NOT NULL AND lower(d.status)<>'draft' AND d.slug IS NOT NULL
    UNION ALL
    SELECT a.id::text,a.article_number::text,'Article '||a.article_number||': '||a.title,a.body_text,'Constitutional Article','/constitution/article',ts_rank_cd(a.search_document,query,32)
    FROM public.constitution_articles a WHERE a.search_document @@ query
    UNION ALL
    SELECT p.id::text,''::text,l.title||coalesce(' — '||nullif(p.heading,''),''),p.body_text,
      CASE d.category WHEN 'act' THEN 'Act of Parliament' WHEN 'county_act' THEN 'County Law' WHEN 'subsidiary' THEN 'Subsidiary Legislation' ELSE 'Treaty' END,
      lp.canonical_path,ts_rank_cd(p.search_document,query,32)
    FROM public.legislation_provisions p JOIN public.legislation_documents d ON d.id=p.legislation_document_id
      JOIN public.legal_documents l ON l.id=d.legal_document_id JOIN public.legal_provisions lp ON lp.id=p.legal_provision_id
    WHERE p.search_document @@ query AND d.published_at IS NOT NULL AND lower(coalesce(d.status,''))<>'draft'
      AND lp.canonical_path LIKE '/legislation/%' AND lower(coalesce(p.status,''))<>'draft'
    UNION ALL
    SELECT g.id::text,i.year||'/'||i.issue_number||'/notice/'||g.notice_number,g.title,g.content_text,'Gazette Notice','/kenya-gazette',ts_rank_cd(g.search_document,query,32)
    FROM public.gazette_notices g JOIN public.gazette_issues i ON i.id=g.issue_id
    WHERE g.search_document @@ query AND g.notice_number IS NOT NULL AND i.year IS NOT NULL AND i.issue_number IS NOT NULL
    UNION ALL
    SELECT b.id::text,b.slug,b.title,b.body_text,'Cabinet Brief','/government/cabinet/briefs',ts_rank_cd(b.search_vector,query,32)
    FROM public.cabinet_briefs b WHERE b.search_vector @@ query AND b.is_published=true AND b.slug IS NOT NULL
    UNION ALL
    SELECT s.id::text,s.slug,s.title,coalesce(s.body_text,s.transcript_text),'Presidential Speech','/government/presidency/speeches',ts_rank_cd(s.search_vector,query,32)
    FROM public.presidential_speeches s WHERE s.search_vector @@ query AND s.is_published=true AND s.slug IS NOT NULL
  ), best_per_page AS (
    SELECT DISTINCT ON (m.base_route,m.slug) m.* FROM matches m
    WHERE (nullif(filter_type,'') IS NULL OR m.entity_type=filter_type)
    ORDER BY m.base_route,m.slug,m.score DESC,m.id
  ), top_hits AS MATERIALIZED (
    SELECT * FROM best_per_page ORDER BY score DESC,name,id LIMIT greatest(1,least(coalesce(lim,30),100))
  )
  SELECT h.id,h.slug,h.name,
    ts_headline('english',regexp_replace(coalesce(h.body,''),'<[^>]*>',' ','g'),query,
      'StartSel=, StopSel=, MaxWords=42, MinWords=20, MaxFragments=2, FragmentDelimiter= … '),
    h.entity_type,h.base_route,(0.55+least(0.4,h.score))::double precision
  FROM top_hits h ORDER BY h.score DESC,h.name,h.id;
END;
$function$;
REVOKE ALL ON FUNCTION public.search_public_content(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_public_content(text,text,integer) TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
