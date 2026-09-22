-- Read-only regression. Does not create fixtures or update/delete any records.
BEGIN READ ONLY;
SET LOCAL ROLE anon;
DO $verify$
BEGIN
  IF EXISTS (SELECT 1 FROM public.education_schools WHERE ownership <> 'public' OR NOT is_published)
    THEN RAISE EXCEPTION 'Unpublished/private school is readable'; END IF;
  IF EXISTS (SELECT 1 FROM public.education_school_directory WHERE ownership <> 'public' OR NOT is_published)
    THEN RAISE EXCEPTION 'School directory visibility mismatch'; END IF;
  IF EXISTS (SELECT 1 FROM public.institutions WHERE is_active IS DISTINCT FROM true)
    THEN RAISE EXCEPTION 'Unpublished institution is readable'; END IF;
  IF EXISTS (SELECT 1 FROM public.global_search_view v JOIN public.education_schools s ON s.id::text=v.id
    WHERE v.entity_type='School' AND (NOT s.is_published OR s.ownership<>'public'))
    THEN RAISE EXCEPTION 'Search publication mismatch'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.institutions WHERE status::text='Dissolved')
    THEN RAISE EXCEPTION 'Published historical records are hidden'; END IF;
  IF EXISTS (SELECT 1 FROM public.global_search_view v JOIN public.institutions i ON i.id::text=v.id
    WHERE v.entity_type='Institution' AND i.status::text='Dissolved' AND v.snippet NOT LIKE 'Historical organisation%')
    THEN RAISE EXCEPTION 'Historical search result lacks a label'; END IF;
  IF has_table_privilege('anon','public.education_schools','UPDATE') OR has_table_privilege('anon','public.education_schools','DELETE')
    THEN RAISE EXCEPTION 'Anonymous school mutation privilege'; END IF;
END $verify$;
ROLLBACK;
