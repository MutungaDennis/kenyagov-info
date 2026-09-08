import { createClient } from "@/lib/supabase/server";
import type { ConstitutionPublicInlineLink } from "@/lib/constitution/render-linked-html";

function personName(row: any): string | null {
  if (!row) return null;

  return (
    [row.first_name, row.other_names, row.surname]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    row.full_name ||
    null
  );
}

export async function getPublicConstitutionInlineLinks(
  articleId: string,
): Promise<ConstitutionPublicInlineLink[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("constitution_inline_links")
    .select(`
      id,
      article_id,
      link_type,
      selected_text,
      historical_label,
      semantic_role,
      verification_status,
      leader_id,
      mca_id,
      leader_role_id,
      institution_id,
      target_document_id,
      target_provision_id,
      target_url,
      target_label,
      external_source_name
    `)
    .eq("article_id", articleId)
    .eq("verification_status", "Verified")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Could not load public Constitution inline links", {
      articleId,
      message: error.message,
    });
    return [];
  }

  const links = rows || [];

  const leaderIds = Array.from(
    new Set(links.map((row: any) => row.leader_id).filter(Boolean)),
  );
  const mcaIds = Array.from(
    new Set(links.map((row: any) => row.mca_id).filter(Boolean)),
  );
  const institutionIds = Array.from(
    new Set(links.map((row: any) => row.institution_id).filter(Boolean)),
  );
  const documentIds = Array.from(
    new Set(links.map((row: any) => row.target_document_id).filter(Boolean)),
  );
  const provisionIds = Array.from(
    new Set(links.map((row: any) => row.target_provision_id).filter(Boolean)),
  );

  const [leadersResult, mcasResult, institutionsResult, documentsResult, provisionsResult] =
    await Promise.all([
      leaderIds.length
        ? supabase
            .from("leaders")
            .select("id, slug, full_name, first_name, other_names, surname")
            .in("id", leaderIds)
        : Promise.resolve({ data: [], error: null }),
      mcaIds.length
        ? supabase
            .from("mcas")
            .select("id, slug, first_name, other_names, surname")
            .in("id", mcaIds)
        : Promise.resolve({ data: [], error: null }),
      institutionIds.length
        ? supabase
            .from("institutions")
            .select("id, slug, name, short_name")
            .in("id", institutionIds)
        : Promise.resolve({ data: [], error: null }),
      documentIds.length
        ? supabase
            .from("legal_documents")
            .select("id, document_type, title, short_title, citation, slug")
            .in("id", documentIds)
        : Promise.resolve({ data: [], error: null }),
      provisionIds.length
        ? supabase
            .from("legal_provisions")
            .select("id, document_id, number_label, heading, canonical_path")
            .in("id", provisionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const hydrateError =
    leadersResult.error ||
    mcasResult.error ||
    institutionsResult.error ||
    documentsResult.error ||
    provisionsResult.error;

  if (hydrateError) {
    console.error("Could not hydrate public Constitution inline links", {
      articleId,
      message: hydrateError.message,
    });
    return [];
  }

  const leaderMap = new Map((leadersResult.data || []).map((row: any) => [row.id, row]));
  const mcaMap = new Map((mcasResult.data || []).map((row: any) => [row.id, row]));
  const institutionMap = new Map(
    (institutionsResult.data || []).map((row: any) => [row.id, row]),
  );
  const documentMap = new Map(
    (documentsResult.data || []).map((row: any) => [row.id, row]),
  );
  const provisionMap = new Map(
    (provisionsResult.data || []).map((row: any) => [row.id, row]),
  );

  return links
    .map((row: any): ConstitutionPublicInlineLink | null => {
      if (row.link_type === "person") {
        const person = row.leader_id
          ? leaderMap.get(row.leader_id)
          : row.mca_id
            ? mcaMap.get(row.mca_id)
            : null;

        if (!person?.slug) return null;

        return {
          id: row.id,
          link_type: "person",
          selected_text: row.selected_text,
          semantic_role: row.semantic_role,
          href: `/leaders/${person.slug}`,
          target_name:
            personName(person) || row.historical_label || row.selected_text,
        };
      }

      if (row.link_type === "institution") {
        const institution = row.institution_id
          ? institutionMap.get(row.institution_id)
          : null;

        if (!institution?.slug) return null;

        return {
          id: row.id,
          link_type: "institution",
          selected_text: row.selected_text,
          semantic_role: row.semantic_role,
          href: `/institutions/${institution.slug}`,
          target_name:
            institution.short_name || institution.name || row.selected_text,
        };
      }

      if (row.link_type === "law") {
        const document = row.target_document_id
          ? documentMap.get(row.target_document_id)
          : null;
        const provision = row.target_provision_id
          ? provisionMap.get(row.target_provision_id)
          : null;

        if (!document) return null;

        const href =
          provision?.canonical_path ||
          (document.slug ? `/acts/parliament/${document.slug}` : null);

        if (!href) return null;

        return {
          id: row.id,
          link_type: "law",
          selected_text: row.selected_text,
          semantic_role: row.semantic_role,
          href,
          target_name:
            provision?.number_label ||
            document.short_title ||
            document.title ||
            row.selected_text,
        };
      }

      if (row.link_type === "internal") {
        if (!row.target_url) return null;

        return {
          id: row.id,
          link_type: "internal",
          selected_text: row.selected_text,
          semantic_role: row.semantic_role,
          href: row.target_url,
          target_name: row.target_label || row.selected_text,
        };
      }

      if (row.link_type === "external") {
        if (!row.target_url) return null;

        return {
          id: row.id,
          link_type: "external",
          selected_text: row.selected_text,
          semantic_role: row.semantic_role,
          href: row.target_url,
          target_name: row.target_label || row.selected_text,
          external_source_name: row.external_source_name || null,
        };
      }

      return null;
    })
    .filter((link): link is ConstitutionPublicInlineLink => Boolean(link));
}