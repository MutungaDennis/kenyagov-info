import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { SEED_LINK_PHRASES } from "@/lib/constitution/seed-link-phrases";

const LIST_QUERY = `*[_type == "constitutionLinkPhrase"] | order(sortOrder asc, phrase asc) {
  _id, phrase, matchMode, internalHref, externalHref, externalLabel,
  constitutionChapter, constitutionArticle, scopeChapters, enabled, sortOrder
}`;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const sanity = createSanityWriteClient();
    const data = await sanity.fetch(LIST_QUERY);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("[link-phrases GET]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load phrases",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const sanity = createSanityWriteClient();

    if (body.action === "seed") {
      const existing = await sanity.fetch<Array<{ phrase?: string }>>(
        `*[_type == "constitutionLinkPhrase"]{ phrase }`,
      );
      const have = new Set(
        (existing || []).map((e) => (e.phrase || "").toLowerCase()),
      );
      let created = 0;
      for (const seed of SEED_LINK_PHRASES) {
        if (have.has(seed.phrase.toLowerCase())) continue;
        await sanity.create({
          _type: "constitutionLinkPhrase",
          ...seed,
        });
        created++;
      }
      const data = await sanity.fetch(LIST_QUERY);
      return NextResponse.json({
        success: true,
        created,
        data,
        message: `Seeded ${created} new phrase(s)`,
      });
    }

    if (body.action === "delete" && body.id) {
      await sanity.delete(String(body.id));
      const data = await sanity.fetch(LIST_QUERY);
      return NextResponse.json({ success: true, data, message: "Deleted" });
    }

    // Upsert one phrase
    const phrase = String(body.phrase || "").trim();
    if (!phrase) {
      return NextResponse.json(
        { success: false, error: "phrase is required" },
        { status: 400 },
      );
    }

    // ✅ FIX: Removed `Record<string, unknown>` and added `as const` to `_type`
    // so TypeScript knows `_type` is explicitly present and is a string literal.
    const doc = {
      _type: "constitutionLinkPhrase" as const,
      phrase,
      matchMode: body.matchMode === "exact" ? "exact" : "caseInsensitive",
      internalHref: body.internalHref
        ? String(body.internalHref).trim()
        : undefined,
      externalHref: body.externalHref
        ? String(body.externalHref).trim()
        : undefined,
      externalLabel: body.externalLabel
        ? String(body.externalLabel).trim()
        : undefined,
      constitutionChapter:
        body.constitutionChapter != null && body.constitutionChapter !== ""
          ? Number(body.constitutionChapter)
          : undefined,
      constitutionArticle:
        body.constitutionArticle != null && body.constitutionArticle !== ""
          ? Number(body.constitutionArticle)
          : undefined,
      scopeChapters: Array.isArray(body.scopeChapters)
        ? body.scopeChapters.map(Number).filter(Number.isFinite)
        : undefined,
      enabled: body.enabled !== false,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 100,
    };

    if (body.id) {
      // We can safely destructure `_type` out since patch doesn't need it
      const { _type: _t, ...patch } = doc;
      await sanity.patch(String(body.id)).set(patch).commit();
    } else {
      await sanity.create(doc);
    }

    const data = await sanity.fetch(LIST_QUERY);
    return NextResponse.json({
      success: true,
      data,
      message: body.id ? "Updated phrase" : "Created phrase",
    });
  } catch (err) {
    console.error("[link-phrases POST]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save phrase",
      },
      { status: 500 },
    );
  }
}