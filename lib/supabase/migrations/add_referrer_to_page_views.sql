-- Add optional referrer column for entry/acquisition analysis (top entry paths + sources)
-- Safe to run multiple times. Existing rows get NULL referrer (treated as direct).

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Optional: index for referrer queries if you later want heavy referrer filtering server-side
CREATE INDEX IF NOT EXISTS idx_page_views_referrer ON public.page_views(referrer);

COMMENT ON COLUMN public.page_views.referrer IS 'Referring hostname (e.g. google.com, twitter.com) or NULL for direct / unknown. Used only for aggregated admin analytics.';