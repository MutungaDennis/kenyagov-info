-- Kenyan national honours / decorations as post-nominals (after the name).
-- e.g. ["E.G.H.","O.G.W."] → displayed as "Hon. Jane Doe, E.G.H., O.G.W."
-- Run in Supabase SQL Editor.

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS national_honours JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.leaders.national_honours IS
  'Array of Kenyan honour codes after the name, e.g. ["E.G.H.","M.B.S.","O.G.W."]. Not used in URL slug.';
