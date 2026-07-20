import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * Reference data for admin leader / role forms.
 * Pulls parties, counties, constituencies, wards, institutions, levels, positions.
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
        let query = sb
          .from("political_parties")
          .select("id, name, abbreviation, slug, code")
          .order("name", { ascending: true })
          .limit(300);
        // Some DBs have code, some don't
        const { data, error } = await query;
        if (error) {
          const retry = await sb
            .from("political_parties")
            .select("id, name, abbreviation, slug")
            .order("name", { ascending: true })
            .limit(300);
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
          .select("id, name, code, slug")
          .order("name", { ascending: true })
          .limit(100);
        if (error) {
          const retry = await sb
            .from("counties")
            .select("id, name, code")
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
        let query = sb
          .from("constituencies")
          .select("id, name, code, county_id, slug")
          .order("name", { ascending: true })
          .limit(500);
        if (countyId) query = query.eq("county_id", countyId);
        const { data, error } = await query;
        if (error) {
          let q2 = sb
            .from("constituencies")
            .select("id, name, code, county_id")
            .order("name", { ascending: true })
            .limit(500);
          if (countyId) q2 = q2.eq("county_id", countyId);
          const retry = await q2;
          result.constituencies = retry.data || [];
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
        // Search-driven: without q return a modest page; with q search full catalogue
        const instLimit = q.length >= 1 ? 80 : 100;
        let query = sb
          .from("institutions")
          .select(
            "id, name, short_name, slug, institution_type, government_level, is_active",
          )
          .order("name", { ascending: true })
          .limit(instLimit);
        // Prefer active when not searching; include inactive when searching by name
        if (q.length < 1) {
          query = query.eq("is_active", true);
        }
        if (q.length >= 1) {
          const safe = q.replace(/[%_,]/g, " ").trim();
          query = query.or(
            `name.ilike.%${safe}%,short_name.ilike.%${safe}%,official_name.ilike.%${safe}%,slug.ilike.%${safe}%`,
          );
        }
        const { data, error } = await query;
        if (error) {
          let q2 = sb
            .from("institutions")
            .select("id, name, short_name, slug, government_level")
            .order("name", { ascending: true })
            .limit(instLimit);
          if (q.length >= 1) {
            const safe = q.replace(/[%_,]/g, " ").trim();
            q2 = q2.or(
              `name.ilike.%${safe}%,short_name.ilike.%${safe}%`,
            );
          }
          const retry = await q2;
          result.institutions = retry.data || [];
          if (retry.error) result.institutions_error = retry.error.message;
        } else {
          result.institutions = data || [];
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
          // Fallback: distinct from positions.level and institutions
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
          result.levels = levels.map((name, i) => ({
            id: name,
            name,
            code: name,
          }));
          // Also try institutions.government_level
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
        // Prefer title sort so admin-created posts appear alphabetically
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

  // Distinct organisations assigned to leaders (for admin filter dropdown)
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
