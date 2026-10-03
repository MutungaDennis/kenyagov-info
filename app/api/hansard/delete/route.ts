import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { refreshHansard } from "@/lib/content/revalidate";



export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const documentId = body?.documentId as string | undefined;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 },
      );
    }

    const { error } = await auth.supabase.from("hansard_sittings").delete().eq("id", documentId);
    if (error) throw error;
    refreshHansard();

    return NextResponse.json({
      success: true,
      message: "Hansard sitting deleted",
      documentId,
    });
  } catch (error: unknown) {
    console.error("[Hansard Delete Error]", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete sitting";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
