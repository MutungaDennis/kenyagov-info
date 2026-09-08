import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ provisionId: string }> };

const ALLOWED = [
  "provision_type","provision_number","heading","body_text","body_html","status",
  "review_status","relationship_review_status","admin_notes","is_current",
  "effective_from","effective_to","repeal_date"
];

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provisionId } = await context.params;
  const body = await request.json();

  const patch = Object.fromEntries(
    Object.entries(body)
      .filter(([key]) => ALLOWED.includes(key))
      .map(([key, value]) => [key, value === "" ? null : value]),
  );

  const { data, error } = await auth.supabase
    .from("legislation_provisions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", provisionId)
    .select("id,legislation_document_id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Provision not found." }, { status: 404 });

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: data.legislation_document_id,
    legislation_provision_id: provisionId,
    action: "provision_updated",
    summary: "Provision text or metadata updated.",
  });

  return NextResponse.json({ data });
}
