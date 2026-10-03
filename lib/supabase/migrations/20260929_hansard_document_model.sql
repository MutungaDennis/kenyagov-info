-- The initial migration created an empty compatibility model. Replace ONLY
-- that empty Hansard model; never silently discard imported/edited records.
do $$ begin
  if exists(select 1 from public.hansard_sittings) then
    raise exception 'Hansard is not empty. Back up and explicitly clear records before applying this replacement.';
  end if;
end $$;
drop function public.save_hansard_sitting(jsonb);
drop function public.search_migrated_content(text,integer);
drop table public.hansard_contributions;
drop table public.hansard_sittings;

create table public.hansard_sittings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]*$'),
  title text not null check(length(trim(title))>0),
  house_type text not null check(house_type in ('national-assembly','senate','county-assembly')),
  sitting_date date not null,
  sitting_period text not null default 'Morning Sitting',
  sitting_number text,
  parliament_number smallint,
  session_number smallint,
  parliamentary_term text,
  county_id uuid references public.counties(id) on delete set null,
  county_name text,
  starts_at time,
  ends_at time,
  official_hansard_url text,
  youtube_url text,
  summary_html text not null default '',
  summary_text text not null default '',
  topics text[] not null default '{}',
  status text not null default 'draft' check(status in ('draft','review','published','archived')),
  review_status text not null default 'pending' check(review_status in ('pending','reviewed')),
  published_at timestamptz,
  presiding_leader_id uuid references public.leaders(id) on delete set null,
  presiding_role_id uuid references public.leader_roles(id) on delete set null,
  presiding_display_name text,
  presiding_capacity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_reviewed check(status <> 'published' or (review_status='reviewed' and published_at is not null))
);
create index hansard_archive_idx on public.hansard_sittings(house_type,sitting_date desc);
create index hansard_presiding_idx on public.hansard_sittings(presiding_leader_id);
create index hansard_presiding_role_idx on public.hansard_sittings(presiding_role_id);
create index hansard_county_idx on public.hansard_sittings(county_id);

create table public.hansard_sections (
  id uuid primary key default gen_random_uuid(),
  sitting_id uuid not null references public.hansard_sittings(id) on delete cascade,
  section_key text not null,
  parent_key text,
  heading text not null,
  section_type text not null default 'debate' check(section_type in ('debate','question','statement','motion','bill','petition','paper','procedural','other')),
  sort_order integer not null check(sort_order >= 0),
  body_html text not null default '',
  body_text text not null default '',
  source_page_start integer check(source_page_start > 0),
  source_page_end integer check(source_page_end > 0),
  unique(sitting_id,section_key),
  foreign key(sitting_id,parent_key) references public.hansard_sections(sitting_id,section_key) deferrable initially deferred,
  check(parent_key is null or parent_key <> section_key),
  check(source_page_end is null or source_page_start is null or source_page_end >= source_page_start)
);
create index hansard_section_parent_idx on public.hansard_sections(sitting_id,parent_key);

create table public.hansard_contributions (
  id uuid primary key default gen_random_uuid(),
  sitting_id uuid not null references public.hansard_sittings(id) on delete cascade,
  contribution_key text not null,
  section_key text not null,
  sort_order integer not null check(sort_order>0),
  contribution_type text not null default 'speech' check(contribution_type in ('speech','interjection','procedural','collective','written')),
  speaker_kind text not null default 'unknown' check(speaker_kind in ('member','office-holder','guest','collective','unknown')),
  leader_id uuid references public.leaders(id) on delete set null,
  leader_role_id uuid references public.leader_roles(id) on delete set null,
  speaker_name text not null default '',
  speaker_title text,
  constituency text,
  county text,
  party text,
  capacity text,
  is_chair boolean not null default false,
  body_html text not null default '',
  body_text text not null default '',
  language text not null default 'en',
  spoken_at text,
  source_page integer check(source_page>0),
  source_column text,
  link_status text not null default 'unmatched' check(link_status in ('unmatched','suggested','confirmed','not-applicable')),
  review_status text not null default 'pending' check(review_status in ('pending','reviewed')),
  unique(sitting_id,contribution_key),
  unique(sitting_id,sort_order),
  foreign key(sitting_id,section_key) references public.hansard_sections(sitting_id,section_key) deferrable initially deferred,
  check(link_status <> 'confirmed' or leader_id is not null)
);
create index hansard_contributions_leader_idx on public.hansard_contributions(leader_id,sitting_id);
create index hansard_contributions_role_idx on public.hansard_contributions(leader_role_id);
create index hansard_contributions_section_idx on public.hansard_contributions(sitting_id,section_key);
create index hansard_contributions_search_idx on public.hansard_contributions using gin(to_tsvector('simple',body_text));

