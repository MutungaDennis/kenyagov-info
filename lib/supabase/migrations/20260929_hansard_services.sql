-- Rich text remains Portable Text JSON, a portable format independent of Sanity.
-- Stable text IDs preserve imported references and contribution anchors.
create table public.hansard_sittings (
  id text primary key default gen_random_uuid()::text,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  title text generated always as (content->>'title') stored not null,
  house_type text generated always as (content->>'houseType') stored not null
    check (house_type in ('national-assembly','senate','county-assembly')),
  sitting_date text generated always as (content->>'sittingDate') stored not null
    check (sitting_date ~ '^\d{4}-\d{2}-\d{2}$'),
  parliamentary_term text generated always as (content->>'parliamentaryTerm') stored,
  county text generated always as (coalesce(content->>'countyName',content->>'county')) stored,
  is_published boolean not null default false,
  contribution_count integer not null default 0 check (contribution_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hansard_archive_idx on public.hansard_sittings(house_type,sitting_date desc) where is_published;
create table public.hansard_contributions (
  sitting_id text not null references public.hansard_sittings(id) on delete cascade,
  key text not null,
  position integer not null check (position > 0),
  leader_id uuid references public.leaders(id) on delete set null,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  primary key(sitting_id,key),
  unique(sitting_id,position)
);
create index hansard_contributions_leader_idx on public.hansard_contributions(leader_id,sitting_id);

create table public.government_services (
  id text primary key default gen_random_uuid()::text,
  content jsonb not null check(jsonb_typeof(content)='object'),
  title text generated always as (content->>'title') stored not null,
  slug text generated always as (content#>>'{slug,current}') stored not null unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.service_categories (
  id text primary key default gen_random_uuid()::text,
  content jsonb not null check(jsonb_typeof(content)='object'),
  title text generated always as (content->>'title') stored not null,
  slug text generated always as (content#>>'{slug,current}') stored not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.service_providers (
  id text primary key default gen_random_uuid()::text,
  content jsonb not null check(jsonb_typeof(content)='object'),
  name text generated always as (content->>'name') stored not null,
  slug text generated always as (content#>>'{slug,current}') stored not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.service_category_links (
  category_id text not null references public.service_categories(id) on delete cascade,
  service_id text not null references public.government_services(id) on delete cascade,
  heading text not null default 'General',
  position integer not null default 0,
  primary key(category_id,service_id,heading)
);
create index service_category_links_service_idx on public.service_category_links(service_id);
create table public.service_link_phrases (
  id text primary key default gen_random_uuid()::text,
  content jsonb not null check(jsonb_typeof(content)='object'),
  phrase text generated always as (content->>'phrase') stored not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Match the document module's administrator policy; never grant public writes.
do $$ declare t text; begin
  foreach t in array array['hansard_sittings','hansard_contributions','government_services','service_categories','service_providers','service_category_links','service_link_phrases'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('grant select on public.%I to anon, authenticated',t);
    execute format('grant insert, update, delete on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('create policy admin_all on public.%I for all to authenticated using ((select private.cg_is_admin())) with check ((select private.cg_is_admin()))',t);
  end loop;
end $$;
create policy public_read on public.hansard_sittings for select to anon,authenticated using (is_published);
create policy public_read on public.hansard_contributions for select to anon,authenticated using
  (exists(select 1 from public.hansard_sittings s where s.id=sitting_id and s.is_published));
create policy public_read on public.government_services for select to anon,authenticated using (is_published);
create policy public_read on public.service_categories for select to anon,authenticated using (true);
create policy public_read on public.service_providers for select to anon,authenticated using (true);
create policy public_read on public.service_category_links for select to anon,authenticated using
  (exists(select 1 from public.government_services s where s.id=service_id and s.is_published));
-- Link phrase rules are an admin editing feature, not a public catalogue.

create function public.save_hansard_sitting(p_document jsonb) returns text
language plpgsql security invoker set search_path='' as $$
declare sid text := coalesce(nullif(p_document->>'_id',''),gen_random_uuid()::text);
begin
  if jsonb_typeof(p_document->'contributions') is distinct from 'array' then
    raise exception 'contributions must be an array';
  end if;
  insert into public.hansard_sittings(id,content,is_published,contribution_count)
  values(sid,p_document-'contributions',coalesce((p_document->>'isActive')::boolean,false),jsonb_array_length(p_document->'contributions'))
  on conflict(id) do update set content=excluded.content,is_published=excluded.is_published,
    contribution_count=excluded.contribution_count,updated_at=now();
  -- Parent row is locked by the upsert: replacing children is atomic and serialized.
  delete from public.hansard_contributions where sitting_id=sid;
  insert into public.hansard_contributions(sitting_id,key,position,leader_id,content)
  select sid,coalesce(nullif(c->>'_key',''),'contrib-'||n),n::integer,
    nullif(c->>'supabaseLeaderId','')::uuid,c
  from jsonb_array_elements(p_document->'contributions') with ordinality as x(c,n);
  return sid;
end $$;
revoke all on function public.save_hansard_sitting(jsonb) from public,anon;
grant execute on function public.save_hansard_sitting(jsonb) to authenticated,service_role;

create function public.save_government_service(p_document jsonb,p_category_id text default null,p_heading text default 'General') returns text
language plpgsql security invoker set search_path='' as $$
declare sid text := coalesce(nullif(p_document->>'_id',''),gen_random_uuid()::text);
begin
  insert into public.government_services(id,content,is_published)
  values(sid,p_document,coalesce(p_document->>'status','draft')='published')
  on conflict(id) do update set content=excluded.content,is_published=excluded.is_published,updated_at=now();
  if nullif(p_category_id,'') is not null then
    insert into public.service_category_links(category_id,service_id,heading)
    values(p_category_id,sid,coalesce(nullif(p_heading,''),'General')) on conflict do nothing;
  end if;
  return sid;
end $$;
revoke all on function public.save_government_service(jsonb,text,text) from public,anon;
grant execute on function public.save_government_service(jsonb,text,text) to authenticated,service_role;

comment on column public.hansard_sittings.content is 'Portable sitting metadata, including source URLs; contributions are stored separately. Search columns are generated from this JSON to prevent drift.';
comment on column public.government_services.content is 'Structured service guidance: rich-text body, steps, fees, downloads, provider IDs and related-service IDs. Preserves source fields during migration.';
