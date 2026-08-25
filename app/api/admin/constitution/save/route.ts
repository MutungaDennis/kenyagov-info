import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { defaultChapterTitle } from "@/lib/constitution/chapters";
import {
  constitutionArticleId,
  paragraphsToPortableText,
} from "@/lib/constitution/portable-text";

type IncomingArticle = {
  partNumber?: number | null;
  partTitle?: string | null;
  articleNumber: number;
  articleTitle: string;
  officialText: string[] | string;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const chapter = Number(body.chapter);
    const chapterTitle =
      String(body.chapterTitle || "").trim() || defaultChapterTitle(chapter);
    const articles = Array.isArray(body.articles)
      ? (body.articles as IncomingArticle[])
      : [];

    if (!Number.isFinite(chapter) || chapter < 0 || chapter > 18) {
      return NextResponse.json(
        { success: false, error: "Invalid chapter number" },
        { status: 400 },
      );
    }
    if (articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No articles to save" },
        { status: 400 },
      );
    }

    const sanity = createSanityWriteClient();
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "SANITY_API_TOKEN is not configured for writes",
        },
        { status: 500 },
      );
    }

    // Find any existing docs with non-deterministic ids for this chapter
    const existing = await sanity.fetch<
      Array<{ _id: string; articleNumber: number; amplifiedText?: unknown }>
    >(
      `*[_type == "constitutionArticle" && chapter == $chapter]{
        _id, articleNumber, amplifiedText
      }`,
      { chapter },
    );
    const byArticle = new Map<number, { _id: string; amplifiedText?: unknown }>();
    for (const row of existing || []) {
      byArticle.set(Number(row.articleNumber), {
        _id: row._id,
        amplifiedText: row.amplifiedText,
      });
    }

    const savedIds: string[] = [];

    for (const raw of articles) {
      const articleNumber = Number(raw.articleNumber);
      if (!Number.isFinite(articleNumber)) continue;

      const preferredId = constitutionArticleId(chapter, articleNumber);
      const prior = byArticle.get(articleNumber);
      // Prefer existing id to avoid duplicates from earlier Studio uploads
      const docId = prior?._id || preferredId;

      const officialText = paragraphsToPortableText(raw.officialText);
      const doc: Record<string, unknown> = {
        _id: docId,
        _type: "constitutionArticle",
        chapter,
        chapterTitle,
        articleNumber,
        articleTitle:
          String(raw.articleTitle || "").trim() || `Article ${articleNumber}`,
        officialText,
      };

      if (raw.partNumber != null && Number.isFinite(Number(raw.partNumber))) {
        doc.partNumber = Number(raw.partNumber);
      }
      if (raw.partTitle) {
        doc.partTitle = String(raw.partTitle).trim();
      }

      // Preserve existing Plain English unless explicitly overwriting
      if (prior?.amplifiedText && !body.overwritePlainEnglish) {
        doc.amplifiedText = prior.amplifiedText;
      }

      await sanity.createOrReplace(
        doc as { _id: string; _type: string } & Record<string, unknown>,
      );
      savedIds.push(docId);
    }

    return NextResponse.json({
      success: true,
      saved: savedIds.length,
      ids: savedIds,
      chapter,
      chapterTitle,
      publicPath: `/constitution/chapter/${chapter}`,
      message: `Saved ${savedIds.length} article(s) for Chapter ${chapter}`,
    });
  } catch (err) {
    console.error("[constitution/save]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save articles",
      },
      { status: 500 },
    );
  }
}