create table public.hansard_sources (
  id uuid primary key default gen_random_uuid(),
  sitting_id uuid not null references public.hansard_sittings(id) on delete cascade,
  source_url text,
  file_name text,
  storage_path text,
  document_file_id uuid references public.document_files(id) on delete set null,
  page_count integer check(page_count>0),
  sha256 text,
  is_official_source boolean not null default true,
  extraction_method text not null default 'manual' check(extraction_method in ('manual','pdf-text','ocr','grok','other')),
  extracted_at timestamptz,
  created_at timestamptz not null default now()
);
create index hansard_sources_sitting_idx on public.hansard_sources(sitting_id);
create index hansard_sources_document_idx on public.hansard_sources(document_file_id);
create table public.hansard_imports (
  id uuid primary key default gen_random_uuid(),
  sitting_id uuid references public.hansard_sittings(id) on delete set null,
  source_name text,
  extraction_method text not null default 'manual',
  payload jsonb not null,
  imported_by uuid references auth.users(id) on delete set null,
  imported_at timestamptz not null default now()
);
create index hansard_imports_sitting_idx on public.hansard_imports(sitting_id);
create index hansard_imports_user_idx on public.hansard_imports(imported_by);

do $$ declare t text; begin
  foreach t in array array['hansard_sittings','hansard_sections','hansard_contributions','hansard_sources','hansard_imports'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('grant select on public.%I to anon,authenticated',t);
    execute format('grant insert,update,delete on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('create policy admin_all on public.%I for all to authenticated using ((select private.cg_is_admin())) with check ((select private.cg_is_admin()))',t);
  end loop;
  foreach t in array array['hansard_sections','hansard_contributions','hansard_sources'] loop
    execute format('create policy public_read on public.%I for select to anon,authenticated using (exists(select 1 from public.hansard_sittings s where s.id=sitting_id and s.status=''published'' and s.published_at is not null))',t);
  end loop;
end $$;
create policy public_read on public.hansard_sittings for select to anon,authenticated using(status='published' and published_at is not null);

-- Some historical roles have a null house; infer only well-defined parliamentary titles.
create function public.hansard_role_house(role_house text,role_title text) returns text
language sql immutable set search_path='' as $$
select coalesce(nullif(role_house,''),case
 when role_title ~* 'senator|senate' then 'senate'
 when role_title ~* 'member of parliament|women representative|woman representative|national assembly' then 'national-assembly'
 when role_title ~* 'member of county assembly|\mMCA\M|county assembly' then 'county-assembly' end);
$$;
create function public.hansard_member_candidates(p_house text,p_date date,p_query text default '')
returns table(leader_id uuid,leader_role_id uuid,full_name text,slug text,title text,party text,constituency text,county text,term_start_date date,term_end_date date)
language sql stable security invoker set search_path='' as $$
select l.id,r.id,l.full_name,l.slug,r.title,r.party,r.constituency,r.county,r.term_start_date,r.term_end_date
from public.leaders l join public.leader_roles r on r.leader_id=l.id
where public.hansard_role_house(r.house,r.title)=p_house
and r.term_start_date<=p_date and (r.term_end_date is null or r.term_end_date>=p_date)
and (length(trim(p_query))=0 or l.full_name ilike '%'||left(p_query,100)||'%' or r.constituency ilike '%'||left(p_query,100)||'%')
order by l.full_name,r.term_start_date desc limit 100;
$$;
revoke all on function public.hansard_member_candidates(text,date,text) from public;
grant execute on function public.hansard_member_candidates(text,date,text) to anon,authenticated,service_role;

-- Called after all children are saved, including when status changes alone.
create function public.validate_hansard_publication(p_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare s public.hansard_sittings; begin
select * into s from public.hansard_sittings where id=p_id;
if s.status <> 'published' then return; end if;
if not exists(select 1 from public.hansard_contributions where sitting_id=p_id) then raise exception 'A published sitting needs at least one contribution'; end if;
if exists(select 1 from public.hansard_contributions c where c.sitting_id=p_id and
 (c.review_status<>'reviewed' or c.speaker_kind='unknown' or length(trim(c.body_text))=0 or
  (c.speaker_kind='member' and (c.link_status<>'confirmed' or c.leader_id is null or c.leader_role_id is null)) or
  c.link_status in ('unmatched','suggested'))) then raise exception 'Review every contribution and confirm member links before publishing'; end if;
if exists(select 1 from public.hansard_contributions c left join public.leader_roles r on r.id=c.leader_role_id
 where c.sitting_id=p_id and c.speaker_kind='member' and
 (r.id is null or r.leader_id<>c.leader_id or public.hansard_role_house(r.house,r.title) is distinct from s.house_type or r.term_start_date>s.sitting_date or (r.term_end_date is not null and r.term_end_date<s.sitting_date))) then
 raise exception 'A linked parliamentary role does not match the member, house or sitting date'; end if;
end $$;
create function public.hansard_publication_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
perform public.validate_hansard_publication(case when tg_table_name='hansard_sittings' then (to_jsonb(new)->>'id')::uuid else coalesce((to_jsonb(new)->>'sitting_id')::uuid,(to_jsonb(old)->>'sitting_id')::uuid) end);
return null;
end $$;
create constraint trigger hansard_publication_guard after insert or update on public.hansard_sittings deferrable initially deferred for each row execute function public.hansard_publication_guard();
create constraint trigger hansard_publication_guard after insert or update or delete on public.hansard_contributions deferrable initially deferred for each row execute function public.hansard_publication_guard();

create function public.save_hansard_document(p_document jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare sid uuid := coalesce(nullif(p_document#>>'{sitting,id}','')::uuid,gen_random_uuid()); s jsonb := p_document->'sitting';
begin
if jsonb_typeof(p_document->'sections') is distinct from 'array' or jsonb_typeof(p_document->'contributions') is distinct from 'array' then raise exception 'sections and contributions must be arrays'; end if;
insert into public.hansard_sittings(id,slug,title,house_type,sitting_date,sitting_period,sitting_number,parliament_number,session_number,parliamentary_term,county_id,county_name,starts_at,ends_at,official_hansard_url,youtube_url,summary_html,summary_text,topics,status,review_status,published_at,presiding_leader_id,presiding_role_id,presiding_display_name,presiding_capacity)
values(sid,s->>'slug',s->>'title',s->>'house_type',(s->>'sitting_date')::date,coalesce(s->>'sitting_period','Morning Sitting'),s->>'sitting_number',nullif(s->>'parliament_number','')::smallint,nullif(s->>'session_number','')::smallint,s->>'parliamentary_term',nullif(s->>'county_id','')::uuid,s->>'county_name',nullif(s->>'starts_at','')::time,nullif(s->>'ends_at','')::time,s->>'official_hansard_url',s->>'youtube_url',coalesce(s->>'summary_html',''),coalesce(s->>'summary_text',''),array(select jsonb_array_elements_text(coalesce(s->'topics','[]'::jsonb))),coalesce(s->>'status','draft'),coalesce(s->>'review_status','pending'),case when s->>'status'='published' then now() end,nullif(s->>'presiding_leader_id','')::uuid,nullif(s->>'presiding_role_id','')::uuid,s->>'presiding_display_name',s->>'presiding_capacity')
on conflict(id) do update set slug=excluded.slug,title=excluded.title,house_type=excluded.house_type,sitting_date=excluded.sitting_date,sitting_period=excluded.sitting_period,sitting_number=excluded.sitting_number,parliament_number=excluded.parliament_number,session_number=excluded.session_number,parliamentary_term=excluded.parliamentary_term,county_id=excluded.county_id,county_name=excluded.county_name,starts_at=excluded.starts_at,ends_at=excluded.ends_at,official_hansard_url=excluded.official_hansard_url,youtube_url=excluded.youtube_url,summary_html=excluded.summary_html,summary_text=excluded.summary_text,topics=excluded.topics,status=excluded.status,review_status=excluded.review_status,published_at=case when excluded.status='published' then coalesce(public.hansard_sittings.published_at,now()) end,presiding_leader_id=excluded.presiding_leader_id,presiding_role_id=excluded.presiding_role_id,presiding_display_name=excluded.presiding_display_name,presiding_capacity=excluded.presiding_capacity,updated_at=now();
delete from public.hansard_contributions where sitting_id=sid;
delete from public.hansard_sections where sitting_id=sid;
delete from public.hansard_sources where sitting_id=sid;
insert into public.hansard_sections(sitting_id,section_key,parent_key,heading,section_type,sort_order,body_html,body_text,source_page_start,source_page_end)
select sid,x.section_key,x.parent_key,x.heading,coalesce(x.section_type,'debate'),x.sort_order,coalesce(x.body_html,''),coalesce(x.body_text,''),x.source_page_start,x.source_page_end
from jsonb_to_recordset(p_document->'sections') as x(section_key text,parent_key text,heading text,section_type text,sort_order integer,body_html text,body_text text,source_page_start integer,source_page_end integer);
insert into public.hansard_contributions(sitting_id,contribution_key,section_key,sort_order,contribution_type,speaker_kind,leader_id,leader_role_id,speaker_name,speaker_title,constituency,county,party,capacity,is_chair,body_html,body_text,language,spoken_at,source_page,source_column,link_status,review_status)
select sid,x.contribution_key,x.section_key,x.sort_order,coalesce(x.contribution_type,'speech'),coalesce(x.speaker_kind,'unknown'),x.leader_id,x.leader_role_id,coalesce(x.speaker_name,''),x.speaker_title,x.constituency,x.county,x.party,x.capacity,coalesce(x.is_chair,false),coalesce(x.body_html,''),coalesce(x.body_text,''),coalesce(x.language,'en'),x.spoken_at,x.source_page,x.source_column,coalesce(x.link_status,'unmatched'),coalesce(x.review_status,'pending')
from jsonb_to_recordset(p_document->'contributions') as x(contribution_key text,section_key text,sort_order integer,contribution_type text,speaker_kind text,leader_id uuid,leader_role_id uuid,speaker_name text,speaker_title text,constituency text,county text,party text,capacity text,is_chair boolean,body_html text,body_text text,language text,spoken_at text,source_page integer,source_column text,link_status text,review_status text);
insert into public.hansard_sources(sitting_id,source_url,file_name,storage_path,document_file_id,page_count,sha256,is_official_source,extraction_method,extracted_at)
select sid,x.source_url,x.file_name,x.storage_path,x.document_file_id,x.page_count,x.sha256,coalesce(x.is_official_source,true),coalesce(x.extraction_method,'manual'),x.extracted_at
from jsonb_to_recordset(coalesce(p_document->'sources','[]'::jsonb)) as x(source_url text,file_name text,storage_path text,document_file_id uuid,page_count integer,sha256 text,is_official_source boolean,extraction_method text,extracted_at timestamptz);
perform public.validate_hansard_publication(sid);
return sid;
end $$;
revoke all on function public.save_hansard_document(jsonb) from public,anon;
grant execute on function public.save_hansard_document(jsonb) to authenticated,service_role;
revoke all on function public.validate_hansard_publication(uuid) from public,anon;
grant execute on function public.validate_hansard_publication(uuid) to authenticated,service_role;

create function public.search_migrated_content(q text,lim integer default 60)
returns table(id text,name text,slug text,base_route text,snippet text,entity_type text,rank real)
language sql stable security invoker set search_path='' as $$
with query as (select websearch_to_tsquery('simple',left(q,120)) as term), documents as (
select s.id,s.title as name,s.slug,'/'::text as base_route,coalesce(s.content->>'summary','') as snippet,'Service'::text as entity_type,
to_tsvector('simple',s.title||' '||coalesce(s.content->>'summary','')||' '||coalesce(s.content->'body','[]'::jsonb)::text) as document from public.government_services s where s.is_published
union all select h.id::text,h.title,'sitting/'||h.slug,'/government/legislature/hansard',h.summary_text,'Hansard',to_tsvector('simple',h.title||' '||array_to_string(h.topics,' ')||' '||h.summary_text) from public.hansard_sittings h where h.status='published'
union all select c.id::text,h.title||' — '||c.speaker_name,'sitting/'||h.slug||'#contribution-'||c.contribution_key,'/government/legislature/hansard',left(c.body_text,240),'Hansard contribution',to_tsvector('simple',c.body_text) from public.hansard_contributions c join public.hansard_sittings h on h.id=c.sitting_id where h.status='published'
)
select d.id,d.name,d.slug,d.base_route,left(d.snippet,240),d.entity_type,ts_rank_cd(d.document,query.term) from documents d cross join query where d.document @@ query.term order by ts_rank_cd(d.document,query.term) desc,d.id limit least(greatest(lim,1),100);
$$;
revoke all on function public.search_migrated_content(text,integer) from public;
grant execute on function public.search_migrated_content(text,integer) to anon,authenticated,service_role;
