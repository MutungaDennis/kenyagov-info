-- Temporary public bodies are stored alongside institutions so existing
-- leader_roles.institution_id links remain usable, but are classified and
-- published separately from the institutional directory.
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS record_kind text NOT NULL DEFAULT 'institution',
  ADD COLUMN IF NOT EXISTS temporary_body_type text,
  ADD COLUMN IF NOT EXISTS term_start_date date,
  ADD COLUMN IF NOT EXISTS term_end_date date;

ALTER TABLE public.institutions
  DROP CONSTRAINT IF EXISTS institutions_record_kind_check,
  ADD CONSTRAINT institutions_record_kind_check
    CHECK (record_kind IN ('institution', 'temporary_body'));

ALTER TABLE public.institutions
  DROP CONSTRAINT IF EXISTS institutions_temporary_body_details_check,
  ADD CONSTRAINT institutions_temporary_body_details_check
    CHECK (
      record_kind <> 'temporary_body'
      OR (
        parent_institution_id IS NOT NULL
        AND temporary_body_type IS NOT NULL
        AND parent_institution_id <> id
      )
    );

ALTER TABLE public.institutions
  DROP CONSTRAINT IF EXISTS institutions_temporary_body_term_dates_check,
  ADD CONSTRAINT institutions_temporary_body_term_dates_check
    CHECK (
      term_start_date IS NULL
      OR term_end_date IS NULL
      OR term_end_date >= term_start_date
    );

CREATE INDEX IF NOT EXISTS institutions_temporary_body_parent_idx
  ON public.institutions (parent_institution_id, name)
  WHERE record_kind = 'temporary_body';

COMMENT ON COLUMN public.institutions.record_kind IS
  'Distinguishes permanent institutions from temporary public bodies while keeping a shared target for leader_roles.';
COMMENT ON COLUMN public.institutions.temporary_body_type IS
  'Body type for records whose record_kind is temporary_body.';
COMMENT ON COLUMN public.institutions.term_start_date IS
  'Start date of a temporary public body, when known.';
COMMENT ON COLUMN public.institutions.term_end_date IS
  'End date of a temporary public body, when known.';
