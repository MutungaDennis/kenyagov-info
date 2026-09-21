import { createClient } from "@/lib/supabase/server";

export async function getAdminDocuments(q?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("documents")
    .select(
      "id,title,slug,publication_date,status,review_status,published_at,created_at,document_type:document_types(name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (q?.trim()) query = query.ilike("title", `%${q.trim()}%`);

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: data ?? [], total: count ?? 0 };
}

export async function getAdminDocument(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*,document_type:document_types(id,name,slug),series:document_series(id,name,slug)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAdminDocumentFiles(documentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_files")
    .select("*")
    .eq("document_id", documentId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminDocumentVersions(documentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("is_current", { ascending: false })
    .order("version_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminDocumentRelationships(documentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_relationships")
    .select("*")
    .eq("source_document_id", documentId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const documentIds = rows.map((r: any) => r.target_document_id).filter(Boolean);
  const lawIds = rows.map((r: any) => r.target_legal_document_id).filter(Boolean);
  const institutionIds = rows.map((r: any) => r.target_institution_id).filter(Boolean);

  const [docs, laws, institutions] = await Promise.all([
    documentIds.length
      ? supabase.from("documents").select("id,title,slug").in("id", documentIds)
      : Promise.resolve({ data: [], error: null } as any),
    lawIds.length
      ? supabase.from("legal_documents").select("id,title,citation,slug").in("id", lawIds)
      : Promise.resolve({ data: [], error: null } as any),
    institutionIds.length
      ? supabase.from("institutions").select("id,name,short_name,slug").in("id", institutionIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (docs.error) throw docs.error;
  if (laws.error) throw laws.error;
  if (institutions.error) throw institutions.error;

  const docMap = new Map((docs.data ?? []).map((x: any) => [x.id, x.title]));
  const lawMap = new Map((laws.data ?? []).map((x: any) => [x.id, x.title]));
  const institutionMap = new Map((institutions.data ?? []).map((x: any) => [x.id, x.name]));

  return rows.map((row: any) => {
    let targetType = "Unknown";
    let targetLabel = "—";
    if (row.target_document_id) {
      targetType = "Document";
      targetLabel = docMap.get(row.target_document_id) ?? row.target_document_id;
    } else if (row.target_legal_document_id) {
      targetType = "Law / Constitution";
      targetLabel = lawMap.get(row.target_legal_document_id) ?? row.target_legal_document_id;
    } else if (row.target_legal_provision_id) {
      targetType = "Legal provision";
      targetLabel = row.target_legal_provision_id;
    } else if (row.target_gazette_id) {
      targetType = "Gazette";
      targetLabel = row.target_gazette_id;
    } else if (row.target_institution_id) {
      targetType = "Institution";
      targetLabel = institutionMap.get(row.target_institution_id) ?? row.target_institution_id;
    }
    return { ...row, targetType, targetLabel };
  });
}
