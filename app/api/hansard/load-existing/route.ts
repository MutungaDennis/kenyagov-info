import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getHansardDocument } from "@/lib/hansard/queries";
export async function GET(request: NextRequest) {
 const auth = await requireAdminApi(); if (!auth.ok) return auth.response;
 const id = request.nextUrl.searchParams.get("id");
 if (!id) return NextResponse.json({ error: "A sitting ID is required" }, { status: 400 });
 const document = await getHansardDocument({ id }, auth.supabase);
 return NextResponse.json({ exists: !!document, document }, { headers: { "Cache-Control": "no-store" } });
}
