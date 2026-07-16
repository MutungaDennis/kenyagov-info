/**
 * Browser-only page view logging (no Server Action → no Worker CPU on navigation).
 * Uses anon Supabase client + RLS insert policy.
 */
import { createBrowserClientAsync } from "@/lib/supabase/client";

export async function logPageViewClient(
  path: string,
  referrer?: string | null,
): Promise<void> {
  const adminBase =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
  if (
    !path ||
    path.startsWith("/admin") ||
    path === adminBase ||
    path.startsWith(`${adminBase}/`) ||
    path.includes(".")
  ) {
    return;
  }

  try {
    const supabase = await createBrowserClientAsync();
    const payload: { path: string; referrer?: string | null } = { path };
    if (referrer) {
      payload.referrer = referrer;
    }
    // Fire-and-forget; ignore result
    void supabase.from("page_views").insert(payload);
  } catch {
    // Silent fail for analytics
  }
}
