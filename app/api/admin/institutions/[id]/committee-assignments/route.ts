import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-api";
import { isCurrentInstitutionService } from "@/lib/institutions/people-model";
import {
  committeeMembershipStatus,
  isCommitteeMemberTitle,
  isCurrentParliamentaryTerm,
  isNationalAssemblySpeakerTitle,
  isValidCommitteeDate,
  parliamentaryChamberForInstitution,
  type ParliamentaryChamber,
} from "@/lib/legislature/committees";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
type MembershipInput = {
  id?: unknown;
  leader_id?: unknown;
  position?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  sort_order?: unknown;
};
type StaffInput = {
  id?: unknown;
  leader_id?: unknown;
  name?: unknown;
  role_title?: unknown;
  email?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  sort_order?: unknown;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSITIONS = new Set(["chairperson", "vice_chairperson", "member"]);

function currentDateInKenya() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

function missingSupport(message: string) {
  return /does not exist|schema cache|could not find|PGRST204/i.test(message);
}

function supportError() {
  return NextResponse.json(
    {
      error: "Parliamentary committee assignments are not installed.",
      hint: "Apply 20261007_parliamentary_committees.sql and 20261009_committee_assignment_management.sql in Supabase.",
    },
    { status: 503 },
  );
}

async function getHouse(supabase: SupabaseClient, id: string) {
  const result = await supabase
    .from("institutions")
    .select("id,slug,name,official_name,record_kind")
    .eq("id", id)
    .maybeSingle();
  if (result.error) {
    return { response: NextResponse.json({ error: result.error.message }, { status: 500 }) };
  }
  if (!result.data || result.data.record_kind === "temporary_body") {
    return { response: NextResponse.json({ error: "Select an existing House institution." }, { status: 404 }) };
  }
  const chamber = parliamentaryChamberForInstitution(
    result.data.slug,
    `${result.data.name || ""} ${result.data.official_name || ""}`,
  );
  if (!chamber) {
    return { response: NextResponse.json({ error: "Committee assignments can only be managed on the National Assembly or Senate institution." }, { status: 400 }) };
  }
  return { house: result.data, chamber };
}

async function loadRows<T>(
  queryFactory: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await queryFactory(offset, offset + 999);
    if (result.error) return { rows: null, error: result.error };
    const page = result.data || [];
    rows.push(...page);
    if (page.length < 1000) return { rows, error: null };
  }
}

