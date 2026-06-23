-- Create site status table for kill switch / maintenance mode
-- Single row design using fixed UUID for reliable upserts
CREATE TABLE IF NOT EXISTS public.site_status (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'maintenance', 'coming_soon', 'under_development', 'launching_soon')),
  message TEXT,
  launch_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_status ENABLE ROW LEVEL SECURITY;

-- Public can read the status (needed for middleware and public pages)
CREATE POLICY "Public can read site status"
  ON public.site_status FOR SELECT
  USING (true);

-- Only admins can update/insert the status
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

-- Seed the single canonical row
INSERT INTO public.site_status (id, status, message)
VALUES ('00000000-0000-0000-0000-000000000001', 'live', 'Welcome to CitizenGuide.KE')
ON CONFLICT (id) DO NOTHING;