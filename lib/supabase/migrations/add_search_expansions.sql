-- Add a table for common Kenyan government acronyms, keywords and likely misspellings.
-- This helps the search function expand short queries like "iebc" to full names,
-- boosting relevant results exactly like Google does for common abbreviations and typos.
-- No personal data. Purely for search quality.

CREATE TABLE IF NOT EXISTS public.search_expansions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original TEXT NOT NULL UNIQUE,          -- the short form or common misspelling user might type
  expansion TEXT NOT NULL,                -- the full term or canonical name to also search for
  boost NUMERIC DEFAULT 2.0,              -- how much to boost matches on this expansion
  notes TEXT                              -- e.g. "Common acronym for IEBC"
);

CREATE INDEX IF NOT EXISTS idx_search_expansions_original ON public.search_expansions (original);
CREATE INDEX IF NOT EXISTS idx_search_expansions_expansion ON public.search_expansions USING gin (to_tsvector('simple', expansion));

-- RLS: public read (for the function), no write from anon
ALTER TABLE public.search_expansions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read expansions"
  ON public.search_expansions
  FOR SELECT
  USING (true);

-- Seed common Kenyan government acronyms, institutions, and frequent misspellings
-- You can add more over time from your search_logs analysis.

INSERT INTO public.search_expansions (original, expansion, boost, notes) VALUES
  -- Core constitutional commissions & big acronyms
  ('iebc', 'Independent Electoral and Boundaries Commission', 3.0, 'The big election body. Very common acronym search.'),
  ('iebc', 'iebc', 1.0, 'keep original'),
  ('kra', 'Kenya Revenue Authority', 3.0, 'Tax authority - extremely common'),
  ('cbk', 'Central Bank of Kenya', 2.5, 'Monetary authority'),
  ('eacc', 'Ethics and Anti-Corruption Commission', 2.5, 'Anti-graft body'),
  ('cra', 'Commission on Revenue Allocation', 2.0, 'Revenue sharing'),
  ('src', 'Salaries and Remuneration Commission', 2.0, 'Payscales'),
  ('nlc', 'National Land Commission', 2.0, 'Land issues'),
  ('ca', 'Communications Authority of Kenya', 1.8, 'Regulator'),
  ('kbc', 'Kenya Broadcasting Corporation', 1.5, 'State broadcaster'),
  ('kdf', 'Kenya Defence Forces', 1.8, 'Military'),
  ('nps', 'National Police Service', 1.8, 'Police'),
  ('odpp', 'Office of the Director of Public Prosecutions', 1.5, 'Prosecutions'),

  -- Major political parties & coalitions (very common)
  ('odm', 'Orange Democratic Movement', 2.0, 'ODM party'),
  ('uda', 'United Democratic Alliance', 2.0, 'Current ruling party acronym'),
  ('jubilee', 'Jubilee Party', 1.5, 'Commonly searched even after rebrand'),
  ('nasa', 'National Super Alliance', 1.5, '2017 coalition'),
  ('anc', 'African National Congress', 1.2, 'Party'),
  ('ford', 'Forum for the Restoration of Democracy', 1.2, 'Ford parties'),

  -- Common misspellings observed or likely from Kenyan users (English + Sheng influence)
  ('governer', 'governor', 2.0, 'Very frequent misspelling'),
  ('goveror', 'governor', 1.8, ''),
  ('minstry', 'ministry', 2.0, 'Very common'),
  ('mininstry', 'ministry', 1.8, ''),
  ('ministery', 'ministry', 1.5, ''),
  ('electrol', 'electoral', 1.5, ''),
  ('boundry', 'boundary', 1.5, ''),
  ('boundries', 'boundaries', 1.5, ''),
  ('comission', 'commission', 1.8, ''),
  ('commision', 'commission', 1.8, ''),
  ('authourity', 'authority', 1.5, ''),
  ('authorty', 'authority', 1.5, ''),
  ('nairob', 'nairobi', 1.5, 'Sheng-style shortening'),
  ('mombasa', 'mombasa', 1.0, 'correct but include variants'),
  ('kisumu', 'kisumu', 1.0, ''),
  ('nakuru', 'nakuru', 1.0, ''),
  ('eldoret', 'eldoret', 1.0, 'Uasin Gishu'),
  ('judiciary', 'judiciary', 1.0, ''),
  ('judicary', 'judiciary', 1.5, 'Common misspelling'),
  ('parliment', 'parliament', 1.8, ''),
  ('parlement', 'parliament', 1.5, ''),
  ('senet', 'senate', 1.5, ''),
  ('constituency', 'constituency', 1.0, ''),
  ('constituancies', 'constituencies', 1.5, ''),

  -- Other frequent searches
  ('governor', 'county governor', 1.2, 'People often search "governor" expecting county ones'),
  ('mp', 'member of parliament', 1.3, ''),
  ('senator', 'senator', 1.0, ''),
  ('mca', 'member of county assembly', 1.5, 'Very common acronym'),
  ('women rep', 'women representative', 1.3, ''),
  ('devolution', 'county government', 1.2, '')
ON CONFLICT (original) DO UPDATE SET 
  expansion = EXCLUDED.expansion,
  boost = GREATEST(public.search_expansions.boost, EXCLUDED.boost);

COMMENT ON TABLE public.search_expansions IS 'Common Kenyan government acronyms, keywords and frequent user misspellings. Used by search_public() to improve recall for short queries and typos (Google-style).';