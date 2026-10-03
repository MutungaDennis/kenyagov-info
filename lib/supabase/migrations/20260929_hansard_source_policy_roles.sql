drop policy source_access_guard on public.hansard_sittings;
create policy source_access_guard on public.hansard_sittings as restrictive for select to anon using(public.hansard_public_source(source_access,proceeding_type,source_community_id));
create policy source_access_admin_guard on public.hansard_sittings as restrictive for select to authenticated using((select private.cg_is_admin()) or public.hansard_public_source(source_access,proceeding_type,source_community_id));
