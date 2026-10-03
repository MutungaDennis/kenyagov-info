-- Additional public-facing offices operated by an institution.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.institution_offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  office_name text NOT NULL,
  office_type text NOT NULL DEFAULT 'Branch office',
  geographic_level text,
  county text,
  constituency text,
  sub_county text,
  physical_address text,
  postal_address text,
  phone text,
  email text,
  website_url text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  start_date date,
  end_date date,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institution_offices_dates_valid
    CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date),
  CONSTRAINT institution_offices_latitude_valid
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT institution_offices_longitude_valid
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX IF NOT EXISTS institution_offices_institution_active_idx
  ON public.institution_offices (institution_id, is_active, sort_order, office_name);
CREATE INDEX IF NOT EXISTS institution_offices_geography_idx
  ON public.institution_offices (county, constituency);

ALTER TABLE public.institution_offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS institution_offices_public_read ON public.institution_offices;
CREATE POLICY institution_offices_public_read
  ON public.institution_offices
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institutions i
      WHERE i.id = institution_offices.institution_id
        AND i.is_active IS TRUE
    )
  );

REVOKE INSERT, UPDATE, DELETE ON public.institution_offices FROM anon, authenticated;
GRANT SELECT ON public.institution_offices TO anon, authenticated;
GRANT ALL ON public.institution_offices TO service_role;

COMMENT ON TABLE public.institution_offices IS
  'Additional field, regional, county, constituency and branch offices operated by a public institution; distinct from its headquarters.';

NOTIFY pgrst, 'reload schema';
COMMIT;
