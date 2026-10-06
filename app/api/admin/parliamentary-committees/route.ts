import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { type ParliamentaryChamber } from "@/lib/legislature/committees";

export const dynamic = "force-dynamic";

const CHAMBERS = new Set<ParliamentaryChamber>(["national_assembly", "senate"]);

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);

  const chamber = searchParams.get("chamber");
  let query = auth.supabase
    .from("parliamentary_committees")
    .select("id,chamber,category,name,slug,description,mandate,established_date,dissolved_date,is_active,is_published,sort_order")
    .order("chamber")
    .order("category")
    .order("sort_order")
    .order("name");
  if (chamber && CHAMBERS.has(chamber as ParliamentaryChamber)) {
    query = query.eq("chamber", chamber);
  }
  const { data, error } = await query;
  if (error) {
    if (/does not exist|schema cache|could not find|PGRST204/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Parliamentary committee management is not installed.",
          hint: "Apply lib/supabase/migrations/20261007_parliamentary_committees.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ committees: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const chamber = String(body.chamber || "") as ParliamentaryChamber;
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const slug = slugify(String(body.slug || name));
  if (!CHAMBERS.has(chamber)) {
    return NextResponse.json({ error: "Choose National Assembly or Senate." }, { status: 400 });
  }
  if (!name || name.length > 200 || !category || category.length > 150 || !slug || slug.length > 220) {
    return NextResponse.json({ error: "Enter a committee name, category and valid URL name." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("parliamentary_committees")
    .insert({
      chamber,
      name,
      category,
      slug,
      description: String(body.description || "").trim() || null,
      mandate: String(body.mandate || "").trim() || null,
      established_date: String(body.established_date || "").trim() || null,
      dissolved_date: String(body.dissolved_date || "").trim() || null,
      is_active: body.is_active !== false,
      is_published: body.is_published === true,
      sort_order: Number.isInteger(Number(body.sort_order)) && Number(body.sort_order) > 0
        ? Number(body.sort_order)
        : 1,
    })
    .select("id,chamber,category,name,slug")
    .single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A committee with this URL name already exists." }, { status: 409 });
    }
    if (/does not exist|schema cache|could not find|PGRST204/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Parliamentary committee management is not installed.",
          hint: "Apply lib/supabase/migrations/20261007_parliamentary_committees.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ committee: data }, { status: 201 });
}
