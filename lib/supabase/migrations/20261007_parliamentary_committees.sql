BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.parliamentary_committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber text NOT NULL CHECK (chamber IN ('national_assembly', 'senate')),
  category text NOT NULL CHECK (length(btrim(category)) BETWEEN 1 AND 150),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 200),
  slug text NOT NULL UNIQUE CHECK (length(btrim(slug)) BETWEEN 1 AND 220),
  description text,
  mandate text,
  established_date date,
  dissolved_date date,
  is_active boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (dissolved_date IS NULL OR established_date IS NULL OR dissolved_date >= established_date)
);

CREATE TABLE IF NOT EXISTS public.parliamentary_committee_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES public.parliamentary_committees(id) ON DELETE CASCADE,
  leader_id uuid NOT NULL REFERENCES public.leaders(id) ON DELETE RESTRICT,
  position text NOT NULL CHECK (position IN ('chairperson', 'vice_chairperson', 'member')),
  start_date date,
  end_date date,
  sort_order integer NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.parliamentary_committee_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES public.parliamentary_committees(id) ON DELETE CASCADE,
  leader_id uuid REFERENCES public.leaders(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 200),
  role_title text NOT NULL CHECK (length(btrim(role_title)) BETWEEN 1 AND 200),
  email text,
  start_date date,
  end_date date,
  sort_order integer NOT NULL DEFAULT 1 CHECK (sort_order >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS parliamentary_committees_chamber_order_idx
  ON public.parliamentary_committees (chamber, is_active DESC, category, sort_order, name);
CREATE INDEX IF NOT EXISTS parliamentary_committee_memberships_committee_order_idx
  ON public.parliamentary_committee_memberships (committee_id, position, sort_order, start_date);
CREATE INDEX IF NOT EXISTS parliamentary_committee_memberships_leader_idx
  ON public.parliamentary_committee_memberships (leader_id, end_date);
CREATE INDEX IF NOT EXISTS parliamentary_committee_staff_committee_order_idx
  ON public.parliamentary_committee_staff (committee_id, sort_order, role_title);

ALTER TABLE public.parliamentary_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliamentary_committee_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliamentary_committee_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parliamentary_committees_public_read ON public.parliamentary_committees;
CREATE POLICY parliamentary_committees_public_read
  ON public.parliamentary_committees
  FOR SELECT TO anon, authenticated
  USING (is_published IS TRUE);

DROP POLICY IF EXISTS parliamentary_committee_memberships_public_read ON public.parliamentary_committee_memberships;
CREATE POLICY parliamentary_committee_memberships_public_read
  ON public.parliamentary_committee_memberships
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parliamentary_committees c
      WHERE c.id = parliamentary_committee_memberships.committee_id
        AND c.is_published IS TRUE
    )
  );

DROP POLICY IF EXISTS parliamentary_committee_staff_public_read ON public.parliamentary_committee_staff;
CREATE POLICY parliamentary_committee_staff_public_read
  ON public.parliamentary_committee_staff
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parliamentary_committees c
      WHERE c.id = parliamentary_committee_staff.committee_id
        AND c.is_published IS TRUE
    )
  );

REVOKE INSERT, UPDATE, DELETE ON public.parliamentary_committees FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.parliamentary_committee_memberships FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.parliamentary_committee_staff FROM anon, authenticated;
GRANT SELECT ON public.parliamentary_committees TO anon, authenticated;
GRANT SELECT ON public.parliamentary_committee_memberships TO anon, authenticated;
GRANT SELECT ON public.parliamentary_committee_staff TO anon, authenticated;
GRANT ALL ON public.parliamentary_committees TO service_role;
GRANT ALL ON public.parliamentary_committee_memberships TO service_role;
GRANT ALL ON public.parliamentary_committee_staff TO service_role;

CREATE OR REPLACE FUNCTION public.save_parliamentary_committee(
  p_committee_id uuid,
  p_committee jsonb,
  p_memberships jsonb,
  p_staff jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.parliamentary_committees
  SET chamber = p_committee->>'chamber',
      category = p_committee->>'category',
      name = p_committee->>'name',
      slug = p_committee->>'slug',
      description = NULLIF(p_committee->>'description', ''),
      mandate = NULLIF(p_committee->>'mandate', ''),
      established_date = NULLIF(p_committee->>'established_date', '')::date,
      dissolved_date = NULLIF(p_committee->>'dissolved_date', '')::date,
      is_active = (p_committee->>'is_active')::boolean,
      is_published = (p_committee->>'is_published')::boolean,
      sort_order = (p_committee->>'sort_order')::integer,
      updated_at = now()
  WHERE id = p_committee_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Committee not found';
  END IF;

  DELETE FROM public.parliamentary_committee_memberships AS existing
  WHERE existing.committee_id = p_committee_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_to_recordset(COALESCE(p_memberships, '[]'::jsonb))
        AS submitted(id uuid)
      WHERE submitted.id = existing.id
    );

  INSERT INTO public.parliamentary_committee_memberships (
    id, committee_id, leader_id, position, start_date, end_date, sort_order, updated_at
  )
  SELECT submitted.id, p_committee_id, submitted.leader_id, submitted.position,
         submitted.start_date, submitted.end_date, submitted.sort_order, now()
  FROM jsonb_to_recordset(COALESCE(p_memberships, '[]'::jsonb))
    AS submitted(
      id uuid,
      leader_id uuid,
      position text,
      start_date date,
      end_date date,
      sort_order integer
    )
  ON CONFLICT (id) DO UPDATE
  SET leader_id = EXCLUDED.leader_id,
      position = EXCLUDED.position,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
  WHERE public.parliamentary_committee_memberships.committee_id = EXCLUDED.committee_id;

  DELETE FROM public.parliamentary_committee_staff AS existing
  WHERE existing.committee_id = p_committee_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_to_recordset(COALESCE(p_staff, '[]'::jsonb))
        AS submitted(id uuid)
      WHERE submitted.id = existing.id
    );

  INSERT INTO public.parliamentary_committee_staff (
    id, committee_id, leader_id, name, role_title, email, start_date, end_date, sort_order, updated_at
  )
  SELECT submitted.id, p_committee_id, submitted.leader_id, submitted.name,
         submitted.role_title, submitted.email, submitted.start_date,
         submitted.end_date, submitted.sort_order, now()
  FROM jsonb_to_recordset(COALESCE(p_staff, '[]'::jsonb))
    AS submitted(
      id uuid,
      leader_id uuid,
      name text,
      role_title text,
      email text,
      start_date date,
      end_date date,
      sort_order integer
    )
  ON CONFLICT (id) DO UPDATE
  SET leader_id = EXCLUDED.leader_id,
      name = EXCLUDED.name,
      role_title = EXCLUDED.role_title,
      email = EXCLUDED.email,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
  WHERE public.parliamentary_committee_staff.committee_id = EXCLUDED.committee_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_parliamentary_committee(uuid, jsonb, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_parliamentary_committee(uuid, jsonb, jsonb, jsonb)
  TO service_role;

COMMENT ON TABLE public.parliamentary_committees IS
  'National Assembly and Senate committees, separate from institutions and temporary public bodies.';
COMMENT ON TABLE public.parliamentary_committee_memberships IS
  'Time-bounded voting parliamentary member assignments and committee offices.';
COMMENT ON TABLE public.parliamentary_committee_staff IS
  'Non-voting professional staff supporting parliamentary committees.';

NOTIFY pgrst, 'reload schema';
COMMIT;
