/**
 * One-time script to promote a user to admin using the service role key.
 * 
 * Usage:
 *   1. Make sure SUPABASE_SERVICE_ROLE_KEY is in your .env.local
 *   2. Run: npx tsx scripts/promote-admin.ts
 */

import { promoteUserToAdmin } from '../lib/supabase/admin';

const EMAIL = 'dennis.mutunga14@gmail.com';

async function main() {
  console.log(`Promoting ${EMAIL} to admin...`);

  try {
    const result = await promoteUserToAdmin(null, EMAIL);
    console.log('✅ Success!', result);
    console.log('The user can now log in at /admin/login');
  } catch (err: any) {
    console.error('❌ Failed to promote:', err.message);
    console.log('\nAlternative: Paste this into Supabase SQL Editor:');
    console.log(`
INSERT INTO public.profiles (id, email, is_admin, updated_at)
SELECT id, email, true, now()
FROM auth.users 
WHERE email = '${EMAIL}'
ON CONFLICT (id) DO UPDATE SET is_admin = true, updated_at = now();
    `);
  }
}

main();