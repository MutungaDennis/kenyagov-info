import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Hansard PDF / text → structured contributions via LlamaParse (optional) + xAI Grok.
 * Uses pure fetch only (no @ai-sdk) so the Cloudflare Worker bundle stays lean.
 *
 * Env:
 *   XAI_API_KEY (required for structuring)
 *   HANSARD_XAI_MODEL (optional, default grok-3-latest)
 *   LLAMA_CLOUD_API_KEY (optional; PDF parse — without it, send text/markdown instead)
 */

type HouseType = "national-assembly" | "senate" | "county-assembly";

type Contribution = {
  order: number;
  type?: "spoken" | "members" | "procedural" | "header" | "mini-header";
  speakerName: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  speech: string;
  startTime?: string;
  sectionHeader?: string;
  supabaseLeaderId?: string;
};

const SYSTEM_PROMPT = `You are an expert Kenyan Parliamentary Hansard analyst.

Extract EVERY individual speech/contribution from the provided Hansard into clean structured JSON.

CRITICAL RULES:
1. ACCURACY FIRST — Only extract what appears in the text. Never invent names, parties, or constituencies.
2. SPEAKER PATTERNS (common in Kenyan Hansard):
   - "The Hon. [Full Name], MP for [Constituency] ([Party])"
   - "Hon. [Name] (The Hon. Member for [Constituency])"
   - "The Speaker (Hon. [Name])"
   - "The Deputy Speaker", "The Leader of the Majority Party", etc.
3. Capture the FULL spoken text. Preserve paragraphs. Include procedural notes like (Laughter), (Applause), or interjections in [square brackets].
4. If the same person speaks multiple times, create separate entries in chronological order.
5. Number contributions sequentially starting from 1.
6. type: "spoken" for individual MP speeches; "members" for collective chamber responses ("Hon. Members: Put the question", "Which Standing Order?", "Send him out"); "procedural" for clerk/stage notes without speech; "header" / "mini-header" for order-of-business titles.
7. Extract speakerName, speakerTitle, constituency, party, role, startTime, sectionHeader when present.

Return ONLY valid JSON of the form:
{
  "contributions": [ { "order": 1, "type": "spoken", "speakerName": "...", "speech": "...", ... } ],
  "suggestedTopics": ["..."],
  "editorialSummary": "..."
}`;

