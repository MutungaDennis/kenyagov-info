import { NextRequest, NextResponse } from "next/server";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

const sanity = createSanityWriteClient();

/** Publish (isActive: true) or unpublish / draft (isActive: false). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentId = body?.documentId as string | undefined;
    const isActive = Boolean(body?.isActive);

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 },
      );
    }

    const updated = await sanity
      .patch(documentId)
      .set({ isActive })
      .commit();

    return NextResponse.json({
      success: true,
      documentId: updated._id,
      isActive,
      message: isActive ? "Sitting published" : "Sitting set to draft",
    });
  } catch (error: unknown) {
    console.error("[Hansard Status Error]", error);
    const message =
      error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
