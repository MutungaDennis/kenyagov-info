BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.save_parliamentary_committee_assignments(
  p_committee_id uuid,
  p_memberships jsonb,
  p_staff jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.parliamentary_committees
    WHERE id = p_committee_id
  ) THEN
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

REVOKE ALL ON FUNCTION public.save_parliamentary_committee_assignments(uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_parliamentary_committee_assignments(uuid, jsonb, jsonb)
  TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
