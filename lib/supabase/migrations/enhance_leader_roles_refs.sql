-- Link leader_roles to reference tables for consistent admin data entry.
-- Denormalized text columns (party, county, constituency, organization, title)
-- remain populated for public reads / Hansard compatibility.

-- Optional FK-style columns (types match common Supabase setups; adjust if needed)
ALTER TABLE public.leader_roles
  ADD COLUMN IF NOT EXISTS position_id UUID,
  ADD COLUMN IF NOT EXISTS institution_id UUID,
  ADD COLUMN IF NOT EXISTS party_id UUID,
  ADD COLUMN IF NOT EXISTS county_id UUID,
  ADD COLUMN IF NOT EXISTS constituency_id UUID,
  ADD COLUMN IF NOT EXISTS ward_id UUID,
  ADD COLUMN IF NOT EXISTS government_level_id UUID,
  ADD COLUMN IF NOT EXISTS level TEXT,
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(100);

-- If your reference tables use bigint/integer ids instead of uuid, run variants like:
-- ALTER TABLE public.leader_roles ALTER COLUMN party_id TYPE BIGINT USING NULL;
-- (only if empty / after casting)

COMMENT ON COLUMN public.leader_roles.term_start_date IS
  'When this position / organisation attachment began';
COMMENT ON COLUMN public.leader_roles.term_end_date IS
  'When this position ended; NULL means still current (open-ended)';
COMMENT ON COLUMN public.leader_roles.institution_id IS
  'FK-ish link to institutions.id; organization text is denormalized name';
COMMENT ON COLUMN public.leader_roles.party_id IS
  'FK-ish link to political_parties.id; party text is denormalized';

-- Helpful indexes for "current role" queries
CREATE INDEX IF NOT EXISTS idx_leader_roles_leader_status
  ON public.leader_roles (leader_id, status);
CREATE INDEX IF NOT EXISTS idx_leader_roles_term_end
  ON public.leader_roles (leader_id, term_end_date);
