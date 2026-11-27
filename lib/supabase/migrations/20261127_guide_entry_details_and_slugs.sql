BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.guide_glossary_terms
  ADD COLUMN IF NOT EXISTS short_meaning text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS details text NOT NULL DEFAULT '';

UPDATE public.guide_glossary_terms
SET short_meaning = CASE
      WHEN length(btrim(meaning)) > 280 THEN left(btrim(meaning), 277) || '...'
      ELSE btrim(meaning)
    END
WHERE short_meaning = '';

UPDATE public.guide_glossary_terms
SET details = meaning
WHERE details = '';

ALTER TABLE public.guide_acronyms
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS short_meaning text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS details text NOT NULL DEFAULT '';

WITH normalized AS (
  SELECT
    id,
    COALESCE(
      NULLIF(trim(BOTH '-' FROM lower(regexp_replace(acronym, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
      'acronym'
    ) AS base_slug
  FROM public.guide_acronyms
), ranked AS (
  SELECT id, base_slug, count(*) OVER (PARTITION BY base_slug) AS duplicate_count
  FROM normalized
)
UPDATE public.guide_acronyms AS acronym
SET slug = ranked.base_slug || CASE
      WHEN ranked.duplicate_count > 1 THEN '-' || replace(ranked.id::text, '-', '')
      ELSE ''
    END
FROM ranked
WHERE acronym.id = ranked.id AND acronym.slug IS NULL;

UPDATE public.guide_acronyms
SET short_meaning = CASE
      WHEN length(COALESCE(NULLIF(btrim(meaning), ''), full_form)) > 280 THEN left(COALESCE(NULLIF(btrim(meaning), ''), full_form), 277) || '...'
      ELSE COALESCE(NULLIF(btrim(meaning), ''), full_form)
    END
WHERE short_meaning = '';

UPDATE public.guide_acronyms
SET details = COALESCE(NULLIF(btrim(meaning), ''), full_form)
WHERE details = '';

ALTER TABLE public.guide_acronyms ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS guide_acronyms_slug_idx
  ON public.guide_acronyms (slug);
CREATE INDEX IF NOT EXISTS guide_glossary_terms_public_order_idx
  ON public.guide_glossary_terms (sort_order, term) WHERE is_published IS TRUE;
CREATE INDEX IF NOT EXISTS guide_acronyms_public_order_idx
  ON public.guide_acronyms (sort_order, acronym) WHERE is_published IS TRUE;

COMMENT ON COLUMN public.guide_glossary_terms.short_meaning IS
  'Concise public list summary; full text is shown on the slug detail page.';
COMMENT ON COLUMN public.guide_glossary_terms.details IS
  'Full glossary definition shown on its slug detail page.';
COMMENT ON COLUMN public.guide_acronyms.slug IS
  'Stable URL slug for the public acronym detail page.';
COMMENT ON COLUMN public.guide_acronyms.short_meaning IS
  'Concise public list summary; full text is shown on the slug detail page.';
COMMENT ON COLUMN public.guide_acronyms.details IS
  'Full acronym explanation shown on its slug detail page.';

NOTIFY pgrst, 'reload schema';
COMMIT;
