import { createClient } from "@/lib/supabase/server";

export const PRESIDENTIAL_SPEECHS_PAGE_SIZE = 20;

export type PresidentialRecordKind =
  | "speech"
  | "communique"
  | "message";

export type PresidentialSpeechSearchParams = {
  page?: string;
  q?: string;
  president?: string;
  year?: string;
  kind?: string;
  type?: string;
  topic?: string;
  county?: string;
};

export type PresidentialSpeechFinderRow = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  recordKind: PresidentialRecordKind;
  speechDate: string;
  occasion: string | null;
  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string;
  summary: string | null;
  excerpt: string | null;
  president: {
    slug: string;
    fullName: string;
    preferredName: string | null;
  } | null;
  speechType: {
    slug: string;
    name: string;
  } | null;
};

export type PresidentialSpeechFilters = {
  presidents: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  years: number[];
  kinds: Array<{
    slug: PresidentialRecordKind;
    name: string;
  }>;
  types: Array<{
    id: string;
    slug: string;
    name: string;
    kinds: PresidentialRecordKind[];
  }>;
  topics: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  counties: string[];
};

export type PresidentialSpeechDetail = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  originalTitle: string | null;

  recordKind: PresidentialRecordKind;

  speakerName: string;
  speakerTitle: string | null;
  administrationName: string | null;

  speechDate: string;
  deliveredAt: string | null;
  publishedAt: string | null;

  occasion: string | null;
  eventName: string | null;
  eventSeries: string | null;
  hostOrganisation: string | null;
  audience: string | null;

  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string;

  summary: string | null;
  excerpt: string | null;
  bodyText: string | null;
  bodyHtml: string | null;

  language: string;
  otherLanguages: string[] | null;
  wordCount: number | null;
  readingTimeMinutes: number | null;

  issuingAuthority: string | null;
  agreementParties: string[] | null;
  effectiveDate: string | null;
  implementationDeadline: string | null;

  officialSourceUrl: string | null;
  sourcePublisher: string | null;
  sourceTitle: string | null;
  sourceArchiveUrl: string | null;
  sourceReference: string | null;
  sourceFileUrl: string | null;

  videoUrl: string | null;
  audioUrl: string | null;
  livestreamUrl: string | null;
  imageUrl: string | null;

  transcriptStatus: string;
  transcriptSource: string | null;
  isOfficialTranscript: boolean;
  isCompleteTranscript: boolean;

  editorialNote: string | null;
  correctionNote: string | null;

  canonicalPath: string;

  president: {
    slug: string;
    fullName: string;
    preferredName: string | null;
    officialTitle: string;
    ordinalNumber: number | null;
    administrationName: string | null;
  } | null;

  speechType: {
    slug: string;
    name: string;
  } | null;

  topics: Array<{
    slug: string;
    name: string;
    isPrimary: boolean;
  }>;

  sources: Array<{
    id: string;
    sourceType: string;
    title: string | null;
    publisher: string | null;
    url: string;
    publishedAt: string | null;
    isPrimary: boolean;
    isOfficial: boolean;
    sortOrder: number;
  }>;
};

type PresidentFilterRow = {
  id: string;
  slug: string;
  full_name: string;
  preferred_name: string | null;
};

type SpeechTypeFilterRow = {
  id: string;
  slug: string;
  name: string;
};

type SpeechTopicFilterRow = {
  id: string;
  slug: string;
  name: string;
};

type CountyRow = {
  county: string | null;
};

type SpeechDateRow = {
  speech_date: string;
};

type TypeKindRow = {
  speech_type_id: string | null;
  record_kind: PresidentialRecordKind;
};

type IdRow = {
  id: string;
};

type SpeechIdRow = {
  speech_id: string;
};

type FinderPresidentRelation = {
  slug: string;
  full_name: string;
  preferred_name: string | null;
};

type FinderSpeechTypeRelation = {
  slug: string;
  name: string;
};

type RawFinderRow = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  record_kind: PresidentialRecordKind;
  speech_date: string;
  occasion: string | null;
  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string;
  summary: string | null;
  excerpt: string | null;
  president:
    | FinderPresidentRelation
    | FinderPresidentRelation[]
    | null;
  speech_type:
    | FinderSpeechTypeRelation
    | FinderSpeechTypeRelation[]
    | null;
};

