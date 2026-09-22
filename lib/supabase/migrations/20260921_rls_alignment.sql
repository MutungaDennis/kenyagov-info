-- RLS alignment for the live CitizenGuide schema, inspected 2026-09-21.
-- Explicit table inventory: new tables are NOT automatically made public.
-- Preserves existing content publication/verification conditions.
-- Does not alter Supabase-managed schemas or PostGIS-owned relations.
-- The separate regression test is run in this transaction before COMMIT on deployment.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';
SET LOCAL search_path = public, extensions, pg_catalog;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
CREATE OR REPLACE FUNCTION private.cg_is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.is_admin IS TRUE
  );
$function$;
ALTER FUNCTION private.cg_is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.cg_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.cg_is_admin() TO authenticated, service_role;
COMMENT ON FUNCTION private.cg_is_admin() IS
  'RLS helper: only the current authenticated user; trusts protected profiles.is_admin, never JWT user_metadata.';

-- Keep legacy helper available to trusted services, but remove it from client RPC access.
ALTER FUNCTION public.cg_current_user_is_admin() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.cg_current_user_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cg_current_user_is_admin() TO service_role;

-- Profiles: avoid self-referencing policy recursion and prohibit self-promotion.
DO $profiles$
DECLARE p record; col record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', p.policyname);
  END LOOP;
  REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
  FOR col IN SELECT attname FROM pg_attribute WHERE attrelid='public.profiles'::regclass AND attnum>0 AND NOT attisdropped LOOP
    EXECUTE format('REVOKE ALL (%I) ON public.profiles FROM PUBLIC, anon, authenticated', col.attname);
  END LOOP;
