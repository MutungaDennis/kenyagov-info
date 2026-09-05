import { createClient } from "@/lib/supabase/server";

export async function getGazetteNoticeContext(noticeId: string) {
  const supabase = await createClient();

  const [people, institutions, outgoing, incoming, corrigenda] = await Promise.all([
    supabase
      .from("gazette_notice_people")
      .select(`
        id, relationship_type, capacity_title, position_title,
        effective_from, effective_to, fiduciary_authority, fiduciary_basis,
        leader_role_id,
        leaders(id, slug, full_name, first_name, other_names, surname, title, current_organization),
        mcas(id, slug, first_name, other_names, surname, assembly_role, status),
        institutions(id, slug, name, short_name)
      `)
      .eq("notice_id", noticeId)
      .eq("verification_status", "Verified")
      .order("created_at", { ascending: true }),

    supabase
      .from("gazette_notice_institutions")
      .select(`
        id, relationship_type,
        institutions(id, slug, name, short_name, institution_type, government_level)
      `)
      .eq("notice_id", noticeId)
      .eq("verification_status", "Verified")
      .order("created_at", { ascending: true }),

    supabase
      .from("gazette_notice_relationships")
      .select(`
        id, relationship_type, effective_date, description,
        target:gazette_notices!gazette_notice_relationships_target_notice_id_fkey(
          id, notice_number, title,
          gazette_issues(year, volume, issue_number, date)
        )
      `)
      .eq("source_notice_id", noticeId)
      .eq("verification_status", "Verified")
      .order("created_at", { ascending: true }),

    supabase
      .from("gazette_notice_relationships")
      .select(`
        id, relationship_type, effective_date, description,
        source:gazette_notices!gazette_notice_relationships_source_notice_id_fkey(
          id, notice_number, title,
          gazette_issues(year, volume, issue_number, date)
        )
      `)
      .eq("target_notice_id", noticeId)
      .eq("verification_status", "Verified")
      .order("created_at", { ascending: true }),

    supabase
      .from("gazette_corrigenda_entries")
      .select(`
        id, sequence_no, relationship_type, affected_field, original_text,
        corrected_text, entry_text, effective_date,
        gazette_issue_sections(
          id, title,
          gazette_issues(year, volume, issue_number, date)
        )
      `)
      .eq("target_notice_id", noticeId)
      .eq("verification_status", "Verified")
      .order("effective_date", { ascending: true }),
  ]);

  return {
    people: people.data || [],
    institutions: institutions.data || [],
    outgoing: outgoing.data || [],
    incoming: incoming.data || [],
    corrigenda: corrigenda.data || [],
  };
}
