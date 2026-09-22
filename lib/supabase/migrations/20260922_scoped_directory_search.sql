BEGIN;
CREATE OR REPLACE FUNCTION public.search_cabinet_briefs_scoped(q text DEFAULT '')
RETURNS SETOF public.cabinet_briefs LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public
AS $function$
  SELECT b.* FROM public.cabinet_briefs b WHERE b.is_published=true AND (
    nullif(btrim(q),'') IS NULL OR (
      q ~ '[[:alnum:]]' AND (b.search_vector @@ websearch_to_tsquery('english',left(q,120))
        OR public.search_tokens_match(q,concat_ws(' ',b.title,b.short_title,b.summary,b.excerpt,b.body_text)))
    )
  );
$function$;
CREATE OR REPLACE FUNCTION public.search_presidential_speeches_scoped(q text DEFAULT '')
RETURNS SETOF public.presidential_speeches LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public
AS $function$
  SELECT s.* FROM public.presidential_speeches s WHERE s.is_published=true AND (
    nullif(btrim(q),'') IS NULL OR (
      q ~ '[[:alnum:]]' AND (s.search_vector @@ websearch_to_tsquery('english',left(q,120))
        OR public.search_tokens_match(q,concat_ws(' ',s.title,s.short_title,s.summary,s.excerpt,s.occasion,s.venue,s.county,s.country)))
    )
  );
$function$;
CREATE OR REPLACE FUNCTION public.search_wards_scoped(q text DEFAULT '')
RETURNS SETOF public.wards LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public
AS $function$
  SELECT w.* FROM public.wards w WHERE w.is_active=true AND (
    nullif(btrim(q),'') IS NULL OR (q ~ '[[:alnum:]]'
      AND public.search_tokens_match(q,concat_ws(' ',w.name,w.county_name,w.constituency_name,w.ward_code)))
  );
$function$;
REVOKE ALL ON FUNCTION public.search_cabinet_briefs_scoped(text),public.search_presidential_speeches_scoped(text),public.search_wards_scoped(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_cabinet_briefs_scoped(text),public.search_presidential_speeches_scoped(text),public.search_wards_scoped(text) TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
