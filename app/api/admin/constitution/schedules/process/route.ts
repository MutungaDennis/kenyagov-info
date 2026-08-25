import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import {
  scheduleByNumber,
  type ScheduleMeta,
} from "@/lib/constitution/schedules";

export type ScheduleBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    };

export type ScheduleSection = {
  heading?: string | null;
  blocks: ScheduleBlock[];
};

let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/constitution-schedule-prompt.txt"),
      "utf8",
    );
    return SYSTEM_PROMPT_CACHE;
  } catch {
    /* CF */
  }
  try {
    const origin = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.citizenguide.ke"
    ).replace(/\/$/, "");
    const res = await fetch(
      `${origin}/data/constitution-schedule-prompt.txt`,
    );
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "Parse Kenya Constitution schedule text to JSON { fullTitle, title, citation, sections: [{ heading, blocks: [{type:paragraph|table,...}] }] }.";
  return SYSTEM_PROMPT_CACHE;
}

function repairJson(content: string): unknown {
  let s = content.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try {
    return JSON.parse(s);
  } catch {
    /* slice */
  }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(s.slice(start, end + 1));
  throw new Error("Grok response was not valid JSON");
}

function normalizeSections(raw: unknown, meta: ScheduleMeta): ScheduleSection[] {
  const obj = (raw || {}) as { sections?: unknown[] };
  if (!Array.isArray(obj.sections) || obj.sections.length === 0) {
    return [];
  }
  const out: ScheduleSection[] = [];
  for (const sec of obj.sections) {
    const s = (sec || {}) as Record<string, unknown>;
    const blocksRaw = Array.isArray(s.blocks) ? s.blocks : [];
    const blocks: ScheduleBlock[] = [];
    for (const b of blocksRaw) {
      const block = (b || {}) as Record<string, unknown>;
      if (block.type === "table") {
        const headers = Array.isArray(block.headers)
          ? block.headers.map((h) => String(h ?? "").trim())
          : [];
        const rows = Array.isArray(block.rows)
          ? block.rows.map((r) =>
              Array.isArray(r)
                ? r.map((c) => String(c ?? "").trim())
                : [],
            )
          : [];
        if (headers.length >= 1) {
          blocks.push({
            type: "table",
            caption: block.caption ? String(block.caption) : undefined,
            headers,
            rows,
          });
        }
      } else {
        const text = String(block.text || "").trim();
        if (text) blocks.push({ type: "paragraph", text });
      }
    }
    // Also accept legacy officialText string arrays on section
    if (blocks.length === 0 && Array.isArray(s.officialText)) {
      for (const p of s.officialText) {
        const text = String(p || "").trim();
        if (text) blocks.push({ type: "paragraph", text });
      }
    }
    if (blocks.length === 0) continue;
    out.push({
      heading: s.heading ? String(s.heading).trim() : null,
      blocks,
    });
  }
  return out;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const scheduleNumber = Number(body.scheduleNumber);
    const text = String(body.text || "").trim();
    const meta = scheduleByNumber(scheduleNumber);

    if (!meta) {
      return NextResponse.json(
        { success: false, error: "scheduleNumber must be 1–6" },
        { status: 400 },
      );
    }
    if (text.length < 40) {
      return NextResponse.json(
        { success: false, error: "Paste more schedule text" },
        { status: 400 },
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "XAI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const model =
      process.env.CONSTITUTION_XAI_MODEL ||
      process.env.HANSARD_XAI_MODEL ||
      "grok-3-latest";

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 32000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: await getSystemPrompt() },
          {
            role: "user",
            content: `Parse ${meta.fullTitle} — ${meta.title} (${meta.citation}).
Notes: ${meta.notes}

Official schedule text:

${text}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `xAI Grok failed (${res.status}): ${errText.slice(0, 500)}`,
        },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Grok returned empty content" },
        { status: 502 },
      );
    }

    const parsed = repairJson(content) as Record<string, unknown>;
    const sections = normalizeSections(parsed, meta);
    if (sections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Grok returned no sections. Check the paste includes schedule body text.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      structured: {
        scheduleNumber: meta.number,
        slug: meta.slug,
        fullTitle:
          String(parsed.fullTitle || meta.fullTitle).trim() || meta.fullTitle,
        title: String(parsed.title || meta.title).trim() || meta.title,
        citation:
          String(parsed.citation || meta.citation).trim() || meta.citation,
        sections,
      },
    });
  } catch (err) {
    console.error("[constitution/schedules/process]", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to process schedule",
      },
      { status: 500 },
    );
  }
}
