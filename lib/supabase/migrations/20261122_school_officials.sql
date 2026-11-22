BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.education_schools
  ADD COLUMN IF NOT EXISTS constituency_id uuid REFERENCES public.constituencies(id),
  ADD COLUMN IF NOT EXISTS ward_id uuid REFERENCES public.wards(id);

CREATE INDEX IF NOT EXISTS education_schools_constituency_id_idx
  ON public.education_schools (constituency_id);
CREATE INDEX IF NOT EXISTS education_schools_ward_id_idx
  ON public.education_schools (ward_id);

WITH constituency_candidates AS (
  SELECT s.id AS school_id, c.id AS constituency_id,
         count(*) OVER (PARTITION BY s.id) AS candidate_count
  FROM public.education_schools s
  JOIN public.counties co ON co.code = s.county_code
  JOIN public.constituencies c ON c.county_id = co.id
    AND lower(c.name) = lower(s.constituency)
), unique_constituencies AS (
  SELECT school_id, constituency_id FROM constituency_candidates WHERE candidate_count = 1
), ward_candidates AS (
  SELECT uc.school_id, w.id AS ward_id,
         count(*) OVER (PARTITION BY uc.school_id) AS candidate_count
  FROM unique_constituencies uc
  JOIN public.education_schools s ON s.id = uc.school_id
  JOIN public.wards w ON w.constituency_id = uc.constituency_id
    AND lower(w.name) = lower(s.ward)
), unique_wards AS (
  SELECT school_id, ward_id FROM ward_candidates WHERE candidate_count = 1
)
UPDATE public.education_schools s
SET constituency_id = uc.constituency_id,
    ward_id = uw.ward_id
FROM unique_constituencies uc
LEFT JOIN unique_wards uw ON uw.school_id = uc.school_id
WHERE s.id = uc.school_id
  AND (s.constituency_id IS DISTINCT FROM uc.constituency_id
       OR s.ward_id IS DISTINCT FROM uw.ward_id);

CREATE TABLE IF NOT EXISTS public.education_school_officials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.education_schools(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 2 AND 250),
  role_title text NOT NULL CHECK (length(btrim(role_title)) BETWEEN 2 AND 150),
  start_date date,
  end_date date,
  biography text,
  photo_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date),
  CHECK (photo_url IS NULL OR photo_url ~* '^https?://')
);

CREATE INDEX IF NOT EXISTS education_school_officials_school_dates_idx
  ON public.education_school_officials (school_id, start_date DESC, end_date);

ALTER TABLE public.education_school_officials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.education_school_officials FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.education_school_officials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.education_school_officials TO authenticated;
GRANT ALL ON public.education_school_officials TO service_role;

DROP POLICY IF EXISTS education_school_officials_public_read ON public.education_school_officials;
CREATE POLICY education_school_officials_public_read
  ON public.education_school_officials FOR SELECT TO anon, authenticated
  USING (
    is_published IS TRUE
    AND EXISTS (
      SELECT 1 FROM public.education_schools s
      WHERE s.id = education_school_officials.school_id
        AND s.ownership = 'public'
        AND s.is_published IS TRUE
    )
  );

DROP POLICY IF EXISTS education_school_officials_admin_all ON public.education_school_officials;
CREATE POLICY education_school_officials_admin_all
  ON public.education_school_officials FOR ALL TO authenticated
  USING ((SELECT private.cg_is_admin()))
  WITH CHECK ((SELECT private.cg_is_admin()));

COMMENT ON TABLE public.education_school_officials IS
  'Current and former school officials, with service dates and optional biographies or photographs.';

NOTIFY pgrst, 'reload schema';
COMMIT;
