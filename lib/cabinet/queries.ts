import "server-only";

import {
  createPublicClient,
} from "@/lib/supabase/public";

export type CabinetBriefSearchParams = {
  query?: string;
  label?: string;
  year?: string;
  page?: string;
};

export type CabinetBriefFinderRow = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  publicationLabel: string;
  briefDate: string;

  summary: string | null;
  excerpt: string | null;

  meetingType: string | null;

  venue: string | null;
  locality: string | null;
  county: string | null;

  topics: string[];

  wordCount: number | null;
  readingTimeMinutes: number | null;
};

export type CabinetBriefSource = {
  id: string;
  sourceType: string;
  title: string | null;
  publisher: string | null;
  url: string;
  publishedAt: string | null;

  isPrimary: boolean;
  isOfficial: boolean;

  mimeType: string | null;
  notes: string | null;
};

export type CabinetBriefRecord = {
  id: string;
  slug: string;

  title: string;
  shortTitle: string | null;
  originalTitle: string | null;

  publicationLabel: string;
  meetingType: string | null;

  briefDate: string;

  chairName: string | null;
  chairTitle: string | null;

  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string | null;

  summary: string | null;
  excerpt: string | null;

  bodyText: string | null;
  bodyHtml: string | null;

  topics: string[];

  wordCount: number | null;
  readingTimeMinutes: number | null;

  officialSourceUrl: string | null;
  sourcePublisher: string | null;
  sourceTitle: string | null;

  isOfficialSource: boolean;

  editorialNote: string | null;

  canonicalPath: string;

  metaTitle: string | null;
  metaDescription: string | null;

  reviewStatus: string | null;

  sources: CabinetBriefSource[];
};

export type CabinetBriefFilters = {
  labels: string[];
  years: number[];
};

const DEFAULT_PAGE_SIZE = 20;

function getPage(
  value?: string,
) {
  const page =
    Number.parseInt(
      value || "1",
      10,
    );

  if (
    !Number.isFinite(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function getYear(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  const year =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isFinite(year)
  ) {
    return undefined;
  }

  return year;
}

export async function searchPublicCabinetBriefs(
  params: CabinetBriefSearchParams,
) {
  const supabase =
    createPublicClient();

  const page =
    getPage(params.page);

  const pageSize =
    DEFAULT_PAGE_SIZE;

  const from =
    (page - 1) *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  const searchText =
    params.query?.trim();

  const publicationLabel =
    params.label?.trim();

  const year =
    getYear(
      params.year,
    );

  let query =
    supabase
      .rpc("search_cabinet_briefs_scoped", { q: searchText || "" }, { count: "exact" })
      .select(
        `
          id,
          slug,
          title,
          short_title,
          publication_label,
          brief_date,
          summary,
          excerpt,
          meeting_type,
          venue,
          locality,
          county,
          topics,
          word_count,
          reading_time_minutes
        `
      )
      .eq(
        "is_published",
        true,
      );

  if (
    publicationLabel
  ) {
    query =
      query.eq(
        "publication_label",
        publicationLabel,
      );
  }

  if (year) {
    query =
      query
        .gte(
          "brief_date",
          `${year}-01-01`,
        )
        .lte(
          "brief_date",
          `${year}-12-31`,
        );
  }

  const {
    data,
    error,
    count,
  } = await query

    // Most recent Cabinet
    // publication first.
    .order(
      "brief_date",
      {
        ascending: false,
      },
    )

    // Deterministic fallback
    // if two records have
    // the same brief date.
    .order(
      "id",
      {
        ascending: false,
      },
    )

    .range(
      from,
      to,
    );

  if (error) {
    console.error(
      "Unable to load Cabinet briefs:",
      JSON.stringify(
        error,
        null,
        2,
      ),
    );

    throw new Error(
      `Unable to load Cabinet briefs: ${error.message}`,
    );
  }

  const rows: CabinetBriefFinderRow[] =
    (Array.isArray(data) ? data : []).map(
      (row: any) => ({
        id: row.id,
        slug: row.slug,

        title:
          row.title,

        shortTitle:
          row.short_title,

        publicationLabel:
          row.publication_label,

        briefDate:
          row.brief_date,

        summary:
          row.summary,

        excerpt:
          row.excerpt,

        meetingType:
          row.meeting_type,

        venue:
          row.venue,

        locality:
          row.locality,

        county:
          row.county,

        topics:
          Array.isArray(
            row.topics,
          )
            ? row.topics
            : [],

        wordCount:
          row.word_count,

        readingTimeMinutes:
          row.reading_time_minutes,
      }),
    );

  return {
    rows,
    total:
      count ?? 0,
    page,
    pageSize,
  };
}

export async function getCabinetBriefFilters(): Promise<CabinetBriefFilters> {
  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "cabinet_briefs",
    )
    .select(
      `
        publication_label,
        brief_date
      `,
    )
    .eq(
      "is_published",
      true,
    )

    // Latest years first.
    .order(
      "brief_date",
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      "Unable to load Cabinet brief filters:",
      JSON.stringify(
        error,
        null,
        2,
      ),
    );

    throw new Error(
      `Unable to load Cabinet brief filters: ${error.message}`,
    );
  }

  const labels =
    Array.from(
      new Set(
        (data ?? [])
          .map(
            (row: any) =>
              row.publication_label,
          )
          .filter(Boolean),
      ),
    ).sort(
      (
        a: string,
        b: string,
      ) =>
        a.localeCompare(b),
    );

  const years =
    Array.from(
      new Set(
        (data ?? [])
          .map(
            (row: any) => {
              if (
                !row.brief_date
              ) {
                return null;
              }

              return Number(
                String(
                  row.brief_date,
                ).slice(
                  0,
                  4,
                ),
              );
            },
          )
          .filter(
            (
              value,
            ): value is number =>
              typeof value ===
                "number" &&
              Number.isFinite(
                value,
              ),
          ),
      ),
    ).sort(
      (
        a,
        b,
      ) =>
        b - a,
    );

  return {
    labels,
    years,
  };
}

