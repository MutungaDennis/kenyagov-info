import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


interface SearchParams {
  q?: string;
  letter?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CoalitionsPage({
  searchParams,
}: PageProps) {
  // Await search params
  const params = await searchParams;

  // Supabase client
  const supabase = await createClient();

  const q = params.q?.toLowerCase() || "";
  const letter = params.letter?.toUpperCase();

  // Fetch coalitions safely
  const { data: coalitions, error } = await supabase
    .from("coalitions")
    .select(`
      id,
      name,
      abbreviation,
      slogan,
      colors,
      symbol,
      political_parties (
        id,
        name,
        abbreviation,
        slug
      )
    `)
    .order("name", { ascending: true });

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

  // Search + alphabet filtering
  const filtered = safeCoalitions
    .filter((c) => {
      if (!q) return true;

      return (
        c.name?.toLowerCase().includes(q) ||
        c.abbreviation?.toLowerCase().includes(q)
      );
    })
    .filter((c) => {
      if (!letter) return true;

      return c.name?.[0]?.toUpperCase() === letter;
    });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
        Coalitions are voluntary alliances of political
        parties. A political party can belong to only one
        coalition at a time.
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

      {/* A-Z FILTER */}
      <div className="govuk-!-margin-bottom-6">
        <p className="govuk-body">
          Filter by alphabet
        </p>

        <div className="govuk-!-display-flex govuk-!-flex-wrap-wrap govuk-!-gap-2">
          <Link className="govuk-link" href="/elections/coalitions">
            All
          </Link>

          {alphabet.map((l) => (
            <Link
              key={l}
              href={`/elections/coalitions?letter=${l}`}
              className={`govuk-link ${letter === l ? 'govuk-!-font-weight-bold' : ''}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

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
                  <h2 className="govuk-heading-m">
                    {coalition.name}
                  </h2>

                  {coalition.abbreviation && (
                    <span className="govuk-tag govuk-!-margin-bottom-2">
                      {coalition.abbreviation}
                    </span>
                  )}

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

      
    
  
  </>
);
}