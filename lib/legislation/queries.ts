import { createClient } from "@/lib/supabase/server";
import type {
  LegislationAmendmentGroup,
  LegislationDocument,
  LegislationListItem,
  LegislationProvision,
} from "./types";

export async function listLegislation(
  filters: Record<string, string | number | null | undefined>,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_legislation", {
    p_query: filters.query || null,
    p_category: filters.category || null,
    p_status: filters.status || null,
    p_county_code: filters.countyCode || null,
    p_chamber: filters.chamber || null,
    p_year: filters.year ? Number(filters.year) : null,
    p_limit: filters.limit ? Number(filters.limit) : 30,
    p_offset: filters.offset ? Number(filters.offset) : 0,
  });

  if (error) {
    console.error("Failed to list legislation", error);
    throw new Error(error.message);
  }

  const rows = (data || []) as LegislationListItem[];

  // The search RPC predates legislation_kind, so enrich the result in one
  // inexpensive query instead of requiring another database migration.
  const legalDocumentIds = rows
    .map((row) => row.legal_document_id)
    .filter(Boolean);

  if (!legalDocumentIds.length) {
    return rows;
  }

  const { data: kinds, error: kindsError } = await supabase
    .from("legislation_documents")
    .select("legal_document_id,legislation_kind")
    .in("legal_document_id", legalDocumentIds);

  if (kindsError) {
    console.error("Failed to enrich legislation kinds", kindsError);
    // Do not make the entire list fail just because the display enrichment failed.
    return rows;
  }

  const kindByDocumentId = new Map(
    (kinds || []).map((row: any) => [
      row.legal_document_id,
      row.legislation_kind || null,
    ]),
  );

  return rows.map((row) => ({
    ...row,
    legislation_kind: kindByDocumentId.get(row.legal_document_id) || null,
  }));
}

