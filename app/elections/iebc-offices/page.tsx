import { createClient } from "@/lib/supabase/server";
import LastUpdated from "@/components/govuk/LastUpdated";

interface PageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function IebcOfficesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const supabase = await createClient();

  const query = params?.q?.toLowerCase() || "";

  const { data } = await supabase
    .from("constituencies")
    .select(`
      id,
      name,
      slug,
      county_code,
      office_location,
      most_conspicuous_landmark,
      registered_voters_2022
    `)
    .order("county_code", { ascending: true });

  const safeData = data ?? [];

  const filtered = query
    ? safeData.filter((c) =>
        (c.name ?? "").toLowerCase().includes(query)
      )
    : safeData;

  return (
    <main className="govuk-width-container">
      {/* BACK */}
      <a href="/politics/elections" className="govuk-back-link">
        Back to Elections
      </a>

      {/* TITLE */}
      <h1 className="govuk-heading-xl">
        IEBC Constituency Offices
      </h1>

      <p className="govuk-body">
        View constituency IEBC office details across Kenya.
        Use the search to quickly find your area.
      </p>

      {/* SEARCH */}
      <form method="GET" className="govuk-!-margin-bottom-6">
        <label className="govuk-label" htmlFor="q">
          Search constituency
        </label>

        <input
          className="govuk-input govuk-!-width-one-half"
          id="q"
          name="q"
          type="text"
          defaultValue={query}
          placeholder="e.g. Westlands"
        />

        <button
          className="govuk-button govuk-!-margin-top-2"
          type="submit"
        >
          Search
        </button>
      </form>

      {/* TABLE */}
      <div
        className="govuk-!-margin-top-6"
        style={{ overflowX: "auto" }}
      >
        <table className="govuk-table">
          <caption className="govuk-table__caption govuk-table__caption--m">
            Constituency IEBC Office Directory
          </caption>

          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">
                Constituency
              </th>

              <th className="govuk-table__header">
                County Code
              </th>

              <th className="govuk-table__header">
                IEBC Office
              </th>

              <th className="govuk-table__header">
                Landmark
              </th>

              <th className="govuk-table__header">
                Registered Voters (2022)
              </th>

              <th className="govuk-table__header">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="govuk-table__body">
            {filtered.length === 0 ? (
              <tr className="govuk-table__row">
                <td
                  className="govuk-table__cell"
                  colSpan={6}
                >
                  No constituencies found.
                </td>
              </tr>
            ) : (
              filtered.map((c: any) => (
                <tr
                  key={c.id}
                  className="govuk-table__row"
                >
                  <td className="govuk-table__cell">
                    {c.name || "Unknown"}
                  </td>

                  <td className="govuk-table__cell">
                    {c.county_code ?? "—"}
                  </td>

                  <td className="govuk-table__cell">
                    {c.office_location ||
                      "Not recorded"}
                  </td>

                  <td className="govuk-table__cell">
                    {c.most_conspicuous_landmark ||
                      "Not recorded"}
                  </td>

                  <td className="govuk-table__cell">
                    {c.registered_voters_2022 ??
                      "N/A"}
                  </td>

                  <td className="govuk-table__cell">
                    {c.slug ? (
                      <a
                        href={`/politics/elections/constituencies/${c.slug}`}
                        className="govuk-link"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* LAST UPDATED */}
      <LastUpdated
        lastUpdated={new Date().toISOString()}
        published={new Date("2026-01-01").toISOString()}
      />

      {/* FEEDBACK */}
      <section className="govuk-!-margin-top-6">
        <h2 className="govuk-heading-m">
          Is this page useful?
        </h2>

        <div className="govuk-button-group">
          <button className="govuk-button govuk-button--secondary">
            Yes
          </button>

          <button className="govuk-button govuk-button--secondary">
            No
          </button>
        </div>
      </section>
    </main>
  );
}