import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import {
  resolveRolePayload,
  updateRoleWithFallback,
} from "@/lib/leaders/resolve-refs";
import {
  inferHouse,
  normalizeLeaderLevel,
  normalizeRoleStatus,
  normalizeSeatType,
  uuidOrOmit,
} from "@/lib/leaders/role-normalize";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; roleId: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: leaderId, roleId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resolved = await resolveRolePayload(auth.supabase, body);
  const patch: Record<string, unknown> = {};

  if ("title" in body || "position_id" in body) {
    patch.title = resolved.title;
  }
  if ("organization" in body || "institution_id" in body) {
    patch.organization = resolved.organization;
  }
  if ("party" in body || "party_id" in body) {
    patch.party = resolved.party;
  }
  if ("county" in body || "county_id" in body || "constituency_id" in body) {
    patch.county = resolved.county;
  }
  if ("constituency" in body || "constituency_id" in body || "ward_id" in body) {
    patch.constituency = resolved.constituency;
  }
  if ("ward" in body || "ward_id" in body) {
    patch.ward = resolved.ward;
  }

  const titleForNorm = String(
    patch.title || body.title || resolved.title || "",
  );

  if (
    "level" in body ||
    "government_level_id" in body ||
    "position_id" in body
  ) {
    patch.level = normalizeLeaderLevel(
      resolved.level || (body.level as string) || null,
      titleForNorm,
    );
  }

  if ("seat_type" in body || "entry_type" in body) {
    patch.seat_type = normalizeSeatType(
      body.seat_type ? String(body.seat_type) : null,
      body.entry_type ? String(body.entry_type) : null,
      titleForNorm,
    );
  }

  if ("entry_type" in body) {
    patch.entry_type = body.entry_type ? String(body.entry_type) : null;
  }

  if ("term_start_date" in body) {
    patch.term_start_date = body.term_start_date
      ? String(body.term_start_date).slice(0, 10)
      : null;
  }
  if ("term_end_date" in body) {
    patch.term_end_date = body.term_end_date
      ? String(body.term_end_date).slice(0, 10)
      : null;
  }

  if ("status" in body || "term_end_date" in body) {
    patch.status = normalizeRoleStatus(
      body.status ? String(body.status) : null,
      patch.term_end_date != null
        ? (patch.term_end_date as string | null)
        : body.term_end_date
          ? String(body.term_end_date)
          : null,
    );
  }

  if ("official_email" in body) {
    patch.official_email = body.official_email
      ? String(body.official_email)
      : null;
  }
  if ("office_location" in body) {
    patch.office_location = body.office_location
      ? String(body.office_location)
      : null;
  }
  if ("committees" in body) {
    patch.committees = body.committees;
  }
  if ("house" in body || "title" in body || "position_id" in body) {
    const h =
      body.house != null
        ? body.house
          ? String(body.house)
          : null
        : inferHouse(titleForNorm);
    if (h !== undefined) patch.house = h;
  }

  // UUID FKs only
  for (const k of [
    "institution_id",
    "party_id",
    "county_id",
    "constituency_id",
    "ward_id",
  ] as const) {
    if (k in body) {
      const u = uuidOrOmit(resolved[k] ?? body[k]);
      if (u) patch[k] = u;
      else if (body[k] === "" || body[k] == null) patch[k] = null;
      // invalid int id: leave out of patch
    }
  }

  for (const k of Object.keys(patch)) {
    if (patch[k] === undefined) delete patch[k];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error, dropped } = await updateRoleWithFallback(
    auth.supabase,
    leaderId,
    roleId,
    patch,
  );

  if (error || !data) {
    return NextResponse.json(
      {
        error: error?.message || "Update failed",
        dropped,
        hint: "level must be national|county|ward; seat_type Elected|Nominated|Ex-Officio|Appointed; status Active|Former|Suspended",
      },
      { status: 500 },
    );
  }

  if (body.set_as_current === true || data?.status === "Active") {
    await auth.supabase
      .from("leaders")
      .update({
        title: data?.title || null,
        current_party: data?.party || null,
        current_constituency: data?.constituency || null,
        current_county: data?.county || null,
        current_organization: data?.organization || null,
        level: data?.level || null,
      })
      .eq("id", leaderId);
  }

  return NextResponse.json({
    data,
    dropped: dropped?.length ? dropped : undefined,
  });
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: leaderId, roleId } = await context.params;

  const { error } = await auth.supabase
    .from("leader_roles")
    .delete()
    .eq("id", roleId)
    .eq("leader_id", leaderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