export async function getPublicCabinetBriefBySlug(
  slug: string,
): Promise<CabinetBriefRecord | null> {
  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "cabinet_briefs",
    )
    .select(
      `
        id,
        slug,

        title,
        short_title,
        original_title,

        publication_label,
        meeting_type,

        brief_date,

        chair_name,
        chair_title,

        venue,
        locality,
        county,
        country,

        summary,
        excerpt,

        body_text,
        body_html,

        topics,

        word_count,
        reading_time_minutes,

        official_source_url,
        source_publisher,
        source_title,

        is_official_source,

        editorial_note,

        canonical_path,

        meta_title,
        meta_description,

        review_status,

        cabinet_brief_sources (
          id,
          source_type,
          title,
          publisher,
          url,
          published_at,
          is_primary,
          is_official,
          mime_type,
          notes,
          sort_order
        )
      `,
    )
    .eq(
      "slug",
      slug,
    )
    .eq(
      "is_published",
      true,
    )
    .maybeSingle();

  if (error) {
    console.error(
      `Unable to load Cabinet brief "${slug}":`,
      JSON.stringify(
        error,
        null,
        2,
      ),
    );

    throw new Error(
      `Unable to load Cabinet brief: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const rawSources =
    Array.isArray(
      data.cabinet_brief_sources,
    )
      ? data.cabinet_brief_sources
      : [];

  const sources: CabinetBriefSource[] =
    rawSources

      .sort(
        (
          a: any,
          b: any,
        ) =>
          (
            a.sort_order ??
            100
          ) -
          (
            b.sort_order ??
            100
          ),
      )

      .map(
        (
          source: any,
        ) => ({
          id:
            source.id,

          sourceType:
            source.source_type,

          title:
            source.title,

          publisher:
            source.publisher,

          url:
            source.url,

          publishedAt:
            source.published_at,

          isPrimary:
            Boolean(
              source.is_primary,
            ),

          isOfficial:
            Boolean(
              source.is_official,
            ),

          mimeType:
            source.mime_type,

          notes:
            source.notes,
        }),
      );

  return {
    id:
      data.id,

    slug:
      data.slug,

    title:
      data.title,

    shortTitle:
      data.short_title,

    originalTitle:
      data.original_title,

    publicationLabel:
      data.publication_label,

    meetingType:
      data.meeting_type,

    briefDate:
      data.brief_date,

    chairName:
      data.chair_name,

    chairTitle:
      data.chair_title,

    venue:
      data.venue,

    locality:
      data.locality,

    county:
      data.county,

    country:
      data.country,

    summary:
      data.summary,

    excerpt:
      data.excerpt,

    bodyText:
      data.body_text,

    bodyHtml:
      data.body_html,

    topics:
      Array.isArray(
        data.topics,
      )
        ? data.topics
        : [],

    wordCount:
      data.word_count,

    readingTimeMinutes:
      data.reading_time_minutes,

    officialSourceUrl:
      data.official_source_url,

    sourcePublisher:
      data.source_publisher,

    sourceTitle:
      data.source_title,

    isOfficialSource:
      Boolean(
        data.is_official_source,
      ),

    editorialNote:
      data.editorial_note,

    canonicalPath:
      data.canonical_path ||
      `/government/cabinet/briefs/${data.slug}`,

    metaTitle:
      data.meta_title,

    metaDescription:
      data.meta_description,

    reviewStatus:
      data.review_status,

    sources,
  };
}