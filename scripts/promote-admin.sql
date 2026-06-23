-- =====================================================
-- Promote specific user to admin
-- dennis.mutunga14@gmail.com
-- =====================================================
-- 
-- Instructions:
-- 1. Go to your Supabase project Dashboard
-- 2. Open SQL Editor
-- 3. Paste and run this entire script
--
-- Alternative (if you have SUPABASE_SERVICE_ROLE_KEY locally):
--   npx tsx scripts/promote-admin.ts
--
-- This will:
-- - Ensure the user exists in auth
-- - Create or update their profile with is_admin = true

INSERT INTO public.profiles (id, email, is_admin, updated_at)
SELECT 
  id, 
  email, 
  true,
  now()
FROM auth.users 
WHERE email = 'dennis.mutunga14@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  is_admin = true,
  email = EXCLUDED.email,
  updated_at = now();

-- Verify
SELECT 
  p.id, 
  p.email, 
  p.is_admin, 
  p.updated_at,
  u.created_at as auth_created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email = 'dennis.mutunga14@gmail.com';

-- After running, you should see is_admin = true
-- Then log in at /admin/login with the email + password you set

-- =====================================================
-- (Optional but recommended) Secure is_admin column
-- Prevent regular users from changing their own is_admin flag
-- =====================================================

-- Drop the old permissive update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- New policy: users can update their profile but cannot change is_admin
CREATE POLICY "Users can update own profile"
  ON public.profiles 
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      is_admin IS NOT DISTINCT FROM (
        SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()
      )
    )
  );

-- Note: Service role (used in server admin operations) bypasses RLS anyway.
-- This protects against client-side tampering.
