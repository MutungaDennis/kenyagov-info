import { createClient } from "@/lib/supabase/server";

export async function getAdminLegislationList({
  query,
  category,
  status,
  review,
  kind,
  page = 1,
  pageSize = 30,
}: {
  query?: string | null;
  category?: string | null;
  status?: string | null;
  review?: string | null;
  kind?: string | null;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("legislation_documents")
    .select(
      `
      id,
      category,
      status,
      legislation_kind,
      review_status,
      relationship_review_status,
      current_version_date,
      updated_at,
      legal:legal_documents!legislation_documents_legal_document_id_fkey!inner(
        id,title,short_title,citation,slug,year
      )
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (category) q = q.eq("category", category);
  if (status) q = q.eq("status", status);
  if (review) q = q.eq("review_status", review);
  if (kind) q = q.eq("legislation_kind", kind);

  if (query?.trim()) {
    const term = query.trim();
    q = q.or(
      `title.ilike.%${term}%,short_title.ilike.%${term}%,citation.ilike.%${term}%,slug.ilike.%${term}%`,
      {
        referencedTable:
          "legal_documents!legislation_documents_legal_document_id_fkey",
      },
    );
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  return {
    rows: (data || []).map((row: any) => ({
      ...row,
      legal: Array.isArray(row.legal) ? row.legal[0] : row.legal,
    })),
    count: count || 0,
    page,
    pageSize,
  };
}

export async function getAdminLegislationDocument(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_documents")
    .select(`
      *,
      legal:legal_documents!legislation_documents_legal_document_id_fkey!inner(*),
      county:kenya_counties(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const document: any = {
    ...data,
    legal: Array.isArray((data as any).legal)
      ? (data as any).legal[0]
      : (data as any).legal,
    county: Array.isArray((data as any).county)
      ? (data as any).county[0]
      : (data as any).county,
  };

  const { data: provisions } = await supabase
    .from("legislation_provisions")
    .select(
      "id,legal_provision_id,provision_type,provision_number,heading,status,is_current,review_status,relationship_review_status,sort_order,updated_at",
    )
    .eq("legislation_document_id", id)
    .order("sort_order");

  const { data: versions } = await supabase
    .from("legislation_versions")
    .select("*")
    .eq("legislation_document_id", id)
    .order("version_date", { ascending: false });

  const { data: changes } = await supabase
    .from("legislation_changes")
    .select("*")
    .eq("legislation_document_id", id)
    .order("change_date", { ascending: false });

  const { data: activity } = await supabase
    .from("legislation_admin_activity")
    .select("*")
    .eq("legislation_document_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const provisionIds = (provisions || []).map((row: any) => row.id);
  const { count: inlineLinkCount } = provisionIds.length
    ? await supabase
        .from("legislation_inline_links")
        .select("id", { count: "exact", head: true })
        .in("provision_id", provisionIds)
    : { count: 0 };

  return {
    document,
    provisions: provisions || [],
    versions: versions || [],
    changes: changes || [],
    inlineLinkCount: inlineLinkCount || 0,
    activity: activity || [],
  };
}

export function publicLegislationHref(document: any) {
  const legal = document.legal;
  if (!legal?.slug) return "/legislation";

  if (document.category === "act") {
    return `/legislation/acts/${legal.slug}`;
  }
  if (document.category === "county_act") {
    const countySlug = document.county?.slug;
    return countySlug
      ? `/legislation/counties/${countySlug}/${legal.slug}`
      : "/legislation/counties";
  }
  if (document.category === "subsidiary") {
    return `/legislation/subsidiary/${legal.slug}`;
  }
  if (document.category === "treaty") {
    return `/legislation/treaties/${legal.slug}`;
  }
  return "/legislation";
}
