import { requireAdminApi } from "@/lib/admin-api";
import { NextRequest, NextResponse } from "next/server";
import { structureWithGrok, GrokExtractionError } from "@/lib/hansard/grok-extract";
type HouseType = "national-assembly" | "senate" | "county-assembly";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
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
    } else if (contentType.includes("text/plain")) {
      markdown = (await request.text()).trim();
    } else {
      let body;
      try { body = await request.json(); } catch { return NextResponse.json({ error: "Send valid JSON containing a text field, or paste plain text." }, { status: 400 }); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Send an object containing the pasted text." }, { status: 400 });
      const house = body.houseType || "national-assembly";
      if (
        house === "national-assembly" ||
        house === "senate" ||
        house === "county-assembly"
      ) {
        houseType = house;
      }
      const value = body.text ?? body.markdown;
      if (typeof value !== "string") return NextResponse.json({ error: "The pasted text must be a string." }, { status: 400 });
      markdown = value.trim();
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

    if (markdown.length < 50) return NextResponse.json({ error: "Paste at least 50 characters of Hansard text." }, { status: 400 });
    if (markdown.length > 300_000) return NextResponse.json({ error: "Paste up to 300,000 characters at a time. Split this sitting into smaller passages." }, { status: 413 });
    const structured = await structureWithGrok(markdown.replace(/\r\n?/g, "\n"), houseType);
    const contributions = structured.contributions.map(c => ({ ...c, supabaseLeaderId: undefined, matchStatus: "unmatched" }));
    const matchIssues: unknown[] = [];
    const stats = { linked: 0, ambiguous: 0, unmatched: contributions.length };

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
    const message =
      error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? "Grok took too long. Try a shorter passage; your editor content has not been changed." : error instanceof Error ? error.message : "Failed to process Hansard";
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof GrokExtractionError ? error.status : error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? 504 : 500 },
    );
  }
}
