import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { listContent, saveContent, deleteContent, getContent } from "@/lib/content/store";
import type { ServiceLinkPhrase } from "@/lib/services/link-phrases";
import { SEED_SERVICE_LINK_PHRASES } from "@/lib/services/seed-link-phrases";

async function phrases(db: Parameters<typeof listContent>[1]) {
  return (await listContent<ServiceLinkPhrase & { _id: string }>("service_link_phrases", db)).sort((a,b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.phrase.localeCompare(b.phrase));
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const data = await phrases(auth.supabase);
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

    const body = await request.json();

    if (body.action === "seed") {
      const existing = await phrases(auth.supabase);
      const have = new Set(
        (existing || []).map((e) => (e.phrase || "").toLowerCase()),
      );
      let created = 0;
      for (const seed of SEED_SERVICE_LINK_PHRASES) {
        if (have.has(seed.phrase.toLowerCase())) continue;
        await saveContent("service_link_phrases", {
          _type: "serviceLinkPhrase" as const,
          phrase: seed.phrase,
          matchMode: seed.matchMode,
          internalHref: seed.internalHref,
          ...(seed.externalHref ? { externalHref: seed.externalHref } : {}),
          ...(seed.externalLabel ? { externalLabel: seed.externalLabel } : {}),
          sortOrder: seed.sortOrder,
          enabled: seed.enabled,
        }, auth.supabase);
        created++;
      }
      const data = await phrases(auth.supabase);
      return NextResponse.json({
        success: true,
        created,
        data,
        message: `Seeded ${created} new phrase(s)`,
      });
    }

    if (body.action === "delete" && body.id) {
      await deleteContent("service_link_phrases", String(body.id), auth.supabase);
      const data = await phrases(auth.supabase);
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
      const existing = await getContent("service_link_phrases", "id", String(body.id), auth.supabase);
      if (!existing) return NextResponse.json({ error: "Phrase not found" }, { status: 404 });
      await saveContent("service_link_phrases", { ...existing, ...doc, _id: String(body.id) }, auth.supabase);
    } else {
      await saveContent("service_link_phrases", doc, auth.supabase);
    }

    const data = await phrases(auth.supabase);
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
