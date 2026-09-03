// app/api/admin/documents/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Document ID is required" }, { status: 400 });
    }

    const sanity = createSanityWriteClient();
    await sanity.delete(id);

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    console.error("[documents/delete]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete document" },
      { status: 500 }
    );
  }
}