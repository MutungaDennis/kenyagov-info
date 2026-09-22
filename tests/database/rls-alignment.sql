-- Integration regression; execute against the migrated schema as postgres.
BEGIN;
SET LOCAL statement_timeout = '120s';
-- Run as postgres after 20260921_rls_alignment.sql.
-- All fixture rows and attempted writes are rolled back in a subtransaction.
-- No real account credentials, emails or application records are returned.
DO $rls_tests$
DECLARE
  member_id uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
  coalition_id uuid := gen_random_uuid();
  draft_id uuid := gen_random_uuid();
  published_id uuid := gen_random_uuid();
  public_section_id uuid := gen_random_uuid();
  hidden_section_id uuid := gen_random_uuid();
  draft_section_id uuid := gen_random_uuid();
  feedback_id uuid := gen_random_uuid();
  row_count bigint;
  relation record;
  role_name text;
  expected_count bigint;
  observed_count bigint;
  baseline jsonb := '{}'::jsonb;
  private_tables text[] := ARRAY['client_feedback','contact_messages','citizen_feedback','general_feedback','page_usefulness_votes','page_views','search_queries','document_admin_activity','legislation_admin_activity','legislation_import_source_text'];
  public_tables text[] := ARRAY['admin_boundary_units','cabinet_brief_sources','cabinet_briefs','census_years','coalitions','constituencies','constitution_article_institutions','constitution_article_people','constitution_articles','constitution_chapters','constitution_inline_links','constitution_parts','constitution_schedules','constitutions','counties','county_flagship_projects','county_me_indicators','county_revenue_projections','county_sector_programmes','county_sub_counties','departments','diplomatic_accreditations','diplomatic_extensions','document_categories','document_files','document_inline_links','document_institution_links','document_relationships','document_sections','document_series','document_topic_links','document_topics','document_types','document_versions','documents','education_counties','education_data_sources','education_school_aliases','education_school_identifiers','education_school_offerings','education_school_source_records','education_school_slug_aliases','education_schools','education_sub_counties','epra_enforcement_log','epra_international_trends','epra_lpg_prices','epra_nairobi_breakdown','epra_price_cycles','epra_town_prices','gazette_corrigenda_entries','gazette_inline_links','gazette_issue_sections','gazette_issues','gazette_notice_institutions','gazette_notice_people','gazette_notice_relationships','gazette_notices','government_entities','government_levels','government_structure','independent_bodies','institution_budgets','institution_documents','institution_leaders','institution_lifecycle_segments','institution_locations','institution_name_history','institution_relationships','institution_services','institutions','kenya_counties','knbs_ethnicity_census','knbs_religion_census','leader_categories','leader_name_title_options','leader_national_honour_options','leader_roles','leaders','legal_citations','legal_document_relationships','legal_documents','legal_provision_relationships','legal_provisions','legislation_amendment_blocks','legislation_amendment_groups','legislation_amendment_items','legislation_change_impacts','legislation_changes','legislation_documents','legislation_inline_links','legislation_provision_display_notes','legislation_provisions','legislation_source_snapshots','legislation_versions','mca_social_media','mca_terms','mcas','official_relationships','officials','party_documents','party_history','party_leadership','political_parties','polling_stations_2022','positions','presidential_speech_relationships','presidential_speech_sources','presidential_speech_topics','presidential_speeches','presidents','public_officials','schools','search_expansions','site_status','speech_topics','speech_types','ward_health_facilities','ward_leadership','ward_projects','ward_schools','wards'];
  table_name text;
