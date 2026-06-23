-- Table to log public searches for analysis (similar to GOV.UK search analytics)
-- No personal data is stored. Used to identify popular terms, spelling mistakes, gaps in content.

CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  filter_type TEXT,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analysis queries (top searches, recent, etc.)
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON public.search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_filter ON public.search_queries(filter_type);

-- RLS: allow anyone (anon) to insert search logs (public site usage)
-- Only admins (via service key or profiles) can read for analysis.
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log searches"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view search queries"
  ON public.search_queries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE public.search_queries IS 'Anonymized search query logs for improving content, detecting spelling issues, and understanding user intent (GOV.UK style).';