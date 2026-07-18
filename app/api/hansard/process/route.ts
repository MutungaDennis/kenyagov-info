import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Hansard pasted text → structured contributions via xAI Grok + Supabase leader match.
 *
 * Env:
 *   XAI_API_KEY (required)
 *   HANSARD_XAI_MODEL (optional, default grok-3-latest)
 *   NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (leader linking)
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
  matchStatus?: "linked" | "ambiguous" | "unmatched" | "skip";
};

export type LeaderCandidate = {
  id: string;
  full_name: string;
  constituency?: string | null;
  party?: string | null;
  role?: string | null;
  score: number;
};

export type SpeakerMatchIssue = {
  /** Cleaned speaker name as extracted from Hansard */
  speakerName: string;
  constituency?: string;
  party?: string;
  /** Contribution orders that use this speaker */
  contributionOrders: number[];
  status: "ambiguous" | "unmatched";
  candidates: LeaderCandidate[];
};

const SYSTEM_PROMPT = `You are an expert Kenyan Parliamentary Hansard analyst.

Your job: read pasted Hansard text and extract EVERY real speech/contribution into clean structured JSON.

IGNORE completely (do not extract as contributions, and strip them out of speech text):
- The repeated line: "Disclaimer: The electronic version of the Official Hansard Report is for information purposes only..."
- Page headers/footers such as "1st July 2026 National Assembly Debates 3", "Vol. V No. 61", page numbers
- Cover lines: "THIRTEENTH PARLIAMENT", "NATIONAL ASSEMBLY", bare "THE HANSARD" titles
- Publisher metadata, watermarks, blank lines, OCR noise

IMPORTANT — text is often SPLIT by disclaimers mid-speech. When a speaker's words continue after a disclaimer/page header, JOIN them into ONE contribution. Do not invent a new speaker for the continuation.

EXTRACT:
- Every individual spoken turn (MP, Senator, Speaker, Temporary/Deputy Speaker when they speak)
- Order-of-business titles as type "header" or "mini-header" (e.g. PAPERS, QUORUM, QUESTIONS AND STATEMENTS, STATE OF LEATHER INDUSTRY)
- Pure stage directions with no spoken words as type "procedural" (e.g. "(The Quorum Bell was rung)", "(Papers deferred)", "(Hon. Joyce Kamene entered the Chamber)")
- Do NOT invent speeches for members who were only mentioned as absent/deferred (e.g. "Request for Statement by Hon. X deferred")

SPEAKER PATTERNS (Kenyan National Assembly Hansard — very common):
1. "Hon. Full Name (Constituency, Party):"  ← PRIMARY floor pattern
   Example: "Hon. Owen Baya (Kilifi North, UDA):" → speakerName=Owen Baya, constituency=Kilifi North, party=UDA
   Example: "Hon. Gitonga Mukunji (Manyatta, UDA):"
   Example: "Hon. Bernard Shinali (Ikolomani, ODM):"
2. Chair forms:
   - "Hon. Deputy Speaker:" / "The Deputy Speaker:" / "The Deputy Speaker (Hon. Gladys Boss):"
   - "Hon. Temporary Speaker:" / "The Temporary Speaker (Hon. Name):"
   - "The Speaker (Hon. Name):"
   For chair: set speakerTitle/role to Deputy Speaker / Temporary Speaker / Speaker; put personal name in speakerName when given (e.g. Gladys Boss). Prefer one consistent personal name for all of that person's chair turns when the name is known from "[The Deputy Speaker (Hon. Gladys Boss) in the Chair]".
3. Other: "The Leader of the Majority Party", "Hon. Members", etc.

RULES:
1. ACCURACY FIRST — Only extract what appears. Never invent names, parties, or constituencies.
2. Capture the FULL spoken text including numbered paper lists and motion text. Preserve paragraphs.
3. Keep parenthetical stage notes that sit inside a speech; standalone stage directions alone → type "procedural".
4. Same person speaking multiple times → separate chronological entries (each time they take the floor).
5. Number contributions sequentially starting from 1 (within this chunk).
6. type: "spoken" | "members" | "procedural" | "header" | "mini-header"
7. Always fill constituency and party when the Hansard gives "(Constituency, Party)" — critical for member matching.
8. startTime only if stated (e.g. House met at 2.30 p.m. is sitting metadata, not every speech's startTime).

Return ONLY valid JSON:
{
  "contributions": [
    {
      "order": 1,
      "type": "spoken",
      "speakerName": "Gladys Boss",
      "speakerTitle": "The Deputy Speaker",
      "role": "Deputy Speaker",
      "speech": "Hon. Members, there being no quorum...",
      "sectionHeader": "QUORUM"
    },
    {
      "order": 2,
      "type": "spoken",
      "speakerName": "Owen Baya",
      "constituency": "Kilifi North",
      "party": "UDA",
      "speech": "Hon. Deputy Speaker, I beg to lay the following Papers on the Table: ...",
      "sectionHeader": "PAPERS"
    }
  ],
  "suggestedTopics": ["..."],
  "editorialSummary": "One short paragraph of what this sitting covered"
}`;