BEGIN
  -- Fail on unknown app tables rather than silently leave a new table exposed.
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND c.relowner='postgres'::regrole
      AND NOT c.relname = ANY(public_tables || private_tables || ARRAY['profiles'])
  ) THEN RAISE EXCEPTION 'RLS test: unclassified application table'; END IF;

  FOR relation IN
    SELECT c.oid,c.relname,c.relrowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND c.relowner='postgres'::regrole
  LOOP
    IF NOT relation.relrowsecurity THEN RAISE EXCEPTION 'RLS disabled: %',relation.relname; END IF;
    IF has_table_privilege('anon',relation.oid,'UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES')
      OR has_table_privilege('authenticated',relation.oid,'TRUNCATE,TRIGGER,REFERENCES')
    THEN RAISE EXCEPTION 'Excessive client grants: %',relation.relname; END IF;
    IF NOT has_table_privilege('service_role',relation.oid,'SELECT')
       OR NOT has_table_privilege('service_role',relation.oid,'INSERT')
       OR NOT has_table_privilege('service_role',relation.oid,'UPDATE')
       OR NOT has_table_privilege('service_role',relation.oid,'DELETE')
    THEN RAISE EXCEPTION 'Service access missing: %',relation.relname; END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND
    (coalesce(qual,'') LIKE '%user_metadata%' OR coalesce(with_check,'') LIKE '%user_metadata%'))
  THEN RAISE EXCEPTION 'Untrusted metadata in RLS'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies p WHERE schemaname='public' AND cmd IN ('UPDATE','DELETE','ALL')
    AND tablename<>'profiles' AND coalesce(qual,'') NOT LIKE '%private.cg_is_admin()%'
  ) THEN RAISE EXCEPTION 'Unprotected write policy'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies p WHERE schemaname='public' AND cmd='INSERT'
    AND NOT tablename = ANY(ARRAY['page_views','search_queries','page_usefulness_votes','contact_messages','citizen_feedback','general_feedback','client_feedback'])
    AND coalesce(with_check,'') NOT LIKE '%private.cg_is_admin()%'
  ) THEN RAISE EXCEPTION 'Unprotected insert policy'; END IF;
  IF has_column_privilege('authenticated','public.profiles','is_admin','UPDATE')
     OR has_column_privilege('authenticated','public.profiles','id','UPDATE')
     OR has_column_privilege('authenticated','public.profiles','email','UPDATE')
     OR has_table_privilege('authenticated','public.profiles','INSERT,DELETE')
  THEN RAISE EXCEPTION 'Profile privilege escalation possible'; END IF;
  IF has_function_privilege('anon','public.cg_current_user_is_admin()','EXECUTE')
     OR has_function_privilege('authenticated','public.cg_current_user_is_admin()','EXECUTE')
     OR has_function_privilege('anon','private.cg_is_admin()','EXECUTE')
  THEN RAISE EXCEPTION 'Privileged helper exposed as public RPC'; END IF;

  -- Compare anonymous and ordinary signed-in reads without touching row data.
  PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
  SET LOCAL ROLE anon;
  FOREACH table_name IN ARRAY public_tables LOOP
    EXECUTE format('SELECT count(*) FROM public.%I',table_name) INTO observed_count;
    baseline := baseline || jsonb_build_object(table_name,observed_count);
  END LOOP;
  SET LOCAL ROLE postgres;

  BEGIN
    INSERT INTO auth.users (id) VALUES (member_id),(admin_id);
    INSERT INTO public.profiles(id,is_admin,full_name)
      VALUES(member_id,false,'RLS regression member'),(admin_id,true,'RLS regression admin');
    INSERT INTO public.coalitions(id,name) VALUES(coalition_id,'RLS regression ' || coalition_id);
    INSERT INTO public.documents(id,title,slug,status,published_at)
      VALUES(draft_id,'RLS draft fixture',draft_id::text,'Draft',NULL),
            (published_id,'RLS public fixture',published_id::text,'Current',now());
    INSERT INTO public.document_sections(id,document_id,is_public,heading)
      VALUES(public_section_id,published_id,true,'RLS public section'),
            (hidden_section_id,published_id,false,'RLS hidden section'),
            (draft_section_id,draft_id,true,'RLS draft section');
    INSERT INTO public.general_feedback(id,feedback_text) VALUES(feedback_id,'RLS private feedback fixture');

    -- A forged user_metadata admin claim must not create administrator privileges.
    PERFORM set_config('request.jwt.claims',
      jsonb_build_object('sub',member_id,'role','authenticated','user_metadata',jsonb_build_object('role','admin','is_admin',true))::text,true);
    PERFORM set_config('request.jwt.claim.sub',member_id::text,true);
    SET LOCAL ROLE authenticated;
    IF private.cg_is_admin() THEN RAISE EXCEPTION 'Forged metadata grants admin'; END IF;
    SELECT count(*) INTO row_count FROM public.profiles;
    IF row_count<>1 THEN RAISE EXCEPTION 'Profile privacy or recursion failure'; END IF;
    UPDATE public.profiles SET full_name='RLS own-name update' WHERE id=member_id;
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>1 THEN RAISE EXCEPTION 'Own profile update blocked'; END IF;
    UPDATE public.profiles SET full_name='Forbidden' WHERE id=admin_id;
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>0 THEN RAISE EXCEPTION 'Can change another profile'; END IF;
    BEGIN
      UPDATE public.profiles SET is_admin=true WHERE id=member_id;
      RAISE EXCEPTION 'Self-promotion succeeded';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
      INSERT INTO public.coalitions(name) VALUES('RLS unauthorized '||member_id);
      RAISE EXCEPTION 'Ordinary user inserted public content';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;

    FOREACH table_name IN ARRAY private_tables LOOP
      EXECUTE format('SELECT count(*) FROM public.%I',table_name) INTO row_count;
      IF row_count<>0 THEN RAISE EXCEPTION 'Private rows visible to ordinary user: %',table_name; END IF;
    END LOOP;
    FOREACH table_name IN ARRAY public_tables LOOP
      EXECUTE format('SELECT count(*) FROM public.%I',table_name) INTO observed_count;
      expected_count := (baseline->>table_name)::bigint +
        CASE WHEN table_name IN ('coalitions','documents','document_sections') THEN 1 ELSE 0 END;
      IF observed_count<>expected_count THEN
        RAISE EXCEPTION 'Public/authenticated read mismatch: %, expected %, got %',table_name,expected_count,observed_count;
      END IF;
    END LOOP;

    -- Actual UPDATE and DELETE statements as a non-admin on every editable app
    -- table. Even if a regression allowed writes, the test transaction rolls back.
    FOR relation IN
      SELECT c.oid,c.relname,
        (SELECT attname FROM pg_attribute a WHERE a.attrelid=c.oid AND a.attnum>0
          AND NOT a.attisdropped AND a.attgenerated='' ORDER BY a.attnum LIMIT 1) AS column_name
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r' AND c.relowner='postgres'::regrole
        AND c.relname<>'profiles'
    LOOP
      IF has_table_privilege('authenticated',relation.oid,'UPDATE') THEN
        EXECUTE format('UPDATE public.%I SET %I=%I',relation.relname,relation.column_name,relation.column_name);
        GET DIAGNOSTICS row_count=ROW_COUNT;
        IF row_count<>0 THEN RAISE EXCEPTION 'Ordinary user updated % rows of %',row_count,relation.relname; END IF;
      END IF;
      IF has_table_privilege('authenticated',relation.oid,'DELETE') THEN
        EXECUTE format('DELETE FROM public.%I',relation.relname);
        GET DIAGNOSTICS row_count=ROW_COUNT;
        IF row_count<>0 THEN RAISE EXCEPTION 'Ordinary user deleted % rows of %',row_count,relation.relname; END IF;
      END IF;
    END LOOP;
    -- Storage policy checks use SELECT/UPDATE only; no files are deleted.
    UPDATE storage.objects SET name=name WHERE bucket_id='leader-portraits';
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>0 THEN RAISE EXCEPTION 'Non-admin can modify portraits'; END IF;
    BEGIN
      INSERT INTO storage.objects(bucket_id,name) VALUES('leader-portraits','rls-denied-'||member_id);
      RAISE EXCEPTION 'Non-admin can upload portraits';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;

    -- Anonymous readers can see published rows, never drafts/private sections.
    SET LOCAL ROLE postgres;
    PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
    PERFORM set_config('request.jwt.claim.sub','',true);
    SET LOCAL ROLE anon;
    SELECT count(*) INTO row_count FROM public.documents WHERE id IN (draft_id,published_id);
    IF row_count<>1 THEN RAISE EXCEPTION 'Draft publication filter failed'; END IF;
    SELECT count(*) INTO row_count FROM public.document_sections WHERE id IN (public_section_id,hidden_section_id,draft_section_id);
    IF row_count<>1 THEN RAISE EXCEPTION 'Private/draft section filter failed'; END IF;
    FOREACH table_name IN ARRAY private_tables LOOP
      BEGIN
        EXECUTE format('SELECT count(*) FROM public.%I',table_name) INTO row_count;
        RAISE EXCEPTION 'Anonymous private table read grant exists: %',table_name;
      EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    END LOOP;
    BEGIN
      INSERT INTO public.coalitions(name) VALUES('RLS anon denied '||member_id);
      RAISE EXCEPTION 'Anonymous content insert allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    INSERT INTO public.page_views(path) VALUES('/rls-regression');
    INSERT INTO public.search_queries(query,result_count) VALUES('rls regression',0);
    INSERT INTO public.page_usefulness_votes(page_path,is_useful) VALUES('/rls-regression',true);
    INSERT INTO public.general_feedback(feedback_text) VALUES('RLS valid submission');
    INSERT INTO public.citizen_feedback(what_were_you_doing,what_went_wrong,page_path)
      VALUES('Testing access','Regression fixture','/rls-regression');
    -- Supply a reserved negative ID to avoid advancing the contact sequence.
    INSERT INTO public.contact_messages(id,name,email,subject,message)
      VALUES(-2147483648,'RLS fixture','rls@example.invalid','Test','Regression fixture');
    INSERT INTO public.client_feedback(name,email,subject,message,feedback_type)
      VALUES('RLS fixture','rls@example.invalid','Test','Regression fixture','general');
    BEGIN
      INSERT INTO public.page_views(path) VALUES('//invalid.example');
      RAISE EXCEPTION 'Invalid analytics path accepted';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
      INSERT INTO public.search_queries(query,result_count) VALUES('test',-1);
      RAISE EXCEPTION 'Invalid search count accepted';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
      INSERT INTO public.general_feedback(feedback_text) VALUES(repeat('x',1201));
      RAISE EXCEPTION 'Oversized feedback accepted';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;

    -- All app views and search RPCs still execute with a public key.
    PERFORM * FROM public."global_search_view" LIMIT 1;
    PERFORM * FROM public."v_county_with_leaders" LIMIT 1;
    PERFORM * FROM public."education_school_directory" LIMIT 1;
    PERFORM * FROM public."legislation_amendment_schedule_view" LIMIT 1;
    PERFORM * FROM public."legislation_amendment_schedule_full_view" LIMIT 1;
    PERFORM * FROM public.search_public('Kenya',NULL,2);
    PERFORM * FROM public.search_constitution('rights',2);
    PERFORM * FROM public.search_gazette_notices('land',NULL,NULL,2,0);
    PERFORM * FROM public.search_legislation(p_limit => 2);
    PERFORM * FROM public.search_documents(p_limit => 2);

    SET LOCAL ROLE postgres;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
    PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
    SET LOCAL ROLE authenticated;
    IF NOT private.cg_is_admin() THEN RAISE EXCEPTION 'Trusted admin denied'; END IF;
    SELECT count(*) INTO row_count FROM public.documents WHERE id IN (draft_id,published_id);
    IF row_count<>2 THEN RAISE EXCEPTION 'Admin cannot review drafts'; END IF;
    SELECT count(*) INTO row_count FROM public.document_sections WHERE id IN (public_section_id,hidden_section_id,draft_section_id);
    IF row_count<>3 THEN RAISE EXCEPTION 'Admin cannot review private sections'; END IF;
    SELECT count(*) INTO row_count FROM public.general_feedback WHERE id=feedback_id;
    IF row_count<>1 THEN RAISE EXCEPTION 'Admin cannot review feedback'; END IF;
    UPDATE public.coalitions SET slogan='RLS admin update' WHERE id=coalition_id;
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>1 THEN RAISE EXCEPTION 'Admin content update blocked'; END IF;
    DELETE FROM public.coalitions WHERE id=coalition_id;
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>1 THEN RAISE EXCEPTION 'Admin content delete blocked'; END IF;
    INSERT INTO public.coalitions(id,name) VALUES(coalition_id,'RLS admin insert '||coalition_id);
    BEGIN
      UPDATE public.profiles SET is_admin=true WHERE id=member_id;
      RAISE EXCEPTION 'Admin client can bypass service-only privilege assignment';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;

    -- Service-role writes continue to bypass RLS.
    SET LOCAL ROLE service_role;
    UPDATE public.profiles SET is_admin=true WHERE id=member_id;
    GET DIAGNOSTICS row_count=ROW_COUNT;
    IF row_count<>1 THEN RAISE EXCEPTION 'Trusted service cannot manage profile privileges'; END IF;

    -- Force rollback of this entire fixture subtransaction, even on success.
    RAISE EXCEPTION USING ERRCODE='Z0001', MESSAGE='rls_fixture_success_rollback';
  EXCEPTION WHEN SQLSTATE 'Z0001' THEN
    IF SQLERRM<>'rls_fixture_success_rollback' THEN RAISE; END IF;
  END;
  SET LOCAL ROLE postgres;
  IF EXISTS(SELECT 1 FROM auth.users WHERE id IN(member_id,admin_id)) THEN
    RAISE EXCEPTION 'Fixture rollback failed';
  END IF;
  RAISE NOTICE 'RLS regression passed: grants, public reads, private rows, forged claims, profiles, writes, storage, views, search, and service access.';
END $rls_tests$;

ROLLBACK;

