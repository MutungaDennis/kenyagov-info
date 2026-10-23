import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Political coalitions in Kenya",
  description: "Registered political coalitions in Kenya, their member parties and leaders.",
  path: "/elections/coalitions",
});


export const revalidate = 3600;



interface SearchParams {
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CoalitionsPage({
  searchParams,
}: PageProps) {
  // Await search params
  const params = await searchParams;

  const q = params.q?.toLowerCase() || "";

  let coalitions: any[] | null = null;
  let error: { message: string } | null = null;

  try {
    const supabase = createPublicClient();
    // Small table — still cap and fail soft for Cloudflare
    const res = await supabase
      .from("coalitions")
      .select(
        `
      id,
      name,
      abbreviation,
      slogan,
      colors,
      symbol,
      coalition_type,
      political_parties (
        id,
        name,
        abbreviation,
        slug
      )
    `,
      )
      .order("name", { ascending: true })
      .limit(50);
    coalitions = res.data;
    if (res.error) error = res.error;
  } catch (e) {
    error = { message: e instanceof Error ? e.message : "Load failed" };
  }

  // Error state
  if (error) {
    return (
  <>
      
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Elections", href: "/elections" },
            { text: "Coalitions" },
          ]}
        />

        <h1 className="govuk-heading-xl">
          Political Coalitions
        </h1>

        <div className="govuk-inset-text">
          There was a problem loading coalitions.
          Please try again later.
        </div>

        
      
    
  </>
);
  }

  // Safe fallback
  const safeCoalitions = coalitions ?? [];

  // Coalitions are few, so search is more useful than an alphabet filter.
  const filtered = safeCoalitions.filter((c) => {
    if (!q) return true;

    return (
      c.name?.toLowerCase().includes(q) ||
      c.abbreviation?.toLowerCase().includes(q)
    );
  });

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Coalitions" },
        ]}
      />

      <h1 className="govuk-heading-xl">
        Political Coalitions in Kenya
      </h1>

      <p className="govuk-body-l">
        A coalition is an alliance of two or more political parties formed to pursue a common goal. Coalitions may be formed before an election or after an election. A coalition political party is a coalition registered as a political party and is exempt from Sections 5 and 6 of the Political Parties Act, 2011.
      </p>

      {/* SEARCH */}
      <form method="GET" className="govuk-!-margin-bottom-6">
        <div className="govuk-form-group">
          <label className="govuk-label">
            Search coalitions
          </label>

          <input
            className="govuk-input"
            name="q"
            defaultValue={q}
            placeholder="e.g. Kenya Kwanza"
          />
        </div>

        <button className="govuk-button" type="submit">
          Search
        </button>
      </form>

      {/* EMPTY STATE */}
      {safeCoalitions.length === 0 ? (
        <div className="govuk-inset-text">
          No coalitions have been added yet.
        </div>
      ) : (
        <>
          <p className="govuk-body">
            Showing <strong>{filtered.length}</strong>{" "}
            coalitions
          </p>

          <div className="govuk-grid-row">
            {filtered.map((coalition) => (
              <div
                key={coalition.id}
                className="govuk-grid-column-one-half govuk-!-margin-bottom-6"
              >
                <div className="govuk-panel govuk-panel--confirmation">
                  {coalition.symbol && /^https?:\/\//i.test(coalition.symbol) && <img src={coalition.symbol} alt="" className="app-coalition-symbol" />}
                  <h2 className="govuk-heading-m">
                    {coalition.name}
                  </h2>

                  {coalition.abbreviation && (
                    <span className="govuk-tag govuk-!-margin-bottom-2">
                      {coalition.abbreviation}
                    </span>
                  )}

                  <p className="govuk-body-s govuk-!-margin-bottom-2 coalition-type-label">
                    <strong>
                      {coalition.coalition_type === "post_election"
                        ? "Post-election coalition"
                        : coalition.coalition_type === "coalition_party"
                          ? "Coalition political party"
                          : "Pre-election coalition"}
                    </strong>
                  </p>

                  {coalition.slogan && (
                    <p className="govuk-body-s">
                      {coalition.slogan}
                    </p>
                  )}

                  <details className="govuk-details">
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        Member political parties (
                        {coalition.political_parties?.length ||
                          0}
                        )
                      </span>
                    </summary>

                    <div className="govuk-details__text">
                      <ul className="govuk-list govuk-list--bullet">
                        {(coalition.political_parties ??
                          []).map((p: any) => (
                          <li key={p.id}>
                            <Link
                              href={`/political-parties/${p.slug}`}
                              className="govuk-link"
                            >
                              {p.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .app-coalition-symbol { width: 64px; height: 64px; object-fit: contain; float: right; margin-left: 1rem; background: #ffffff; padding: 0.25rem; }

        .coalition-type-label {
          display: inline-block;
          padding: 0.35rem 0.6rem;
          background: #ffffff;
          color: #0b3d2e;
          border: 2px solid #0b3d2e;
          border-radius: 0.2rem;
        }

        .govuk-panel--confirmation .govuk-details__summary,
        .govuk-panel--confirmation .govuk-details__summary-text {
          color: #ffffff;
          font-weight: 700;
        }

        .govuk-panel--confirmation .govuk-details__summary:focus,
        .govuk-panel--confirmation .govuk-details__summary:focus .govuk-details__summary-text {
          color: #0b0c0c;
        }
      `}</style>
  </>
);
}
