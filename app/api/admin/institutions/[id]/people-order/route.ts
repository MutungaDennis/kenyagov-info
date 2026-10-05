import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/admin-api";
import { isCurrentInstitutionService } from "@/lib/institutions/people-model";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
type LevelInput = {
  id?: unknown;
  name?: unknown;
  sort_order?: unknown;
  parent_level_id?: unknown;
};
type AssignmentInput = {
  person_id?: unknown;
  level_id?: unknown;
  order?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function missingSupport(message: string) {
  return /does not exist|schema cache|could not find|PGRST204/i.test(message);
}

function currentDateInKenya() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

function supportError() {
  return NextResponse.json(
    {
      error: "Institution people ordering is not installed.",
      hint: "Apply 20261005_institution_people_order.sql, then 20261006_institution_people_subcategories.sql in Supabase.",
    },
    { status: 503 },
  );
}

async function institutionCheck(supabase: SupabaseClient, id: string) {
  const result = await supabase
    .from("institutions")
    .select("id,record_kind")
    .eq("id", id)
    .maybeSingle();
  if (result.error) {
    return { response: NextResponse.json({ error: result.error.message }, { status: 500 }) };
  }
  if (!result.data || result.data.record_kind === "temporary_body") {
    return {
      response: NextResponse.json(
        { error: "Select an existing institution to manage its current officials." },
        { status: 404 },
      ),
    };
  }
  return {};
}

export async function GET(_request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const checked = await institutionCheck(auth.supabase, id);
  if (checked.response) return checked.response;

  const [levelsResult, assignmentsResult, rolesResult] = await Promise.all([
    auth.supabase
      .from("institution_people_levels")
      .select("id,name,sort_order,parent_level_id")
      .eq("institution_id", id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    auth.supabase
      .from("institution_people_assignments")
      .select("leader_id,level_id,sort_order")
      .eq("institution_id", id),
    auth.supabase
      .from("leader_roles")
      .select(`id,leader_id,title,status,term_start_date,term_end_date,display_priority,rank_order,
        person:leaders!leader_roles_leader_id_fkey!inner(id,full_name,first_name,other_names,surname,is_active)`)
      .eq("institution_id", id)
      .eq("person.is_active", true),
  ]);

  for (const result of [levelsResult, assignmentsResult, rolesResult]) {
    if (result.error) {
      if (missingSupport(result.error.message)) return supportError();
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
  }

  const today = currentDateInKenya();
  const rolesByPerson = new Map<string, {
    id: string;
    name: string;
    title: string;
    priority: number | null;
  }>();
  for (const role of rolesResult.data || []) {
    const person = Array.isArray(role.person) ? role.person[0] : role.person;
    if (
      !person ||
      !isCurrentInstitutionService(
        { start: role.term_start_date, end: role.term_end_date, status: role.status },
        today,
      )
    ) {
      continue;
    }
    const personId = String(person.id);
    const current = rolesByPerson.get(personId);
    const name =
      [person.first_name, person.other_names, person.surname]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      String(person.full_name || "Unnamed official");
    if (!current) {
      rolesByPerson.set(personId, {
        id: personId,
        name,
        title: String(role.title || "Role not recorded"),
        priority: role.display_priority ?? role.rank_order ?? null,
      });
      continue;
    }
    current.title = [...new Set([...current.title.split(" · "), String(role.title || "Role not recorded")])].join(" · ");
    const priority = role.display_priority ?? role.rank_order ?? null;
    if (priority != null && (current.priority == null || priority < current.priority)) {
      current.priority = priority;
    }
  }

  const assignmentsByPerson = new Map(
    (assignmentsResult.data || []).map((row) => [row.leader_id, row]),
  );
  const people = [...rolesByPerson.values()]
    .map((person) => {
      const assignment = assignmentsByPerson.get(person.id);
      return {
        ...person,
        level_id: assignment?.level_id || "",
        order: assignment?.sort_order == null ? "" : assignment.sort_order,
      };
    })
    .sort(
      (a, b) =>
        ((a.priority as number | null) ?? Number.MAX_SAFE_INTEGER) -
          ((b.priority as number | null) ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name),
    );

  return NextResponse.json({
    levels: levelsResult.data || [],
    people,
  });
}

export async function PUT(request: NextRequest, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const checked = await institutionCheck(auth.supabase, id);
  if (checked.response) return checked.response;

  let body: { levels?: unknown; assignments?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!Array.isArray(body.levels) || !Array.isArray(body.assignments)) {
    return NextResponse.json(
      { error: "Provide both the institution levels and current-official assignments." },
      { status: 400 },
    );
  }

  const levels: {
    id: string;
    institution_id: string;
    name: string;
    sort_order: number;
    parent_level_id: string | null;
  }[] = [];
  const levelIds = new Set<string>();
  const levelNames = new Set<string>();
  const levelOrders = new Set<string>();
  for (const value of body.levels as LevelInput[]) {
    const levelId = String(value?.id || "").trim();
    const name = String(value?.name || "").trim();
    const sortOrder = Number(value?.sort_order);
    const parentLevelId = value?.parent_level_id
      ? String(value.parent_level_id).trim()
      : null;
    if (!UUID_PATTERN.test(levelId)) {
      return NextResponse.json({ error: "Each level must have a valid ID." }, { status: 400 });
    }
    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Each level needs a name of no more than 100 characters." },
        { status: 400 },
      );
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
      return NextResponse.json({ error: "Level order must be a whole number starting at 1." }, { status: 400 });
    }
    const nameKey = name.toLocaleLowerCase();
    if (levelIds.has(levelId) || levelNames.has(nameKey)) {
      return NextResponse.json(
        { error: "Level IDs and names must be unique." },
        { status: 400 },
      );
    }
    if (parentLevelId && (!UUID_PATTERN.test(parentLevelId) || parentLevelId === levelId)) {
      return NextResponse.json(
        { error: "Choose a different existing main level for this subcategory." },
        { status: 400 },
      );
    }
    const orderKey = `${parentLevelId || "root"}:${sortOrder}`;
    if (levelOrders.has(orderKey)) {
      return NextResponse.json(
        { error: "Display order must be unique within each main level or subcategory group." },
        { status: 400 },
      );
    }
    levelIds.add(levelId);
    levelNames.add(nameKey);
    levelOrders.add(orderKey);
    levels.push({
      id: levelId,
      institution_id: id,
      name,
      sort_order: sortOrder,
      parent_level_id: parentLevelId,
    });
  }

  const levelsById = new Map(levels.map((level) => [level.id, level]));
  for (const level of levels) {
    if (!level.parent_level_id) continue;
    const parent = levelsById.get(level.parent_level_id);
    if (!parent) {
      return NextResponse.json(
        { error: "Each subcategory must belong to a main level in this institution." },
        { status: 400 },
      );
    }
    if (parent.parent_level_id) {
      return NextResponse.json(
        { error: "Subcategories can only be one level deep." },
        { status: 400 },
      );
    }
  }

  const assignments: { person_id: string; level_id: string | null; order: number | null }[] = [];
  const personIds = new Set<string>();
  const personOrders = new Set<string>();
  for (const value of body.assignments as AssignmentInput[]) {
    const personId = String(value?.person_id || "").trim();
    const levelId = value?.level_id ? String(value.level_id).trim() : null;
    const order = value?.order == null || value.order === "" ? null : Number(value.order);
    if (!UUID_PATTERN.test(personId) || personIds.has(personId)) {
      return NextResponse.json({ error: "Official assignments must have unique, valid person IDs." }, { status: 400 });
    }
    if (levelId && (!UUID_PATTERN.test(levelId) || !levelIds.has(levelId))) {
      return NextResponse.json({ error: "An official must be assigned to a level in this institution." }, { status: 400 });
    }
    if (levelId && (!Number.isInteger(order) || (order as number) < 1)) {
      return NextResponse.json(
        { error: "Enter a whole-number display order starting at 1 for each assigned official." },
        { status: 400 },
      );
    }
    if (levelId) {
      const orderKey = `${levelId}:${order}`;
      if (personOrders.has(orderKey)) {
        return NextResponse.json(
          { error: "Each official in a level must have a unique display order." },
          { status: 400 },
        );
      }
      personOrders.add(orderKey);
    }
    personIds.add(personId);
    assignments.push({ person_id: personId, level_id: levelId, order: levelId ? order : null });
  }

  const existingLevelsResult = await auth.supabase
    .from("institution_people_levels")
    .select("id,parent_level_id,name")
    .eq("institution_id", id);
  if (existingLevelsResult.error) {
    if (missingSupport(existingLevelsResult.error.message)) return supportError();
    return NextResponse.json({ error: existingLevelsResult.error.message }, { status: 500 });
  }

  const submittedLevelIds = levels.map((level) => level.id);
  const submittedLevelIdSet = new Set(submittedLevelIds);
  const submittedLevelNames = new Set(
    levels.map((level) => level.name.toLocaleLowerCase()),
  );
  const levelsToRemove = (existingLevelsResult.data || []).filter(
    (level) => !submittedLevelIdSet.has(level.id),
  );
  const removedNameCollisions = levelsToRemove.filter((level) =>
    submittedLevelNames.has(level.name.toLocaleLowerCase()),
  );

  if (submittedLevelIds.length) {
    const collisions = await auth.supabase
      .from("institution_people_levels")
      .select("id,institution_id,parent_level_id")
      .in("id", submittedLevelIds);
    if (collisions.error) {
      if (missingSupport(collisions.error.message)) return supportError();
      return NextResponse.json({ error: collisions.error.message }, { status: 500 });
    }
    if (collisions.data?.some((level) => level.institution_id !== id)) {
      return NextResponse.json({ error: "A level ID belongs to another institution." }, { status: 400 });
    }
  }
  if (assignments.length) {
    const submittedPersonIds = assignments.map((assignment) => assignment.person_id);
    const currentRoles = await auth.supabase
      .from("leader_roles")
      .select(`leader_id,status,term_start_date,term_end_date,
        person:leaders!leader_roles_leader_id_fkey!inner(is_active)`)
      .eq("institution_id", id)
      .eq("person.is_active", true)
      .in("leader_id", submittedPersonIds);
    if (currentRoles.error) {
      return NextResponse.json({ error: currentRoles.error.message }, { status: 500 });
    }
    const today = currentDateInKenya();
    const currentPeople = new Set(
      (currentRoles.data || [])
        .filter((role) =>
          isCurrentInstitutionService(
            { start: role.term_start_date, end: role.term_end_date, status: role.status },
            today,
          ),
        )
        .map((role) => role.leader_id),
    );
    if (submittedPersonIds.some((personId) => !currentPeople.has(personId))) {
      return NextResponse.json({ error: "One or more officials do not currently serve this institution." }, { status: 400 });
    }
  }

  for (const existing of removedNameCollisions) {
    const removeLevel = await auth.supabase
      .from("institution_people_levels")
      .delete()
      .eq("id", existing.id)
      .eq("institution_id", id);
    if (removeLevel.error) {
      return NextResponse.json(
        { error: `Could not replace a removed category: ${removeLevel.error.message}` },
        { status: 500 },
      );
    }
  }

  for (const group of [
    levels.filter((level) => !level.parent_level_id),
    levels.filter((level) => level.parent_level_id),
  ]) {
    if (group.length) {
      const saveLevels = await auth.supabase
        .from("institution_people_levels")
        .upsert(
          group.map((level) => ({ ...level, updated_at: new Date().toISOString() })),
          { onConflict: "id" },
        );
      if (saveLevels.error) {
        if (missingSupport(saveLevels.error.message)) return supportError();
        if (saveLevels.error.code === "23505") {
          return NextResponse.json(
            {
              error:
                "A category or subcategory with this name already exists for the institution. Use a unique name or remove the existing category before saving.",
            },
            { status: 409 },
          );
        }
        return NextResponse.json({ error: saveLevels.error.message }, { status: 500 });
      }
    }
  }

  const assignmentsToSave = assignments.filter((assignment) => assignment.level_id);
  if (assignmentsToSave.length) {
    const saveAssignments = await auth.supabase
      .from("institution_people_assignments")
      .upsert(
        assignmentsToSave.map((assignment) => ({
          institution_id: id,
          leader_id: assignment.person_id,
          level_id: assignment.level_id,
          sort_order: assignment.order,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "institution_id,leader_id" },
      );
    if (saveAssignments.error) {
      if (missingSupport(saveAssignments.error.message)) return supportError();
      return NextResponse.json({ error: saveAssignments.error.message }, { status: 500 });
    }
  }

  const clearPersonIds = assignments
    .filter((assignment) => !assignment.level_id)
    .map((assignment) => assignment.person_id);
  if (clearPersonIds.length) {
    const clearAssignments = await auth.supabase
      .from("institution_people_assignments")
      .delete()
      .eq("institution_id", id)
      .in("leader_id", clearPersonIds);
    if (clearAssignments.error) {
      return NextResponse.json({ error: clearAssignments.error.message }, { status: 500 });
    }
  }

  const removedNameCollisionIds = new Set(
    removedNameCollisions.map((level) => level.id),
  );
  for (const existing of levelsToRemove) {
    if (removedNameCollisionIds.has(existing.id)) continue;
    const removeLevel = await auth.supabase
      .from("institution_people_levels")
      .delete()
      .eq("id", existing.id)
      .eq("institution_id", id);
    if (removeLevel.error) {
      return NextResponse.json(
        { error: `Could not remove a deleted level: ${removeLevel.error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