END $profiles$;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
CREATE POLICY profiles_read ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT private.cg_is_admin()));
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- One policy per role and operation; admin checks use an initplan once per query.
DO $policies$
DECLARE item jsonb; table_name text; read_predicate text; insert_predicate text;
        p record; col record;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements($matrix$
[
  {
    "table": "admin_boundary_units",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "cabinet_brief_sources",
    "public_read": "(EXISTS ( SELECT 1\n   FROM cabinet_briefs b\n  WHERE ((b.id = cabinet_brief_sources.cabinet_brief_id) AND (b.is_published = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "cabinet_briefs",
    "public_read": "(is_published = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "census_years",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "citizen_feedback",
    "public_read": null,
    "public_insert": "length(btrim(what_were_you_doing)) BETWEEN 1 AND 4000 AND length(btrim(what_went_wrong)) BETWEEN 1 AND 4000 AND (email_address IS NULL OR length(email_address) <= 320) AND length(page_path) BETWEEN 1 AND 2048 AND page_path LIKE '/%' AND page_path NOT LIKE '//%' AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "client_feedback",
    "public_read": null,
    "public_insert": "length(btrim(name)) BETWEEN 1 AND 300 AND length(email) BETWEEN 3 AND 320 AND length(btrim(subject)) BETWEEN 1 AND 500 AND length(btrim(message)) BETWEEN 1 AND 4000 AND length(feedback_type) BETWEEN 1 AND 100 AND (phone IS NULL OR length(phone) <= 100) AND status = 'pending' AND created_at IS NOT NULL AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute' AND updated_at IS NOT NULL AND updated_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "coalitions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constituencies",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_article_institutions",
    "public_read": "verification_status = 'Verified'",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_article_people",
    "public_read": "verification_status = 'Verified'",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_articles",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_chapters",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_inline_links",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_parts",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitution_schedules",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "constitutions",
    "public_read": "(is_current = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "contact_messages",
    "public_read": null,
    "public_insert": "length(btrim(name)) BETWEEN 1 AND 300 AND length(email) BETWEEN 3 AND 320 AND length(btrim(subject)) BETWEEN 1 AND 500 AND length(btrim(message)) BETWEEN 1 AND 2000 AND (phone IS NULL OR length(phone) <= 100) AND contact_type = 'general_inquiry' AND created_at IS NOT NULL AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "counties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "county_flagship_projects",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "county_me_indicators",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "county_revenue_projections",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "county_sector_programmes",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "county_sub_counties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "departments",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "diplomatic_accreditations",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "diplomatic_extensions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_admin_activity",
    "public_read": null,
    "public_insert": null,
    "admin_write": false
  },
  {
    "table": "document_categories",
    "public_read": "is_active = true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_files",
    "public_read": "(EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_files.document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_inline_links",
    "public_read": "((verification_status = 'Verified'::text) AND (EXISTS ( SELECT 1\n   FROM (document_sections s\n     JOIN documents d ON ((d.id = s.document_id)))\n  WHERE ((s.id = document_inline_links.document_section_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text)))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_institution_links",
    "public_read": "(EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_institution_links.document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_relationships",
    "public_read": "((verification_status = 'Verified'::text) AND (EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_relationships.source_document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text)))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_sections",
    "public_read": "((is_public = true) AND (EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_sections.document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text)))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_series",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_topic_links",
    "public_read": "(EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_topic_links.document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_topics",
    "public_read": "is_active",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_types",
    "public_read": "is_active",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "document_versions",
    "public_read": "(EXISTS ( SELECT 1\n   FROM documents d\n  WHERE ((d.id = document_versions.document_id) AND (d.published_at IS NOT NULL) AND (d.status <> 'Draft'::text))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "documents",
    "public_read": "((published_at IS NOT NULL) AND (status <> 'Draft'::text))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_counties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_data_sources",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_school_aliases",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_school_identifiers",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_school_offerings",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_school_source_records",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_schools",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "education_sub_counties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_enforcement_log",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_international_trends",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_lpg_prices",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_nairobi_breakdown",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_price_cycles",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "epra_town_prices",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_corrigenda_entries",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_inline_links",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_issue_sections",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_issues",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_notice_institutions",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_notice_people",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_notice_relationships",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "gazette_notices",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "general_feedback",
    "public_read": null,
    "public_insert": "length(btrim(feedback_text)) BETWEEN 1 AND 1200 AND (full_name IS NULL OR length(full_name) <= 300) AND (email_address IS NULL OR length(email_address) <= 320) AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "government_entities",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "government_levels",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "government_structure",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "independent_bodies",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_budgets",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_documents",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_leaders",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_lifecycle_segments",
    "public_read": "(EXISTS ( SELECT 1\n   FROM institutions i\n  WHERE ((i.id = institution_lifecycle_segments.institution_id) AND (COALESCE(i.is_active, true) = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_locations",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_name_history",
    "public_read": "(EXISTS ( SELECT 1\n   FROM institutions i\n  WHERE ((i.id = institution_name_history.institution_id) AND (COALESCE(i.is_active, true) = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_relationships",
    "public_read": "((EXISTS ( SELECT 1\n   FROM institutions i\n  WHERE ((i.id = institution_relationships.from_institution_id) AND (COALESCE(i.is_active, true) = true)))) OR (EXISTS ( SELECT 1\n   FROM institutions i\n  WHERE ((i.id = institution_relationships.to_institution_id) AND (COALESCE(i.is_active, true) = true)))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institution_services",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "institutions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "kenya_counties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "knbs_ethnicity_census",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "knbs_religion_census",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "leader_categories",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "leader_name_title_options",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "leader_national_honour_options",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "leader_roles",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "leaders",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legal_citations",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legal_document_relationships",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legal_documents",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legal_provision_relationships",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legal_provisions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_admin_activity",
    "public_read": null,
    "public_insert": null,
    "admin_write": false
  },
  {
    "table": "legislation_amendment_blocks",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_amendment_groups",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_amendment_items",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_change_impacts",
    "public_read": "(EXISTS ( SELECT 1\n   FROM legislation_changes c\n  WHERE ((c.id = legislation_change_impacts.change_id) AND (c.verification_status = 'Verified'::text))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_changes",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_documents",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_import_source_text",
    "public_read": null,
    "public_insert": null,
    "admin_write": false
  },
  {
    "table": "legislation_inline_links",
    "public_read": "(verification_status = 'Verified'::text)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_provision_display_notes",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_provisions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_source_snapshots",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "legislation_versions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "mca_social_media",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "mca_terms",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "mcas",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "official_relationships",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "officials",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "page_usefulness_votes",
    "public_read": null,
    "public_insert": "length(page_path) BETWEEN 1 AND 2048 AND page_path LIKE '/%' AND page_path NOT LIKE '//%' AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "page_views",
    "public_read": null,
    "public_insert": "length(path) BETWEEN 1 AND 2048 AND path LIKE '/%' AND path NOT LIKE '//%' AND viewed_at IS NOT NULL AND viewed_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute' AND (referrer IS NULL OR length(referrer) <= 4096)",
    "admin_write": true
  },
  {
    "table": "party_documents",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "party_history",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "party_leadership",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "political_parties",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "polling_stations_2022",
    "public_read": "(is_active = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "positions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "presidential_speech_relationships",
    "public_read": "(EXISTS ( SELECT 1\n   FROM presidential_speeches s\n  WHERE ((s.id = presidential_speech_relationships.speech_id) AND (s.is_published = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "presidential_speech_sources",
    "public_read": "(EXISTS ( SELECT 1\n   FROM presidential_speeches s\n  WHERE ((s.id = presidential_speech_sources.speech_id) AND (s.is_published = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "presidential_speech_topics",
    "public_read": "(EXISTS ( SELECT 1\n   FROM presidential_speeches s\n  WHERE ((s.id = presidential_speech_topics.speech_id) AND (s.is_published = true))))",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "presidential_speeches",
    "public_read": "(is_published = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "presidents",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "public_officials",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "schools",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "search_expansions",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "search_queries",
    "public_read": null,
    "public_insert": "length(btrim(query)) BETWEEN 1 AND 300 AND (filter_type IS NULL OR length(filter_type) <= 100) AND result_count IS NOT NULL AND result_count BETWEEN 0 AND 1000000 AND created_at IS NOT NULL AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '1 minute'",
    "admin_write": true
  },
  {
    "table": "site_status",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "speech_topics",
    "public_read": "(is_active = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "speech_types",
    "public_read": "(is_active = true)",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "ward_health_facilities",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "ward_leadership",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "ward_projects",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "ward_schools",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  },
  {
    "table": "wards",
    "public_read": "true",
    "public_insert": null,
    "admin_write": true
  }
]
$matrix$::jsonb) LOOP
    table_name := item->>'table';
    read_predicate := item->>'public_read';
    insert_predicate := item->>'public_insert';
    IF to_regclass(format('public.%I',table_name)) IS NULL THEN
      RAISE EXCEPTION 'Expected table public.% is missing', table_name;
    END IF;
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=table_name LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, table_name);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',table_name);
    -- Table-level REVOKE alone does not remove independent column grants.
    FOR col IN SELECT attname FROM pg_attribute WHERE attrelid=to_regclass(format('public.%I',table_name)) AND attnum>0 AND NOT attisdropped LOOP
      EXECUTE format('REVOKE ALL (%I) ON public.%I FROM PUBLIC, anon, authenticated',col.attname,table_name);
    END LOOP;
    EXECUTE format('GRANT ALL ON public.%I TO service_role',table_name);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',table_name);
    IF read_predicate IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon',table_name);
      EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon USING (%s)',table_name,read_predicate);
    END IF;
    EXECUTE format(
      'CREATE POLICY authenticated_read ON public.%I FOR SELECT TO authenticated USING (%s)',
      table_name,
      CASE WHEN read_predicate='true' THEN 'true'
           WHEN read_predicate IS NULL THEN '(SELECT private.cg_is_admin())'
           ELSE format('(%s) OR (SELECT private.cg_is_admin())',read_predicate) END);
    IF (item->>'admin_write')::boolean THEN
      EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated',table_name);
      EXECUTE format('CREATE POLICY admin_update ON public.%I FOR UPDATE TO authenticated USING ((SELECT private.cg_is_admin())) WITH CHECK ((SELECT private.cg_is_admin()))',table_name);
      EXECUTE format('CREATE POLICY admin_delete ON public.%I FOR DELETE TO authenticated USING ((SELECT private.cg_is_admin()))',table_name);
      EXECUTE format('CREATE POLICY authenticated_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',table_name,
        CASE WHEN insert_predicate IS NULL THEN '(SELECT private.cg_is_admin())'
             ELSE format('(%s) OR (SELECT private.cg_is_admin())',insert_predicate) END);
    END IF;
    IF insert_predicate IS NOT NULL THEN
      EXECUTE format('GRANT INSERT ON public.%I TO anon',table_name);
      EXECUTE format('CREATE POLICY public_insert ON public.%I FOR INSERT TO anon WITH CHECK (%s)',table_name,insert_predicate);
    END IF;
  END LOOP;
