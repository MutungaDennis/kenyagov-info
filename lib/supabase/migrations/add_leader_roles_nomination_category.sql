-- Special interest / nomination category for nominated Senators (and similar seats).
-- Mirrors mcas.nomination_category (Gender Top-up, PWD, Youth, Marginalized, Workers, etc.)

ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS nomination_category text;

COMMENT ON COLUMN public.leader_roles.nomination_category IS
  'For Nominated seats (e.g. Nominated Senator): special interest category such as PWD, Youth, Gender Top-up, Marginalized, Workers. Null/N/A for elected seats.';
