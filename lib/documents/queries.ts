import { createClient } from "@/lib/supabase/server";

export const DOCUMENT_PAGE_SIZE = 30;

export type DocumentSearchParams = {
  q?: string;
  category?: string;
  type?: string;
  topic?: string;
  institution?: string;
  status?: string;
  year_from?: string;
  year_to?: string;
  sort?: string;
  page?: string;
};

export type DocumentSearchRow = {
  id: string;
  title: string;
  short_title?: string | null;
  slug: string;
  summary: string | null;
  publisher_text: string | null;
  publication_date: string | null;
  document_year?: number | null;

  category_name?: string | null;
  category_slug?: string | null;

  type_name: string | null;
  type_slug?: string | null;

  status?: string | null;
  total_count?: number | string | null;

  [key: string]: unknown;
};

export type DocumentFinderRow = DocumentSearchRow & {
  href: string;
};

export type DocumentCategoryFilter = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type DocumentTypeFilter = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
};

export type DocumentTopicFilter = {
  id: string;
  name: string;
  slug: string;
};

function parseOptionalYear(value?: string) {
  if (!value) return null;

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export async function searchPublicDocuments(
  params: DocumentSearchParams,
) {
  const supabase = await createClient();

  const page = parsePage(params.page);
  const offset = (page - 1) * DOCUMENT_PAGE_SIZE;

  const { data, error } = await supabase.rpc("search_documents", {
    p_query: params.q?.trim() || null,
    p_category_slug: params.category || null,
    p_type_slug: params.type || null,
    p_topic_slug: params.topic || null,
    p_institution_id: params.institution || null,
    p_status: params.status || null,
    p_year_from: parseOptionalYear(params.year_from),
    p_year_to: parseOptionalYear(params.year_to),
    p_sort: params.sort || "newest",
    p_limit: DOCUMENT_PAGE_SIZE,
    p_offset: offset,
  });

  if (error) {
    throw new Error(
      `Unable to load documents: ${error.message}`,
    );
  }

  const rawRows = (data ?? []) as DocumentSearchRow[];

  const rows = rawRows.filter((row) =>
    Boolean(row.slug),
  );

  return {
    rows,
    page,
    pageSize: DOCUMENT_PAGE_SIZE,
    total: Number(rows[0]?.total_count ?? 0),
  };
}

export async function getDocumentFilters() {
  const supabase = await createClient();

  const [
    {
      data: categories,
      error: categoriesError,
    },
    {
      data: types,
      error: typesError,
    },
    {
      data: topics,
      error: topicsError,
    },
  ] = await Promise.all([
    supabase
      .from("document_categories")
      .select("id,name,slug,description")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("document_types")
      .select("id,name,slug,category_id")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("document_topics")
      .select("id,name,slug")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),
  ]);

  if (categoriesError) {
    throw new Error(
      `Unable to load document categories: ${categoriesError.message}`,
    );
  }

  if (typesError) {
    throw new Error(
      `Unable to load document types: ${typesError.message}`,
    );
  }

  if (topicsError) {
    throw new Error(
      `Unable to load document topics: ${topicsError.message}`,
    );
  }

  return {
    categories:
      (categories ?? []) as DocumentCategoryFilter[],

    types:
      (types ?? []) as DocumentTypeFilter[],

    topics:
      (topics ?? []) as DocumentTopicFilter[],
  };
}

export async function getPublicDocument(
  slug: string,
) {
  const supabase = await createClient();

  const { data: document, error } =
    await supabase
      .from("documents")
      .select(`
        *,
        document_type:document_types(
          id,
          name,
          slug,
          category_id
        ),
        series:document_series(
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .not("published_at", "is", null)
      .neq("status", "Draft")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load document: ${error.message}`,
    );
  }

  if (!document) {
    return null;
  }

  const [
    {
      data: sections,
      error: sectionsError,
    },
    {
      data: files,
      error: filesError,
    },
    {
      data: versions,
      error: versionsError,
    },
    {
      data: topicLinks,
      error: topicsError,
    },
  ] = await Promise.all([
    supabase
      .from("document_sections")
      .select("*")
      .eq("document_id", document.id)
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("document_files")
      .select("*")
      .eq("document_id", document.id)
      .order("is_primary", {
        ascending: false,
      }),

    supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", document.id)
      .order("version_date", {
        ascending: false,
      }),

    supabase
      .from("document_topic_links")
      .select(
        "topic:document_topics(id,name,slug)",
      )
      .eq("document_id", document.id),
  ]);

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  if (filesError) {
    throw new Error(filesError.message);
  }

  if (versionsError) {
    throw new Error(versionsError.message);
  }

  if (topicsError) {
    throw new Error(topicsError.message);
  }

  return {
    document,
    sections: sections ?? [],
    files: files ?? [],
    versions: versions ?? [],
    topicLinks: topicLinks ?? [],
  };
}