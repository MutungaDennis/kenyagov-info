import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { paragraphsToPortableText } from "@/lib/constitution/portable-text";

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function toBlocks(paras: unknown): unknown[] {
  if (Array.isArray(paras)) {
    return paragraphsToPortableText(
      paras.map((p) => String(p || "")),
    ) as unknown[];
  }
  if (typeof paras === "string") {
    return paragraphsToPortableText(paras) as unknown[];
  }
  return [];
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
    const meta = body.metadata || {};
    const structured = body.structured || {};

    const title = String(meta.title || "").trim();
    const shortTitle = String(meta.shortTitle || "").trim();
    const citation = String(meta.citation || "").trim();
    const yearEnacted = Number(meta.yearEnacted);
    const houseOfOrigin = String(meta.houseOfOrigin || "").trim();
    const status = String(meta.status || "active").trim();

    if (!title || !shortTitle || !citation) {
      return NextResponse.json(
        {
          success: false,
          error: "title, shortTitle and citation are required",
        },
        { status: 400 },
      );
    }
    if (!Number.isFinite(yearEnacted)) {
      return NextResponse.json(
        { success: false, error: "yearEnacted is required" },
        { status: 400 },
      );
    }
    if (
      !["nationalAssembly", "senate", "countyAssembly"].includes(houseOfOrigin)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid houseOfOrigin" },
        { status: 400 },
      );
    }
    if (houseOfOrigin === "countyAssembly") {
      if (!String(meta.countyName || "").trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "countyName is required for County Assembly Acts",
          },
          { status: 400 },
        );
      }
    }

    const partsIn = Array.isArray(structured.parts) ? structured.parts : [];
    if (partsIn.length === 0) {
      return NextResponse.json(
        { success: false, error: "No parts/sections to save" },
        { status: 400 },
      );
    }

    const parts = partsIn.map((part: Record<string, unknown>) => {
      const sectionsIn = Array.isArray(part.sections) ? part.sections : [];
      return {
        _type: "part" as const,
        _key: randomKey(),
        partNumber: part.partNumber != null ? String(part.partNumber) : "",
        partTitle: part.partTitle != null ? String(part.partTitle) : "",
        sections: sectionsIn.map((sec: Record<string, unknown>) => ({
          _type: "section" as const,
          _key: randomKey(),
          sectionNumber:
            sec.sectionNumber != null ? String(sec.sectionNumber) : "",
          sectionTitle:
            sec.sectionTitle != null ? String(sec.sectionTitle) : "",
          officialText: toBlocks(sec.officialText),
          plainSummary: sec.plainSummary
            ? String(sec.plainSummary)
            : undefined,
        })),
      };
    });

    const schedulesIn = Array.isArray(structured.schedules)
      ? structured.schedules
      : [];
    const scheduleObjects = schedulesIn.map((sch: Record<string, unknown>) => {
      const itemsIn = Array.isArray(sch.items) ? sch.items : [];
      return {
        _type: "schedule" as const,
        _key: randomKey(),
        scheduleNumber:
          sch.scheduleNumber != null ? String(sch.scheduleNumber) : "",
        scheduleTitle:
          sch.scheduleTitle != null ? String(sch.scheduleTitle) : "",
        relatedSection:
          sch.relatedSection != null ? String(sch.relatedSection) : "",
        introText: toBlocks(sch.introText),
        items: itemsIn.map((it: Record<string, unknown>) => ({
          _type: "scheduleItem" as const,
          _key: randomKey(),
          itemNumber: it.itemNumber != null ? String(it.itemNumber) : "",
          itemTitle: it.itemTitle != null ? String(it.itemTitle) : "",
          officialText: toBlocks(it.officialText),
        })),
      };
    });

    // Flatten parts + schedules into the single `parts` array field used by schema
    const partsField = [...parts, ...scheduleObjects];

    const baseSlug = slugify(
      [
        houseOfOrigin === "countyAssembly"
          ? String(meta.countySlug || meta.countyName || "county")
          : "",
        shortTitle,
        String(yearEnacted),
      ]
        .filter(Boolean)
        .join(" "),
    );

    const sanity = createSanityWriteClient();
    const existingId = body.existingId ? String(body.existingId) : null;

    // Avoid slug clash
    let slugCurrent = baseSlug;
    const clash = await sanity.fetch<string | null>(
      `*[_type == "actOfParliament" && slug.current == $slug ${
        existingId ? "&& _id != $id" : ""
      }][0]._id`,
      existingId ? { slug: slugCurrent, id: existingId } : { slug: slugCurrent },
    );
    if (clash) {
      slugCurrent = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    // ✅ FIX: Removed `Record<string, unknown>` and added `as const` to `_type` 
    // so TypeScript correctly infers the required string literal types.
    const doc = {
      _type: "actOfParliament" as const,
      title,
      shortTitle,
      slug: { _type: "slug" as const, current: slugCurrent },
      citation,
      capNumber: meta.capNumber ? String(meta.capNumber).trim() : undefined,
      yearEnacted,
      dateOfAssent: meta.dateOfAssent || undefined,
      dateOfCommencement: meta.dateOfCommencement || undefined,
      status,
      houseOfOrigin,
      countyName:
        houseOfOrigin === "countyAssembly"
          ? String(meta.countyName).trim()
          : undefined,
      countySlug:
        houseOfOrigin === "countyAssembly"
          ? String(meta.countySlug || "").trim() || undefined
          : undefined,
      globalSummary: meta.globalSummary
        ? String(meta.globalSummary).trim()
        : undefined,
      parts: partsField,
    };

    let id: string;
    if (existingId) {
      const { _type: _t, ...patch } = doc;
      await sanity.patch(existingId).set(patch).commit({
        autoGenerateArrayKeys: true,
      });
      id = existingId;
    } else {
      const created = await sanity.create(doc);
      id = created._id;
    }

    return NextResponse.json({
      success: true,
      id,
      slug: slugCurrent,
      publicPath: `/acts/parliament/${slugCurrent}`,
      message: `Saved ${shortTitle}`,
    });
  } catch (err) {
    console.error("[legislation/save]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save Act",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const sanity = createSanityWriteClient();
    const data = await sanity.fetch(
      `*[_type == "actOfParliament"] | order(yearEnacted desc, shortTitle asc) {
        _id,
        title,
        shortTitle,
        "slug": slug.current,
        citation,
        yearEnacted,
        status,
        houseOfOrigin,
        countyName,
        countySlug
      }`,
    );
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to list Acts",
      },
      { status: 500 },
    );
  }
}