END $policies$;

-- Sequences cannot use RLS. Only roles that can insert into their owning table
-- get USAGE; client roles never get UPDATE/setval rights.
DO $sequences$
DECLARE s record;
BEGIN
  FOR s IN
    SELECT seq.oid, seq.relname, owner_table.oid AS table_oid
    FROM pg_class seq JOIN pg_namespace n ON n.oid=seq.relnamespace
    JOIN pg_depend d ON d.classid='pg_class'::regclass AND d.objid=seq.oid AND d.deptype IN ('a','i')
    JOIN pg_class owner_table ON owner_table.oid=d.refobjid
    WHERE seq.relkind='S' AND n.nspname='public'
      AND owner_table.relowner='postgres'::regrole
  LOOP
    EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM PUBLIC, anon, authenticated',s.relname);
    EXECUTE format('GRANT ALL ON SEQUENCE public.%I TO service_role',s.relname);
    IF has_table_privilege('anon',s.table_oid,'INSERT') THEN
      EXECUTE format('GRANT USAGE ON SEQUENCE public.%I TO anon',s.relname);
    END IF;
    IF has_table_privilege('authenticated',s.table_oid,'INSERT') THEN
      EXECUTE format('GRANT USAGE ON SEQUENCE public.%I TO authenticated',s.relname);
    END IF;
  END LOOP;
