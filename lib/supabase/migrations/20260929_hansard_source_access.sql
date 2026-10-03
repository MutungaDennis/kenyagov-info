-- Counts of zero are not access-control rules. Classify the actual source.
create table public.hansard_repository_communities (
 id uuid primary key, title text not null, proceeding_type text not null,
 access_level text not null check(access_level in ('public','restricted')),
 repository_url text not null
);
insert into public.hansard_repository_communities values
 ('2fa15201-cbe0-4290-9fcb-eed7ffb03c9b','House proceedings','house-proceeding','public','https://hansardna.parliament.go.ke'),
 ('1653b0ba-1c30-45fa-be00-98afccf14b49','Committee proceedings','committee-proceeding','restricted','https://hansardna.parliament.go.ke'),
 ('5e16943d-6a47-4935-8224-bd443a2c93dd','Joint sittings','joint-sitting','public','https://hansardna.parliament.go.ke'),
 ('22ba6910-3b34-4d7e-a6c5-bd78e25568e2','State opening sittings','state-opening','public','https://hansardna.parliament.go.ke'),
 ('ab0cdf0a-fcf7-4fec-b07c-63d4d122b379','Sessional bound volumes','bound-volume','restricted','https://hansardna.parliament.go.ke');
alter table public.hansard_repository_communities enable row level security;
grant select on public.hansard_repository_communities to anon,authenticated;
grant all on public.hansard_repository_communities to service_role;
create policy public_read on public.hansard_repository_communities for select to anon,authenticated using(access_level='public');
create policy admin_read on public.hansard_repository_communities for select to authenticated using((select private.cg_is_admin()));
alter table public.hansard_sittings
 add column proceeding_type text not null default 'house-proceeding' check(proceeding_type in ('house-proceeding','joint-sitting','state-opening','committee-proceeding','bound-volume')),
 add column source_access text not null default 'unknown' check(source_access in ('unknown','public','restricted')),
 add column source_community_id uuid references public.hansard_repository_communities(id),
 add column source_collection_id uuid,
 add column source_item_id uuid;
create index hansard_community_idx on public.hansard_sittings(source_community_id);
create index hansard_proceeding_date_idx on public.hansard_sittings(proceeding_type,sitting_date desc);
create function public.hansard_public_source(access text,proceeding text,community uuid) returns boolean
language sql stable security invoker set search_path='' as $$
select access='public' and proceeding in ('house-proceeding','joint-sitting','state-opening')
 and (community is null or exists(select 1 from public.hansard_repository_communities c where c.id=community and c.access_level='public' and c.proceeding_type=proceeding));
$$;
grant execute on function public.hansard_public_source(text,text,uuid) to anon,authenticated,service_role;
alter table public.hansard_sittings add constraint public_sources_only check(status<>'published' or public.hansard_public_source(source_access,proceeding_type,source_community_id));
create policy source_access_guard on public.hansard_sittings as restrictive for select to anon,authenticated
 using((select private.cg_is_admin()) or public.hansard_public_source(source_access,proceeding_type,source_community_id));

-- Function replacements follow below to persist provenance atomically and to
-- permit both chambers' valid historical roles in a joint sitting.

