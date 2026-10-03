create function public.search_migrated_content(q text, lim integer default 60)
returns table(id text,name text,slug text,base_route text,snippet text,entity_type text,rank real)
language sql stable security invoker set search_path='' as $$
  with query as (select websearch_to_tsquery('simple',left(q,120)) as term),
  documents as (
    select s.id,s.title as name,s.slug,'/'::text as base_route,
      coalesce(s.content->>'summary','') as snippet,'Service'::text as entity_type,
      to_tsvector('simple',s.title||' '||coalesce(s.content->>'summary','')||' '||coalesce(s.content->'body','[]'::jsonb)::text) as document
    from public.government_services s where s.is_published
    union all
    select h.id,h.title,h.house_type||'/'||h.sitting_date,'/government/legislature/hansard',
      h.sitting_date||' '||coalesce(h.parliamentary_term,''),'Hansard',
      to_tsvector('simple',h.title||' '||coalesce(h.content->'topics','[]'::jsonb)::text)
    from public.hansard_sittings h where h.is_published
  )
  select d.id,d.name,d.slug,d.base_route,left(d.snippet,240),d.entity_type,ts_rank_cd(d.document,query.term)
  from documents d cross join query where d.document @@ query.term
  order by ts_rank_cd(d.document,query.term) desc,d.id limit least(greatest(lim,1),100);
$$;
revoke all on function public.search_migrated_content(text,integer) from public;
grant execute on function public.search_migrated_content(text,integer) to anon,authenticated,service_role;
