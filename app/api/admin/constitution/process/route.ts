import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { defaultChapterTitle } from "@/lib/constitution/chapters";

export type ParsedConstitutionArticle = {
  partNumber?: number | null;
  partTitle?: string | null;
  articleNumber: number;
  articleTitle: string;
  officialText: string[];
};

let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/constitution-system-prompt.txt"),
      "utf8",
    );
    return SYSTEM_PROMPT_CACHE;
  } catch {
    /* CF Worker: no disk */
  }
  try {
    const origin = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.citizenguide.ke"
    ).replace(/\/$/, "");
    const res = await fetch(`${origin}/data/constitution-system-prompt.txt`);
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "Parse Kenya Constitution chapter text into JSON { chapterTitle, articles: [{ articleNumber, articleTitle, officialText: string[], partNumber?, partTitle? }] }. Official text only.";
  return SYSTEM_PROMPT_CACHE;
}

function repairJson(content: string): unknown {
  let s = content.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  try {
    return JSON.parse(s);
  } catch {
    /* try slice */
  }

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = s.slice(start, end + 1);
    return JSON.parse(slice);
  }
  throw new Error("Grok response was not valid JSON");
}

function normalizeArticles(raw: unknown): ParsedConstitutionArticle[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as { articles?: unknown[] };
  if (!Array.isArray(obj.articles)) return [];

  const parsed: ParsedConstitutionArticle[] = [];
  for (const item of obj.articles) {
    const a = (item || {}) as Record<string, unknown>;
    const articleNumber = Number(a.articleNumber);
    if (!Number.isFinite(articleNumber)) continue;

    let officialText: string[] = [];
    if (Array.isArray(a.officialText)) {
      officialText = a.officialText
        .map((p) => String(p || "").trim())
        .filter(Boolean);
    } else if (typeof a.officialText === "string") {
      officialText = String(a.officialText)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }

    const partRaw =
      a.partNumber == null || a.partNumber === ""
        ? NaN
        : Number(a.partNumber);

    parsed.push({
      partNumber: Number.isFinite(partRaw) ? partRaw : null,
      partTitle: a.partTitle ? String(a.partTitle).trim() : null,
      articleNumber,
      articleTitle:
        String(a.articleTitle || "").trim() || `Article ${articleNumber}`,
      officialText:
        officialText.length > 0
          ? officialText
          : [`[Empty official text for article ${articleNumber}]`],
    });
  }

  return parsed.sort((a, b) => a.articleNumber - b.articleNumber);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const chapter = Number(body.chapter);
    const text = String(body.text || "").trim();
    const chapterTitleHint = body.chapterTitle
      ? String(body.chapterTitle).trim()
      : "";

    if (!Number.isFinite(chapter) || chapter < 0 || chapter > 18) {
      return NextResponse.json(
        { success: false, error: "chapter must be a number from 0 to 18" },
        { status: 400 },
      );
    }
    if (text.length < 80) {
      return NextResponse.json(
        {
          success: false,
          error: "Paste at least ~80 characters of official Constitution text",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "XAI_API_KEY is not configured. Set it to process Constitution text with Grok.",
        },
        { status: 500 },
      );
    }

    const model =
      process.env.CONSTITUTION_XAI_MODEL ||
      process.env.HANSARD_XAI_MODEL ||
      "grok-3-latest";

    const defaultTitle = defaultChapterTitle(chapter);
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
            content: `Parse Chapter ${chapter} of the Constitution of Kenya, 2010.
Suggested chapter title: ${chapterTitleHint || defaultTitle}

Official text to parse:

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
      chapterTitle?: string;
      articles?: unknown[];
    };
    const articles = normalizeArticles(parsed);
    if (articles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Grok returned no articles. Check that the paste includes Article headings.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      structured: {
        chapter,
        chapterTitle:
          String(parsed.chapterTitle || chapterTitleHint || defaultTitle).trim() ||
          defaultTitle,
        articles,
      },
    });
  } catch (err) {
    console.error("[constitution/process]", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to process Constitution text",
      },
      { status: 500 },
    );
  }
}