type DetailPresidentRelation = {
  slug: string;
  full_name: string;
  preferred_name: string | null;
  official_title: string;
  ordinal_number: number | null;
  administration_name: string | null;
};

type DetailSpeechTypeRelation = {
  slug: string;
  name: string;
};

type RawSpeechDetailRow = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  original_title: string | null;
  record_kind: PresidentialRecordKind;

  speaker_name: string;
  speaker_title: string | null;
  administration_name: string | null;

  speech_date: string;
  delivered_at: string | null;
  published_at: string | null;

  occasion: string | null;
  event_name: string | null;
  event_series: string | null;
  host_organisation: string | null;
  audience: string | null;

  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string;

  summary: string | null;
  excerpt: string | null;
  body_text: string | null;
  body_html: string | null;
  transcript_text: string | null;
  transcript_html: string | null;

  language: string;
  other_languages: string[] | null;
  word_count: number | null;
  reading_time_minutes: number | null;

  issuing_authority: string | null;
  agreement_parties: string[] | null;
  effective_date: string | null;
  implementation_deadline: string | null;

  official_source_url: string | null;
  source_publisher: string | null;
  source_title: string | null;
  source_archive_url: string | null;
  source_reference: string | null;
  source_file_url: string | null;

  video_url: string | null;
  audio_url: string | null;
  livestream_url: string | null;
  image_url: string | null;

  transcript_status: string;
  transcript_source: string | null;
  is_official_transcript: boolean;
  is_complete_transcript: boolean;

  editorial_note: string | null;
  correction_note: string | null;

  canonical_path: string;

  president:
    | DetailPresidentRelation
    | DetailPresidentRelation[]
    | null;

  speech_type:
    | DetailSpeechTypeRelation
    | DetailSpeechTypeRelation[]
    | null;
};

type RawTopicLinkRow = {
  is_primary: boolean;
  topic:
    | {
        slug: string;
        name: string;
      }
    | Array<{
        slug: string;
        name: string;
      }>
    | null;
};

type RawSourceRow = {
  id: string;
  source_type: string;
  title: string | null;
  publisher: string | null;
  url: string;
  published_at: string | null;
  is_primary: boolean;
  is_official: boolean;
  sort_order: number;
};

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function firstRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getPresidentialSpeechFilters(): Promise<PresidentialSpeechFilters> {
  const supabase = await createClient();

  const [
    { data: presidentsData, error: presidentsError },
    { data: typesData, error: typesError },
    { data: topicsData, error: topicsError },
    { data: countiesData, error: countiesError },
    { data: datesData, error: datesError },
    { data: typeKindsData, error: typeKindsError },
  ] = await Promise.all([
    supabase
      .from("presidents")
      .select("id,slug,full_name,preferred_name")
      .order("term_start", { ascending: false }),

    supabase
      .from("speech_types")
      .select("id,slug,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("speech_topics")
      .select("id,slug,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("presidential_speeches")
      .select("county")
      .eq("is_published", true)
      .not("county", "is", null),

    supabase
      .from("presidential_speeches")
      .select("speech_date")
      .eq("is_published", true)
      .order("speech_date", { ascending: false }),

    supabase
      .from("presidential_speeches")
      .select("speech_type_id,record_kind")
      .eq("is_published", true)
      .not("speech_type_id", "is", null)
      .limit(10000),
  ]);

  if (presidentsError) {
    throw new Error(
      `Unable to load presidents: ${presidentsError.message}`,
    );
  }

  if (typesError) {
    throw new Error(
      `Unable to load publication types: ${typesError.message}`,
    );
  }

  if (topicsError) {
    throw new Error(
      `Unable to load topics: ${topicsError.message}`,
    );
  }

  if (countiesError) {
    throw new Error(
      `Unable to load counties: ${countiesError.message}`,
    );
  }

  if (datesError) {
    throw new Error(
      `Unable to load years: ${datesError.message}`,
    );
  }

  if (typeKindsError) {
    throw new Error(
      `Unable to coordinate content and publication types: ${typeKindsError.message}`,
    );
  }

  const presidents =
    (presidentsData ?? []) as PresidentFilterRow[];

  const types =
    (typesData ?? []) as SpeechTypeFilterRow[];

  const topics =
    (topicsData ?? []) as SpeechTopicFilterRow[];

  const countyRows =
    (countiesData ?? []) as CountyRow[];

  const dateRows =
    (datesData ?? []) as SpeechDateRow[];

  const typeKindRows =
    (typeKindsData ?? []) as TypeKindRow[];

  const kindsByTypeId = new Map<string, Set<PresidentialRecordKind>>();

  for (const row of typeKindRows) {
    if (!row.speech_type_id) continue;

    const existing = kindsByTypeId.get(row.speech_type_id) ??
      new Set<PresidentialRecordKind>();

    existing.add(row.record_kind);
    kindsByTypeId.set(row.speech_type_id, existing);
  }

  const counties: string[] = Array.from(
    new Set<string>(
      countyRows
        .map((row) => row.county)
        .filter(
          (county): county is string =>
            Boolean(county),
        ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const years: number[] = Array.from(
    new Set<number>(
      dateRows
        .map((row) =>
          Number(row.speech_date.slice(0, 4)),
        )
        .filter((year) =>
          Number.isInteger(year),
        ),
    ),
  ).sort((a, b) => b - a);

  return {
    presidents: presidents.map((row) => ({
      id: row.id,
      slug: row.slug,
      name:
        row.preferred_name ??
        row.full_name,
    })),

    years,

    kinds: [
      {
        slug: "speech",
        name: "Speeches",
      },
      {
        slug: "communique",
        name: "Communiqués",
      },
      {
        slug: "message",
        name: "Messages",
      },
    ],

    types: types.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      kinds: Array.from(kindsByTypeId.get(row.id) ?? []),
    })),

    topics: topics.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
    })),

    counties,
  };
}

