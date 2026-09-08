import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const type = request.nextUrl.searchParams.get("type") || "";
  const q = (request.nextUrl.searchParams.get("q") || "").trim();

  if (q.length < 2) return NextResponse.json({ data: [] });

  if (type === "institution") {
    const { data, error } = await auth.supabase
      .from("institutions")
      .select("id,name,short_name,slug")
      .or(`name.ilike.%${q}%,short_name.ilike.%${q}%`)
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data: (data || []).map((row: any) => ({
        kind: "institution",
        id: row.id,
        name: row.short_name || row.name,
        description: row.name,
      })),
    });
  }

  if (type === "law") {
    const { data, error } = await auth.supabase
      .from("legal_documents")
      .select("id,title,short_title,citation,slug,document_type")
      .or(`title.ilike.%${q}%,short_title.ilike.%${q}%,citation.ilike.%${q}%`)
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data: (data || []).map((row: any) => ({
        kind: "law",
        id: row.id,
        name: row.short_title || row.title,
        description: row.citation,
      })),
    });
  }

  if (type === "person") {
    const [leaders, mcas] = await Promise.all([
      auth.supabase
        .from("leaders")
        .select("id,slug,full_name,first_name,other_names,surname")
        .or(`full_name.ilike.%${q}%,first_name.ilike.%${q}%,surname.ilike.%${q}%`)
        .limit(15),
      auth.supabase
        .from("mcas")
        .select("id,slug,first_name,other_names,surname")
        .or(`first_name.ilike.%${q}%,surname.ilike.%${q}%`)
        .limit(15),
    ]);

    return NextResponse.json({
      data: [
        ...(leaders.data || []).map((row: any) => ({
          kind: "leader",
          id: row.id,
          name: row.full_name || [row.first_name, row.other_names, row.surname].filter(Boolean).join(" "),
        })),
        ...(mcas.data || []).map((row: any) => ({
          kind: "mca",
          id: row.id,
          name: [row.first_name, row.other_names, row.surname].filter(Boolean).join(" "),
        })),
      ],
    });
  }

  return NextResponse.json({ data: [] });
}
