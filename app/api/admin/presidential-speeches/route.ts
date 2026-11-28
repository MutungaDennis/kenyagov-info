import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().slice(0, 120);
  const parsedOffset = Number.parseInt(params.get("offset") ?? "0", 10);
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, Math.min(parsedOffset, 100_000)) : 0;
  let speeches = auth.supabase
    .from("presidential_speeches")
    .select("id, slug, title, record_kind, speech_date, is_published, summary", { count: "exact" });

  if (query) speeches = speeches.ilike("title", `%${query.replace(/[%,_\\]/g, " ")}%`);

  const { data, error, count } = await speeches
    .order("speech_date", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: "Could not load presidential publications." }, { status: 500 });
  }

  return NextResponse.json(
    { data: data ?? [], total: count ?? 0, offset, limit: PAGE_SIZE },
    { headers: { "Cache-Control": "no-store" } },
  );
}
