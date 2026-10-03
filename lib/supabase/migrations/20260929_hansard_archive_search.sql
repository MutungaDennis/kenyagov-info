alter table public.hansard_sittings add column archive_search text generated always as (
  coalesce(content->>'title','') || ' ' || coalesce(content->'topics','[]'::jsonb)::text || ' ' || coalesce(content->>'countyName',content->>'county','')
) stored;
alter table public.hansard_sittings add constraint hansard_valid_date check (sitting_date::date is not null);
