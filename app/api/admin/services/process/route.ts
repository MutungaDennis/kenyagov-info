import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/services-system-prompt.txt"),
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
    const res = await fetch(`${origin}/data/services-system-prompt.txt`);
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "Return JSON for a Kenyan GOV.UK-style service guide with title, summary, steps, portals, etc.";
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
    const hintTitle = String(body.title || "").trim();
    const hintPortalUrl = String(body.portalUrl || "").trim();

    if (text.length < 80) {
      return NextResponse.json(
        {
          success: false,
          error: "Paste more of the official guidance (min ~80 characters)",
        },
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
      process.env.SERVICES_XAI_MODEL ||
      process.env.LEGISLATION_XAI_MODEL ||
      process.env.CONSTITUTION_XAI_MODEL ||
      process.env.HANSARD_XAI_MODEL ||
      "grok-3-latest";

    const userParts = [
      "Structure this Kenyan government service guidance into the JSON schema.",
      hintTitle ? `Preferred title hint: ${hintTitle}` : "",
      hintPortalUrl ? `Known transaction portal URL: ${hintPortalUrl}` : "",
      "",
      "--- PASTED TEXT ---",
      text.slice(0, 120000),
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: await getSystemPrompt() },
          { role: "user", content: userParts },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: `Grok request failed (${res.status}): ${errText.slice(0, 400)}`,
        },
        { status: 502 },
      );
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Empty Grok response" },
        { status: 502 },
      );
    }

    const structured = repairJson(content) as Record<string, unknown>;
    return NextResponse.json({ success: true, structured });
  } catch (err) {
    console.error("[services process]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Process failed",
      },
      { status: 500 },
    );
  }
}
