import Link from "next/link";
import { createPublicClient, isPublicSupabaseConfigured } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import Pagination from "@/components/govuk/Pagination";
import ParliamentExplainer from "@/components/hansard/ParliamentExplainer";
import { counties } from "@/data/counties";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    party?: string;
    county?: string;
    house?: string;
    page?: string;
  }>;
}

/** Small page size = less Worker serialization / memory on Cloudflare Free */
const PAGE_SIZE = 20;

/**
 * Static filter options — do NOT load every leaders row to build dropdowns
 * (that path exceeded Cloudflare Free CPU / duration under load).
 */
const COMMON_PARTIES = [
  "UDA",
  "ODM",
  "Jubilee",
  "WDM-K",
  "FORD-Kenya",
  "ANC",
  "KANU",
  "Independent",
];

export const revalidate = 300;

export default async function FindMembersPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const currentPage = Math.max(1, parseInt(filters.page || "1", 10) || 1);

  let leaders: Array<{
    id: string;
    slug: string | null;
    full_name: string | null;
    title: string | null;
    current_party: string | null;
    current_county: string | null;
    current_constituency: string | null;
  }> = [];
  let totalCount = 0;
  let loadError: string | null = null;

  if (!isPublicSupabaseConfigured()) {
    loadError =
      "Directory temporarily unavailable (database not configured on this server).";
  } else {
    try {
      const supabase = createPublicClient();

      // Minimal columns only — no full-table filter scans
      let query = supabase
        .from("leaders")
        .select(
          "id, slug, full_name, title, current_party, current_county, current_constituency",
          { count: "exact" },
        )
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (filters.house === "National Assembly") {
        query = query.not("current_constituency", "is", null);
      } else if (filters.house === "Senate") {
        query = query.is("current_constituency", null);
      }

      if (filters.party) {
        query = query.eq("current_party", filters.party);
      }
      if (filters.county) {
        query = query.eq("current_county", filters.county);
      }

      const searchTerm = filters.q?.trim() || "";
      if (searchTerm) {
        // Escape commas for PostgREST or() lists
        const safe = searchTerm.replace(/[%_,]/g, " ").slice(0, 80);
        query = query.or(
          `full_name.ilike.%${safe}%,current_constituency.ilike.%${safe}%,current_county.ilike.%${safe}%`,
        );
      }

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await query.range(from, to);
      if (error) {
        loadError = error.message;
      } else {
        leaders = data || [];
        totalCount = typeof count === "number" ? count : leaders.length;
      }
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Failed to load members";
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const uniqueCounties = counties.map((c) => c.name).sort((a, b) => a.localeCompare(b));

  const paginationParams: Record<string, string> = {};
  if (filters.q) paginationParams.q = filters.q;
  if (filters.party) paginationParams.party = filters.party;
  if (filters.county) paginationParams.county = filters.county;
  if (filters.house) paginationParams.house = filters.house;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Legislature", href: "/government/legislature" },
          {
            text: "Hansard",
            href: "/government/legislature/hansard/national-assembly",
          },
          { text: "Find Members" },
        ]}
      />

      <h1 className="govuk-heading-l">Find Members of Parliament</h1>
      <p className="govuk-body-l">
        Search MPs and Senators, then open their Hansard record — speaking pulse
        while in office, floor contributions, and links to full sittings.
      </p>
      <p className="govuk-body">
        Not sure who represents you?{" "}
        <Link href="/find-your-representatives" className="govuk-link">
          Find your representatives
        </Link>
        {" · "}
        <Link href="/government/legislature" className="govuk-link">
          How Parliament works
        </Link>
      </p>

      <ParliamentExplainer variant="members" />

      {loadError && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            {loadError}. Try again later, or use the{" "}
            <Link href="/government/people" className="govuk-link">
              people directory
            </Link>
            .
          </strong>
        </div>
      )}

      <form method="GET" className="govuk-!-margin-bottom-5">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="q">
                Search by name, constituency or county
              </label>
              <input
                className="govuk-input"
                id="q"
                name="q"
                type="text"
                defaultValue={filters.q}
                placeholder="e.g. Chepkonga, Ainabkoi, or Uasin Gishu"
              />
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="house">
                House
              </label>
              <select
                className="govuk-select"
                id="house"
                name="house"
                defaultValue={filters.house || ""}
              >
                <option value="">All Houses</option>
                <option value="National Assembly">National Assembly</option>
                <option value="Senate">Senate</option>
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="party">
                Party
              </label>
              <select
                className="govuk-select"
                id="party"
                name="party"
                defaultValue={filters.party || ""}
              >
                <option value="">All Parties</option>
                {COMMON_PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="county">
                County
              </label>
              <select
                className="govuk-select"
                id="county"
                name="county"
                defaultValue={filters.county || ""}
              >
                <option value="">All Counties</option>
                {uniqueCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="govuk-button">
          Search
        </button>
      </form>

      <p className="govuk-body">
        {totalCount > 0
          ? `Showing page ${currentPage} of ${totalPages} (${totalCount} match${totalCount === 1 ? "" : "es"})`
          : "No members matched your filters."}
      </p>

      {leaders.length > 0 && (
        <ul className="govuk-list">
          {leaders.map((leader) => (
            <li key={leader.id} className="govuk-!-margin-bottom-3">
              <Link
                href={
                  leader.slug
                    ? `/government/legislature/hansard/member/${leader.slug}`
                    : "/government/people"
                }
                className="govuk-link govuk-!-font-weight-bold"
              >
                {leader.full_name || "Unnamed"}
              </Link>
              <br />
              <span className="govuk-body-s">
                {[
                  leader.title,
                  leader.current_constituency,
                  leader.current_county,
                  leader.current_party,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/government/legislature/hansard/members"
          queryParams={paginationParams}
        />
      )}
    </>
  );
}
