// app/api/admin/documents/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      _id,
      title,
      shortTitle,
      slug,
      referenceNumber,
      yearPublished,
      issuingBody,
      functionalCategory,
      archivalCategory,
      historicalEra,
      summary,
      officialExternalUrl,
    } = body;

    if (!_id || !shortTitle || !slug) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (_id, shortTitle, slug)" },
        { status: 400 }
      );
    }

    const sanity = createSanityWriteClient();
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const doc = {
      title,
      shortTitle,
      slug: { _type: "slug", current: slug },
      referenceNumber,
      yearPublished: Number(yearPublished),
      issuingBody,
      functionalCategory,
      archivalCategory,
      historicalEra,
      summary: String(summary || "").trim(),
      officialExternalUrl: officialExternalUrl || null,
    };

    await sanity.patch(_id).set(doc).commit();

    return NextResponse.json({
      success: true,
      message: `Document updated successfully: ${shortTitle}`,
      publicPath: `/documents/${slug}`,
    });
  } catch (err) {
    console.error("[documents/update]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update document" },
      { status: 500 }
    );
  }
}