function cleanSpeakerName(name: string): string {
  return name
    .replace(/^(The\s+)?Hon\.?\s+/i, "")
    .replace(/^(Rt\.?\s*)?Hon\.?\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sanitize for PostgREST ilike / or filters */
function safeSearchTerm(term: string): string {
  return term
    .replace(/[%_,.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameTokens(name: string): string[] {
  return normalizeForMatch(name)
    .split(" ")
    .filter((t) => t.length > 1 && !["hon", "the", "mp", "dr", "prof", "eng"].includes(t));
}

function scoreNameMatch(extracted: string, dbName: string): number {
  const a = normalizeForMatch(extracted);
  const b = normalizeForMatch(dbName);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (b.includes(a) || a.includes(b)) return 90;

  const ta = nameTokens(extracted);
  const tb = nameTokens(dbName);
  if (ta.length === 0 || tb.length === 0) return 0;

  const setB = new Set(tb);
  let hit = 0;
  for (const t of ta) {
    if (setB.has(t)) hit++;
    else {
      // partial last-name / shared root (e.g. Wetangula vs Wetang'ula already normalized)
      for (const u of tb) {
        if (t.length >= 4 && u.length >= 4 && (t.startsWith(u) || u.startsWith(t))) {
          hit += 0.7;
          break;
        }
      }
    }
  }
  const recall = hit / ta.length;
  const precision = hit / tb.length;
  const f1 = (2 * recall * precision) / (recall + precision || 1);

  // Prefer matches that share the last token (surname)
  const lastA = ta[ta.length - 1];
  const lastB = tb[tb.length - 1];
  const surnameBonus =
    lastA && lastB && (lastA === lastB || lastA.startsWith(lastB) || lastB.startsWith(lastA))
      ? 15
      : 0;

  return Math.round(f1 * 70 + surnameBonus);
}

function scoreConstituency(extracted?: string, db?: string | null): number {
  if (!extracted || !db) return 0;
  const a = normalizeForMatch(
    extracted.replace(/\b(constituency|county|senator for|mp for|member for)\b/gi, ""),
  );
  const b = normalizeForMatch(
    db.replace(/\b(constituency|county|senator for|mp for|member for)\b/gi, ""),
  );
  if (!a || !b) return 0;
  if (a === b) return 40;
  if (a.includes(b) || b.includes(a)) return 30;
  // token overlap
  const ta = a.split(" ").filter((t) => t.length > 2);
  const tb = new Set(b.split(" ").filter((t) => t.length > 2));
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  if (hit === 0) return 0;
  return Math.min(25, hit * 12);
}

/** Split long Hansard text into overlapping-safe chunks at paragraph boundaries. */
function chunkText(text: string, maxChars = 45000): string[] {
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
  if (remaining.length > 50) chunks.push(remaining);
  return chunks;
}

function repairJson(content: string): unknown {
  // Strip markdown fences
  let s = content.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  try {
    return JSON.parse(s);
  } catch {
    // try object slice
  }

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    let slice = s.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {
      // Truncated array: close open structures
      // Remove trailing incomplete string/object
      slice = slice.replace(/,\s*$/, "");
      // Close open quotes if odd number of unescaped quotes at end region — best effort
      const openBrackets = (slice.match(/\[/g) || []).length - (slice.match(/\]/g) || []).length;
      const openBraces = (slice.match(/\{/g) || []).length - (slice.match(/\}/g) || []).length;
      // Drop incomplete last contribution object if needed
      const lastCompleteObj = slice.lastIndexOf("},");
      if (lastCompleteObj > 0 && (openBrackets > 0 || openBraces > 1)) {
        let repaired = slice.slice(0, lastCompleteObj + 1);
        const ob =
          (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
        const oc =
          (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
        repaired += "]".repeat(Math.max(0, ob));
        repaired += "}".repeat(Math.max(0, oc));
        try {
          return JSON.parse(repaired);
        } catch {
          /* fall through */
        }
      }
      // Simple close
      let simple = slice.replace(/,\s*\{[^}]*$/, "");
      simple = simple.replace(/,\s*$/, "");
      const ob2 =
        (simple.match(/\[/g) || []).length - (simple.match(/\]/g) || []).length;
      const oc2 =
        (simple.match(/\{/g) || []).length - (simple.match(/\}/g) || []).length;
      simple += "]".repeat(Math.max(0, ob2));
      simple += "}".repeat(Math.max(0, oc2));
      return JSON.parse(simple);
    }
  }
  throw new Error("Grok response was not valid JSON");
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
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `House: ${houseType}${chunkNote}\n\nHansard content (pasted text — ignore disclaimers and boilerplate):\n\n${text}`,
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

  const parsed = repairJson(content) as {
    contributions?: Contribution[];
    suggestedTopics?: string[];
    editorialSummary?: string;
  };

  if (!Array.isArray(parsed.contributions)) {
    throw new Error("Grok returned no contributions array");
  }

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

async function structureWithGrok(
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
  let summaryParts: string[] = [];

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

  if (all.length === 0) {
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

type UniqueSpeaker = {
  key: string;
  speakerName: string;
  cleaned: string;
  constituency?: string;
  party?: string;
  orders: number[];
  skip: boolean;
};

function uniqueSpeakers(contributions: Contribution[]): UniqueSpeaker[] {
  const map = new Map<string, UniqueSpeaker>();
  for (const c of contributions) {
    const type = c.type || "spoken";
    if (type === "header" || type === "mini-header" || type === "procedural") continue;

    const name = (c.speakerName || "").trim();
    if (!name || name === "Unknown speaker") continue;

    const cleaned = cleanSpeakerName(name);
    // Group chamber responses — no leader link
    if (
      type === "members" ||
      /^hon\.?\s*members$/i.test(name) ||
      /^members$/i.test(cleaned)
    ) {
      continue;
    }

    // Role-only chairs without personal name still may need linking if a person name is present
    const key = `${normalizeForMatch(cleaned)}|${normalizeForMatch(c.constituency || "")}`;
    const existing = map.get(key);
    if (existing) {
      existing.orders.push(c.order);
      if (!existing.constituency && c.constituency) {
        existing.constituency = c.constituency;
      }
      if (!existing.party && c.party) existing.party = c.party;
    } else {
      map.set(key, {
        key,
        speakerName: name,
        cleaned,
        constituency: c.constituency,
        party: c.party,
        orders: [c.order],
        skip: cleaned.length < 2,
      });
    }
  }
  return Array.from(map.values());
}

async function linkLeaders(contributions: Contribution[]): Promise<{
  contributions: Contribution[];
  matchIssues: SpeakerMatchIssue[];
  stats: { linked: number; ambiguous: number; unmatched: number };
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return {
      contributions,
      matchIssues: [],
      stats: { linked: 0, ambiguous: 0, unmatched: 0 },
    };
  }

  const supabase = createClient(url, key);
  const speakers = uniqueSpeakers(contributions);
  const nameToMatch = new Map<
    string,
    { status: "linked" | "ambiguous" | "unmatched"; id?: string; candidates: LeaderCandidate[] }
  >();
  const matchIssues: SpeakerMatchIssue[] = [];

  for (const sp of speakers.slice(0, 60)) {
    if (sp.skip) continue;

    const tokens = nameTokens(sp.cleaned);
    const lastTwo = tokens.slice(-2).join(" ");
    const surname = tokens[tokens.length - 1] || sp.cleaned;
    const searchTerms = Array.from(
      new Set([lastTwo, surname, sp.cleaned].filter((t) => t && t.length >= 2)),
    );

    const candidateMap = new Map<string, LeaderCandidate>();

    for (const term of searchTerms) {
      const safe = safeSearchTerm(term);
      if (safe.length < 2) continue;
      const { data } = await supabase
        .from("leaders")
        .select("id, full_name, title, current_constituency, current_party, current_organization")
        .or(
          `full_name.ilike.%${safe}%,current_constituency.ilike.%${safe}%`,
        )
        .limit(12);

      for (const row of data || []) {
        if (!row.id || candidateMap.has(row.id)) continue;
        const nameScore = scoreNameMatch(sp.cleaned, row.full_name || "");
        const constScore = scoreConstituency(
          sp.constituency,
          row.current_constituency,
        );
        // If name is weak but constituency is strong, still keep (name variance)
        const score = nameScore + constScore;
        if (score < 25 && nameScore < 40) continue;
        candidateMap.set(row.id, {
          id: row.id,
          full_name: row.full_name || "",
          constituency: row.current_constituency,
          party: row.current_party,
          role: row.current_organization || row.title,
          score,
        });
      }
    }

    // Constituency-first rescue when name search finds nothing useful
    if (candidateMap.size === 0 && sp.constituency) {
      const constQ = safeSearchTerm(
        sp.constituency.replace(
          /\b(constituency|county|mp for|member for|senator for)\b/gi,
          "",
        ),
      );
      if (constQ.length >= 3) {
        const { data } = await supabase
          .from("leaders")
          .select("id, full_name, title, current_constituency, current_party, current_organization")
          .ilike("current_constituency", `%${constQ}%`)
          .limit(10);
        for (const row of data || []) {
          if (!row.id) continue;
          const nameScore = scoreNameMatch(sp.cleaned, row.full_name || "");
          const constScore = scoreConstituency(
            sp.constituency,
            row.current_constituency,
          );
          candidateMap.set(row.id, {
            id: row.id,
            full_name: row.full_name || "",
            constituency: row.current_constituency,
            party: row.current_party,
            role: row.current_organization || row.title,
            score: nameScore + constScore + 5,
          });
        }
      }
    }

    const ranked = Array.from(candidateMap.values()).sort(
      (a, b) => b.score - a.score,
    );
    const top = ranked[0];
    const second = ranked[1];

    // Confident link: high name score, or good name + constituency, and clear winner
    const confident =
      top &&
      ((top.score >= 85 && (!second || top.score - second.score >= 10)) ||
        (top.score >= 70 &&
          scoreConstituency(sp.constituency, top.constituency) >= 25 &&
          (!second || top.score - second.score >= 8)));

    if (confident && top) {
      nameToMatch.set(sp.key, {
        status: "linked",
        id: top.id,
        candidates: ranked.slice(0, 5),
      });
    } else if (ranked.length > 0) {
      nameToMatch.set(sp.key, {
        status: "ambiguous",
        candidates: ranked.slice(0, 8),
      });
      matchIssues.push({
        speakerName: sp.speakerName,
        constituency: sp.constituency,
        party: sp.party,
        contributionOrders: sp.orders,
        status: "ambiguous",
        candidates: ranked.slice(0, 8),
      });
    } else {
      nameToMatch.set(sp.key, { status: "unmatched", candidates: [] });
      matchIssues.push({
        speakerName: sp.speakerName,
        constituency: sp.constituency,
        party: sp.party,
        contributionOrders: sp.orders,
        status: "unmatched",
        candidates: [],
      });
    }
  }

  const updated = contributions.map((c) => {
    const type = c.type || "spoken";
    if (
      type === "header" ||
      type === "mini-header" ||
      type === "procedural" ||
      type === "members" ||
      /^hon\.?\s*members$/i.test(c.speakerName || "")
    ) {
      return { ...c, matchStatus: "skip" as const };
    }

    const cleaned = cleanSpeakerName(c.speakerName || "");
    const key = `${normalizeForMatch(cleaned)}|${normalizeForMatch(c.constituency || "")}`;
    const m = nameToMatch.get(key);
    if (!m) return c;

    if (m.status === "linked" && m.id) {
      return { ...c, supabaseLeaderId: m.id, matchStatus: "linked" as const };
    }
    if (m.status === "ambiguous") {
      return { ...c, matchStatus: "ambiguous" as const };
    }
    return { ...c, matchStatus: "unmatched" as const };
  });

  const uniqueLinked = Array.from(nameToMatch.values()).filter(
    (m) => m.status === "linked",
  ).length;
  const uniqueAmbiguous = matchIssues.filter((i) => i.status === "ambiguous").length;
  const uniqueUnmatched = matchIssues.filter((i) => i.status === "unmatched").length;

  return {
    contributions: updated,
    matchIssues,
    stats: {
      linked: uniqueLinked,
      ambiguous: uniqueAmbiguous,
      unmatched: uniqueUnmatched,
    },
  };
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const contentType = request.headers.get("content-type") || "";
    let houseType: HouseType = "national-assembly";
    let markdown = "";

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

      // Reject PDF — paste only
      if (form.get("pdf") instanceof File) {
        return NextResponse.json(
          {
            error:
              "PDF upload is no longer supported. Paste the Hansard text and Grok will extract contributions.",
          },
          { status: 400 },
        );
      }

      const textField = form.get("text") || form.get("markdown");
      if (typeof textField === "string" && textField.trim().length >= 50) {
        markdown = textField.trim();
      } else {
        return NextResponse.json(
          {
            error:
              "Paste Hansard text (at least 50 characters). PDF upload has been removed.",
          },
          { status: 400 },
        );
      }
    } else {
      const body = await request.json();
      const house = body.houseType || "national-assembly";
      if (
        house === "national-assembly" ||
        house === "senate" ||
        house === "county-assembly"
      ) {
        houseType = house;
      }
      markdown = String(body.text || body.markdown || "").trim();
      if (markdown.length < 50) {
        return NextResponse.json(
          {
            error:
              "Paste Hansard text of at least 50 characters. PDF upload is not supported.",
          },
          { status: 400 },
        );
      }
    }

    const structured = await structureWithGrok(markdown, houseType);
    const { contributions, matchIssues, stats } = await linkLeaders(
      structured.contributions,
    );

    return NextResponse.json({
      success: true,
      structured: {
        contributions,
        suggestedTopics: structured.suggestedTopics,
        editorialSummary: structured.editorialSummary,
      },
      matchIssues,
      matchStats: stats,
      rawMarkdownLength: markdown.length,
      processingTimeMs: Date.now() - start,
      source: "text",
      chunksProcessed: structured.chunksProcessed,
      model: process.env.HANSARD_XAI_MODEL || "grok-3-latest",
      linkedLeaders: stats.linked,
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
