// app/elections/iebc-offices/page.tsx
import { createPublicClient, isPublicSupabaseConfigured } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKPagination from "@/components/govuk/Pagination";
import LastUpdated from "@/components/govuk/LastUpdated";

export const revalidate = 3600;

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 50;

export default async function IebcOfficesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const currentPage = Math.max(1, parseInt(params?.page || "1", 10) || 1);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let paginatedData: Array<{
    id: string;
    name: string | null;
    slug: string | null;
    county_code: string | null;
    office_location: string | null;
    most_conspicuous_landmark: string | null;
    registered_voters_2022: number | null;
  }> = [];
  let totalCount = 0;
  let loadError: string | null = null;

  if (!isPublicSupabaseConfigured()) {
    loadError = "Directory temporarily unavailable.";
  } else {
    try {
      const supabase = createPublicClient();
      // Server-side filter + range — never load all ~290 constituencies into the Worker
      let q = supabase
        .from("constituencies")
        .select(
          `
          id,
          name,
          slug,
          county_code,
          office_location,
          most_conspicuous_landmark,
          registered_voters_2022
        `,
          { count: "exact" },
        )
        .order("county_code", { ascending: true })
        .order("name", { ascending: true });

      if (query) {
        const safe = query.replace(/[%_,]/g, " ").slice(0, 80);
        q = q.or(
          `name.ilike.%${safe}%,county_code.ilike.%${safe}%,office_location.ilike.%${safe}%,most_conspicuous_landmark.ilike.%${safe}%`,
        );
      }

      const { data, count, error } = await q.range(from, to);
      if (error) {
        loadError = error.message;
      } else {
        paginatedData = data || [];
        totalCount = typeof count === "number" ? count : paginatedData.length;
      }
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Failed to load offices";
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginationParams: Record<string, string> = {};
  if (query) paginationParams.q = query;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          {
            text: "IEBC constituency offices",
            href: "/elections/iebc-offices",
          },
        ]}
      />

      <h1 className="govuk-heading-xl">IEBC constituency offices</h1>

      <p className="govuk-body">
        Find Independent Electoral and Boundaries Commission (IEBC) constituency
        offices across Kenya, including office locations and landmarks.
      </p>

      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        <p className="govuk-body govuk-!-margin-bottom-2">
          <strong>Data source:</strong> Independent Electoral and Boundaries
          Commission (IEBC).
        </p>
        <p className="govuk-body govuk-!-margin-bottom-0">
          <a
            href="https://www.iebc.or.ke/docs/Physical_Locations_of_County_and_Constituency_Offices_in_Kenya.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="govuk-link"
          >
            View official IEBC office locations document (PDF)
          </a>
        </p>
      </div>

      {loadError && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            {loadError}
          </strong>
        </div>
      )}

      <div className="app-iebc-search govuk-!-margin-bottom-6">
        <form
          method="GET"
          action="/elections/iebc-offices"
          className="app-iebc-search-form"
        >
          <div className="app-iebc-search-input">
            <label className="govuk-label govuk-label--s" htmlFor="q">
              Search
            </label>
            <input
              className="govuk-input"
              id="q"
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Constituency, county code or office location"
            />
          </div>
          <div className="app-iebc-search-actions">
            <button
              type="submit"
              className="govuk-button govuk-!-margin-bottom-0"
            >
              Search
            </button>
            {query && (
              <a
                href="/elections/iebc-offices"
                className="govuk-link govuk-!-margin-left-3"
              >
                Clear search
              </a>
            )}
          </div>
        </form>
      </div>

      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        <p className="govuk-body govuk-!-margin-bottom-0">
          <strong>{totalCount}</strong>{" "}
          {totalCount === 1 ? "constituency office" : "constituency offices"}{" "}
          found
          {query ? ` matching “${query}”` : ""}
          {totalPages > 1
            ? ` (page ${currentPage} of ${totalPages})`
            : ""}
        </p>
      </div>

      {paginatedData.length === 0 && !loadError ? (
        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-margin-bottom-0">
            No constituency offices match your search. Try different keywords or{" "}
            <a href="/elections/iebc-offices" className="govuk-link">
              clear the search
            </a>
            .
          </p>
        </div>
      ) : paginatedData.length > 0 ? (
        <div
          className="app-table-scroll"
          role="region"
          aria-label="IEBC constituency offices — scroll sideways on small screens"
          tabIndex={0}
        >
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-visually-hidden">
              IEBC constituency offices directory
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  Constituency
                </th>
                <th scope="col" className="govuk-table__header">
                  County code
                </th>
                <th scope="col" className="govuk-table__header">
                  IEBC office location
                </th>
                <th scope="col" className="govuk-table__header">
                  Landmark
                </th>
                <th
                  scope="col"
                  className="govuk-table__header govuk-table__header--numeric"
                >
                  Registered voters (2022)
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {paginatedData.map((c) => (
                <tr key={c.id} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <strong>{c.name || "Unknown"}</strong>
                  </td>
                  <td className="govuk-table__cell">{c.county_code ?? "—"}</td>
                  <td className="govuk-table__cell">
                    {c.office_location || "Not recorded"}
                  </td>
                  <td className="govuk-table__cell">
                    {c.most_conspicuous_landmark || "Not recorded"}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {c.registered_voters_2022?.toLocaleString() ?? "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <GovUKPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/elections/iebc-offices"
        queryParams={paginationParams}
      />

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <LastUpdated published="2026-01-01" lastUpdated="2026-07-02" />

      <style>{`
        .app-iebc-search {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }
        .app-iebc-search-form {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .app-iebc-search-input {
          flex: 1;
          min-width: 250px;
        }
        .app-iebc-search-input .govuk-input { width: 100%; }
        .app-iebc-search-actions {
          display: flex;
          align-items: center;
          padding-bottom: 2px;
        }
        .app-table-responsive { overflow-x: auto; }
        @media (max-width: 40.0625rem) {
          .app-iebc-search-form {
            flex-direction: column;
            align-items: stretch;
          }
          .app-iebc-search-input { min-width: 100%; }
        }
      `}</style>
    </>
  );
}
