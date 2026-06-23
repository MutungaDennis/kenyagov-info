-- =====================================================
-- FIX SCRIPT: Repair site_status table after unique constraint error
-- Run this in Supabase SQL Editor if you see:
-- "duplicate key value violates unique constraint "site_status_single_row""
-- =====================================================

-- 1. Drop the old problematic unique index (if it exists)
DROP INDEX IF EXISTS site_status_single_row;

-- 2. Backup any existing data
CREATE TEMP TABLE IF NOT EXISTS site_status_backup AS 
SELECT * FROM public.site_status LIMIT 1;

-- 3. Drop the table (this will also drop policies)
DROP TABLE IF EXISTS public.site_status CASCADE;

-- 4. Recreate with the proper fixed-UUID design (compatible with UUID type and Supabase)
CREATE TABLE public.site_status (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'maintenance', 'coming_soon', 'under_development', 'launching_soon')),
  message TEXT,
  launch_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. Re-create RLS policies
ALTER TABLE public.site_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site status"
  ON public.site_status FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site status"
  ON public.site_status
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 6. Restore data or seed fresh
INSERT INTO public.site_status (id, status, message, launch_date, updated_at, updated_by)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  COALESCE(status, 'live'),
  message,
  launch_date,
  COALESCE(updated_at, NOW()),
  updated_by
FROM site_status_backup
ON CONFLICT (id) DO NOTHING;

-- Ensure at least one row exists (the canonical row)
INSERT INTO public.site_status (id, status, message)
VALUES ('00000000-0000-0000-0000-000000000001', 'live', 'Welcome to CitizenGuide.KE')
ON CONFLICT (id) DO NOTHING;

-- 7. Verify
SELECT * FROM public.site_status;

-- After running, go to /admin/site-status and try the update.
-- The code always uses the fixed UUID '00000000-0000-0000-0000-000000000001' for the single row.