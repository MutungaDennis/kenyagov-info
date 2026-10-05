BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.institution_people_levels
  ADD COLUMN IF NOT EXISTS parent_level_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.institution_people_levels'::regclass
      AND conname = 'institution_people_levels_parent_level_id_fkey'
  ) THEN
    ALTER TABLE public.institution_people_levels
      ADD CONSTRAINT institution_people_levels_parent_level_id_fkey
      FOREIGN KEY (parent_level_id)
      REFERENCES public.institution_people_levels(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS institution_people_levels_parent_order_idx
  ON public.institution_people_levels (institution_id, parent_level_id, sort_order, name);

COMMENT ON COLUMN public.institution_people_levels.parent_level_id IS
  'Optional parent seniority level; hierarchy is limited to one subcategory level by the admin API.';

NOTIFY pgrst, 'reload schema';
COMMIT;
