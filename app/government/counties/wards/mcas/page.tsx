import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import TableScroll from "@/components/govuk/TableScroll";
import McaFilters from "@/components/wards/mca-filters";
import { buildPageMetadata } from "@/lib/seo";

const BASE_PATH = "/government/counties/wards/mcas";

export const metadata = buildPageMetadata({
  title: "Members of County Assembly (MCAs)",
  description:
    "Find elected and nominated Members of County Assembly by name, county, constituency or ward.",
  path: BASE_PATH,
});

export const revalidate = 3600;

interface SearchParams {
  county?: string;
  constituency?: string;
  ward?: string;
  party?: string;
  type?: string;
  q?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 50;

const PARTIES = [
  "ANC", "CCM", "DAP-K", "DP", "FORD-K", "GDDP", "Independent", "JP", "KANU", "KUP", "MCCP",
  "MDG", "NAP-K", "NOPEU", "ODM", "PAA", "TSP", "UDA", "UDM", "UPA", "UPIA", "WDM-K",
];

export default async function MCAsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const county = sp.county || "";
  const constituency = sp.constituency || "";
  const ward = sp.ward || "";
  const party = sp.party || "";
  const type = sp.type === "Elected" || sp.type === "Nominated" ? sp.type : "";
  const q = sp.q ? sp.q.trim() : "";

  const currentPage = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { fetchCountyNames } = await import("@/lib/legislature/members");
  const counties = (await fetchCountyNames()).map((name) => ({ name }));

  let constituencies: { name: string }[] = [];
  let wardOptions: { name: string; slug: string }[] = [];
  let mcas: any[] = [];
  let total = 0;
  let failed = false;
  let noMatch = false;

