BEGIN;
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS fund_levy_type text,
  ADD COLUMN IF NOT EXISTS fund_classification text,
  ADD COLUMN IF NOT EXISTS fund_legal_form text,
  ADD COLUMN IF NOT EXISTS accessibility_type text,
  ADD COLUMN IF NOT EXISTS funding_source text,
  ADD COLUMN IF NOT EXISTS application_url text,
  ADD COLUMN IF NOT EXISTS fund_operational_structure text;
ALTER TABLE public.institutions
  DROP CONSTRAINT IF EXISTS institutions_record_kind_check,
  ADD CONSTRAINT institutions_record_kind_check
    CHECK (record_kind IN ('institution', 'temporary_body', 'fund_levy'));
ALTER TABLE public.institutions
  DROP CONSTRAINT IF EXISTS institutions_fund_levy_details_check,
  ADD CONSTRAINT institutions_fund_levy_details_check
    CHECK (record_kind <> 'fund_levy' OR parent_institution_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS institutions_fund_levy_parent_idx
  ON public.institutions (parent_institution_id, name)
  WHERE record_kind = 'fund_levy';
COMMENT ON COLUMN public.institutions.record_kind IS
  'Distinguishes institutions, temporary public bodies, and funds or levies; funds remain linked to administrators without inflating institution counts.';
COMMIT;
