import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import {
  applyPhrasesToBlocks,
  type LinkPhrase,
} from "@/lib/constitution/link-phrases";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const dryRun = body.dryRun !== false;
    /** chapters | schedules | both */
    const target = String(body.target || "chapters");
    const chapter =
      body.chapter == null || body.chapter === "" || body.chapter === "all"
        ? null
        : Number(body.chapter);
    const scheduleSlug =
      body.scheduleSlug && body.scheduleSlug !== "all"
        ? String(body.scheduleSlug)
        : null;

    if (
      chapter != null &&
      (!Number.isFinite(chapter) || chapter < 0 || chapter > 18)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid chapter" },
        { status: 400 },
      );
    }

    if (!dryRun && !process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const sanity = createSanityWriteClient();
    const phrases = (await sanity.fetch(
      `*[_type == "constitutionLinkPhrase" && enabled != false]{
        _id, phrase, matchMode, internalHref, externalHref, externalLabel,
        constitutionChapter, constitutionArticle, scopeChapters, enabled, sortOrder
      }`,
    )) as LinkPhrase[];

    if (!phrases?.length) {
      return NextResponse.json({
        success: true,
        dryRun,
        articlesTouched: 0,
        schedulesTouched: 0,
        matchCount: 0,
        message: "No enabled link phrases found. Seed or add phrases first.",
        samples: [],
      });
    }

    let matchCount = 0;
    let articlesTouched = 0;
    let schedulesTouched = 0;
    let articlesScanned = 0;
    let schedulesScanned = 0;
    const samples: Array<{
      kind: "article" | "schedule";
      chapter?: number;
      articleNumber?: number;
      schedule?: string;
      title?: string;
      matches: number;
    }> = [];

    const doChapters = target === "chapters" || target === "both";
    const doSchedules = target === "schedules" || target === "both";

    if (doChapters) {
      const filter =
        chapter != null
          ? `*[_type == "constitutionArticle" && chapter == $chapter]`
          : `*[_type == "constitutionArticle"]`;

      const articles = await sanity.fetch<
        Array<{
          _id: string;
          chapter: number;
          articleNumber: number;
          articleTitle?: string;
          officialText?: unknown;
        }>
      >(
        `${filter} | order(chapter asc, articleNumber asc) {
          _id, chapter, articleNumber, articleTitle, officialText
        }`,
        chapter != null ? { chapter } : {},
      );

      articlesScanned = (articles || []).length;

      for (const article of articles || []) {
        const result = applyPhrasesToBlocks(
          article.officialText,
          phrases,
          Number(article.chapter),
        );
        if (!result.changed || result.matchCount === 0) continue;

        matchCount += result.matchCount;
        articlesTouched += 1;
        if (samples.length < 40) {
          samples.push({
            kind: "article",
            chapter: article.chapter,
            articleNumber: article.articleNumber,
            title: article.articleTitle,
            matches: result.matchCount,
          });
        }

        if (!dryRun) {
          await sanity
            .patch(article._id)
            .set({ officialText: result.blocks })
            .commit({ autoGenerateArrayKeys: true });
        }
      }
    }

    if (doSchedules) {
      const filter = scheduleSlug
        ? `*[_type == "constitutionSchedule" && slug.current == $slug]`
        : `*[_type == "constitutionSchedule"]`;

      const schedules = await sanity.fetch<
        Array<{
          _id: string;
          scheduleNumber: number;
          fullTitle?: string;
          title?: string;
          officialText?: unknown;
        }>
      >(
        `${filter} | order(scheduleNumber asc) {
          _id, scheduleNumber, fullTitle, title, officialText
        }`,
        scheduleSlug ? { slug: scheduleSlug } : {},
      );

      schedulesScanned = (schedules || []).length;

      for (const sched of schedules || []) {
        // Schedules are not chapter-scoped — ignore scopeChapters filters
        const phrasesForSched = phrases.map((p) => ({
          ...p,
          scopeChapters: null,
        }));
        const result = applyPhrasesToBlocks(
          sched.officialText,
          phrasesForSched,
          0,
        );
        if (!result.changed || result.matchCount === 0) continue;

        matchCount += result.matchCount;
        schedulesTouched += 1;
        if (samples.length < 40) {
          samples.push({
            kind: "schedule",
            schedule: sched.fullTitle || `Schedule ${sched.scheduleNumber}`,
            title: sched.title,
            matches: result.matchCount,
          });
        }

        if (!dryRun) {
          await sanity
            .patch(sched._id)
            .set({ officialText: result.blocks })
            .commit({ autoGenerateArrayKeys: true });
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      articlesScanned,
      schedulesScanned,
      articlesTouched,
      schedulesTouched,
      matchCount,
      samples,
      message: dryRun
        ? `Dry run: ${matchCount} link(s) — articles ${articlesTouched}, schedules ${schedulesTouched}`
        : `Applied ${matchCount} link(s) — articles ${articlesTouched}, schedules ${schedulesTouched}`,
    });
  } catch (err) {
    console.error("[link-phrases/apply]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Apply failed",
      },
      { status: 500 },
    );
  }
}
