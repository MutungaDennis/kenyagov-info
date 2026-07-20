-- Honorific name titles (Hon., Dr., Prof.) — separate from job title (MP, CS).
-- Slugs use first_name/other_names/surname only (no titles).

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS name_titles JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.leaders.name_titles IS
  'Array of honorifics e.g. ["Hon.","Prof."] shown before the name on public pages. Not used in URL slug.';

-- Social links often already exist as jsonb object { "x": "https://...", "linkedin": "..." }
ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.leaders.social_media IS
  'Map of platform key → URL, e.g. {"x":"https://x.com/...","linkedin":"https://..."}';