async function parsePdfWithLlamaParse(
  pdfBuffer: ArrayBuffer,
  fileName: string,
): Promise<string> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error(
      "LLAMA_CLOUD_API_KEY is not set. Paste Hansard text instead, or configure LlamaParse.",
    );
  }

  const baseUrl = "https://api.cloud.llamaindex.ai/api/parsing";
  const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", fileBlob, fileName);
  formData.append("result_type", "markdown");
  formData.append(
    "parsing_instruction",
    "This is a Kenyan Parliamentary Hansard. Preserve speaker names, titles, constituencies, parties, roles, and the FULL spoken text accurately. Maintain correct reading order. Do not summarize or omit any speeches.",
  );

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(
      `LlamaParse upload failed: ${uploadResponse.status} - ${errorText}`,
    );
  }

  const uploadData = (await uploadResponse.json()) as {
    id?: string;
    job_id?: string;
  };
  const jobId = uploadData.id || uploadData.job_id;
  if (!jobId) throw new Error("Failed to get LlamaParse job ID");

  let attempts = 0;
  const maxAttempts = 40;
  let status = "PENDING";

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await fetch(`${baseUrl}/job/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!statusRes.ok) throw new Error("Failed to check LlamaParse job status");
    const statusData = (await statusRes.json()) as {
      status?: string;
      error?: string;
    };
    status = statusData.status || "PENDING";
    if (status === "SUCCESS") break;
    if (status === "ERROR" || status === "FAILED") {
      throw new Error(`LlamaParse failed: ${statusData.error || "Unknown error"}`);
    }
    attempts++;
  }

  if (status !== "SUCCESS") {
    throw new Error(`LlamaParse timed out after ${maxAttempts * 3}s`);
  }

  const resultRes = await fetch(`${baseUrl}/job/${jobId}/result/markdown`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!resultRes.ok) throw new Error("Failed to fetch LlamaParse result");

  const resultData = (await resultRes.json()) as {
    markdown?: string;
    text?: string;
  };
  const markdown = resultData.markdown || resultData.text || "";
  if (!markdown || markdown.length < 100) {
    throw new Error("LlamaParse returned empty or very short content");
  }
  return markdown;
}

async function structureWithGrok(
  markdownText: string,
  houseType: string,
): Promise<{
  contributions: Contribution[];
  suggestedTopics?: string[];
  editorialSummary?: string;
}> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "XAI_API_KEY is not configured. Set it to process Hansards with Grok.",
    );
  }

  const model = process.env.HANSARD_XAI_MODEL || "grok-3-latest";
  const maxChars = 120000;
  const textToProcess =
    markdownText.length > maxChars
      ? markdownText.substring(0, maxChars) + "\n\n[CONTENT TRUNCATED]"
      : markdownText;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `House: ${houseType}\n\nHansard content:\n\n${textToProcess}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`xAI Grok failed (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Grok returned empty content");

  let parsed: {
    contributions?: Contribution[];
    suggestedTopics?: string[];
    editorialSummary?: string;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON object from fenced response
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Grok response was not valid JSON");
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed.contributions) || parsed.contributions.length === 0) {
    throw new Error("Grok returned no contributions");
  }

  const contributions = parsed.contributions.map((c, i) => {
    let type = (c.type as Contribution["type"]) || "spoken";
    let speakerName = String(c.speakerName || "").trim();
    // Normalise group chamber responses
    if (
      type === "members" ||
      /^hon\.?\s*members$/i.test(speakerName) ||
      /^members$/i.test(speakerName)
    ) {
      type = "members";
      speakerName = speakerName || "Hon. Members";
    }
    return {
      order: typeof c.order === "number" ? c.order : i + 1,
      type,
      speakerName: speakerName || "Unknown speaker",
      speakerTitle: c.speakerTitle ? String(c.speakerTitle) : undefined,
      constituency: c.constituency ? String(c.constituency) : undefined,
      party: c.party ? String(c.party) : undefined,
      role: c.role ? String(c.role) : undefined,
      speech: String(c.speech || "").trim(),
      startTime: c.startTime ? String(c.startTime) : undefined,
      sectionHeader: c.sectionHeader ? String(c.sectionHeader) : undefined,
    };
  });

  return {
    contributions,
    suggestedTopics: parsed.suggestedTopics,
    editorialSummary: parsed.editorialSummary,
  };
}

/** Best-effort match of speaker names to Supabase leaders (stores UUID only). */
async function linkLeaders(
  contributions: Contribution[],
): Promise<Contribution[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return contributions;

  const supabase = createClient(url, key);
  const names = Array.from(
    new Set(
      contributions
        .map((c) => c.speakerName?.trim())
        .filter((n): n is string => Boolean(n) && n !== "Unknown speaker"),
    ),
  );

  if (names.length === 0) return contributions;

  const nameToId = new Map<string, string>();

  // Batch search — short names first for better exact matches
  for (const name of names.slice(0, 40)) {
    const cleaned = name
      .replace(/^(The\s+)?Hon\.?\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length < 3) continue;

    const { data } = await supabase
      .from("leaders")
      .select("id, full_name")
      .ilike("full_name", `%${cleaned.split(" ").slice(-2).join(" ")}%`)
      .limit(5);

    if (!data?.length) continue;

    const exact = data.find(
      (l) =>
        l.full_name?.toLowerCase() === cleaned.toLowerCase() ||
        l.full_name?.toLowerCase().includes(cleaned.toLowerCase()) ||
        cleaned.toLowerCase().includes(l.full_name?.toLowerCase() || ""),
    );
    if (exact?.id) {
      nameToId.set(name, exact.id);
      nameToId.set(cleaned, exact.id);
    }
  }

  return contributions.map((c) => {
    const id =
      nameToId.get(c.speakerName) ||
      nameToId.get(
        c.speakerName
          .replace(/^(The\s+)?Hon\.?\s+/i, "")
          .replace(/\s+/g, " ")
          .trim(),
      );
    return id ? { ...c, supabaseLeaderId: id } : c;
  });
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const contentType = request.headers.get("content-type") || "";
    let houseType: HouseType = "national-assembly";
    let markdown = "";
    let source: "pdf" | "text" = "text";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const house = String(form.get("houseType") || "national-assembly");
      if (
        house === "national-assembly" ||
        house === "senate" ||
        house === "county-assembly"
      ) {
        houseType = house;
      }

      const textField = form.get("text") || form.get("markdown");
      if (typeof textField === "string" && textField.trim().length > 50) {
        markdown = textField.trim();
        source = "text";
      } else {
        const pdf = form.get("pdf");
        if (!(pdf instanceof File)) {
          return NextResponse.json(
            {
              error:
                "Provide a PDF file (field: pdf) or pasted Hansard text (field: text).",
            },
            { status: 400 },
          );
        }
        if (pdf.type && !pdf.type.includes("pdf") && !pdf.name.endsWith(".pdf")) {
          return NextResponse.json(
            { error: "Only PDF files are accepted for the pdf field." },
            { status: 400 },
          );
        }
        source = "pdf";
        const buffer = await pdf.arrayBuffer();
        markdown = await parsePdfWithLlamaParse(buffer, pdf.name || "hansard.pdf");
      }
    } else {
      const body = await request.json();
      houseType = body.houseType || "national-assembly";
      markdown = String(body.text || body.markdown || "").trim();
      if (markdown.length < 50) {
        return NextResponse.json(
          { error: "Provide text/markdown of at least 50 characters." },
          { status: 400 },
        );
      }
      source = "text";
    }

    const structured = await structureWithGrok(markdown, houseType);
    const withLeaders = await linkLeaders(structured.contributions);

    return NextResponse.json({
      success: true,
      structured: {
        contributions: withLeaders,
        suggestedTopics: structured.suggestedTopics,
        editorialSummary: structured.editorialSummary,
      },
      rawMarkdownLength: markdown.length,
      processingTimeMs: Date.now() - start,
      source,
      model: process.env.HANSARD_XAI_MODEL || "grok-3-latest",
      linkedLeaders: withLeaders.filter((c) => c.supabaseLeaderId).length,
    });
  } catch (error: unknown) {
    console.error("[Hansard Process Error]", error);
    const message =
      error instanceof Error ? error.message : "Failed to process Hansard";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
