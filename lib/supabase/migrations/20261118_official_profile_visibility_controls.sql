begin;

alter table public.leaders
  add column if not exists profile_visibility jsonb not null default '{}'::jsonb;

create table if not exists public.official_profile_visibility_settings (
  scope text primary key check (
    scope in (
      'all_officials',
      'national_officials',
      'mps',
      'senators',
      'governors',
      'women_representatives'
    )
  ),
  visibility jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.official_profile_visibility_settings enable row level security;
revoke all on public.official_profile_visibility_settings from anon, authenticated;
grant select on public.official_profile_visibility_settings to anon, authenticated;
grant insert, update, delete on public.official_profile_visibility_settings to authenticated;

drop policy if exists official_visibility_public_read
  on public.official_profile_visibility_settings;
create policy official_visibility_public_read
  on public.official_profile_visibility_settings
  for select to anon, authenticated using (true);

drop policy if exists official_visibility_admin_insert
  on public.official_profile_visibility_settings;
create policy official_visibility_admin_insert
  on public.official_profile_visibility_settings
  for insert to authenticated
  with check ((select private.cg_is_admin()));

drop policy if exists official_visibility_admin_update
  on public.official_profile_visibility_settings;
create policy official_visibility_admin_update
  on public.official_profile_visibility_settings
  for update to authenticated
  using ((select private.cg_is_admin()))
  with check ((select private.cg_is_admin()));

drop policy if exists official_visibility_admin_delete
  on public.official_profile_visibility_settings;
create policy official_visibility_admin_delete
  on public.official_profile_visibility_settings
  for delete to authenticated
  using ((select private.cg_is_admin()));

commit;
