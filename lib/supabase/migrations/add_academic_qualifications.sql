-- Academic qualifications + ensure name parts drive generated full_name
-- Run in Supabase SQL editor if academic_qualifications column is missing.

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS academic_qualifications JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.leaders.academic_qualifications IS
  'Array of { degree, field, institution, year, notes } for public biography.';

-- Optional education free-text fallback (some DBs already have this)
ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS education TEXT;

-- Ensure leader_roles can store entry type for appointed vs elected
ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(100);
