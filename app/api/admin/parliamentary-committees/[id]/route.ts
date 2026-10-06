import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import {
  isValidCommitteeDate,
  type ParliamentaryChamber,
} from "@/lib/legislature/committees";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function nullableDate(value: unknown) {
  const date = String(value || "").trim();
  return date ? date : null;
}

function installedError(message: string) {
  return /does not exist|schema cache|could not find|PGRST204/i.test(message);
}

function schemaError() {
  return NextResponse.json(
    {
      error: "Parliamentary committee management is not installed.",
      hint: "Apply lib/supabase/migrations/20261007_parliamentary_committees.sql in Supabase.",
    },
    { status: 503 },
  );
}

export async function GET(_request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Committee not found." }, { status: 404 });
  const committee = await auth.supabase
    .from("parliamentary_committees")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (committee.error) return installedError(committee.error.message) ? schemaError() : NextResponse.json({ error: committee.error.message }, { status: 500 });
  if (!committee.data) return NextResponse.json({ error: "Committee not found." }, { status: 404 });
  return NextResponse.json({ committee: committee.data });
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Committee not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const slug = slugify(String(body.slug || name));
  const chamber = String(body.chamber || "") as ParliamentaryChamber;
  const establishedDate = nullableDate(body.established_date);
  const dissolvedDate = nullableDate(body.dissolved_date);
  if (!name || name.length > 200 || !category || category.length > 150 || !slug || slug.length > 220) {
    return NextResponse.json({ error: "Enter a committee name, category and valid URL name." }, { status: 400 });
  }
  if (!["national_assembly", "senate"].includes(chamber)) {
    return NextResponse.json({ error: "Choose National Assembly or Senate." }, { status: 400 });
  }
  if (!isValidCommitteeDate(establishedDate) || !isValidCommitteeDate(dissolvedDate) ||
      (establishedDate && dissolvedDate && dissolvedDate < establishedDate)) {
    return NextResponse.json({ error: "Check the committee start and end dates." }, { status: 400 });
  }
  const sortOrder = Number(body.sort_order);
  if (!Number.isInteger(sortOrder) || sortOrder < 1) {
    return NextResponse.json({ error: "Committee display order must be a whole number starting at 1." }, { status: 400 });
  }

  const existingCommittee = await auth.supabase
    .from("parliamentary_committees")
    .select("id,chamber")
    .eq("id", id)
    .maybeSingle();
  if (existingCommittee.error) return installedError(existingCommittee.error.message) ? schemaError() : NextResponse.json({ error: existingCommittee.error.message }, { status: 500 });
  if (!existingCommittee.data) return NextResponse.json({ error: "Committee not found." }, { status: 404 });
  if (existingCommittee.data.chamber !== chamber) {
    return NextResponse.json({ error: "A committee's House cannot be changed after creation. Create a new committee under the correct House instead." }, { status: 400 });
  }

  const save = await auth.supabase
    .from("parliamentary_committees")
    .update({
      chamber,
      category,
      name,
      slug,
      description: String(body.description || "").trim() || null,
      mandate: String(body.mandate || "").trim() || null,
      established_date: establishedDate,
      dissolved_date: dissolvedDate,
      is_active: body.is_active === true,
      is_published: body.is_published === true,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (save.error) {
    if (installedError(save.error.message)) return schemaError();
    if (save.error.code === "23505") return NextResponse.json({ error: "A committee with this URL name already exists." }, { status: 409 });
    return NextResponse.json({ error: save.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
