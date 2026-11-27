BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.guide_acronyms
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other / unclassified'
  CHECK (length(btrim(category)) BETWEEN 1 AND 100);

CREATE INDEX IF NOT EXISTS guide_acronyms_category_sort_idx
  ON public.guide_acronyms (category, sort_order, acronym);

COMMENT ON COLUMN public.guide_acronyms.category IS
  'Admin-defined category for classifying acronyms, such as Kenyan government entity or international entity.';

NOTIFY pgrst, 'reload schema';
COMMIT;