create or replace function public.save_hansard_document(p_document jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare sid uuid := coalesce(nullif(p_document#>>'{sitting,id}','')::uuid,gen_random_uuid()); s jsonb := p_document->'sitting';
begin
if jsonb_typeof(p_document->'sections') is distinct from 'array' or jsonb_typeof(p_document->'contributions') is distinct from 'array' then raise exception 'sections and contributions must be arrays'; end if;
insert into public.hansard_sittings(id,proceeding_type,source_access,source_community_id,source_collection_id,source_item_id,slug,title,house_type,sitting_date,sitting_period,sitting_number,parliament_number,session_number,parliamentary_term,county_id,county_name,starts_at,ends_at,official_hansard_url,youtube_url,summary_html,summary_text,topics,status,review_status,published_at,presiding_leader_id,presiding_role_id,presiding_display_name,presiding_capacity)
values(sid,coalesce(s->>'proceeding_type','house-proceeding'),coalesce(s->>'source_access','unknown'),nullif(s->>'source_community_id','')::uuid,nullif(s->>'source_collection_id','')::uuid,nullif(s->>'source_item_id','')::uuid,s->>'slug',s->>'title',s->>'house_type',(s->>'sitting_date')::date,coalesce(s->>'sitting_period','Morning Sitting'),s->>'sitting_number',nullif(s->>'parliament_number','')::smallint,nullif(s->>'session_number','')::smallint,s->>'parliamentary_term',nullif(s->>'county_id','')::uuid,s->>'county_name',nullif(s->>'starts_at','')::time,nullif(s->>'ends_at','')::time,s->>'official_hansard_url',s->>'youtube_url',coalesce(s->>'summary_html',''),coalesce(s->>'summary_text',''),array(select jsonb_array_elements_text(coalesce(s->'topics','[]'::jsonb))),coalesce(s->>'status','draft'),coalesce(s->>'review_status','pending'),case when s->>'status'='published' then now() end,nullif(s->>'presiding_leader_id','')::uuid,nullif(s->>'presiding_role_id','')::uuid,s->>'presiding_display_name',s->>'presiding_capacity')
on conflict(id) do update set proceeding_type=excluded.proceeding_type,source_access=excluded.source_access,source_community_id=excluded.source_community_id,source_collection_id=excluded.source_collection_id,source_item_id=excluded.source_item_id,slug=excluded.slug,title=excluded.title,house_type=excluded.house_type,sitting_date=excluded.sitting_date,sitting_period=excluded.sitting_period,sitting_number=excluded.sitting_number,parliament_number=excluded.parliament_number,session_number=excluded.session_number,parliamentary_term=excluded.parliamentary_term,county_id=excluded.county_id,county_name=excluded.county_name,starts_at=excluded.starts_at,ends_at=excluded.ends_at,official_hansard_url=excluded.official_hansard_url,youtube_url=excluded.youtube_url,summary_html=excluded.summary_html,summary_text=excluded.summary_text,topics=excluded.topics,status=excluded.status,review_status=excluded.review_status,published_at=case when excluded.status='published' then coalesce(public.hansard_sittings.published_at,now()) end,presiding_leader_id=excluded.presiding_leader_id,presiding_role_id=excluded.presiding_role_id,presiding_display_name=excluded.presiding_display_name,presiding_capacity=excluded.presiding_capacity,updated_at=now();
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

create or replace function public.validate_hansard_publication(p_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare s public.hansard_sittings; begin
select * into s from public.hansard_sittings where id=p_id;
if not found or s.status is distinct from 'published' then return; end if;
if not exists(select 1 from public.hansard_contributions where sitting_id=p_id) then raise exception 'A published sitting needs at least one contribution'; end if;
if exists(select 1 from public.hansard_contributions c where c.sitting_id=p_id and
 (c.review_status<>'reviewed' or c.speaker_kind='unknown' or length(trim(c.body_text))=0 or
  (c.speaker_kind='member' and (c.link_status<>'confirmed' or c.leader_id is null or c.leader_role_id is null)) or
  c.link_status in ('unmatched','suggested'))) then raise exception 'Review every contribution and confirm member links before publishing'; end if;
if exists(select 1 from public.hansard_contributions c left join public.leader_roles r on r.id=c.leader_role_id
 where c.sitting_id=p_id and c.speaker_kind='member' and
 (r.id is null or r.leader_id<>c.leader_id or (case when s.proceeding_type='joint-sitting' then coalesce(public.hansard_role_house(r.house,r.title) not in ('national-assembly','senate'),true) else public.hansard_role_house(r.house,r.title) is distinct from s.house_type end) or r.term_start_date>s.sitting_date or (r.term_end_date is not null and r.term_end_date<s.sitting_date))) then
 raise exception 'A linked parliamentary role does not match the member, house or sitting date'; end if;
end $$;

create or replace function public.hansard_member_candidates(p_house text,p_date date,p_query text default '')
returns table(leader_id uuid,leader_role_id uuid,full_name text,slug text,title text,party text,constituency text,county text,term_start_date date,term_end_date date)
language sql stable security invoker set search_path='' as $$
select l.id,r.id,l.full_name,l.slug,r.title,r.party,r.constituency,r.county,r.term_start_date,r.term_end_date
from public.leaders l join public.leader_roles r on r.leader_id=l.id
where (public.hansard_role_house(r.house,r.title)=p_house or (p_house='joint' and public.hansard_role_house(r.house,r.title) in ('national-assembly','senate')))
and r.term_start_date<=p_date and (r.term_end_date is null or r.term_end_date>=p_date)
and (length(trim(p_query))=0 or l.full_name ilike '%'||left(p_query,100)||'%' or r.constituency ilike '%'||left(p_query,100)||'%')
order by l.full_name,r.term_start_date desc limit 100;
$$;
