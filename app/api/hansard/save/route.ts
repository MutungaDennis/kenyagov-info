import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prepareHansardDocument, publicationIssues } from "@/lib/hansard/document";
import { refreshHansard } from "@/lib/content/revalidate";
export async function POST(request: NextRequest) {
 const auth = await requireAdminApi(); if (!auth.ok) return auth.response;
 try {
 const document = prepareHansardDocument(await request.json());
 if (document.sitting.status === "published") { const issues = publicationIssues(document); if (issues.length) return NextResponse.json({ error: issues.join("; ") }, { status: 400 }); }
 const { data, error } = await auth.supabase.rpc("save_hansard_document", { p_document: document });
 if (error) return NextResponse.json({ error: error.message }, { status: 400 });
 refreshHansard(); return NextResponse.json({ success: true, documentId: data });
 } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save sitting" }, { status: 400 }); }
}
