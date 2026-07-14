import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

/**
 * PDF bulk IEBC upload is disabled on the Cloudflare Worker build.
 * `pdf-parse-fork` / pdfjs add ~1 MB+ to the server bundle and push past
 * Worker size limits. Use local admin tooling or a separate Worker for PDF
 * ingestion; this route remains for auth-gated JSON/API compatibility messaging.
 */
export async function POST() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    {
      error:
        "PDF bulk upload is not available on the Cloudflare deployment (Worker size limits). Run the upload locally against Supabase or use a dedicated ingestion service.",
      code: "CF_WORKER_LITE",
    },
    { status: 501 },
  );
}
