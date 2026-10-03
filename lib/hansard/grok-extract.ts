import { z } from "zod";
import { HANSARD_SYSTEM_PROMPT } from "./grok-prompt";

export class GrokExtractionError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
const optionalText = z.string().nullish();
const extractedSchema = z.object({
  contributions: z.array(z.object({
    order: z.number().optional(), type: z.enum(["spoken", "members", "procedural", "header", "mini-header"]).optional(),
    speakerName: optionalText, speech: z.string(), speakerTitle: optionalText,
    constituency: optionalText, party: optionalText, role: optionalText,
    startTime: optionalText, sectionHeader: optionalText,
  })),
  suggestedTopics: z.array(z.string()).nullish().transform(value => value || []),
  editorialSummary: optionalText.transform(value => value || ""),
});

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
  matchStatus?: "linked" | "ambiguous" | "unmatched" | "skip";
};

export function chunkText(text: string, maxChars = 45000): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf("\n\n", maxChars);
    if (cut < maxChars * 0.5) {
      cut = remaining.lastIndexOf("\n", maxChars);
    }
    if (cut < maxChars * 0.4) cut = maxChars;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function parseGrokJson(content: string): unknown {
  const source = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(source); }
  catch { throw new GrokExtractionError("Grok returned incomplete or invalid JSON. Try a shorter passage; your editor content has not been changed.", 502); }
}

async function structureChunkWithGrok(
  text: string,
  houseType: string,
  chunkIndex: number,
  totalChunks: number,
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
  const chunkNote =
    totalChunks > 1
      ? `\n\nThis is chunk ${chunkIndex + 1} of ${totalChunks}. Extract only contributions present in this chunk. Number orders from 1 within this chunk.`
      : "";

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(120_000),
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
        { role: "system", content: HANSARD_SYSTEM_PROMPT },
        {
          role: "user",
          content: `House: ${houseType}${chunkNote}\n\nHansard content (pasted text — ignore disclaimers and boilerplate):\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const message = res.status === 429 ? "Grok is rate-limited or out of API credits. Check your xAI account and try again."
      : [401, 403].includes(res.status) ? "Grok authentication failed. Check the server XAI_API_KEY and xAI permissions."
      : "Grok could not process this passage. Check the configured model or try again shortly.";
    throw new GrokExtractionError(message, res.status === 429 ? 429 : 502);
  }

  const data = (await res.json()) as {
    choices?: Array<{ finish_reason?: string; message?: { content?: string } }>;
  };
  if (data.choices?.[0]?.finish_reason === "length") {
    throw new GrokExtractionError("Grok reached its output limit. Paste a shorter passage; no partial extraction was loaded.", 502);
  }
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Grok returned empty content");

  const validated = extractedSchema.safeParse(parseGrokJson(content));
  if (!validated.success) throw new GrokExtractionError("Grok returned an unexpected extraction format. Try again with a shorter passage.", 502);
  const parsed = validated.data;

  const contributions = parsed.contributions.map((c, i) => {
    let type = (c.type as Contribution["type"]) || "spoken";
    let speakerName = String(c.speakerName || "").trim();
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

export async function structureWithGrok(
  markdownText: string,
  houseType: string,
): Promise<{
  contributions: Contribution[];
  suggestedTopics?: string[];
  editorialSummary?: string;
  chunksProcessed: number;
}> {
  const chunks = chunkText(markdownText.trim());
  const all: Contribution[] = [];
  const topics = new Set<string>();
  const summaryParts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const part = await structureChunkWithGrok(chunks[i], houseType, i, chunks.length);
    for (const c of part.contributions) {
      all.push(c);
    }
    for (const t of part.suggestedTopics || []) {
      if (t) topics.add(String(t));
    }
    if (part.editorialSummary) summaryParts.push(part.editorialSummary);
  }

  if (!all.some(c => c.type !== "header" && c.type !== "mini-header" && c.speech.trim())) {
    throw new Error("Grok returned no contributions from the pasted text");
  }

  // Renumber globally
  const contributions = all.map((c, i) => ({ ...c, order: i + 1 }));

  return {
    contributions,
    suggestedTopics: topics.size ? Array.from(topics) : undefined,
    editorialSummary: summaryParts.length
      ? summaryParts.join(" ")
      : undefined,
    chunksProcessed: chunks.length,
  };
}

