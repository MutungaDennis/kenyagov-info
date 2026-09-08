import { createClient } from "@/lib/supabase/server";

export async function getPublicLegislationInlineLinks(provisionId: string) {
  const supabase = await createClient();

  const { data: links, error } = await supabase
    .from("legislation_inline_links")
    .select("*")
    .eq("provision_id", provisionId)
    .eq("verification_status", "Verified")
    .order("created_at");

  if (error) {
    console.error("Failed to load legislation inline links", error);
    return [];
  }

  const rows = links || [];
  const leaderIds = rows.map((x: any) => x.leader_id).filter(Boolean);
  const mcaIds = rows.map((x: any) => x.mca_id).filter(Boolean);
  const institutionIds = rows.map((x: any) => x.institution_id).filter(Boolean);
  const documentIds = rows.map((x: any) => x.target_document_id).filter(Boolean);
  const provisionIds = rows.map((x: any) => x.target_provision_id).filter(Boolean);

  const [leaders, mcas, institutions, documents, provisions] = await Promise.all([
    leaderIds.length
      ? supabase.from("leaders").select("id,slug,full_name,first_name,other_names,surname").in("id", leaderIds)
      : Promise.resolve({ data: [] as any[] }),
    mcaIds.length
      ? supabase.from("mcas").select("id,slug,first_name,other_names,surname").in("id", mcaIds)
      : Promise.resolve({ data: [] as any[] }),
    institutionIds.length
      ? supabase.from("institutions").select("id,slug,name,short_name").in("id", institutionIds)
      : Promise.resolve({ data: [] as any[] }),
    documentIds.length
      ? supabase.from("legal_documents").select("id,title,short_title,citation,slug,document_type").in("id", documentIds)
      : Promise.resolve({ data: [] as any[] }),
    provisionIds.length
      ? supabase.from("legal_provisions").select("id,number_label,heading,canonical_path").in("id", provisionIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const leaderMap = new Map((leaders.data || []).map((x: any) => [x.id, x]));
  const mcaMap = new Map((mcas.data || []).map((x: any) => [x.id, x]));
  const institutionMap = new Map((institutions.data || []).map((x: any) => [x.id, x]));
  const documentMap = new Map((documents.data || []).map((x: any) => [x.id, x]));
  const provisionMap = new Map((provisions.data || []).map((x: any) => [x.id, x]));

  return rows.map((row: any) => {
    let target_name: string | null = null;
    let target_href: string | null = null;

    if (row.link_type === "person") {
      const person = row.leader_id
        ? leaderMap.get(row.leader_id)
        : mcaMap.get(row.mca_id);

      if (person) {
        target_name =
          person.full_name ||
          [person.first_name, person.other_names, person.surname]
            .filter(Boolean)
            .join(" ");
        target_href = person.slug ? `/leaders/${person.slug}` : null;
      }
    }

    if (row.link_type === "institution") {
      const institution = institutionMap.get(row.institution_id);
      target_name = institution?.short_name || institution?.name || null;
      target_href = institution?.slug
        ? `/government/institutions/${institution.slug}`
        : null;
    }

    if (row.link_type === "law") {
      const provision = provisionMap.get(row.target_provision_id);
      const document = documentMap.get(row.target_document_id);

      target_name =
        provision?.number_label ||
        document?.short_title ||
        document?.title ||
        null;

      target_href =
        provision?.canonical_path ||
        (document?.slug
          ? document.document_type === "constitution"
            ? "/constitution"
            : `/legislation/acts/${document.slug}`
          : null);
    }

    if (row.link_type === "internal" || row.link_type === "external") {
      target_name = row.target_label || row.selected_text;
      target_href = row.target_url || null;
    }

    return { ...row, target_name, target_href };
  });
}