END $sequences$;

-- These five app views must enforce underlying table RLS.
ALTER VIEW public."global_search_view" SET (security_invoker = true);
REVOKE ALL ON public."global_search_view" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public."global_search_view" TO anon, authenticated;
ALTER VIEW public."v_county_with_leaders" SET (security_invoker = true);
REVOKE ALL ON public."v_county_with_leaders" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public."v_county_with_leaders" TO anon, authenticated;
ALTER VIEW public."education_school_directory" SET (security_invoker = true);
REVOKE ALL ON public."education_school_directory" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public."education_school_directory" TO anon, authenticated;
ALTER VIEW public."legislation_amendment_schedule_view" SET (security_invoker = true);
REVOKE ALL ON public."legislation_amendment_schedule_view" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public."legislation_amendment_schedule_view" TO anon, authenticated;
ALTER VIEW public."legislation_amendment_schedule_full_view" SET (security_invoker = true);
REVOKE ALL ON public."legislation_amendment_schedule_full_view" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public."legislation_amendment_schedule_full_view" TO anon, authenticated;

-- Only trusted admins may modify public portrait files.
DROP POLICY IF EXISTS "Authenticated write leader portraits" ON storage.objects;
DROP POLICY IF EXISTS "Public read leader portraits" ON storage.objects;
CREATE POLICY portraits_read ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'leader-portraits');
CREATE POLICY portraits_admin_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'leader-portraits' AND (SELECT private.cg_is_admin()));
CREATE POLICY portraits_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'leader-portraits' AND (SELECT private.cg_is_admin()))
  WITH CHECK (bucket_id = 'leader-portraits' AND (SELECT private.cg_is_admin()));
CREATE POLICY portraits_admin_delete ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'leader-portraits' AND (SELECT private.cg_is_admin()));

-- Fix app-function search paths without changing extension functions.
-- public/extensions are not writable by the client roles; pg_temp is last.
ALTER FUNCTION public.bulk_insert_polling_stations(jsonb) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.cg_document_sections_search_vector_refresh() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.cg_documents_search_vector_refresh() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.cg_escape_legal_html(text) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.cg_format_act_section_html(text) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.cg_format_amendment_html(text) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.constituencies_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.counties_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.immutable_array_to_string(text[],text) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.institutions_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.leaders_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.officials_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.political_parties_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.search_documents(text,text,text,text,uuid,text,integer,integer,text,integer,integer) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.search_public(text,text,integer) SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.touch_updated_at() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.update_modified_column() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public, extensions, pg_temp;
ALTER FUNCTION public.wards_search_vector_update() SET search_path = pg_catalog, public, extensions, pg_temp;
REVOKE EXECUTE ON FUNCTION public.bulk_insert_polling_stations(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bulk_insert_polling_stations(jsonb) TO authenticated, service_role;

-- Future postgres-created objects start closed. Each new table must explicitly
-- enable RLS and grant the operations its callers actually need.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;

