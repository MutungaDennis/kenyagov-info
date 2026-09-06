import { createClient } from "@/lib/supabase/server";

export type ConstitutionStructure = {
  constitution: {
    id: string;
    official_title: string;
    year: number;
    promulgation_date: string | null;
    effective_date: string | null;
    preamble_text: string | null;
    preamble_html: string | null;
    legal_document_id: string;
  };
  chapters: any[];
  parts: any[];
  articles: any[];
  schedules: any[];
};

async function getCurrentConstitutionId() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("constitutions")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve current Constitution:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return null;
  }

  return data?.id ?? null;
}

export async function getConstitutionStructure(): Promise<ConstitutionStructure | null> {
  const supabase = await createClient();

  const { data: constitution, error } = await supabase
    .from("constitutions")
    .select(
      "id, official_title, year, promulgation_date, effective_date, preamble_text, preamble_html, legal_document_id"
    )
    .eq("is_current", true)
    .maybeSingle();

  if (error || !constitution) {
    if (error) {
      console.error("Failed to load current Constitution:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }
    return null;
  }

  const [chaptersResult, partsResult, articlesResult, schedulesResult] =
    await Promise.all([
      supabase
        .from("constitution_chapters")
        .select("id, chapter_number, title, slug, sort_order")
        .eq("constitution_id", constitution.id)
        .order("sort_order"),

      supabase
        .from("constitution_parts")
        .select("id, chapter_id, part_number, title, slug, sort_order")
        .eq("constitution_id", constitution.id)
        .order("sort_order"),

      supabase
        .from("constitution_articles")
        .select("id, chapter_id, part_id, article_number, title, review_status")
        .eq("constitution_id", constitution.id)
        .order("article_number"),

      supabase
        .from("constitution_schedules")
        .select("id, ordinal, schedule_label, slug, title")
        .eq("constitution_id", constitution.id)
        .order("ordinal"),
    ]);

  const failures = [
    ["chapters", chaptersResult.error],
    ["parts", partsResult.error],
    ["articles", articlesResult.error],
    ["schedules", schedulesResult.error],
  ].filter(([, queryError]) => Boolean(queryError));

  if (failures.length) {
    for (const [name, queryError] of failures) {
      const e = queryError as any;
      console.error(`Failed to load Constitution ${name}:`, {
        code: e?.code,
        message: e?.message,
        details: e?.details,
        hint: e?.hint,
      });
    }
    return null;
  }

  return {
    constitution,
    chapters: chaptersResult.data ?? [],
    parts: partsResult.data ?? [],
    articles: articlesResult.data ?? [],
    schedules: schedulesResult.data ?? [],
  };
}

export async function getArticle(articleNumber: number) {
  if (!Number.isInteger(articleNumber) || articleNumber < 1 || articleNumber > 264) {
    return null;
  }

  const supabase = await createClient();

  const { data: article, error: articleError } = await supabase
    .from("constitution_articles")
    .select(
      "id, constitution_id, article_number, title, body_text, body_html, legal_provision_id, chapter_id, part_id"
    )
    .eq("article_number", articleNumber)
    .limit(1)
    .maybeSingle();

  if (articleError || !article) {
    if (articleError) {
      console.error(`Failed to load Article ${articleNumber}:`, {
        code: articleError.code,
        message: articleError.message,
        details: articleError.details,
        hint: articleError.hint,
      });
    }
    return null;
  }

  const chapterPromise = article.chapter_id
    ? supabase
        .from("constitution_chapters")
        .select("id, chapter_number, title, slug")
        .eq("id", article.chapter_id)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const partPromise = article.part_id
    ? supabase
        .from("constitution_parts")
        .select("id, part_number, title, slug")
        .eq("id", article.part_id)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const previousPromise = supabase
    .from("constitution_articles")
    .select("article_number, title")
    .eq("constitution_id", article.constitution_id)
    .lt("article_number", articleNumber)
    .order("article_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPromise = supabase
    .from("constitution_articles")
    .select("article_number, title")
    .eq("constitution_id", article.constitution_id)
    .gt("article_number", articleNumber)
    .order("article_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  const [
    chapterResult,
    partResult,
    previousResult,
    nextResult,
  ] = await Promise.all([
    chapterPromise,
    partPromise,
    previousPromise,
    nextPromise,
  ]);

  let citations: any[] = [];

  if (article.legal_provision_id) {
    const { data: citationData, error: citationError } = await supabase
      .from("legal_citations")
      .select(
        "id, reference_text, target_provision_id, legal_provisions!legal_citations_target_provision_id_fkey(number_label, heading, canonical_path)"
      )
      .eq("source_provision_id", article.legal_provision_id)
      .eq("verification_status", "Verified")
      .limit(40);

    if (citationError) {
      console.error(`Failed to load citations for Article ${articleNumber}:`, {
        code: citationError.code,
        message: citationError.message,
        details: citationError.details,
        hint: citationError.hint,
      });
    } else {
      citations = citationData ?? [];
    }
  }

  return {
    article: {
      ...article,
      constitution_chapters: chapterResult.data ?? null,
      constitution_parts: partResult.data ?? null,
    },
    prev: previousResult.data ?? null,
    next: nextResult.data ?? null,
    citations,
  };
}

export async function getChapter(chapterNumber: number) {
  const supabase = await createClient();
  const constitutionId = await getCurrentConstitutionId();

  if (!constitutionId) return null;

  const { data: chapter, error } = await supabase
    .from("constitution_chapters")
    .select("id, chapter_number, title, slug")
    .eq("constitution_id", constitutionId)
    .eq("chapter_number", chapterNumber)
    .maybeSingle();

  if (error || !chapter) {
    if (error) {
      console.error(`Failed to load Chapter ${chapterNumber}:`, error);
    }
    return null;
  }

  const [{ data: parts }, { data: articles }] = await Promise.all([
    supabase
      .from("constitution_parts")
      .select("id, part_number, title, slug")
      .eq("chapter_id", chapter.id)
      .order("part_number"),

    supabase
      .from("constitution_articles")
      .select("id, part_id, article_number, title")
      .eq("constitution_id", constitutionId)
      .eq("chapter_id", chapter.id)
      .order("article_number"),
  ]);

  return {
    chapter,
    parts: parts ?? [],
    articles: articles ?? [],
  };
}

export async function getSchedule(slug: string) {
  const supabase = await createClient();
  const constitutionId = await getCurrentConstitutionId();

  if (!constitutionId) return null;

  const { data, error } = await supabase
    .from("constitution_schedules")
    .select("*")
    .eq("constitution_id", constitutionId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load Constitution schedule "${slug}":`, error);
    return null;
  }

  return data;
}