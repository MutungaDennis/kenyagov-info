/**
 * Admin-only Supabase operations using the SERVICE_ROLE_KEY.
 * Never import this in client components.
 *
 * Use these to:
 * - Promote a user to admin (set is_admin = true in profiles)
 * - Create the profile row for an existing auth user
 */

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Ensures a profile exists and sets is_admin = true.
 * 
 * You can call it with:
 *   - promoteUserToAdmin('user-uuid-here')
 *   - promoteUserToAdmin(null, 'email@example.com')   // looks up the user
 *   - promoteUserToAdmin(undefined, 'dennis.mutunga14@gmail.com')
 */
export async function promoteUserToAdmin(userId?: string | null, email?: string) {
  const admin = getAdminClient();

  let targetUserId = userId;
  let targetEmail = email;

  if (!targetUserId && targetEmail) {
    // Look up user by email using service role
    const { data: users, error: lookupError } = await admin.auth.admin.listUsers();
    if (lookupError) throw lookupError;

    const emailToSearch = targetEmail; // narrowed to string by the if guard
    const found = users?.users?.find(u => u.email?.toLowerCase() === emailToSearch.toLowerCase());
    if (!found) {
      throw new Error(`No auth user found with email: ${targetEmail}`);
    }
    targetUserId = found.id;
    if (!targetEmail) targetEmail = found.email;
  }

  if (!targetUserId) {
    throw new Error('You must provide either a userId or an email');
  }

  const { error } = await admin
    .from('profiles')
    .upsert(
      {
        id: targetUserId,
        email: targetEmail ?? null,
        is_admin: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw new Error(`Failed to promote user to admin: ${error.message}`);
  }

  return { success: true, userId: targetUserId };
}

/**
 * Optional: Set role via Supabase Auth app_metadata as well (available in JWT).
 * This allows fast checks in middleware without a DB roundtrip in some cases.
 */
export async function setAdminAppMetadata(userId: string) {
  const admin = getAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' },
  });

  if (error) {
    throw new Error(`Failed to set admin app_metadata: ${error.message}`);
  }

  return { success: true };
}
