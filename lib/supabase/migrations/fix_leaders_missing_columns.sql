-- Run this in Supabase SQL Editor (Dashboard → SQL) so admin saves work fully.
-- name_titles, national_honours, academic_qualifications, education
-- social_media already exists on many projects.

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS name_titles JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS national_honours JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS academic_qualifications JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS education TEXT;

COMMENT ON COLUMN public.leaders.national_honours IS
  'Post-nominals after the name, e.g. ["E.G.H.","O.G.W."]';

COMMENT ON COLUMN public.leaders.name_titles IS
  'Honorifics e.g. ["Hon.","Prof."] — public display only; not used in slug';

COMMENT ON COLUMN public.leaders.academic_qualifications IS
  'Array of { degree, field, institution, year, notes }';

-- Optional FK-style columns on leader_roles (safe if already present)
ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(100);

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS level TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS position_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS institution_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS party_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS county_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS constituency_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS ward_id TEXT;

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS government_level_id TEXT;
