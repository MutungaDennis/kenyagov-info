import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityWriteClient";
import { SEED_SERVICE_LINK_PHRASES } from "@/lib/services/seed-link-phrases";

const LIST_QUERY = `*[_type == "serviceLinkPhrase"] | order(sortOrder asc, phrase asc) {
  _id, phrase, matchMode, internalHref, externalHref, externalLabel,
  scopeServiceSlugs, enabled, sortOrder
}`;

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const sanity = createSanityWriteClient();
    const data = await sanity.fetch(LIST_QUERY);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("[service link-phrases GET]", err);
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
        `*[_type == "serviceLinkPhrase"]{ phrase }`,
      );
      const have = new Set(
        (existing || []).map((e) => (e.phrase || "").toLowerCase()),
      );
      let created = 0;
      for (const seed of SEED_SERVICE_LINK_PHRASES) {
        if (have.has(seed.phrase.toLowerCase())) continue;
        await sanity.create({
          _type: "serviceLinkPhrase" as const,
          phrase: seed.phrase,
          matchMode: seed.matchMode,
          internalHref: seed.internalHref,
          ...(seed.externalHref ? { externalHref: seed.externalHref } : {}),
          ...(seed.externalLabel ? { externalLabel: seed.externalLabel } : {}),
          sortOrder: seed.sortOrder,
          enabled: seed.enabled,
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

    const phrase = String(body.phrase || "").trim();
    if (!phrase) {
      return NextResponse.json(
        { success: false, error: "phrase is required" },
        { status: 400 },
      );
    }

    const doc = {
      _type: "serviceLinkPhrase" as const,
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
      scopeServiceSlugs: Array.isArray(body.scopeServiceSlugs)
        ? body.scopeServiceSlugs.map(String).filter(Boolean)
        : undefined,
      enabled: body.enabled !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : 100,
    };

    if (body.id) {
      await sanity.patch(String(body.id)).set(doc).commit();
    } else {
      await sanity.create(doc);
    }

    const data = await sanity.fetch(LIST_QUERY);
    return NextResponse.json({ success: true, data, message: "Saved" });
  } catch (err) {
    console.error("[service link-phrases POST]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save phrase",
      },
      { status: 500 },
    );
  }
}
