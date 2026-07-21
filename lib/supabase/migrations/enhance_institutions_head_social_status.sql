-- Institutions: link current head to leaders, social_media jsonb, lifecycle status
-- Run in Supabase SQL editor if columns / enum values are missing.

-- FK so public pages can link to /government/people/{slug}
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS current_head_id uuid REFERENCES public.leaders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS institutions_current_head_id_idx
  ON public.institutions (current_head_id)
  WHERE current_head_id IS NOT NULL;

COMMENT ON COLUMN public.institutions.current_head_id IS
  'Optional FK to leaders for the current head. current_head holds a display-name snapshot.';

-- social_media already used by admin (jsonb object platform → url)
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.institutions.social_media IS
  'Organisation social profiles, e.g. {"x":"https://x.com/…","facebook":"https://…"}';

-- If status / verification_status are free-text or unconstrained, app values work as-is.
-- If they are Postgres enums, add labels (adjust type names to match your schema):
--
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Inactive';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Former';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Restructured';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Merged';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Succeeded';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Dissolved';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Abolished';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Suspended';
-- ALTER TYPE public.institution_status ADD VALUE IF NOT EXISTS 'Proposed';
--
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Unverified';
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Verified';
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Needs review';
