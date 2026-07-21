import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * Reference data for admin leader / role forms.
 * Pulls parties, counties, constituencies, wards, institutions, levels, positions.
 *
 * Institutions: pass only=institutions with optional q, limit, offset.
 * Default without q returns up to 1000 rows (full catalogue for ~791 orgs).
 * Admin includes inactive unless active=1.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const countyId = searchParams.get("county_id")?.trim() || "";
  const constituencyId = searchParams.get("constituency_id")?.trim() || "";
  const q = searchParams.get("q")?.trim() || "";
  const only = searchParams.get("only")?.trim() || ""; // optional subset

  const need = (key: string) =>
    !only ||
    only
      .split(",")
      .map((s) => s.trim())
      .includes(key);

  const sb = auth.supabase;

  const result: Record<string, unknown> = {};

  const tasks: Promise<void>[] = [];

  if (need("parties")) {
    tasks.push(
      (async () => {
        // Include former / inactive parties for historical roles
        const { data, error } = await sb
          .from("political_parties")
          .select("id, name, abbreviation, slug, status")
          .order("name", { ascending: true })
          .limit(500);
        if (error) {
          const retry = await sb
            .from("political_parties")
            .select("id, name, abbreviation, slug")
            .order("name", { ascending: true })
            .limit(500);
          result.parties = retry.data || [];
          if (retry.error) result.parties_error = retry.error.message;
        } else {
          result.parties = data || [];
        }
      })(),
    );
  }

  if (need("counties")) {
    tasks.push(
      (async () => {
        const { data, error } = await sb
          .from("counties")
          .select("id, name, code, slug, former_province, region")
          .order("name", { ascending: true })
          .limit(100);
        if (error) {
          const retry = await sb
            .from("counties")
            .select("id, name, code, slug")
            .order("name", { ascending: true })
            .limit(100);
          result.counties = retry.data || [];
        } else {
          result.counties = data || [];
        }
      })(),
    );
  }

  if (need("constituencies")) {
    tasks.push(
      (async () => {
        // Include former/abolished (is_active=false) for historical MP seats
        let query = sb
          .from("constituencies")
          .select("id, name, county_id, slug, is_active")
          .order("name", { ascending: true })
          .limit(1000);
        if (countyId) query = query.eq("county_id", countyId);
        // Optional name search
        if (q.length >= 1) {
          const safe = q.replace(/[%_,.()]/g, " ").trim();
          if (safe) {
            query = query.or(
              `name.ilike.%${safe}%,slug.ilike.%${safe}%`,
            );
          }
        }
        const { data, error } = await query;
        if (error) {
          let q2 = sb
            .from("constituencies")
            .select("id, name, county_id, slug")
            .order("name", { ascending: true })
            .limit(1000);
          if (countyId) q2 = q2.eq("county_id", countyId);
          if (q.length >= 1) {
            const safe = q.replace(/[%_,.()]/g, " ").trim();
            if (safe) q2 = q2.ilike("name", `%${safe}%`);
          }
          const retry = await q2;
          result.constituencies = retry.data || [];
          if (retry.error) result.constituencies_error = retry.error.message;
        } else {
          result.constituencies = data || [];
        }
      })(),
    );
  }

  if (need("wards")) {
    tasks.push(
      (async () => {
        let query = sb
          .from("wards")
          .select("id, name, code, constituency_id")
          .order("name", { ascending: true })
          .limit(800);
        if (constituencyId) query = query.eq("constituency_id", constituencyId);
        const { data, error } = await query;
        result.wards = error ? [] : data || [];
        if (error) result.wards_error = error.message;
      })(),
    );
  }

  if (need("institutions")) {
    tasks.push(
      (async () => {
        const rawLimit = parseInt(searchParams.get("limit") || "", 10);
        const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
        const instLimit = Math.min(
          1000,
          Math.max(
            1,
            Number.isFinite(rawLimit) && rawLimit > 0
              ? rawLimit
              : q.length >= 1
                ? 300
                : 1000,
          ),
        );
        const offset = Math.max(0, Number.isFinite(rawOffset) ? rawOffset : 0);
        const activeOnly = searchParams.get("active") === "1";

        let query = sb
          .from("institutions")
          .select(
            "id, name, short_name, slug, institution_type, government_level, is_active, official_name",
            { count: "exact" },
          )
          .order("name", { ascending: true })
          .range(offset, offset + instLimit - 1);
        if (activeOnly) {
          query = query.eq("is_active", true);
        }
        if (q.length >= 1) {
          const safe = q.replace(/[%_,.()]/g, " ").trim();
          if (safe) {
            query = query.or(
              `name.ilike.%${safe}%,short_name.ilike.%${safe}%,official_name.ilike.%${safe}%,slug.ilike.%${safe}%`,
            );
          }
        }
        const { data, error, count } = await query;
        if (error) {
          let q2 = sb
            .from("institutions")
            .select("id, name, short_name, slug, government_level, is_active", {
              count: "exact",
            })
            .order("name", { ascending: true })
            .range(offset, offset + instLimit - 1);
          if (q.length >= 1) {
            const safe = q.replace(/[%_,.()]/g, " ").trim();
            if (safe) {
              q2 = q2.or(
                `name.ilike.%${safe}%,short_name.ilike.%${safe}%`,
              );
            }
          }
          const retry = await q2;
          result.institutions = retry.data || [];
          result.institutions_total = retry.count ?? (retry.data || []).length;
          result.institutions_limit = instLimit;
          result.institutions_offset = offset;
          if (retry.error) result.institutions_error = retry.error.message;
        } else {
          result.institutions = data || [];
          result.institutions_total = count ?? (data || []).length;
          result.institutions_limit = instLimit;
          result.institutions_offset = offset;
        }
      })(),
    );
  }

  if (need("levels")) {
    tasks.push(
      (async () => {
        const { data, error } = await sb
          .from("government_levels")
          .select("id, name, code, description")
          .order("name", { ascending: true })
          .limit(50);
        if (error || !data?.length) {
          const pos = await sb
            .from("positions")
            .select("level")
            .not("level", "is", null)
            .limit(100);
          const levels = Array.from(
            new Set(
              (pos.data || [])
                .map((r: { level?: string }) => r.level)
                .filter(Boolean) as string[],
            ),
          ).sort();
          result.levels = levels.map((name) => ({
            id: name,
            name,
            code: name,
          }));
          if (!levels.length) {
            const inst = await sb
              .from("institutions")
              .select("government_level")
              .not("government_level", "is", null)
              .limit(200);
            const gl = Array.from(
              new Set(
                (inst.data || [])
                  .map(
                    (r: { government_level?: string }) => r.government_level,
                  )
                  .filter(Boolean) as string[],
              ),
            ).sort();
            result.levels = gl.map((name) => ({
              id: name,
              name,
              code: name,
            }));
          }
          if (error) result.levels_error = error.message;
        } else {
          result.levels = data;
        }
      })(),
    );
  }

  if (need("positions")) {
    tasks.push(
      (async () => {
        const { data, error } = await sb
          .from("positions")
          .select("id, title, code, level, rank_order, description")
          .order("title", { ascending: true })
          .limit(500);
        if (error) {
          const retry = await sb
            .from("positions")
            .select("id, title, code, level")
            .order("title", { ascending: true })
            .limit(500);
          result.positions = retry.data || [];
          if (retry.error) result.positions_error = retry.error.message;
        } else {
          result.positions = data || [];
        }
      })(),
    );
  }

  if (need("leader_organizations") || need("organizations")) {
    tasks.push(
      (async () => {
        const names = new Set<string>();
        const { data: roles } = await sb
          .from("leader_roles")
          .select("organization")
          .not("organization", "is", null)
          .limit(5000);
        for (const r of roles || []) {
          const o = (r as { organization?: string }).organization?.trim();
          if (o) names.add(o);
        }
        const { data: leaders } = await sb
          .from("leaders")
          .select("current_organization")
          .not("current_organization", "is", null)
          .limit(5000);
        for (const l of leaders || []) {
          const o = (l as { current_organization?: string })
            .current_organization?.trim();
          if (o) names.add(o);
        }
        result.leader_organizations = Array.from(names).sort((a, b) =>
          a.localeCompare(b),
        );
      })(),
    );
  }

  await Promise.all(tasks);

  return NextResponse.json(result);
}
