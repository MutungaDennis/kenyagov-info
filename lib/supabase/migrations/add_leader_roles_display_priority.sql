-- Explicit priority only affects the ordering of concurrent current roles.
-- Idempotent: the linked database may already contain the initial column/index.
ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS display_priority integer NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.leader_roles'::regclass
      AND conname = 'leader_roles_display_priority_positive'
  ) THEN
    ALTER TABLE public.leader_roles
      ADD CONSTRAINT leader_roles_display_priority_positive
      CHECK (display_priority IS NULL OR display_priority >= 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS leader_roles_leader_priority_idx
  ON public.leader_roles (leader_id, display_priority, term_start_date DESC);

COMMENT ON COLUMN public.leader_roles.display_priority IS
  'Optional administrator-defined public display priority. 1 is highest. NULL allows automatic ordering. Application input is limited to 1–999; equal priorities use title/date/ID ordering.';

-- No defaults, backfill, grants or policy changes: all existing rows retain NULL.
NOTIFY pgrst, 'reload schema';
