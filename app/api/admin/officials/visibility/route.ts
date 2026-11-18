import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const SCOPES = [
  "all_officials",
  "national_officials",
  "mps",
  "senators",
  "governors",
  "women_representatives",
] as const;
const FIELDS = [
  "biography",
  "key_details",
  "party",
  "positions",
  "qualifications",
  "committees",
  "contact",
  "social_media",
] as const;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("official_profile_visibility_settings")
    .select("scope, visibility, updated_at")
    .order("scope");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: { scope?: unknown; visibility?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const scope = typeof body.scope === "string" ? body.scope : "";
  if (!SCOPES.includes(scope as (typeof SCOPES)[number])) {
    return NextResponse.json({ error: "Invalid visibility scope" }, { status: 400 });
  }
  if (!body.visibility || typeof body.visibility !== "object" || Array.isArray(body.visibility)) {
    return NextResponse.json({ error: "Visibility must be an object" }, { status: 400 });
  }
  const input = body.visibility as Record<string, unknown>;
  const visibility: Record<string, boolean> = {};
  for (const field of FIELDS) {
    if (field in input) {
      if (typeof input[field] !== "boolean") {
        return NextResponse.json({ error: `Invalid value for ${field}` }, { status: 400 });
      }
      visibility[field] = input[field] as boolean;
    }
  }

  const { data, error } = await auth.supabase
    .from("official_profile_visibility_settings")
    .upsert(
      { scope, visibility, updated_at: new Date().toISOString(), updated_by: auth.user.id },
      { onConflict: "scope" },
    )
    .select("scope, visibility, updated_at")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
