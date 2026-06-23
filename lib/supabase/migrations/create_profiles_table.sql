-- Create profiles table for user metadata including admin role
-- Run this in Supabase SQL editor or via migration.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile, but CANNOT change the is_admin flag themselves
-- (prevents privilege escalation from client side)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      is_admin IS NOT DISTINCT FROM (
        SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()
      )
    )
  );

-- Service role (backend) can do everything (for admin promotion, seeding, etc.)
-- Note: Policies above do not restrict service_role key usage.

-- Optional: Auto-create profile row on new user signup via trigger
-- (Uncomment if you want automatic profile creation for all signups)
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name, is_admin)
--   VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), FALSE);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BOOTSTRAPPING THE FIRST ADMIN USER (IMPORTANT)
-- =====================================================
-- 1. Create the user in Supabase Dashboard → Authentication → Users (you already did for dennis.mutunga14@gmail.com).
-- 2. Run the following in the Supabase SQL Editor (paste the whole block):

-- Promote dennis.mutunga14@gmail.com (or replace email)
INSERT INTO public.profiles (id, email, is_admin, updated_at)
SELECT id, email, true, now()
FROM auth.users 
WHERE email = 'dennis.mutunga14@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, email = EXCLUDED.email, updated_at = now();

-- Verify it worked
SELECT id, email, is_admin FROM public.profiles 
WHERE email = 'dennis.mutunga14@gmail.com';

-- Alternative using the helper (if you have a Node script with SUPABASE_SERVICE_ROLE_KEY):
--   import { promoteUserToAdmin } from '@/lib/supabase/admin';
--   await promoteUserToAdmin('the-uuid-here', 'dennis.mutunga14@gmail.com');

-- After the row has is_admin=true, log in at /admin/login
-- You will be redirected to the admin dashboard.

COMMENT ON TABLE public.profiles IS 'User profiles with role flags. is_admin controls access to /admin area.';
