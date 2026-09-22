# RLS alignment — 21 September 2026

Status: **applied and verified on the connected project**.
Applied through Supabase MCP after explicit approval. Migration history: `20260921124140_rls_alignment_and_access_regression`. All regression assertions passed before COMMIT; fixture records were rolled back.

## Files

- Migration: [20260921_rls_alignment.sql](../../lib/supabase/migrations/20260921_rls_alignment.sql)
- Transactional regression: [rls-alignment.sql](../../tests/database/rls-alignment.sql)
- Before snapshot (metadata only): [rls-before-20260921.json](rls-before-20260921.json)

The earlier `20260921_security_hardening.sql` is preserved. The new migration incorporates its profile-column protection and analytics bounds, adds complete policy alignment, and supersedes its intended changes. Do not bulk-replay the legacy migration directory.

## Access model

132 application tables are explicitly classified. Existing public publication and verification filters are preserved; constitution relationship tables now require Verified links and document categories require is_active. Institution locations and budgets receive public read policies. Public reads work for both anonymous visitors and ordinary signed-in users.

- Public content: SELECT for visitors; INSERT/UPDATE/DELETE only for authenticated users with the protected `profiles.is_admin = true` flag or the trusted service role.
- Private submissions and analytics: bounded INSERT for visitors, no visitor reads/updates/deletes; admins can review/manage records.
- Import source text and admin activity: admin SELECT, service-only writes.
- Profiles: own profile read and full_name/updated_at edit; admin read of profiles; privilege assignment (is_admin), email, identifiers and profile creation/deletion remain service-only.
- Admin checks live in a non-API `private` schema with a fixed empty search path, avoiding recursive profile policies and client-controlled JWT metadata.
- Five application views use security_invoker so base table policies are enforced.
- Portrait files remain publicly readable; storage INSERT/UPDATE/DELETE requires the trusted admin flag.
- App function search paths are fixed; default table/sequence grants for new postgres-created public objects are closed until explicitly granted.

Existing server-side admin routes authorize the real user, then use a service-role client. That access remains available. No frontend build/deploy is needed for these database policy changes.

## Validation

Before changes, anonymous SELECT counts were recorded for all 121 public content tables. The database regression suite is designed to execute within the migration transaction **before commit**, so a failed assertion rolls the change back. Fixture auth users and records are created inside a subtransaction that always rolls back.

Checks cover public/ordinary-user read parity; unpublished documents and private sections; forged user_metadata claims; profile ownership and self-promotion; actual non-admin UPDATE/DELETE attempts across editable application tables; content INSERT denial; private submission reads; valid and invalid visitor submissions; portrait write denial; all five app views; five search RPCs; verified administrator CRUD; and service-role privilege assignment.

Docker's daemon was unavailable. The full regression suite instead ran inside the live migration transaction before commit. Post-commit checks confirmed 132 application tables have RLS enabled and no test users or test documents remain.

All 121 public table reads were compared with the before snapshot. Counts were unchanged on 120 tables; `institution_locations` now exposes the intended 23 public office locations, previously hidden by missing policies. These are database-level checks, not a browser walkthrough.

Post-commit security adviser: 9 findings remain, down from 73. They comprise one PostGIS `spatial_ref_sys` RLS error, one PostGIS schema-placement warning, six PostGIS security-definer execution warnings (three overloads, two roles), and disabled leaked-password protection. All application RLS, unsafe-metadata, security-definer-view, missing-policy, and mutable-function-search-path findings are resolved.

Post-commit performance adviser: no auth RLS initplan or multiple-permissive-policy warnings remain. Unrelated findings are 86 unindexed foreign keys, 91 indexes currently reported unused, and one duplicate-index warning. The unused-index count is usage-dependent; no indexes were removed.

No manual migration run or application deployment is needed for this completed database change. To rerun verification, execute the entire `tests/database/rls-alignment.sql` file as `postgres` in Supabase SQL Editor; its final ROLLBACK keeps fixture data out of the database. Do not rerun the already-applied migration or the superseded hardening script.

