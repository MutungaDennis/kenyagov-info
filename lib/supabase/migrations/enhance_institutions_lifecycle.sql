-- Institution lifecycle history: when status changed, predecessor/successor, reason.
-- Run in Supabase SQL editor if columns are missing.

-- Date the current lifecycle status took effect OR is planned (earmarked change)
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS status_effective_date date;

COMMENT ON COLUMN public.institutions.status_effective_date IS
  'Date the current status became effective, or planned date if earmarked for change. Complements established_date / operational_date.';

-- Why the change happened or why it is planned (executive order, Act, restructure, etc.)
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS lifecycle_change_reason text;

COMMENT ON COLUMN public.institutions.lifecycle_change_reason IS
  'Explanation of why the organisational change took place, or why it is earmarked (e.g. Executive Order, Act of Parliament, merger announcement).';

-- Predecessor / successor organisational lineage (historical rename, merge, succession)
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS predecessor_institution_id uuid
    REFERENCES public.institutions(id) ON DELETE SET NULL;

ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS successor_institution_id uuid
    REFERENCES public.institutions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS institutions_predecessor_id_idx
  ON public.institutions (predecessor_institution_id)
  WHERE predecessor_institution_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS institutions_successor_id_idx
  ON public.institutions (successor_institution_id)
  WHERE successor_institution_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS institutions_status_effective_date_idx
  ON public.institutions (status_effective_date)
  WHERE status_effective_date IS NOT NULL;

COMMENT ON COLUMN public.institutions.predecessor_institution_id IS
  'Institution this body replaced, was renamed from, or was created from (e.g. after a split).';

COMMENT ON COLUMN public.institutions.successor_institution_id IS
  'Institution this body was renamed to, merged into, or succeeded by (or planned target if earmarked).';