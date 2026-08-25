import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import {
  scheduleByNumber,
  scheduleDocumentId,
} from "@/lib/constitution/schedules";
import { paragraphsToPortableText } from "@/lib/constitution/portable-text";

type IncomingBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    };

type IncomingSection = {
  heading?: string | null;
  blocks: IncomingBlock[];
};

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function sectionsToPortableText(sections: IncomingSection[]) {
  const out: Array<Record<string, unknown>> = [];

  for (const section of sections) {
    if (section.heading?.trim()) {
      out.push({
        _type: "block",
        _key: randomKey(),
        style: "h3",
        children: [
          {
            _type: "span",
            _key: randomKey(),
            text: section.heading.trim(),
            marks: [],
          },
        ],
        markDefs: [],
      });
    }

    for (const block of section.blocks || []) {
      if (block.type === "table") {
        out.push({
          _type: "constitutionTable",
          _key: randomKey(),
          caption: block.caption || undefined,
          headers: block.headers || [],
          rows: (block.rows || []).map((cells) => ({
            _key: randomKey(),
            cells,
          })),
        });
        continue;
      }
      const paras = paragraphsToPortableText(block.text);
      for (const p of paras) out.push(p as Record<string, unknown>);
    }
  }

  return out;
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
    const scheduleNumber = Number(body.scheduleNumber);
    const meta = scheduleByNumber(scheduleNumber);
    if (!meta) {
      return NextResponse.json(
        { success: false, error: "Invalid schedule number" },
        { status: 400 },
      );
    }

    const sections = Array.isArray(body.sections)
      ? (body.sections as IncomingSection[])
      : [];
    if (sections.length === 0) {
      return NextResponse.json(
        { success: false, error: "No sections to save" },
        { status: 400 },
      );
    }

    const fullTitle =
      String(body.fullTitle || "").trim() || meta.fullTitle;
    const title = String(body.title || "").trim() || meta.title;
    const citation =
      String(body.citation || "").trim() || meta.citation;
    const slugCurrent =
      String(body.slug || meta.slug).trim().toLowerCase() || meta.slug;

    const officialText = sectionsToPortableText(sections);
    const docId = scheduleDocumentId(meta.number);

    const sanity = createSanityWriteClient();

    // Preserve amplifiedText if re-saving
    const existing = await sanity.fetch<{ amplifiedText?: unknown } | null>(
      `*[_id == $id][0]{ amplifiedText }`,
      { id: docId },
    );

    const doc: Record<string, unknown> = {
      _id: docId,
      _type: "constitutionSchedule",
      scheduleNumber: meta.number,
      slug: { _type: "slug", current: slugCurrent },
      fullTitle,
      title,
      citation,
      officialText,
    };
    if (existing?.amplifiedText && !body.overwritePlainEnglish) {
      doc.amplifiedText = existing.amplifiedText;
    }

    await sanity.createOrReplace(
      doc as { _id: string; _type: string } & Record<string, unknown>,
    );

    return NextResponse.json({
      success: true,
      id: docId,
      publicPath: `/constitution/schedules/${slugCurrent}`,
      message: `Saved ${fullTitle}`,
    });
  } catch (err) {
    console.error("[constitution/schedules/save]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save schedule",
      },
      { status: 500 },
    );
  }
}