## Known limits

- `public.spatial_ref_sys` is owned by `supabase_admin`, is part of PostGIS, and this connection has neither ownership nor grant options. Its existing API write grants and missing RLS remain unresolved. The PostGIS extension and its functions are not modified. This is an explicit exception, not a claim that every security adviser finding is fixed.
- Supabase-managed auth/storage/vault tables are not bulk-modified. Only the app's existing portrait object policies are replaced.
- Direct bounded anonymous submissions remain available to preserve current clients. RLS input limits are not rate limits or CAPTCHA. A future server-only ingestion change must be coordinated with the deployed application.
- RLS governs rows, not individual content columns. Existing public content projections are preserved; editorial-note column minimization is a separate application/database contract change.
- Leaked-password protection, PostGIS schema placement, duplicate indexes, missing indexes and unused indexes are outside this RLS migration.
- Future migrations must explicitly enable RLS, grant access and add policies; they no longer inherit open client table/sequence grants.

## Table-by-table contract

| Table (public schema) | Visitor SELECT | Visitor INSERT | Authenticated admin writes |
|---|---|---|---|
| profiles | No | No | Own name/timestamp only; privileged fields service-only |
| admin_boundary_units | Yes | No | Yes |
| cabinet_brief_sources | Filtered | No | Yes |
| cabinet_briefs | Filtered | No | Yes |
| census_years | Yes | No | Yes |
| citizen_feedback | No | Bounded | Yes |
| client_feedback | No | Bounded | Yes |
| coalitions | Yes | No | Yes |
| constituencies | Yes | No | Yes |
| constitution_article_institutions | Filtered | No | Yes |
| constitution_article_people | Filtered | No | Yes |
| constitution_articles | Yes | No | Yes |
| constitution_chapters | Yes | No | Yes |
| constitution_inline_links | Filtered | No | Yes |
| constitution_parts | Yes | No | Yes |
| constitution_schedules | Yes | No | Yes |
| constitutions | Filtered | No | Yes |
| contact_messages | No | Bounded | Yes |
| counties | Yes | No | Yes |
| county_flagship_projects | Yes | No | Yes |
| county_me_indicators | Yes | No | Yes |
| county_revenue_projections | Yes | No | Yes |
| county_sector_programmes | Yes | No | Yes |
| county_sub_counties | Yes | No | Yes |
| departments | Yes | No | Yes |
| diplomatic_accreditations | Yes | No | Yes |
| diplomatic_extensions | Yes | No | Yes |
| document_admin_activity | No | No | Service-only |
| document_categories | Filtered | No | Yes |
| document_files | Filtered | No | Yes |
| document_inline_links | Filtered | No | Yes |
| document_institution_links | Filtered | No | Yes |
| document_relationships | Filtered | No | Yes |
| document_sections | Filtered | No | Yes |
| document_series | Yes | No | Yes |
| document_topic_links | Filtered | No | Yes |
| document_topics | Filtered | No | Yes |
| document_types | Filtered | No | Yes |
| document_versions | Filtered | No | Yes |
| documents | Filtered | No | Yes |
| education_counties | Yes | No | Yes |
| education_data_sources | Yes | No | Yes |
| education_school_aliases | Yes | No | Yes |
| education_school_identifiers | Yes | No | Yes |
| education_school_offerings | Yes | No | Yes |
| education_school_source_records | Yes | No | Yes |
| education_schools | Yes | No | Yes |
| education_sub_counties | Yes | No | Yes |
| epra_enforcement_log | Yes | No | Yes |
| epra_international_trends | Yes | No | Yes |
| epra_lpg_prices | Yes | No | Yes |
| epra_nairobi_breakdown | Yes | No | Yes |
| epra_price_cycles | Yes | No | Yes |
| epra_town_prices | Yes | No | Yes |
| gazette_corrigenda_entries | Filtered | No | Yes |
| gazette_inline_links | Filtered | No | Yes |
| gazette_issue_sections | Yes | No | Yes |
| gazette_issues | Yes | No | Yes |
| gazette_notice_institutions | Filtered | No | Yes |
| gazette_notice_people | Filtered | No | Yes |
| gazette_notice_relationships | Filtered | No | Yes |
| gazette_notices | Yes | No | Yes |
| general_feedback | No | Bounded | Yes |
| government_entities | Yes | No | Yes |
| government_levels | Yes | No | Yes |
| government_structure | Yes | No | Yes |
| independent_bodies | Yes | No | Yes |
| institution_budgets | Yes | No | Yes |
| institution_documents | Yes | No | Yes |
| institution_leaders | Yes | No | Yes |
| institution_lifecycle_segments | Filtered | No | Yes |
| institution_locations | Yes | No | Yes |
| institution_name_history | Filtered | No | Yes |
| institution_relationships | Filtered | No | Yes |
| institution_services | Yes | No | Yes |
| institutions | Yes | No | Yes |
| kenya_counties | Yes | No | Yes |
| knbs_ethnicity_census | Yes | No | Yes |
| knbs_religion_census | Yes | No | Yes |
| leader_categories | Yes | No | Yes |
| leader_name_title_options | Yes | No | Yes |
| leader_national_honour_options | Yes | No | Yes |
| leader_roles | Yes | No | Yes |
| leaders | Yes | No | Yes |
| legal_citations | Filtered | No | Yes |
| legal_document_relationships | Filtered | No | Yes |
| legal_documents | Yes | No | Yes |
| legal_provision_relationships | Filtered | No | Yes |
| legal_provisions | Yes | No | Yes |
| legislation_admin_activity | No | No | Service-only |
| legislation_amendment_blocks | Yes | No | Yes |
| legislation_amendment_groups | Yes | No | Yes |
| legislation_amendment_items | Yes | No | Yes |
| legislation_change_impacts | Filtered | No | Yes |
| legislation_changes | Filtered | No | Yes |
| legislation_documents | Yes | No | Yes |
| legislation_import_source_text | No | No | Service-only |
| legislation_inline_links | Filtered | No | Yes |
| legislation_provision_display_notes | Yes | No | Yes |
| legislation_provisions | Yes | No | Yes |
| legislation_source_snapshots | Yes | No | Yes |
| legislation_versions | Yes | No | Yes |
| mca_social_media | Yes | No | Yes |
| mca_terms | Yes | No | Yes |
| mcas | Yes | No | Yes |
| official_relationships | Yes | No | Yes |
| officials | Yes | No | Yes |
| page_usefulness_votes | No | Bounded | Yes |
| page_views | No | Bounded | Yes |
| party_documents | Yes | No | Yes |
| party_history | Yes | No | Yes |
| party_leadership | Yes | No | Yes |
| political_parties | Yes | No | Yes |
| polling_stations_2022 | Filtered | No | Yes |
| positions | Yes | No | Yes |
| presidential_speech_relationships | Filtered | No | Yes |
| presidential_speech_sources | Filtered | No | Yes |
| presidential_speech_topics | Filtered | No | Yes |
| presidential_speeches | Filtered | No | Yes |
| presidents | Yes | No | Yes |
| public_officials | Yes | No | Yes |
| schools | Yes | No | Yes |
| search_expansions | Yes | No | Yes |
| search_queries | No | Bounded | Yes |
| site_status | Yes | No | Yes |
| speech_topics | Filtered | No | Yes |
| speech_types | Filtered | No | Yes |
| ward_health_facilities | Yes | No | Yes |
| ward_leadership | Yes | No | Yes |
| ward_projects | Yes | No | Yes |
| ward_schools | Yes | No | Yes |
| wards | Yes | No | Yes |

Exact filtered predicates and submission bounds are recorded in the migration's explicit JSON matrix.
