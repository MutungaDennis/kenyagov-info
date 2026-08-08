-- Editorial verification status for leaders and MCAs
-- (institutions already use verification_status in admin)
--
-- Run in Supabase SQL editor (or your migration pipeline) before relying on
-- the admin Verification fields for officials / MCAs.
--
-- Meaning of values (app defaults):
--   Unverified   — not yet double-checked (default for new rows)
--   Verified     — double-checked against an authoritative source
--   Pending      — check in progress / awaiting source
--   Needs review — previously checked; facts may have changed

-- ---------------------------------------------------------------------------
-- leaders
-- ---------------------------------------------------------------------------
ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS verification_status text;

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Backfill then set default for future inserts
UPDATE public.leaders
SET verification_status = 'Unverified'
WHERE verification_status IS NULL OR btrim(verification_status) = '';

ALTER TABLE public.leaders
  ALTER COLUMN verification_status SET DEFAULT 'Unverified';

-- Optional: enforce non-null after backfill
-- ALTER TABLE public.leaders ALTER COLUMN verification_status SET NOT NULL;

COMMENT ON COLUMN public.leaders.verification_status IS
  'Editorial double-check: Unverified | Verified | Pending | Needs review. Not the same as is_active (public visibility).';

COMMENT ON COLUMN public.leaders.verified_at IS
  'When verification_status was last set to Verified (optional audit).';

CREATE INDEX IF NOT EXISTS leaders_verification_status_idx
  ON public.leaders (verification_status);

-- ---------------------------------------------------------------------------
-- mcas
-- ---------------------------------------------------------------------------
ALTER TABLE public.mcas
  ADD COLUMN IF NOT EXISTS verification_status text;

ALTER TABLE public.mcas
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

UPDATE public.mcas
SET verification_status = 'Unverified'
WHERE verification_status IS NULL OR btrim(verification_status) = '';

ALTER TABLE public.mcas
  ALTER COLUMN verification_status SET DEFAULT 'Unverified';

-- ALTER TABLE public.mcas ALTER COLUMN verification_status SET NOT NULL;

COMMENT ON COLUMN public.mcas.verification_status IS
  'Editorial double-check: Unverified | Verified | Pending | Needs review. Separate from status (Active / Vacated / Unpublished).';

COMMENT ON COLUMN public.mcas.verified_at IS
  'When verification_status was last set to Verified (optional audit).';

CREATE INDEX IF NOT EXISTS mcas_verification_status_idx
  ON public.mcas (verification_status);

-- ---------------------------------------------------------------------------
-- institutions (ensure column exists if an older env never had it)
-- ---------------------------------------------------------------------------
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS verification_status text;

UPDATE public.institutions
SET verification_status = 'Unverified'
WHERE verification_status IS NULL OR btrim(verification_status) = '';

ALTER TABLE public.institutions
  ALTER COLUMN verification_status SET DEFAULT 'Unverified';

COMMENT ON COLUMN public.institutions.verification_status IS
  'Editorial double-check: Unverified | Verified | Pending | Needs review.';

-- If verification_status is a Postgres ENUM type instead of text, use e.g.:
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Unverified';
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Verified';
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Pending';
-- ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Needs review';