export async function searchPublicPresidentialSpeeches(
  params: PresidentialSpeechSearchParams,
) {
  const supabase = await createClient();

  const page = parsePage(params.page);
  const offset =
    (page - 1) * PRESIDENTIAL_SPEECHS_PAGE_SIZE;

  let presidentId: string | null = null;
  let speechTypeId: string | null = null;
  let topicId: string | null = null;

  if (params.president) {
    const { data, error } = await supabase
      .from("presidents")
      .select("id")
      .eq("slug", params.president)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to resolve president filter: ${error.message}`,
      );
    }

    presidentId =
      ((data as IdRow | null)?.id) ?? null;

    if (!presidentId) {
      return {
        rows: [] as PresidentialSpeechFinderRow[],
        total: 0,
        page,
        pageSize:
          PRESIDENTIAL_SPEECHS_PAGE_SIZE,
      };
    }
  }

  if (params.type) {
    const { data, error } = await supabase
      .from("speech_types")
      .select("id")
      .eq("slug", params.type)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to resolve publication type filter: ${error.message}`,
      );
    }

    speechTypeId =
      ((data as IdRow | null)?.id) ?? null;

    if (!speechTypeId) {
      return {
        rows: [] as PresidentialSpeechFinderRow[],
        total: 0,
        page,
        pageSize:
          PRESIDENTIAL_SPEECHS_PAGE_SIZE,
      };
    }
  }

  if (params.topic) {
    const { data, error } = await supabase
      .from("speech_topics")
      .select("id")
      .eq("slug", params.topic)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to resolve topic filter: ${error.message}`,
      );
    }

    topicId =
      ((data as IdRow | null)?.id) ?? null;

    if (!topicId) {
      return {
        rows: [] as PresidentialSpeechFinderRow[],
        total: 0,
        page,
        pageSize:
          PRESIDENTIAL_SPEECHS_PAGE_SIZE,
      };
    }
  }

  let topicSpeechIds: string[] | null = null;

  if (topicId) {
    const { data, error } = await supabase
      .from("presidential_speech_topics")
      .select("speech_id")
      .eq("topic_id", topicId);

    if (error) {
      throw new Error(
        `Unable to apply topic filter: ${error.message}`,
      );
    }

    topicSpeechIds = (
      (data ?? []) as SpeechIdRow[]
    ).map((row) => row.speech_id);

    if (topicSpeechIds.length === 0) {
      return {
        rows: [] as PresidentialSpeechFinderRow[],
        total: 0,
        page,
        pageSize:
          PRESIDENTIAL_SPEECHS_PAGE_SIZE,
      };
    }
  }

  let query = supabase
    .rpc("search_presidential_speeches_scoped", { q: params.q?.trim() || "" }, { count: "exact" })
    .select(
      `
        id,
        slug,
        title,
        short_title,
        record_kind,
        speech_date,
        occasion,
        venue,
        locality,
        county,
        country,
        summary,
        excerpt,
        president:presidents(
          slug,
          full_name,
          preferred_name
        ),
        speech_type:speech_types(
          slug,
          name
        )
      `
    )
    .eq("is_published", true);

  if (
    params.kind === "speech" ||
    params.kind === "communique" ||
    params.kind === "message"
  ) {
    query = query.eq(
      "record_kind",
      params.kind,
    );
  }

  if (presidentId) {
    query = query.eq(
      "president_id",
      presidentId,
    );
  }

  if (speechTypeId) {
    query = query.eq(
      "speech_type_id",
      speechTypeId,
    );
  }

  if (
    params.year &&
    /^\d{4}$/.test(params.year)
  ) {
    const year = Number(params.year);

    query = query
      .gte(
        "speech_date",
        `${year}-01-01`,
      )
      .lte(
        "speech_date",
        `${year}-12-31`,
      );
  }

  if (params.county) {
    query = query.eq(
      "county",
      params.county,
    );
  }

  if (
    topicSpeechIds &&
    topicSpeechIds.length > 0
  ) {
    query = query.in(
      "id",
      topicSpeechIds,
    );
  }

  const { data, error, count } =
    await query
      .order("speech_date", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      })
      .range(
        offset,
        offset +
          PRESIDENTIAL_SPEECHS_PAGE_SIZE -
          1,
      );

  if (error) {
    throw new Error(
      `Unable to load Presidential publications: ${error.message}`,
    );
  }

  const rawRows =
    (data ?? []) as unknown as RawFinderRow[];

  const rows: PresidentialSpeechFinderRow[] =
    rawRows.map((row) => {
      const president =
        firstRelation(row.president);

      const speechType =
        firstRelation(row.speech_type);

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        shortTitle:
          row.short_title,
        recordKind:
          row.record_kind,
        speechDate:
          row.speech_date,
        occasion:
          row.occasion,
        venue:
          row.venue,
        locality:
          row.locality,
        county:
          row.county,
        country:
          row.country,
        summary:
          row.summary,
        excerpt:
          row.excerpt,

        president: president
          ? {
              slug:
                president.slug,
              fullName:
                president.full_name,
              preferredName:
                president.preferred_name,
            }
          : null,

        speechType: speechType
          ? {
              slug:
                speechType.slug,
              name:
                speechType.name,
            }
          : null,
      };
    });

  return {
    rows,
    total: count ?? 0,
    page,
    pageSize:
      PRESIDENTIAL_SPEECHS_PAGE_SIZE,
  };
}

export async function getPublicPresidentialSpeechBySlug(
  slug: string,
): Promise<PresidentialSpeechDetail | null> {
  const supabase = await createClient();

  const {
    data: speechData,
    error: speechError,
  } = await supabase
    .from("presidential_speeches")
    .select(
      `
        id,
        slug,
        title,
        short_title,
        original_title,
        record_kind,

        speaker_name,
        speaker_title,
        administration_name,

        speech_date,
        delivered_at,
        published_at,

        occasion,
        event_name,
        event_series,
        host_organisation,
        audience,

        venue,
        locality,
        county,
        country,

        summary,
        excerpt,
        body_text,
        body_html,
        transcript_text,
        transcript_html,

        language,
        other_languages,
        word_count,
        reading_time_minutes,

        issuing_authority,
        agreement_parties,
        effective_date,
        implementation_deadline,

        official_source_url,
        source_publisher,
        source_title,
        source_archive_url,
        source_reference,
        source_file_url,

        video_url,
        audio_url,
        livestream_url,
        image_url,

        transcript_status,
        transcript_source,
        is_official_transcript,
        is_complete_transcript,

        editorial_note,
        correction_note,

        canonical_path,

        president:presidents(
          slug,
          full_name,
          preferred_name,
          official_title,
          ordinal_number,
          administration_name
        ),

        speech_type:speech_types(
          slug,
          name
        )
      `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (speechError) {
    throw new Error(
      `Unable to load Presidential publication: ${speechError.message}`,
    );
  }

  if (!speechData) {
    return null;
  }

  const speech =
    speechData as unknown as RawSpeechDetailRow;

  const [
    { data: topicLinksData, error: topicLinksError },
    { data: sourcesData, error: sourcesError },
  ] = await Promise.all([
    supabase
      .from("presidential_speech_topics")
      .select(
        `
          is_primary,
          topic:speech_topics(
            slug,
            name
          )
        `,
      )
      .eq("speech_id", speech.id),

    supabase
      .from("presidential_speech_sources")
      .select(
        `
          id,
          source_type,
          title,
          publisher,
          url,
          published_at,
          is_primary,
          is_official,
          sort_order
        `,
      )
      .eq("speech_id", speech.id)
      .order("is_primary", {
        ascending: false,
      })
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (topicLinksError) {
    throw new Error(
      `Unable to load publication topics: ${topicLinksError.message}`,
    );
  }

  if (sourcesError) {
    throw new Error(
      `Unable to load publication sources: ${sourcesError.message}`,
    );
  }

  const president =
    firstRelation(speech.president);

  const speechType =
    firstRelation(speech.speech_type);

  const topicLinks =
    (topicLinksData ?? []) as unknown as RawTopicLinkRow[];

  const sourceRows =
    (sourcesData ?? []) as unknown as RawSourceRow[];

  const topics =
    topicLinks
      .map((link) => {
        const topic =
          firstRelation(link.topic);

        if (!topic) {
          return null;
        }

        return {
          slug: topic.slug,
          name: topic.name,
          isPrimary:
            link.is_primary,
        };
      })
      .filter(
        (
          topic,
        ): topic is {
          slug: string;
          name: string;
          isPrimary: boolean;
        } => topic !== null,
      )
      .sort(
        (a, b) =>
          Number(b.isPrimary) -
            Number(a.isPrimary) ||
          a.name.localeCompare(b.name),
      );

  const sources =
    sourceRows.map((source) => ({
      id: source.id,
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
        source.is_primary,
      isOfficial:
        source.is_official,
      sortOrder:
        source.sort_order,
    }));

  return {
    id: speech.id,
    slug: speech.slug,
    title: speech.title,
    shortTitle:
      speech.short_title,
    originalTitle:
      speech.original_title,

    recordKind:
      speech.record_kind,

    speakerName:
      speech.speaker_name,
    speakerTitle:
      speech.speaker_title,
    administrationName:
      speech.administration_name,

    speechDate:
      speech.speech_date,
    deliveredAt:
      speech.delivered_at,
    publishedAt:
      speech.published_at,

    occasion:
      speech.occasion,
    eventName:
      speech.event_name,
    eventSeries:
      speech.event_series,
    hostOrganisation:
      speech.host_organisation,
    audience:
      speech.audience,

    venue:
      speech.venue,
    locality:
      speech.locality,
    county:
      speech.county,
    country:
      speech.country,

    summary:
      speech.summary,
    excerpt:
      speech.excerpt,

    bodyText:
      speech.body_text ??
      speech.transcript_text,

    bodyHtml:
      speech.body_html ??
      speech.transcript_html,

    language:
      speech.language,
    otherLanguages:
      speech.other_languages,
    wordCount:
      speech.word_count,
    readingTimeMinutes:
      speech.reading_time_minutes,

    issuingAuthority:
      speech.issuing_authority,
    agreementParties:
      speech.agreement_parties,
    effectiveDate:
      speech.effective_date,
    implementationDeadline:
      speech.implementation_deadline,

    officialSourceUrl:
      speech.official_source_url,
    sourcePublisher:
      speech.source_publisher,
    sourceTitle:
      speech.source_title,
    sourceArchiveUrl:
      speech.source_archive_url,
    sourceReference:
      speech.source_reference,
    sourceFileUrl:
      speech.source_file_url,

    videoUrl:
      speech.video_url,
    audioUrl:
      speech.audio_url,
    livestreamUrl:
      speech.livestream_url,
    imageUrl:
      speech.image_url,

    transcriptStatus:
      speech.transcript_status,
    transcriptSource:
      speech.transcript_source,
    isOfficialTranscript:
      speech.is_official_transcript,
    isCompleteTranscript:
      speech.is_complete_transcript,

    editorialNote:
      speech.editorial_note,
    correctionNote:
      speech.correction_note,

    canonicalPath:
      speech.canonical_path,

    president: president
      ? {
          slug:
            president.slug,
          fullName:
            president.full_name,
          preferredName:
            president.preferred_name,
          officialTitle:
            president.official_title,
          ordinalNumber:
            president.ordinal_number,
          administrationName:
            president.administration_name,
        }
      : null,

    speechType: speechType
      ? {
          slug:
            speechType.slug,
          name:
            speechType.name,
        }
      : null,

    topics,
    sources,
  };
}