export async function getCounties() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kenya_counties")
    .select("code,name,slug,official_name,sort_order")
    .order("sort_order");

  if (error) {
    console.error("Failed to load counties", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getLegislationDocument(
  slug: string,
  category?: string,
  countySlug?: string,
) {
  const supabase = await createClient();

  let query = supabase
    .from("legislation_documents")
    .select(`
      id,
      category,
      jurisdiction_level,
      county_code,
      legislature_name,
      originating_chamber,
      act_number,
      cap_number,
      bill_reference,
      long_title,
      assent_date,
      publication_date,
      commencement_date,
      repeal_date,
      last_amended_date,
      current_version_date,
      status,
      is_current,
      legislation_kind,
      treaty_type,
      treaty_status,
      signature_date,
      ratification_date,
      entry_into_force_date,
      legal:legal_documents!legislation_documents_legal_document_id_fkey!inner(
        id,
        title,
        short_title,
        citation,
        slug,
        year,
        document_type,
        source_url,
        source_publisher
      ),
      county:kenya_counties(
        code,
        name,
        slug,
        official_name
      )
    `)
    .eq("legal.slug", slug)
    .limit(1);

  if (category) {
    query = query.eq("category", category);
  }

  if (countySlug) {
    query = query.eq("county.slug", countySlug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Failed to load legislation document", {
      slug,
      category,
      countySlug,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as any;
  const legal = Array.isArray(row.legal) ? row.legal[0] : row.legal;
  const county = Array.isArray(row.county) ? row.county[0] : row.county;

  if (!legal) {
    return null;
  }

  return {
    legislation_document_id: row.id,
    legal_document_id: legal.id,
    title: legal.title,
    short_title: legal.short_title,
    citation: legal.citation,
    slug: legal.slug,
    year: legal.year,
    document_type: legal.document_type,
    category: row.category,
    jurisdiction_level: row.jurisdiction_level,
    county_code: row.county_code,
    county_name: county?.official_name || county?.name || null,
    county_slug: county?.slug || null,
    legislature_name: row.legislature_name,
    originating_chamber: row.originating_chamber,
    act_number: row.act_number,
    cap_number: row.cap_number,
    bill_reference: row.bill_reference,
    long_title: row.long_title,
    assent_date: row.assent_date,
    publication_date: row.publication_date,
    commencement_date: row.commencement_date,
    repeal_date: row.repeal_date,
    last_amended_date: row.last_amended_date,
    current_version_date: row.current_version_date,
    status: row.status,
    is_current: row.is_current,
    legislation_kind: row.legislation_kind,
    source_url: legal.source_url,
    source_publisher: legal.source_publisher,
    treaty_type: row.treaty_type,
    treaty_status: row.treaty_status,
    signature_date: row.signature_date,
    ratification_date: row.ratification_date,
    entry_into_force_date: row.entry_into_force_date,
  } as LegislationDocument;
}

export async function getProvisions(legislationDocumentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_provisions")
    .select(`
      id,
      legal_provision_id,
      provision_type,
      provision_number,
      heading,
      body_text,
      body_html,
      sort_order,
      legal_provisions!inner(canonical_path)
    `)
    .eq("legislation_document_id", legislationDocumentId)
    .order("sort_order");

  if (error) {
    console.error("Failed to load legislation provisions", error);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    ...row,
    canonical_path: (
      Array.isArray(row.legal_provisions)
        ? row.legal_provisions[0]
        : row.legal_provisions
    )?.canonical_path,
  })) as LegislationProvision[];
}

export async function getAmendmentSchedule(
  legislationDocumentId: string,
): Promise<LegislationAmendmentGroup[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_amendment_groups")
    .select(`
      id,
      group_key,
      written_law_title,
      written_law_citation,
      target_legal_document_id,
      sort_order,
      source_line_start,
      source_line_end,
      target:legal_documents!legislation_amendment_groups_target_legal_document_id_fkey(
        slug,
        title
      ),
      items:legislation_amendment_items(
        id,
        item_key,
        provision_label,
        operation_type,
        amendment_text,
        amendment_html,
        sort_order,
        source_line_start,
        source_line_end
      )
    `)
    .eq("amending_legislation_document_id", legislationDocumentId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load amendment schedule", {
      legislationDocumentId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => {
    const target = Array.isArray(row.target) ? row.target[0] : row.target;

    return {
      id: row.id,
      group_key: row.group_key,
      written_law_title: row.written_law_title,
      written_law_citation: row.written_law_citation,
      target_legal_document_id: row.target_legal_document_id,
      target_document_slug: target?.slug || null,
      target_document_title: target?.title || null,
      sort_order: row.sort_order,
      source_line_start: row.source_line_start,
      source_line_end: row.source_line_end,
      items: (row.items || [])
        .map((item: any) => ({
          id: item.id,
          item_key: item.item_key,
          provision_label: item.provision_label,
          operation_type: item.operation_type,
          amendment_text: item.amendment_text,
          amendment_html: item.amendment_html,
          sort_order: item.sort_order,
          source_line_start: item.source_line_start,
          source_line_end: item.source_line_end,
        }))
        .sort((a: any, b: any) => a.sort_order - b.sort_order),
    };
  }) as LegislationAmendmentGroup[];
}

export async function getSection(
  legislationDocumentId: string,
  sectionNumber: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_provisions")
    .select(`
      id,
      legal_provision_id,
      provision_type,
      provision_number,
      heading,
      body_text,
      body_html,
      sort_order,
      legal_provisions!inner(canonical_path)
    `)
    .eq("legislation_document_id", legislationDocumentId)
    .eq("provision_type", "section")
    .eq("provision_number", sectionNumber)
    .maybeSingle();

  if (error) {
    console.error("Failed to load legislation section", error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as any;

  return {
    ...row,
    canonical_path: (
      Array.isArray(row.legal_provisions)
        ? row.legal_provisions[0]
        : row.legal_provisions
    )?.canonical_path,
  } as LegislationProvision;
}

export async function getVersions(legislationDocumentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_versions")
    .select("*")
    .eq("legislation_document_id", legislationDocumentId)
    .order("version_date", { ascending: false });

  if (error) {
    console.error("Failed to load legislation versions", error);
    throw new Error(error.message);
  }

  return data || [];
}
