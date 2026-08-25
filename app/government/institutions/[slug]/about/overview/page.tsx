import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Props = {
  params: Promise<{ slug: string }>;
};

type County = {
  id: string;
  slug: string;
  name: string;
  code: number | null;
  headquarters: string | null;
  region: string | null;
  area_km2: number | null;
  population: number | null;
  population_density: number | null;
  constituencies: number | null;
  wards: number | null;
  sub_counties: number | null;
};

type Institution = {
  vision: string | null;
  mission: string | null;
  description: string | null;
};

type Leader = {
  id: string;
  slug: string;
  full_name: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  title: string | null;
  image_url: string | null;
  current_constituency?: string | null;
  constituency?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
};

// ✅ FIXED: Changed from array to single object, as Supabase returns foreign key joins as objects
type Mca = {
  id: string;
  slug: string;
  first_name: string;
  other_names: string | null;
  surname: string;
  gender: string;
  seat_type: "Elected" | "Nominated";
  nomination_category: string | null;
  assembly_role: string | null;
  wards: { name: string; ward_code: string } | null;
  political_parties: { name: string; abbreviation: string } | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function displayName(leader: Leader | null): string {
  if (!leader) return "Office currently vacant";
  const parts = [leader.first_name, leader.other_names, leader.surname].filter(Boolean);
  return parts.join(" ").trim() || leader.full_name || "Unknown";
}

function LeaderCard({
  leader,
  roleLabel,
  isFormer = false,
}: {
  leader: Leader | null;
  roleLabel: string;
  isFormer?: boolean;
}) {
  const name = displayName(leader);
  const hasImage = leader?.image_url && leader.image_url.trim();

  return (
    <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
      <div className="app-leader-card" style={{
        border: "1px solid #b1b4b6",
        padding: "20px",
        background: "#ffffff",
        height: "100%",
        opacity: isFormer ? 0.85 : 1,
      }}>
        <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
          {hasImage ? (
            <div style={{
              width: "80px",
              height: "80px",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              background: "#f3f2f1",
              borderRadius: "50%",
            }}>
              <Image
                src={leader!.image_url!}
                alt={name}
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
            </div>
          ) : (
            <div style={{
              width: "80px",
              height: "80px",
              flexShrink: 0,
              background: "#b1b4b6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "32px",
              fontWeight: "bold",
              borderRadius: "50%",
            }}>
              {name.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="govuk-caption-s govuk-!-margin-bottom-1" style={{ color: "#505a5f" }}>
              {isFormer ? "Former " : ""}{roleLabel}
            </p>
            {leader?.slug ? (
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link href={`/government/people/${leader.slug}`} className="govuk-link govuk-link--no-visited-state">
                  {name}
                </Link>
                {isFormer && leader?.term_start_date && leader?.term_end_date && (
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    {new Date(leader.term_start_date).getFullYear()} – {new Date(leader.term_end_date).getFullYear()}
                  </span>
                )}
              </h3>
            ) : (
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ color: "#505a5f" }}>
                {name}
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CountyOverviewPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // 1. Fetch county data
  const { data: county } = await supabase
    .from("counties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!county) notFound();

  // 2. Fetch institution (vision/mission)
  const { data: institution } = await supabase
    .from("institutions")
    .select("vision, mission, description")
    .eq("slug", slug)
    .maybeSingle();

  // 3. Fetch Top Executive Leadership (Governor, Deputy, Senator, CWR)
  // ✅ FIXED: Added "County Women Representative" to catch exact DB title variations
  const { data: allTopLeaders } = await supabase
    .from("leaders")
    .select("id, slug, full_name, first_name, other_names, surname, title, image_url, is_active")
    .eq("current_county", county.name)
    .in("title", ["Governor", "Deputy Governor", "Senator", "Woman Representative", "County Woman Representative", "County Women Representative"])
    .order("is_active", { ascending: false })
    .order("updated_at", { ascending: false });

  const leadersByTitle: Record<string, { current: Leader | null; former: Leader[] }> = {};
  allTopLeaders?.forEach((leader) => {
    let title = leader.title || "Unknown";
    if (title.toLowerCase().includes("woman representative")) {
      title = "Woman Representative"; // Normalize title for grouping
    }

    if (!leadersByTitle[title]) {
      leadersByTitle[title] = { current: null, former: [] };
    }

    if (leader.is_active) {
      leadersByTitle[title].current = leader;
    } else {
      leadersByTitle[title].former.push(leader);
    }
  });

  const governor = leadersByTitle["Governor"]?.current || null;
  const deputyGovernor = leadersByTitle["Deputy Governor"]?.current || null;
  const senator = leadersByTitle["Senator"]?.current || null;
  const cwr = leadersByTitle["Woman Representative"]?.current || null;
  const formerCWRs = leadersByTitle["Woman Representative"]?.former || [];

  // 4. Fetch Constituencies
  const { data: constituencies } = await supabase
    .from("constituencies")
    .select("id, name")
    .eq("county_id", county.id)
    .order("name");

  const constituencyNames = constituencies?.map((c) => c.name) || [];

  // 5. Fetch Current MPs
  let currentMps: Leader[] = [];
  if (constituencyNames.length > 0) {
    const { data: mpData } = await supabase
      .from("leaders")
      .select("id, slug, full_name, first_name, other_names, surname, title, image_url, current_constituency")
      .in("current_constituency", constituencyNames)
      .eq("title", "Member of Parliament")
      .eq("is_active", true)
      .order("current_constituency");
    currentMps = mpData || [];
  }

  // ✅ NEW: Fetch Former MPs from leader_roles
  const { data: formerMpsRoles } = await supabase
    .from("leader_roles")
    .select(`
      constituency,
      term_start_date,
      term_end_date,
      status,
      leaders (
        id,
        slug,
        full_name,
        first_name,
        other_names,
        surname,
        image_url
      )
    `)
    .eq("county_id", county.id)
    .eq("title", "Member of Parliament")
    .neq("status", "Active"); // Only get inactive/historical roles

  const formerMps = (formerMpsRoles || [])
    .filter((r: any) => r.leaders)
    .map((r: any) => ({
      ...r.leaders,
      constituency: r.constituency,
      term_start_date: r.term_start_date,
      term_end_date: r.term_end_date,
    }));

  // 6. Fetch MCAs
  const { data: mcas } = await supabase
    .from("mcas")
    .select(`
      id, slug, first_name, other_names, surname, gender, seat_type,
      nomination_category, assembly_role, status,
      wards (name, ward_code),
      political_parties (name, abbreviation)
    `)
    .eq("county_id", county.id)
    .eq("status", "Active")
    .order("seat_type", { ascending: true })
    .order("surname", { ascending: true });

  const electedMcas = (mcas || []).filter((m: any) => m.seat_type === "Elected");
  const nominatedMcas = (mcas || []).filter((m: any) => m.seat_type === "Nominated");

  const pageTitle = `${county.name} County`;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Overview" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">
                Republic of Kenya · County Code {county.code ?? "—"}
              </span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                {pageTitle} — Overview
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                {institution?.description ||
                  `Comprehensive overview of ${county.name} County, including its leadership, vision, and representation across the County Executive, Senate, National Assembly, and County Assembly.`}
              </p>
            </div>
          </div>

          {/* ============================================ */}
          {/* VISION & MISSION                             */}
          {/* ============================================ */}
          {(institution?.vision || institution?.mission) && (
            <div className="govuk-grid-row govuk-!-margin-bottom-8">
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  {institution?.vision && (
                    <div className="govuk-!-margin-bottom-4">
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">Vision</h2>
                      <p className="govuk-body govuk-!-margin-bottom-0">{institution.vision}</p>
                    </div>
                  )}
                  {institution?.mission && (
                    <div>
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">Mission</h2>
                      <p className="govuk-body govuk-!-margin-bottom-0">{institution.mission}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">

              {/* ========================================== */}
              {/* EXECUTIVE LEADERSHIP                       */}
              {/* ========================================== */}
              <section className="govuk-!-margin-bottom-9" aria-labelledby="exec-heading">
                <h2 id="exec-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                  County Executive Leadership
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The County Executive is headed by the Governor and Deputy Governor, who provide overall
                  policy direction and steer the strategic development agenda of the county.
                </p>
                <div className="govuk-grid-row">
                  <LeaderCard leader={governor} roleLabel="Governor" />
                  <LeaderCard leader={deputyGovernor} roleLabel="Deputy Governor" />
                </div>
              </section>

              {/* ========================================== */}
              {/* SENATE REPRESENTATIVE                      */}
              {/* ========================================== */}
              <section className="govuk-!-margin-bottom-9" aria-labelledby="senate-heading">
                <h2 id="senate-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                  Senate Representation
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The Senator represents the county at the Senate of Kenya, safeguarding the interests
                  of the county and its residents in national legislation.
                </p>
                <div className="govuk-grid-row">
                  <LeaderCard leader={senator} roleLabel="Senator" />
                </div>
              </section>

              {/* ========================================== */}
              {/* NATIONAL ASSEMBLY REPRESENTATIVES          */}
              {/* ========================================== */}
              <section className="govuk-!-margin-bottom-9" aria-labelledby="na-heading">
                <h2 id="na-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                  National Assembly Representation
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The county is represented in the National Assembly by Members of Parliament (MPs) for
                  each constituency and a County Woman Representative who champions the interests of
                  women and the county at large.
                </p>

                {/* Current Woman Representative */}
                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Current Woman Representative
                </h3>
                <div className="govuk-grid-row govuk-!-margin-bottom-6">
                  <LeaderCard leader={cwr} roleLabel="Woman Representative" />
                </div>

                {/* Current Constituency MPs */}
                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Current Members of Parliament ({currentMps.length})
                </h3>
                {currentMps.length > 0 ? (
                  <dl className="govuk-summary-list">
                    {currentMps.map((mp) => (
                      <div key={mp.id} className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {mp.current_constituency || "Constituency"}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          <Link href={`/government/people/${mp.slug}`} className="govuk-link govuk-link--no-visited-state">
                            {displayName(mp)}
                          </Link>
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="govuk-body govuk-body-s" style={{ color: "#505a5f" }}>
                    Current MP data for this county is being updated.
                  </p>
                )}

                {/* ✅ NEW: Former Members of Parliament */}
                {formerMps.length > 0 && (
                  <>
                    <h3 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
                      Former Members of Parliament
                    </h3>
                    <dl className="govuk-summary-list">
                      {formerMps.map((mp, idx) => (
                        <div key={mp.id} className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">
                            {mp.constituency || "Constituency"}
                          </dt>
                          <dd className="govuk-summary-list__value">
                            <Link href={`/government/people/${mp.slug}`} className="govuk-link govuk-link--no-visited-state">
                              {displayName(mp)}
                            </Link>
                            {mp.term_start_date && mp.term_end_date && (
                              <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                                {new Date(mp.term_start_date).getFullYear()} – {new Date(mp.term_end_date).getFullYear()}
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </section>

              {/* ========================================== */}
              {/* COUNTY ASSEMBLY (MCAs)                     */}
              {/* ========================================== */}
              <section className="govuk-!-margin-bottom-9" aria-labelledby="assembly-heading">
                <h2 id="assembly-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                  County Assembly Members
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The County Assembly is the legislative arm of the county government, comprising elected
                  ward representatives and nominated members representing special interest groups
                  including persons with disabilities, the youth, and workers.
                </p>

                <div className="govuk-inset-text govuk-!-margin-bottom-4">
                  <p className="govuk-body govuk-!-margin-bottom-1">
                    <strong>Total Assembly Members:</strong>{" "}
                    {electedMcas.length + nominatedMcas.length}
                  </p>
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    <strong>Elected Ward MCAs:</strong> {electedMcas.length} ·{" "}
                    <strong>Nominated MCAs:</strong> {nominatedMcas.length}
                  </p>
                </div>

                {/* Elected Ward MCAs Accordion */}
                <details className="govuk-details govuk-!-margin-bottom-6">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      View Elected Ward Representatives ({electedMcas.length})
                    </span>
                  </summary>
                  <div className="govuk-details__text" style={{ padding: "0" }}>
                    {electedMcas.length > 0 ? (
                      <table className="govuk-table govuk-!-margin-bottom-0">
                        <caption className="govuk-table__caption govuk-visually-hidden">
                          Elected ward representatives of {county.name} County Assembly
                        </caption>
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">MCA Name</th>
                            <th scope="col" className="govuk-table__header">Ward</th>
                            <th scope="col" className="govuk-table__header">Party</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {electedMcas.map((mca: any) => {
                            const fullName = [mca.first_name, mca.other_names, mca.surname]
                              .filter(Boolean)
                              .join(" ")
                              .trim();
                            
                            // ✅ FIXED: Access as object, not array
                            const ward = mca.wards as { name: string; ward_code: string } | null;
                            const party = mca.political_parties as { name: string; abbreviation: string } | null;

                            return (
                              <tr key={mca.id} className="govuk-table__row">
                                <th scope="row" className="govuk-table__header govuk-body-s">
                                  <Link href={`/government/people/${mca.slug}`} className="govuk-link govuk-link--no-visited-state">
                                    Hon. {fullName}
                                  </Link>
                                </th>
                                <td className="govuk-table__cell govuk-body-s">
                                  {ward?.name || "—"}
                                  {ward?.ward_code && (
                                    <span className="govuk-hint govuk-!-margin-bottom-0">
                                      {" "}({ward.ward_code})
                                    </span>
                                  )}
                                </td>
                                <td className="govuk-table__cell govuk-body-s">
                                  {party?.abbreviation || "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="govuk-body govuk-body-s govuk-!-padding-3">
                        Elected MCA data is currently being updated.
                      </p>
                    )}
                  </div>
                </details>

                {/* Nominated MCAs Accordion */}
                <details className="govuk-details govuk-!-margin-bottom-6">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      View Nominated Special Interest Representatives ({nominatedMcas.length})
                    </span>
                  </summary>
                  <div className="govuk-details__text" style={{ padding: "0" }}>
                    {nominatedMcas.length > 0 ? (
                      <table className="govuk-table govuk-!-margin-bottom-0">
                        <caption className="govuk-table__caption govuk-visually-hidden">
                          Nominated special interest representatives of {county.name} County Assembly
                        </caption>
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">MCA Name</th>
                            <th scope="col" className="govuk-table__header">Category</th>
                            <th scope="col" className="govuk-table__header">Party</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {nominatedMcas.map((mca: any) => {
                            const fullName = [mca.first_name, mca.other_names, mca.surname]
                              .filter(Boolean)
                              .join(" ")
                              .trim();
                            
                            // ✅ FIXED: Access as object, not array
                            const party = mca.political_parties as { name: string; abbreviation: string } | null;

                            return (
                              <tr key={mca.id} className="govuk-table__row">
                                <th scope="row" className="govuk-table__header govuk-body-s">
                                  <Link href={`/government/people/${mca.slug}`} className="govuk-link govuk-link--no-visited-state">
                                    Hon. {fullName}
                                  </Link>
                                </th>
                                <td className="govuk-table__cell govuk-body-s">
                                  <strong className="govuk-tag govuk-tag--purple">
                                    {mca.nomination_category || "Nominated"}
                                  </strong>
                                </td>
                                <td className="govuk-table__cell govuk-body-s">
                                  {party?.abbreviation || "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="govuk-body govuk-body-s govuk-!-padding-3">
                        Nominated MCA data is currently being updated.
                      </p>
                    )}
                  </div>
                </details>
              </section>

              {/* ========================================== */}
              {/* NAVIGATION TO OTHER OVERVIEW PAGES         */}
              {/* ========================================== */}
              <section className="govuk-!-margin-top-9" aria-labelledby="explore-heading">
                <h2 id="explore-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                  Explore more about {county.name}
                </h2>
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href={`/government/institutions/${slug}/about/demographics`} className="govuk-link govuk-link--no-visited-state">
                      Demographics & Population
                    </Link>
                  </li>
                  <li>
                    <Link href={`/government/institutions/${slug}/about/health`} className="govuk-link govuk-link--no-visited-state">
                      Health & Social Services
                    </Link>
                  </li>
                  <li>
                    <Link href={`/government/institutions/${slug}/about/education`} className="govuk-link govuk-link--no-visited-state">
                      Education & Skills Development
                    </Link>
                  </li>
                  <li>
                    <Link href={`/government/institutions/${slug}/about/economy`} className="govuk-link govuk-link--no-visited-state">
                      Economy, Agriculture & Blue Economy
                    </Link>
                  </li>
                  <li>
                    <Link href={`/government/institutions/${slug}/about/infrastructure`} className="govuk-link govuk-link--no-visited-state">
                      Infrastructure, Water & Housing
                    </Link>
                  </li>
                  <li>
                    <Link href={`/government/institutions/${slug}/about/tourism-culture`} className="govuk-link govuk-link--no-visited-state">
                      Tourism, Culture & Environment
                    </Link>
                  </li>
                </ul>
              </section>
            </div>

            {/* ============================================ */}
            {/* SIDEBAR                                      */}
            {/* ============================================ */}
            <div className="govuk-grid-column-one-third">
              <aside className="govuk-!-display-none-print" role="complementary">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                  County at a glance
                </h2>
                <dl className="govuk-!-margin-bottom-6">
                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Population (2022)
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {formatNumber(county.population)}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Land Area
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.area_km2 ? `${formatNumber(county.area_km2)} km²` : "N/A"}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Headquarters
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.headquarters || "N/A"}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Region
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.region || "N/A"}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Sub-Counties
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.sub_counties ?? "N/A"}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Constituencies
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.constituencies ?? "N/A"}
                  </dd>

                  <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    Electoral Wards
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.wards ?? "N/A"}
                  </dd>
                </dl>

                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Related content
                </h2>
                <nav role="navigation">
                  <ul className="govuk-list govuk-list--spaced">
                    <li>
                      <Link href={`/government/institutions/${slug}`} className="govuk-link">
                        {county.name} home
                      </Link>
                    </li>
                    <li>
                      <Link href={`/government/institutions/${slug}/about`} className="govuk-link">
                        About {county.name}
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/counties" className="govuk-link">
                        All 47 Counties
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/institutions" className="govuk-link">
                        All government institutions
                      </Link>
                    </li>
                  </ul>
                </nav>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}