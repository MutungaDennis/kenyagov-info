import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
export async function GET(request: NextRequest) {
 const auth = await requireAdminApi(); if (!auth.ok) return auth.response;
 const params = request.nextUrl.searchParams;
 const house = params.get("house"), date = params.get("date");
 if (!house || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Select a house and sitting date first" }, { status: 400 });
 const { data, error } = await auth.supabase.rpc("hansard_member_candidates", { p_house: house, p_date: date, p_query: (params.get("q") || "").slice(0,120) });
 if (error) return NextResponse.json({ error: error.message }, { status: 400 });
 return NextResponse.json({ members: data }, { headers: { "Cache-Control": "no-store" } });
}
