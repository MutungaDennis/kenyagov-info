// app/api/admin/documents/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    const sanity = createSanityWriteClient();

    const doc = await sanity.fetch(
      `*[_type == "governmentPublication" && _id == $id][0] {
        _id,
        title,
        shortTitle,
        "slug": slug.current,
        referenceNumber,
        yearPublished,
        issuingBody,
        functionalCategory,
        archivalCategory,
        historicalEra,
        summary,
        fullText,
        officialExternalUrl
      }`,
      { id }
    );

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    console.error("[documents/fetch]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch document" },
      { status: 500 }
    );
  }
}