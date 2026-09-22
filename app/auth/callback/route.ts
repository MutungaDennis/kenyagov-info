import { NextRequest, NextResponse } from "next/server";
import { adminPath } from "@/lib/admin-path";
import { createClient } from "@/lib/supabase/server";

// The destination is fixed; never redirect to a user-supplied URL.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(adminPath("reset-password"), request.url), {
        headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
      });
    }
  }
  return NextResponse.redirect(new URL(`${adminPath("login")}?error=recovery-expired`, request.url), {
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
