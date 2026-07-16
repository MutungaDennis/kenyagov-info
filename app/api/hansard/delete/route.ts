import { NextRequest, NextResponse } from "next/server";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

const sanity = createSanityWriteClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentId = body?.documentId as string | undefined;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 },
      );
    }

    await sanity.delete(documentId);

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
