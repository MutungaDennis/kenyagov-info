// app/api/admin/documents/process/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { paragraphsToPortableText } from "@/lib/constitution/portable-text";

let SYSTEM_PROMPT_CACHE: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT_CACHE) return SYSTEM_PROMPT_CACHE;
  try {
    const fs = await import(/* webpackIgnore: true */ "node:fs/promises");
    const path = await import(/* webpackIgnore: true */ "node:path");
    SYSTEM_PROMPT_CACHE = await fs.readFile(
      path.join(process.cwd(), "public/data/document-system-prompt.txt"),
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
    const res = await fetch(`${origin}/data/document-system-prompt.txt`);
    if (res.ok) {
      SYSTEM_PROMPT_CACHE = await res.text();
      return SYSTEM_PROMPT_CACHE;
    }
  } catch {
    /* ignore */
  }
  SYSTEM_PROMPT_CACHE =
    "Parse the provided government document text into structured JSON. Extract metadata and an array of text blocks.";
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

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const titleHint = String(body.title || "").trim();
    const refHint = String(body.referenceNumber || "").trim();
    const text = String(body.text || "").trim();
    const isHtml = body.isHtml === true;
    const portableTextFromClient = body.portableText; // Pre-converted from TipTap

    if (text.length < 200 && !portableTextFromClient) {
      return NextResponse.json(
        { success: false, error: "Paste at least ~200 characters of the document text" },
        { status: 400 },
      );
    }

    let processed;

    // ✅ If HTML/TipTap content, convert directly without Grok
    if (isHtml && portableTextFromClient && Array.isArray(portableTextFromClient)) {
      processed = {
        title: titleHint || "Untitled Document",
        shortTitle: titleHint || "Untitled",
        referenceNumber: refHint || "N/A",
        yearPublished: Number(body.yearPublished) || new Date().getFullYear(),
        issuingBody: String(body.issuingBody || "Unknown Issuing Body").trim(),
        functionalCategory: String(body.functionalCategory || "strategic_planning").trim(),
        archivalCategory: String(body.archivalCategory || "national_documentation_service").trim(),
        historicalEra: String(body.historicalEra || "constitution_2010").trim(),
        summary: String(body.summary || "").trim(),
        fullText: portableTextFromClient, // ✅ Already in Portable Text format from client
      };
    } 
    // ✅ Otherwise, use Grok for plain text processing
    else {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: "XAI_API_KEY is not configured." },
          { status: 500 },
        );
      }

      const model = process.env.DOCUMENT_XAI_MODEL || process.env.HANSARD_XAI_MODEL || "grok-3-latest";

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
              content: `Parse this government document.
Suggested title: ${titleHint}
Suggested reference: ${refHint}

Official text to parse:

${text}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { success: false, error: `xAI Grok failed (${res.status}): ${errText.slice(0, 500)}` },
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

      const parsed = repairJson(content) as any;
      
      // Convert Grok's text array into rich Sanity Portable Text
      const portableTextBlocks = paragraphsToPortableText(parsed.fullText || []);

      processed = {
        title: parsed.title || titleHint || "Untitled Document",
        shortTitle: parsed.shortTitle || titleHint || "Untitled",
        referenceNumber: parsed.referenceNumber || refHint || "N/A",
        yearPublished: Number(parsed.yearPublished) || new Date().getFullYear(),
        issuingBody: parsed.issuingBody || "Unknown Issuing Body",
        functionalCategory: parsed.functionalCategory || "strategic_planning",
        archivalCategory: parsed.archivalCategory || "national_documentation_service",
        historicalEra: parsed.historicalEra || "constitution_2010",
        summary: parsed.summary || "",
        fullText: portableTextBlocks,
      };
    }

    if (processed.fullText.length === 0) {
      return NextResponse.json(
        { success: false, error: "No text blocks found. Check that the content includes the document text." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      processed,
    });
  } catch (err) {
    console.error("[documents/process]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to process document text" },
      { status: 500 },
    );
  }
}