export async function GET(_request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Institution not found." }, { status: 404 });
  const checked = await getHouse(auth.supabase, id);
  if (checked.response) return checked.response;
  const { chamber } = checked;

  const committeesResult = await auth.supabase
    .from("parliamentary_committees")
    .select("id,chamber,category,name,slug,is_active,is_published,sort_order")
    .eq("chamber", chamber)
    .order("category")
    .order("sort_order")
    .order("name");
  if (committeesResult.error) return missingSupport(committeesResult.error.message) ? supportError() : NextResponse.json({ error: committeesResult.error.message }, { status: 500 });
  const rolesResult = await loadRows((from, to) => auth.supabase
    .from("leader_roles")
    .select(`id,leader_id,title,status,term_start_date,term_end_date,
      person:leaders!leader_roles_leader_id_fkey!inner(id,slug,first_name,other_names,surname,full_name,is_active)`)
    .eq("institution_id", id)
    .eq("person.is_active", true)
    .order("id")
    .range(from, to));
  if (rolesResult.error) return missingSupport(rolesResult.error.message) ? supportError() : NextResponse.json({ error: rolesResult.error.message }, { status: 500 });

  const committees = committeesResult.data || [];
  const committeeIds = committees.map((committee) => committee.id);
  const [membershipsResult, staffResult] = committeeIds.length
    ? await Promise.all([
        loadRows((from, to) => auth.supabase
          .from("parliamentary_committee_memberships")
          .select(`id,committee_id,leader_id,position,start_date,end_date,sort_order,
            person:leaders!parliamentary_committee_memberships_leader_id_fkey(id,slug,first_name,other_names,surname,full_name)`)
          .in("committee_id", committeeIds)
          .order("position")
          .order("sort_order")
          .range(from, to)),
        loadRows((from, to) => auth.supabase
          .from("parliamentary_committee_staff")
          .select(`id,committee_id,leader_id,name,role_title,email,start_date,end_date,sort_order,
            person:leaders!parliamentary_committee_staff_leader_id_fkey(id,slug,first_name,other_names,surname,full_name)`)
          .in("committee_id", committeeIds)
          .order("sort_order")
          .range(from, to)),
      ])
    : [{ rows: [], error: null }, { rows: [], error: null }];
  for (const result of [membershipsResult, staffResult]) {
    if (result.error) return missingSupport(result.error.message) ? supportError() : NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  const today = currentDateInKenya();
  const memberCandidates = new Map<string, { id: string; name: string; slug: string | null }>();
  const staffCandidates = new Map<string, { id: string; name: string; slug: string | null; title: string }>();
  for (const role of rolesResult.rows || []) {
    const person = Array.isArray(role.person) ? role.person[0] : role.person;
    if (!person?.id) continue;
    const roleService = {
      start: role.term_start_date,
      end: role.term_end_date,
      status: role.status,
    };
    if (!isCurrentInstitutionService(roleService, today)) continue;
    const candidate = {
      id: person.id,
      name: [person.first_name, person.other_names, person.surname].filter(Boolean).join(" ").trim() ||
        person.full_name || "Unnamed House official",
      slug: person.slug,
    };
    const isCommitteeLeader = isCommitteeMemberTitle(chamber, role.title) ||
      isNationalAssemblySpeakerTitle(chamber, role.title);
    if (isCommitteeLeader && isCurrentParliamentaryTerm(roleService, today)) {
      memberCandidates.set(person.id, candidate);
    } else if (!isCommitteeLeader) {
      staffCandidates.set(person.id, { ...candidate, title: role.title?.trim() || "" });
    }
  }
  for (const memberId of memberCandidates.keys()) {
    staffCandidates.delete(memberId);
  }

  return NextResponse.json({
    chamber,
    committees,
    memberships: membershipsResult.rows || [],
    staff: (staffResult.rows || []).map((row) => ({
      ...row,
      role_title: (row.leader_id && staffCandidates.get(row.leader_id)?.title) || row.role_title,
    })),
    member_candidates: [...memberCandidates.values()].sort((a, b) => a.name.localeCompare(b.name)),
    staff_candidates: [...staffCandidates.values()].sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: institutionId } = await context.params;
  if (!UUID.test(institutionId)) return NextResponse.json({ error: "Institution not found." }, { status: 404 });
  const checked = await getHouse(auth.supabase, institutionId);
  if (checked.response) return checked.response;
  const chamber: ParliamentaryChamber = checked.chamber;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const committeeId = String(body.committee_id || "").trim();
  if (!UUID.test(committeeId) || !Array.isArray(body.memberships) || !Array.isArray(body.staff)) {
    return NextResponse.json({ error: "Choose a committee and provide its member and secretariat records." }, { status: 400 });
  }

  const committeeResult = await auth.supabase
    .from("parliamentary_committees")
    .select("id,chamber,category,name,slug,description,mandate,established_date,dissolved_date,is_active,is_published,sort_order")
    .eq("id", committeeId)
    .eq("chamber", chamber)
    .maybeSingle();
  if (committeeResult.error) return missingSupport(committeeResult.error.message) ? supportError() : NextResponse.json({ error: committeeResult.error.message }, { status: 500 });
  const committee = committeeResult.data;
  if (!committee) return NextResponse.json({ error: "Committee not found for this House." }, { status: 404 });

  const today = currentDateInKenya();
  const memberships: {
    id: string; leader_id: string; position: string; start_date: string;
    end_date: string | null; sort_order: number;
  }[] = [];
  const membershipRecordIds = new Set<string>();
  const activeMemberIds = new Set<string>();
  const memberOrders = new Set<string>();
  const leadershipCounts = new Map<string, number>();
  for (const value of body.memberships as MembershipInput[]) {
    const rowId = String(value?.id || "").trim();
    const leaderId = String(value?.leader_id || "").trim();
    const position = String(value?.position || "");
    const startDate = String(value?.start_date || "").trim();
    const endDate = String(value?.end_date || "").trim() || null;
    const sortOrder = Number(value?.sort_order);
    if (!UUID.test(rowId) || membershipRecordIds.has(rowId) || !UUID.test(leaderId) || !POSITIONS.has(position)) {
      return NextResponse.json({ error: "Each House member assignment needs a valid person, record and committee position." }, { status: 400 });
    }
    membershipRecordIds.add(rowId);
    if (!startDate || !isValidCommitteeDate(startDate) || !isValidCommitteeDate(endDate) || (endDate && endDate < startDate)) {
      return NextResponse.json({ error: "Each committee member needs a valid start date; an end date must be valid and not before it." }, { status: 400 });
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) return NextResponse.json({ error: "Member order must be a whole number starting at 1." }, { status: 400 });
    const active = committee.is_active && committeeMembershipStatus(startDate, endDate, today) === "current";
    if (active && activeMemberIds.has(leaderId)) {
      return NextResponse.json({ error: "A member can have only one current assignment in this committee." }, { status: 400 });
    }
    const orderKey = `${position}:${sortOrder}`;
    if (active && memberOrders.has(orderKey)) return NextResponse.json({ error: "Display order must be unique within each committee position." }, { status: 400 });
    if (active) memberOrders.add(orderKey);
    if (active && position !== "member") {
      const count = (leadershipCounts.get(position) || 0) + 1;
      leadershipCounts.set(position, count);
      if (count > 1) return NextResponse.json({ error: `Only one current ${position.replace("_", "-")} can be assigned.` }, { status: 400 });
    }
    if (active) activeMemberIds.add(leaderId);
    memberships.push({ id: rowId, leader_id: leaderId, position, start_date: startDate, end_date: endDate, sort_order: sortOrder });
  }

  const currentMemberIds = [...new Set(memberships
    .filter((row) => committee.is_active && committeeMembershipStatus(row.start_date, row.end_date, today) === "current")
    .map((row) => row.leader_id))];
  if (currentMemberIds.length) {
    const roles = await auth.supabase
      .from("leader_roles")
      .select(`leader_id,title,status,term_start_date,term_end_date,
        person:leaders!leader_roles_leader_id_fkey!inner(is_active)`)
      .eq("institution_id", institutionId)
      .eq("person.is_active", true)
      .in("leader_id", currentMemberIds);
    if (roles.error) return NextResponse.json({ error: roles.error.message }, { status: 500 });
    const validMembers = new Set((roles.data || [])
      .filter((role) => {
        const person = Array.isArray(role.person) ? role.person[0] : role.person;
        const term = { start: role.term_start_date, end: role.term_end_date, status: role.status };
        return person?.is_active &&
          (isCommitteeMemberTitle(chamber, role.title) ||
            isNationalAssemblySpeakerTitle(chamber, role.title)) &&
          isCurrentInstitutionService(term, today) &&
          isCurrentParliamentaryTerm(term, today);
      })
      .map((role) => role.leader_id));
    if (currentMemberIds.some((memberId) => !validMembers.has(memberId))) {
      return NextResponse.json({ error: "Current committee assignments must be current MPs or Senators from this House, or the National Assembly Speaker." }, { status: 400 });
    }
  }

  const staff: {
    id: string; leader_id: string | null; name: string; role_title: string;
    email: string | null; start_date: string | null; end_date: string | null; sort_order: number;
  }[] = [];
  const staffIds = new Set<string>();
  const activeStaffIds = new Set<string>();
  for (const value of body.staff as StaffInput[]) {
    const rowId = String(value?.id || "").trim();
    const leaderId = String(value?.leader_id || "").trim() || null;
    const name = String(value?.name || "").trim();
    const roleTitle = String(value?.role_title || "").trim();
    const startDate = String(value?.start_date || "").trim() || null;
    const endDate = String(value?.end_date || "").trim() || null;
    const sortOrder = Number(value?.sort_order);
    if (!UUID.test(rowId) || staffIds.has(rowId) || (leaderId && !UUID.test(leaderId)) ||
        !name || name.length > 200 || !roleTitle || roleTitle.length > 200) {
      return NextResponse.json({ error: "Each secretariat record needs a unique record, name and role." }, { status: 400 });
    }
    if (!isValidCommitteeDate(startDate) || !isValidCommitteeDate(endDate) || (startDate && endDate && endDate < startDate)) {
      return NextResponse.json({ error: "Secretariat dates are optional, but any date entered must be valid and the end date cannot be before the start date." }, { status: 400 });
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) return NextResponse.json({ error: "Secretariat order must be a whole number starting at 1." }, { status: 400 });
    if (staffIds.has(rowId)) return NextResponse.json({ error: "Secretariat record IDs must be unique." }, { status: 400 });
    staffIds.add(rowId);
    if (committee.is_active && leaderId &&
      committeeMembershipStatus(startDate, endDate, today) === "current") {
      if (activeStaffIds.has(leaderId)) {
        return NextResponse.json({ error: "A House staff member can have only one current secretariat role in this committee." }, { status: 400 });
      }
      activeStaffIds.add(leaderId);
    }
    staff.push({ id: rowId, leader_id: leaderId, name, role_title: roleTitle, email: String(value?.email || "").trim() || null, start_date: startDate, end_date: endDate, sort_order: sortOrder });
  }

  const currentStaffIds = [...new Set(staff
    .filter((row) => committee.is_active && committeeMembershipStatus(row.start_date, row.end_date, today) === "current")
    .map((row) => row.leader_id)
    .filter((leaderId): leaderId is string => Boolean(leaderId)))];
  if (currentStaffIds.length) {
    const houseRoles = await auth.supabase
      .from("leader_roles")
      .select(`leader_id,status,term_start_date,term_end_date,
        title,person:leaders!leader_roles_leader_id_fkey!inner(is_active)`)
      .eq("institution_id", institutionId)
      .eq("person.is_active", true)
      .in("leader_id", currentStaffIds);
    if (houseRoles.error) return NextResponse.json({ error: houseRoles.error.message }, { status: 500 });
    const staffRoleIds = new Set<string>();
    const memberRoleIds = new Set<string>();
    for (const role of houseRoles.data || []) {
      if (
        isCommitteeMemberTitle(chamber, role.title) ||
        isNationalAssemblySpeakerTitle(chamber, role.title)
      ) {
        memberRoleIds.add(role.leader_id);
        continue;
      }
      const person = Array.isArray(role.person) ? role.person[0] : role.person;
      if (person?.is_active && isCurrentInstitutionService(
        { start: role.term_start_date, end: role.term_end_date, status: role.status },
        today,
      )) {
        staffRoleIds.add(role.leader_id);
      }
    }
    const validStaffIds = new Set([...staffRoleIds]
      .filter((leaderId) => !memberRoleIds.has(leaderId)));
    if (currentStaffIds.some((leaderId) => !validStaffIds.has(leaderId))) {
      return NextResponse.json({ error: "Current secretariat staff must be active people assigned to this House institution." }, { status: 400 });
    }
  }

  const [memberCollisions, staffCollisions] = await Promise.all([
    memberships.length
      ? auth.supabase.from("parliamentary_committee_memberships").select("id,committee_id").in("id", memberships.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
    staff.length
      ? auth.supabase.from("parliamentary_committee_staff").select("id,committee_id").in("id", staff.map((row) => row.id))
      : Promise.resolve({ data: [], error: null }),
  ]);
  for (const result of [memberCollisions, staffCollisions]) {
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (result.data?.some((row) => row.committee_id !== committeeId)) {
      return NextResponse.json({ error: "A submitted assignment belongs to another committee." }, { status: 400 });
    }
  }

  // The public title held in the House is authoritative for linked staff.
  const linkedStaffIds = [...new Set(staff.map((row) => row.leader_id).filter((leaderId): leaderId is string => Boolean(leaderId)))];
  if (linkedStaffIds.length) {
    const titles = await auth.supabase
      .from("leader_roles")
      .select("leader_id,title,status,term_start_date,term_end_date")
      .eq("institution_id", institutionId)
      .in("leader_id", linkedStaffIds);
    if (titles.error) return NextResponse.json({ error: titles.error.message }, { status: 500 });
    const titleByLeader = new Map<string, string>();
    for (const role of titles.data || []) {
      const title = role.title?.trim();
      if (!title) continue;
      const current = isCurrentInstitutionService({ start: role.term_start_date, end: role.term_end_date, status: role.status }, today);
      if (current || !titleByLeader.has(role.leader_id)) titleByLeader.set(role.leader_id, title);
    }
    for (const row of staff) {
      const title = row.leader_id ? titleByLeader.get(row.leader_id) : null;
      if (title) row.role_title = title.slice(0, 200);
    }
  }

  const save = await auth.supabase.rpc("save_parliamentary_committee_assignments", {
    p_committee_id: committeeId,
    p_memberships: memberships,
    p_staff: staff,
  });
  if (save.error) {
    if (missingSupport(save.error.message)) return supportError();
    return NextResponse.json({ error: save.error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
