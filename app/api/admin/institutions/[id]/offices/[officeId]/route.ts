import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { parseInstitutionOffice } from "@/lib/institutions/offices";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; officeId: string }> };

export async function PUT(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id, officeId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = parseInstitutionOffice(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("institution_offices")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", officeId)
    .eq("institution_id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) {
      return NextResponse.json({
        error: "Institution office support is not installed.",
        hint: "Apply lib/supabase/migrations/20261003_institution_offices.sql in Supabase.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Office not found." }, { status: 404 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id, officeId } = await context.params;
  const { data, error } = await auth.supabase
    .from("institution_offices")
    .delete()
    .eq("id", officeId)
    .eq("institution_id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) {
      return NextResponse.json({
        error: "Institution office support is not installed.",
        hint: "Apply lib/supabase/migrations/20261003_institution_offices.sql in Supabase.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Office not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
