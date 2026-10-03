import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-api";
import { parseInstitutionOffice } from "@/lib/institutions/offices";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function validateInstitution(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("institutions")
    .select("id, record_kind")
    .eq("id", id)
    .maybeSingle();
  if (error) return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
  if (!data || data.record_kind === "temporary_body") {
    return { response: NextResponse.json({ error: "Select an existing institution to manage its offices." }, { status: 404 }) };
  }
  return {};
}

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const validation = await validateInstitution(auth.supabase, id);
  if (validation.response) return validation.response;

  const { data, error } = await auth.supabase
    .from("institution_offices")
    .select("*")
    .eq("institution_id", id)
    .order("sort_order", { ascending: true })
    .order("office_name", { ascending: true });
  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) {
      return NextResponse.json({
        error: "Institution office support is not installed.",
        hint: "Apply lib/supabase/migrations/20261003_institution_offices.sql in Supabase.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const validation = await validateInstitution(auth.supabase, id);
  if (validation.response) return validation.response;

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
    .insert({ institution_id: id, ...parsed.data })
    .select("*")
    .single();
  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) {
      return NextResponse.json({
        error: "Institution office support is not installed.",
        hint: "Apply lib/supabase/migrations/20261003_institution_offices.sql in Supabase.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
