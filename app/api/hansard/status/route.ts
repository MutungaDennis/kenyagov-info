import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { refreshHansard } from "@/lib/content/revalidate";
export async function POST(request: NextRequest) {
 const auth = await requireAdminApi(); if (!auth.ok) return auth.response;
 const { documentId, isActive } = await request.json();
 if (!documentId || typeof isActive !== "boolean") return NextResponse.json({ error: "documentId and isActive are required" }, { status: 400 });
 const { data, error } = await auth.supabase.from("hansard_sittings").update({ status: isActive ? "published" : "draft", published_at: isActive ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", documentId).select("id").maybeSingle();
 if (error) return NextResponse.json({ error: error.message }, { status: 400 });
 if (!data) return NextResponse.json({ error: "Sitting not found" }, { status: 404 });
 refreshHansard(); return NextResponse.json({ success: true });
}
