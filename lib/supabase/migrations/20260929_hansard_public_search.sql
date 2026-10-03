-- Search only the public Hansard corpus, with stable pagination and filters.
create function public.search_hansard_content(q text,p_proceeding text default null,p_house text default null,p_offset integer default 0,p_limit integer default 25)
returns table(id text,title text,slug text,snippet text,kind text,house_type text,proceeding_type text,sitting_date date,total_count bigint)
language sql stable security invoker set search_path='' as $$
with term as (select websearch_to_tsquery('simple',left(q,120)) as value),
sittings as (
 select h.* from public.hansard_sittings h where h.status='published'
 and public.hansard_public_source(h.source_access,h.proceeding_type,h.source_community_id)
 and (p_proceeding is null or h.proceeding_type=p_proceeding)
 and (p_house is null or h.house_type=p_house or (p_house in ('national-assembly','senate') and h.proceeding_type='joint-sitting'))
), matches as (
 select h.id::text,h.title,'sitting/'||h.slug as slug,left(h.summary_text,240) as snippet,'Sitting'::text as kind,h.house_type,h.proceeding_type,h.sitting_date,
 ts_rank_cd(to_tsvector('simple',h.title||' '||h.summary_text||' '||array_to_string(h.topics,' ')),term.value) as rank
 from sittings h cross join term where to_tsvector('simple',h.title||' '||h.summary_text||' '||array_to_string(h.topics,' ')) @@ term.value
 union all
 select c.id::text,h.title||' — '||c.speaker_name,'sitting/'||h.slug||'#contribution-'||c.contribution_key,left(c.body_text,240),'Contribution',h.house_type,h.proceeding_type,h.sitting_date,
 ts_rank_cd(to_tsvector('simple',c.body_text),term.value)
 from public.hansard_contributions c join sittings h on h.id=c.sitting_id cross join term where to_tsvector('simple',c.body_text) @@ term.value
)
select m.id,m.title,m.slug,m.snippet,m.kind,m.house_type,m.proceeding_type,m.sitting_date,count(*) over() from matches m
order by m.rank desc,m.sitting_date desc,m.id limit least(greatest(p_limit,1),50) offset greatest(p_offset,0);
$$;
revoke all on function public.search_hansard_content(text,text,text,integer,integer) from public;
grant execute on function public.search_hansard_content(text,text,text,integer,integer) to anon,authenticated,service_role;
