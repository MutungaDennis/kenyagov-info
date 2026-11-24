BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE public.education_schools
  ADD COLUMN IF NOT EXISTS former_name text,
  ADD COLUMN IF NOT EXISTS established_year smallint;

DO $migration$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'education_schools_established_year_range'
      AND conrelid = 'public.education_schools'::regclass
  ) THEN
    ALTER TABLE public.education_schools
      ADD CONSTRAINT education_schools_established_year_range
      CHECK (established_year IS NULL OR established_year BETWEEN 1500 AND 2200);
  END IF;
END
$migration$;

COMMENT ON COLUMN public.education_schools.former_name IS
  'Former name of the school, when supported by a cited source.';
COMMENT ON COLUMN public.education_schools.established_year IS
  'Year the school was established, when supported by a cited source.';

NOTIFY pgrst, 'reload schema';
COMMIT;
