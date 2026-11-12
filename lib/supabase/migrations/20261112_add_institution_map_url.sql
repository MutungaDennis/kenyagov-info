alter table public.institutions
  add column if not exists map_url text;
