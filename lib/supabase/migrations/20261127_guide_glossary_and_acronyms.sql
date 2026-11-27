BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.guide_glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  term text NOT NULL CHECK (length(btrim(term)) BETWEEN 1 AND 200),
  meaning text NOT NULL CHECK (length(btrim(meaning)) BETWEEN 1 AND 5000),
  reference_label text CHECK (reference_label IS NULL OR length(reference_label) <= 250),
  reference_url text CHECK (reference_url IS NULL OR reference_url ~* '^https?://'),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guide_glossary_terms_term_lower_idx
  ON public.guide_glossary_terms (lower(term));
CREATE INDEX IF NOT EXISTS guide_glossary_terms_sort_idx
  ON public.guide_glossary_terms (sort_order, term);

CREATE TABLE IF NOT EXISTS public.guide_acronyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acronym text NOT NULL CHECK (length(btrim(acronym)) BETWEEN 1 AND 30),
  full_form text NOT NULL CHECK (length(btrim(full_form)) BETWEEN 1 AND 300),
  meaning text CHECK (meaning IS NULL OR length(meaning) <= 5000),
  reference_label text CHECK (reference_label IS NULL OR length(reference_label) <= 250),
  reference_url text CHECK (reference_url IS NULL OR reference_url ~* '^https?://'),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guide_acronyms_acronym_idx
  ON public.guide_acronyms (upper(acronym));
CREATE INDEX IF NOT EXISTS guide_acronyms_sort_idx
  ON public.guide_acronyms (sort_order, acronym);

ALTER TABLE public.guide_glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_acronyms ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.guide_glossary_terms FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.guide_acronyms FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.guide_glossary_terms, public.guide_acronyms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.guide_glossary_terms, public.guide_acronyms TO authenticated;
GRANT ALL ON public.guide_glossary_terms, public.guide_acronyms TO service_role;

DROP POLICY IF EXISTS guide_glossary_terms_public_read ON public.guide_glossary_terms;
CREATE POLICY guide_glossary_terms_public_read
  ON public.guide_glossary_terms FOR SELECT TO anon, authenticated
  USING (is_published IS TRUE);

DROP POLICY IF EXISTS guide_glossary_terms_admin_all ON public.guide_glossary_terms;
CREATE POLICY guide_glossary_terms_admin_all
  ON public.guide_glossary_terms FOR ALL TO authenticated
  USING ((SELECT private.cg_is_admin()))
  WITH CHECK ((SELECT private.cg_is_admin()));

DROP POLICY IF EXISTS guide_acronyms_public_read ON public.guide_acronyms;
CREATE POLICY guide_acronyms_public_read
  ON public.guide_acronyms FOR SELECT TO anon, authenticated
  USING (is_published IS TRUE);

DROP POLICY IF EXISTS guide_acronyms_admin_all ON public.guide_acronyms;
CREATE POLICY guide_acronyms_admin_all
  ON public.guide_acronyms FOR ALL TO authenticated
  USING ((SELECT private.cg_is_admin()))
  WITH CHECK ((SELECT private.cg_is_admin()));

COMMENT ON TABLE public.guide_glossary_terms IS
  'Plain-language glossary of civic and government terms, with optional official references.';
COMMENT ON TABLE public.guide_acronyms IS
  'Acronyms used in Kenyan government and civic guides, with full forms, meanings and optional references.';

NOTIFY pgrst, 'reload schema';
COMMIT;
