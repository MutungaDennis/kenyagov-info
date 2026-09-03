// app/api/admin/documents/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { paragraphsToPortableText } from "@/lib/constitution/portable-text";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      title,
      shortTitle,
      referenceNumber,
      yearPublished,
      issuingBody,
      functionalCategory,
      archivalCategory,
      historicalEra,
      summary,
      fullText,
    } = body;

    if (!shortTitle || !referenceNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (shortTitle, referenceNumber)" },
        { status: 400 },
      );
    }

    const sanity = createSanityWriteClient();
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured for writes" },
        { status: 500 },
      );
    }

    const slug = shortTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const docId = `governmentPublication-${slug}`;

    const portableText = paragraphsToPortableText(fullText || []);

    const doc = {
      _id: docId,
      _type: "governmentPublication",
      title: title || shortTitle,
      shortTitle,
      slug: { _type: "slug", current: slug },
      referenceNumber,
      yearPublished: Number(yearPublished) || new Date().getFullYear(),
      issuingBody,
      functionalCategory,
      archivalCategory,
      historicalEra,
      summary: String(summary || "").trim(),
      fullText: portableText,
    };

    await sanity.createOrReplace(doc as any);

    return NextResponse.json({
      success: true,
      message: `Successfully saved document: ${shortTitle}`,
      publicPath: `/documents/${slug}`,
    });
  } catch (err) {
    console.error("[documents/save]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to save document" },
      { status: 500 },
    );
  }
}