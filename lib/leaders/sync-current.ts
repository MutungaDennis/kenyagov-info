/**
 * Sync leaders.* snapshot columns from Active concurrent roles.
 * Multiple current positions are allowed; the primary role drives list fields.
 */

import { resolvePrimaryRole, type LeaderRoleLike } from "@/lib/leaders/display";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseSupabase = { from: (table: string) => any };

export async function syncLeaderSnapshotFromActiveRoles(
  supabase: LooseSupabase,
  leaderId: string,
): Promise<void> {
  const { data: roles, error } = await supabase
    .from("leader_roles")
    .select(
      "id, title, organization, constituency, county, ward, party, level, term_start_date, term_end_date, status",
    )
    .eq("leader_id", leaderId);

  if (error || !roles?.length) {
    // No roles: leave snapshot as-is (admin may clear later)
    return;
  }

  const list = roles as LeaderRoleLike[];
  const { role } = resolvePrimaryRole(list);
  if (!role) return;

  await supabase
    .from("leaders")
    .update({
      title: role.title || null,
      current_party: role.party || null,
      current_constituency: role.constituency || null,
      current_county: role.county || null,
      current_organization: role.organization || null,
      level: role.level || null,
    })
    .eq("id", leaderId);
}
