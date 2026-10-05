BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.institution_people_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  sort_order integer NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, name)
);

CREATE TABLE IF NOT EXISTS public.institution_people_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  leader_id uuid NOT NULL REFERENCES public.leaders(id) ON DELETE CASCADE,
  level_id uuid REFERENCES public.institution_people_levels(id) ON DELETE SET NULL,
  sort_order integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institution_people_assignments_order_positive
    CHECK (sort_order IS NULL OR sort_order >= 1),
  UNIQUE (institution_id, leader_id)
);

CREATE INDEX IF NOT EXISTS institution_people_levels_order_idx
  ON public.institution_people_levels (institution_id, sort_order, name);
CREATE INDEX IF NOT EXISTS institution_people_assignments_level_order_idx
  ON public.institution_people_assignments (institution_id, level_id, sort_order);

ALTER TABLE public.institution_people_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_people_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS institution_people_levels_public_read ON public.institution_people_levels;
CREATE POLICY institution_people_levels_public_read
  ON public.institution_people_levels
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institutions i
      WHERE i.id = institution_people_levels.institution_id
        AND i.is_active IS TRUE
    )
  );

DROP POLICY IF EXISTS institution_people_assignments_public_read ON public.institution_people_assignments;
CREATE POLICY institution_people_assignments_public_read
  ON public.institution_people_assignments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institutions i
      WHERE i.id = institution_people_assignments.institution_id
        AND i.is_active IS TRUE
    )
  );

REVOKE INSERT, UPDATE, DELETE ON public.institution_people_levels FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.institution_people_assignments FROM anon, authenticated;
GRANT SELECT ON public.institution_people_levels TO anon, authenticated;
GRANT SELECT ON public.institution_people_assignments TO anon, authenticated;
GRANT ALL ON public.institution_people_levels TO service_role;
GRANT ALL ON public.institution_people_assignments TO service_role;

COMMENT ON TABLE public.institution_people_levels IS
  'Administrator-defined seniority tiers used to group and order current institution officials on public profiles.';
COMMENT ON TABLE public.institution_people_assignments IS
  'Optional per-institution display level and left-to-right order for a leader who currently serves that institution.';

NOTIFY pgrst, 'reload schema';
COMMIT;
