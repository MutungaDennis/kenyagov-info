import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdminApi,
} from "@/lib/admin-api";

export const dynamic =
  "force-dynamic";

function documentHref(
  row: any,
) {
  const metadata =
    row.metadata &&
    typeof row.metadata ===
      "object"
      ? row.metadata
      : {};

  if (
    typeof metadata
      .canonical_path ===
      "string"
  ) {
    return metadata
      .canonical_path;
  }

  if (
    row.document_type ===
    "act"
  ) {
    return `/acts/parliament/${row.slug}`;
  }

  if (
    row.document_type ===
    "county_act"
  ) {
    return `/acts/county/${row.slug}`;
  }

  if (
    row.document_type ===
    "constitution"
  ) {
    return "/constitution";
  }

  return null;
}

export async function GET(
  request: NextRequest,
) {
  const auth =
    await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const q =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() ||
    "";

  if (
    q.length < 2
  ) {
    return NextResponse.json({
      data: [],
    });
  }

  /*
   * Do not return the Constitution itself as a
   * candidate law target here. Internal Constitution
   * Article references are automatic.
   */
  const {
    data,
    error,
  } = await auth.supabase
    .from(
      "legal_documents",
    )
    .select(`
      id,
      document_type,
      title,
      short_title,
      citation,
      slug,
      year,
      status,
      metadata
    `)
    .neq(
      "document_type",
      "constitution",
    )
    .or(
      `title.ilike.%${q}%,short_title.ilike.%${q}%,citation.ilike.%${q}%`,
    )
    .order(
      "year",
      {
        ascending: false,
        nullsFirst: false,
      },
    )
    .limit(40);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      },
    );
  }

  const results =
    (data || []).map(
      (row: any) => ({
        id:
          `law:${row.id}`,

        kind:
          "law" as const,

        document_id:
          row.id,

        provision_id:
          null,

        document_type:
          row.document_type,

        title:
          row.title,

        short_title:
          row.short_title,

        citation:
          row.citation,

        year:
          row.year,

        status:
          row.status,

        slug:
          row.slug,

        canonical_path:
          documentHref(
            row,
          ),

        description:
          [
            row.citation,
            row.year,
            row.document_type,
            row.status,
          ]
            .filter(Boolean)
            .join(" · "),
      }),
    );

  return NextResponse.json({
    data:
      results,
  });
}