// app/political-parties/page.tsx

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

interface SearchParams {
  q?: string;
  letter?: string;
  coalition?: string;
}

export default async function PoliticalPartiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const q = params?.q?.toLowerCase();
  const letter = params?.letter?.toUpperCase();
  const coalitionFilter = params?.coalition;

  // Fetch Coalitions
  const { data: coalitions } = await supabase
    .from("coalitions")
    .select("id, name, abbreviation")
    .order("name");

  // Fetch Parties
  let query = supabase.from("political_parties").select(`
    id, slug, name, abbreviation, symbol, colors, slogan,
    coalition_id,
    coalitions (id, name, abbreviation)
  `);

  if (coalitionFilter) query = query.eq("coalition_id", coalitionFilter);

  const { data: parties, error } = await query.order("name");

  if (error) {
    return <p className="govuk-body">Error loading political parties.</p>;
  }

  let filtered = parties || [];

  if (q) {
    filtered = filtered.filter((p: any) =>
      p.name?.toLowerCase().includes(q) || p.abbreviation?.toLowerCase().includes(q)
    );
  }

  if (letter) {
    filtered = filtered.filter((p: any) => p.name?.toUpperCase().startsWith(letter));
  }

  const grouped = filtered.reduce((acc: any, party: any) => {
    const key = party.coalitions?.name || "Independent Parties";
    if (!acc[key]) acc[key] = [];
    acc[key].push(party);
    return acc;
  }, {});

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics", href: "/politics" },
          { text: "Political parties", href: "/political-parties" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Political parties in Kenya</h1>
        <p className="govuk-body-l">
          Official register of political parties maintained by the Office of the Registrar of Political Parties (ORPP).
        </p>

        {/* Filters */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-third">
            <form method="GET">
              <label className="govuk-label" htmlFor="q">Search</label>
              <input
                id="q"
                name="q"
                className="govuk-input"
                defaultValue={q || ""}
                placeholder="Party name or abbreviation"
              />
              <button type="submit" className="govuk-button govuk-!-margin-top-2">Search</button>
            </form>
          </div>

          <div className="govuk-grid-column-one-third">
            <form method="GET">
              <label className="govuk-label" htmlFor="coalition">Coalition</label>
              <select name="coalition" className="govuk-select" defaultValue={coalitionFilter || ""}>
                <option value="">All Coalitions</option>
                {coalitions?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.abbreviation})
                  </option>
                ))}
              </select>
              <button type="submit" className="govuk-button govuk-!-margin-top-2">Apply</button>
            </form>
          </div>

          <div className="govuk-grid-column-one-third">
            <p className="govuk-body-s">Filter by letter:</p>
            <div className="govuk-!-display-flex govuk-!-flex-wrap-wrap govuk-!-gap-2">
              {alphabet.map((l) => (
                <Link key={l} href={`/political-parties?letter=${l}`} className="govuk-link">
                  {l}
                </Link>
              ))}
              <Link href="/political-parties" className="govuk-link">All</Link>
            </div>
          </div>
        </div>

        {/* Parties List - Compact Cards */}
        {Object.entries(grouped).map(([coalitionName, items]: any) => (
          <section key={coalitionName} className="govuk-!-margin-bottom-10">
            <h2 className="govuk-heading-l">{coalitionName}</h2>

            <div className="govuk-grid-row">
              {items.map((party: any) => (
                <div key={party.id} className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                  <div className="govuk-panel govuk-!-padding-3 govuk-!-background-grey">
                    <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                      <Link href={`/political-parties/${party.slug}`} className="govuk-link">
                        {party.name}
                      </Link>
                    </h3>

                    {party.abbreviation && (
                      <p className="govuk-body-s govuk-!-margin-bottom-1">
                        <strong>{party.abbreviation}</strong>
                      </p>
                    )}

                    {party.coalitions && (
                      <span className="govuk-tag govuk-tag--blue">
                        {party.coalitions.abbreviation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && <p className="govuk-body">No parties found.</p>}

        <div className="govuk-inset-text">
          Under Section 34(e) of the Political Parties Act, ORPP maintains the official register of political parties.
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}