-- Institution lineage (many-to-many), lifecycle segments (resurrection), dated names.
-- Run in Supabase SQL editor. Additive — existing predecessor/successor columns remain.

-- ---------------------------------------------------------------------------
-- A. Operational periods (same conceptual office across eras)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_lifecycle_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  label text,
  start_date date,
  end_date date,
  segment_status text NOT NULL DEFAULT 'Active',
  legal_basis_type text,
  legal_basis_name text,
  legal_basis_reference text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS institution_lifecycle_segments_institution_id_idx
  ON public.institution_lifecycle_segments (institution_id);

CREATE INDEX IF NOT EXISTS institution_lifecycle_segments_dates_idx
  ON public.institution_lifecycle_segments (institution_id, start_date);

COMMENT ON TABLE public.institution_lifecycle_segments IS
  'Multiple operational periods for one institution (e.g. Office of the PM 1963–64 and 2008–13).';

COMMENT ON COLUMN public.institution_lifecycle_segments.segment_status IS
  'Status during this period: Active, Abolished, Suspended, Unconstitutional, Proposed, etc.';

-- ---------------------------------------------------------------------------
-- B. Many-to-many organisational lineage
-- Convention: from_institution = ancestor / source; to_institution = descendant / result
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  to_institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  effective_date date,
  end_date date,
  legal_instrument text,
  notes text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institution_relationships_no_self CHECK (from_institution_id <> to_institution_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS institution_relationships_unique_idx
  ON public.institution_relationships (
    from_institution_id,
    to_institution_id,
    relationship_type,
    COALESCE(effective_date, '0001-01-01'::date)
  );

CREATE INDEX IF NOT EXISTS institution_relationships_from_idx
  ON public.institution_relationships (from_institution_id);

CREATE INDEX IF NOT EXISTS institution_relationships_to_idx
  ON public.institution_relationships (to_institution_id);

CREATE INDEX IF NOT EXISTS institution_relationships_type_idx
  ON public.institution_relationships (relationship_type);

COMMENT ON TABLE public.institution_relationships IS
  'Lineage links: RENAME, MERGE_INTO, SPLIT_FROM, SUCCESSION, ABSORPTION, BIRTH, CONTINUATION. from=ancestor, to=descendant.';

COMMENT ON COLUMN public.institution_relationships.is_primary IS
  'When true, may sync into institutions.predecessor_institution_id / successor_institution_id.';

-- ---------------------------------------------------------------------------
-- C. Dated name history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_name_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_kind text NOT NULL DEFAULT 'official',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS institution_name_history_institution_id_idx
  ON public.institution_name_history (institution_id);

COMMENT ON TABLE public.institution_name_history IS
  'Official/alias names with optional date ranges. Complements former_names / aliases arrays.';

COMMENT ON COLUMN public.institution_name_history.name_kind IS
  'official | short | alias | informal';

-- ---------------------------------------------------------------------------
-- RLS — public read for published institutions; writes via service role (admin API)
-- ---------------------------------------------------------------------------
ALTER TABLE public.institution_lifecycle_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_name_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_lifecycle_segments_public_read ON public.institution_lifecycle_segments;
CREATE POLICY institution_lifecycle_segments_public_read
  ON public.institution_lifecycle_segments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.institutions i
      WHERE i.id = institution_id
        AND COALESCE(i.is_active, true) = true
    )
  );

DROP POLICY IF EXISTS institution_relationships_public_read ON public.institution_relationships;
CREATE POLICY institution_relationships_public_read
  ON public.institution_relationships
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.institutions i
      WHERE i.id = from_institution_id
        AND COALESCE(i.is_active, true) = true
    )
    OR EXISTS (
      SELECT 1 FROM public.institutions i
      WHERE i.id = to_institution_id
        AND COALESCE(i.is_active, true) = true
    )
  );

DROP POLICY IF EXISTS institution_name_history_public_read ON public.institution_name_history;
CREATE POLICY institution_name_history_public_read
  ON public.institution_name_history
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.institutions i
      WHERE i.id = institution_id
        AND COALESCE(i.is_active, true) = true
    )
  );

-- Service role bypasses RLS for admin writes (createServiceClient).