  try {
    const supabase = createPublicClient();

    let countyId: string | number | null = null;
    if (county) {
      const { data: c } = await supabase
        .from("counties")
        .select("id, code")
        .eq("name", county)
        .maybeSingle();
      countyId = c?.id ?? null;
      if (c?.code != null) {
        const { data } = await supabase
          .from("constituencies")
          .select("name")
          .eq("county_code", c.code)
          .order("name")
          .limit(60);
        constituencies = data || [];
      }
      if (countyId == null) noMatch = true;
    }

    if (county && constituency) {
      const { data } = await supabase
        .from("wards")
        .select("name, slug")
        .eq("county_name", county)
        .eq("constituency_name", constituency)
        .order("name")
        .limit(60);
      wardOptions = (data || []) as { name: string; slug: string }[];
    }

    // Ward and constituency only apply to elected MCAs, which are tied to a ward
    let wardIds: (string | number)[] | null = null;
    if (ward || (county && constituency)) {
      let wq = supabase.from("wards").select("id");
      if (ward) wq = wq.eq("slug", ward);
      else wq = wq.eq("county_name", county).eq("constituency_name", constituency);
      const { data } = await wq.limit(100);
      wardIds = (data || []).map((w: any) => w.id);
      if (wardIds.length === 0) noMatch = true;
    }

    let partyId: string | number | null = null;
    if (party) {
      const { data } = await supabase
        .from("political_parties")
        .select("id")
        .or(`abbreviation.eq.${party},name.eq.${party}`)
        .limit(1)
        .maybeSingle();
      partyId = data?.id ?? null;
      if (partyId == null) noMatch = true;
    }

    if (!noMatch) {
      let query = supabase
        .from("mcas")
        .select(
          `id, slug, first_name, surname, seat_type, nomination_category,
           counties (name), wards (name, slug), political_parties (name, abbreviation)`,
          { count: "exact" },
        )
        .neq("status", "Unpublished");

      if (countyId != null) query = query.eq("county_id", countyId);
      if (wardIds) query = query.in("ward_id", wardIds);
      if (partyId != null) query = query.eq("party_id", partyId);
      if (type) query = query.eq("seat_type", type);
      if (q) {
        const safe = q.replace(/[%_,()]/g, " ").slice(0, 80);
        query = query.or(`first_name.ilike.%${safe}%,surname.ilike.%${safe}%`);
      }

      const res = await query
        .order("first_name", { ascending: true })
        .order("surname", { ascending: true })
        .range(from, to);
      if (res.error) failed = true;
      mcas = res.data || [];
      total = res.count || 0;
    }
  } catch {
    failed = true;
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    const all = { county, constituency, ward, party, type, q };
    for (const [k, v] of Object.entries(all)) if (v) params.set(k, v);
    params.set("page", String(p));
    return `${BASE_PATH}?${params}`;
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Counties", href: "/government/counties" },
          { text: "Wards", href: "/government/counties/wards" },
          { text: "Members of County Assembly" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content">
        <h1 className="govuk-heading-l">Members of County Assembly (MCAs)</h1>
        <p className="govuk-body-l">
          Elected MCAs represent a ward. Nominated MCAs represent special interests across a county.
        </p>

        <McaFilters
          basePath={BASE_PATH}
          counties={counties}
          constituencies={constituencies}
          wards={wardOptions}
          parties={PARTIES}
          values={{ county, constituency, ward, party, type, q }}
        />

        {failed ? (
          <p className="govuk-body">We could not load MCAs. Try again later.</p>
        ) : total > 0 ? (
          <>
            <h2 className="govuk-heading-s" aria-live="polite">
              {total.toLocaleString()} {total === 1 ? "MCA" : "MCAs"} found
            </h2>
            {(constituency || ward) && (
              <p className="govuk-hint">Nominated MCAs are not tied to a ward, so they are not shown when you choose a constituency or ward.</p>
            )}
            <TableScroll caption="Members of County Assembly">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">Members of County Assembly</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Name</th>
                    <th scope="col" className="govuk-table__header">Ward</th>
                    <th scope="col" className="govuk-table__header">County</th>
                    <th scope="col" className="govuk-table__header">Party</th>
                    <th scope="col" className="govuk-table__header">Type</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {mcas.map((m) => {
                    const w = Array.isArray(m.wards) ? m.wards[0] : m.wards;
                    const c = Array.isArray(m.counties) ? m.counties[0] : m.counties;
                    const p = Array.isArray(m.political_parties) ? m.political_parties[0] : m.political_parties;
                    return (
                      <tr key={m.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                          <Link href={`/government/people/${m.slug}`} className="govuk-link">
                            {`${m.first_name} ${m.surname}`.trim()}
                          </Link>
                        </th>
                        <td className="govuk-table__cell">
                          {w?.name ? (
                            <Link href={`/government/counties/wards/${w.slug}/about`} className="govuk-link">{w.name}</Link>
                          ) : (
                            "County-wide"
                          )}
                        </td>
                        <td className="govuk-table__cell">{c?.name || "—"}</td>
                        <td className="govuk-table__cell">{p?.abbreviation || p?.name || "Independent"}</td>
                        <td className="govuk-table__cell">
                          <span className={`govuk-tag ${m.seat_type === "Elected" ? "govuk-tag--blue" : "govuk-tag--grey"}`}>
                            {m.seat_type}
                          </span>
                          {m.seat_type === "Nominated" && m.nomination_category && (
                            <div className="govuk-hint govuk-!-margin-bottom-0">{m.nomination_category}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>

            {totalPages > 1 && (
              <nav className="govuk-pagination" aria-label="Pagination">
                {currentPage > 1 && (
                  <div className="govuk-pagination__prev">
                    <Link className="govuk-link govuk-pagination__link" href={pageUrl(currentPage - 1)} rel="prev">
                      <span className="govuk-pagination__link-title">Previous</span>
                    </Link>
                  </div>
                )}
                <ul className="govuk-pagination__list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <li key={p} className={`govuk-pagination__item ${p === currentPage ? "govuk-pagination__item--current" : ""}`}>
                        {i > 0 && p - arr[i - 1] > 1 && <span aria-hidden="true">…&nbsp;</span>}
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={pageUrl(p)}
                          aria-label={`Page ${p}`}
                          aria-current={p === currentPage ? "page" : undefined}
                        >
                          {p}
                        </Link>
                      </li>
                    ))}
                </ul>
                {currentPage < totalPages && (
                  <div className="govuk-pagination__next">
                    <Link className="govuk-link govuk-pagination__link" href={pageUrl(currentPage + 1)} rel="next">
                      <span className="govuk-pagination__link-title">Next</span>
                    </Link>
                  </div>
                )}
              </nav>
            )}
          </>
        ) : (
          <p className="govuk-body">
            No MCAs match your search. <Link href={BASE_PATH} className="govuk-link">Clear all filters</Link>
          </p>
        )}
      </main>
    </div>
  );
}
