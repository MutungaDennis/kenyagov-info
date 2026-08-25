import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/legislation-system-prompt.txt"),
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
    const res = await fetch(`${origin}/data/legislation-system-prompt.txt`);
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "Parse Kenyan Act text to JSON { parts:[{partNumber,partTitle,sections:[{sectionNumber,sectionTitle,officialText:[]}]}], schedules:[] }.";
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

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const text = String(body.text || "").trim();
    const meta = body.metadata || {};

    if (text.length < 80) {
      return NextResponse.json(
        { success: false, error: "Paste more of the Act text (min ~80 chars)" },
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
      process.env.LEGISLATION_XAI_MODEL ||
      process.env.CONSTITUTION_XAI_MODEL ||
      process.env.HANSARD_XAI_MODEL ||
      "grok-3-latest";

    const house = String(meta.houseOfOrigin || "nationalAssembly");
    const houseLabel =
      house === "senate"
        ? "Senate"
        : house === "countyAssembly"
          ? `County Assembly${meta.countyName ? ` (${meta.countyName})` : ""}`
          : "National Assembly";

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        max_tokens: 32000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: await getSystemPrompt() },
          {
            role: "user",
            content: `Parse this ${houseLabel} law.
Known metadata (may help; trust the paste for body text):
- Title: ${meta.title || "(unknown)"}
- Short title: ${meta.shortTitle || "(unknown)"}
- Citation: ${meta.citation || "(unknown)"}
- Year: ${meta.yearEnacted || "(unknown)"}

Official text:

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

    const parsed = repairJson(content) as {
      parts?: unknown[];
      schedules?: unknown[];
      detectedTitle?: string;
      globalSummary?: string;
      summary?: string;
    };

    const parts = Array.isArray(parsed.parts) ? parsed.parts : [];
    if (parts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Grok found no parts/sections. Try pasting a clearer stretch of the Act (include section headings).",
        },
        { status: 422 },
      );
    }

    const suggestedSummary = String(
      parsed.globalSummary || parsed.summary || "",
    ).trim();

    return NextResponse.json({
      success: true,
      structured: {
        detectedTitle: parsed.detectedTitle || null,
        globalSummary: suggestedSummary || null,
        parts,
        schedules: Array.isArray(parsed.schedules) ? parsed.schedules : [],
      },
      suggestedSummary: suggestedSummary || null,
    });
  } catch (err) {
    console.error("[legislation/process]", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to process legislation",
      },
      { status: 500 },
    );
  }
}
