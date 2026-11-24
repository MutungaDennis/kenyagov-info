-- Adds a separate public-entrance position without modifying source latitude/longitude.
-- This migration has not been applied to the connected database.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';

ALTER TABLE public.education_schools
  ADD COLUMN IF NOT EXISTS entrance_lat double precision,
  ADD COLUMN IF NOT EXISTS entrance_lng double precision;

DO $constraints$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'education_schools_entrance_coordinates_pair_check'
  ) THEN
    ALTER TABLE public.education_schools
      ADD CONSTRAINT education_schools_entrance_coordinates_pair_check
      CHECK ((entrance_lat IS NULL) = (entrance_lng IS NULL));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'education_schools_entrance_lat_range_check'
  ) THEN
    ALTER TABLE public.education_schools
      ADD CONSTRAINT education_schools_entrance_lat_range_check
      CHECK (entrance_lat IS NULL OR entrance_lat BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'education_schools_entrance_lng_range_check'
  ) THEN
    ALTER TABLE public.education_schools
      ADD CONSTRAINT education_schools_entrance_lng_range_check
      CHECK (entrance_lng IS NULL OR entrance_lng BETWEEN -180 AND 180);
  END IF;
END
$constraints$;

COMMIT;
