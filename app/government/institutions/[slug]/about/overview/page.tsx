import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import CountyAboutNav from "@/components/government/CountyAboutNav";

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
  image_url: string | null;
};

type RoleRow = {
  id: string;
  title: string | null;
  status: string | null;
  seat_type: string | null;
  entry_type: string | null;
  nomination_category: string | null;
  constituency: string | null;
  county: string | null;
  county_id: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  leaders: Leader | Leader[] | null;
};

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
  status: string | null;
  wards: { name: string; ward_code: string } | null;
  political_parties: { name: string; abbreviation: string } | null;
};

type OfficeBucket = {
  current: Leader | null;
  former: Leader[];
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function displayName(leader: Leader | null): string {
  if (!leader) return "Office currently vacant";
  const parts = [leader.first_name, leader.other_names, leader.surname].filter(
    Boolean,
  );
  return parts.join(" ").trim() || leader.full_name || "Unknown";
}

function unwrapLeader(raw: Leader | Leader[] | null | undefined): Leader | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] || null : raw;
}

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Active = role.status Active (case-insensitive). Do NOT use leaders.is_active. */
function isRoleActive(role: RoleRow): boolean {
  const s = norm(role.status);
  if (s === "active") return true;
  if (s === "former" || s === "ended" || s === "suspended" || s === "vacant") {
    return false;
  }
  // Fallback: open-ended term with no explicit former status
  if (!role.term_end_date && (!s || s === "current")) return true;
  return false;
}

/**
 * Classify a leader_roles.title into a county office bucket.
 * Matching is on the ROLE title, so a governor who also sits on a committee
 * still matches Governor when that Active role's title is Governor.
 */
function classifyCountyRole(role: RoleRow): string | null {
  const t = norm(role.title);
  const seat = norm(role.seat_type || role.entry_type);
  const nominated =
    seat.includes("nominat") || t.includes("nominated");

  if (t.includes("deputy governor")) return "Deputy Governor";
  if (t.includes("governor")) return "Governor";

  // Elected county senator only — nominated senators represent special interests
  if (
    (t === "senator" || t === "elected senator" || t.includes("senator")) &&
    !nominated &&
    !t.includes("nominated")
  ) {
    return "Senator";
  }

  if (t.includes("women representative") || t.includes("woman representative")) {
    return "Woman Representative";
  }

  if (
    t.includes("member of parliament") ||
    t === "mp" ||
    t.includes("member of the national assembly")
  ) {
    if (nominated || t.includes("nominated")) return null;
    return "MP";
  }

  return null;
}

function LeaderCard({
  leader,
  roleLabel,
  isFormer = false,
  meta,
}: {
  leader: Leader | null;
  roleLabel: string;
  isFormer?: boolean;
  meta?: string | null;
}) {
  const name = displayName(leader);
  const hasImage = leader?.image_url && leader.image_url.trim();

  return (
    <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
      <div
        className="app-leader-card"
        style={{
          border: "1px solid #b1b4b6",
          padding: "20px",
          background: "#ffffff",
          height: "100%",
          opacity: isFormer ? 0.85 : 1,
        }}
      >
        <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
          {hasImage ? (
            <div
              style={{
                width: "80px",
                height: "80px",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
                background: "#f3f2f1",
                borderRadius: "50%",
              }}
            >
              <Image
                src={leader!.image_url!}
                alt={name}
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
            </div>
          ) : (
            <div
              style={{
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
              }}
            >
              {name.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="govuk-caption-s govuk-!-margin-bottom-1"
              style={{ color: "#505a5f" }}
            >
              {isFormer ? "Former " : ""}
              {roleLabel}
            </p>
            {leader?.slug ? (
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                <Link
                  href={`/government/people/${leader.slug}`}
                  className="govuk-link govuk-link--no-visited-state"
                >
                  {name}
                </Link>
              </h3>
            ) : (
              <h3
                className="govuk-heading-s govuk-!-margin-bottom-1"
                style={{ color: "#505a5f" }}
              >
                {name}
              </h3>
            )}
            {meta ? (
              <p className="govuk-body-s govuk-!-margin-bottom-0">{meta}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function pushUniqueFormer(list: Leader[], leader: Leader) {
  if (!list.some((l) => l.id === leader.id)) list.push(leader);
}

export default async function CountyOverviewPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!county) notFound();

  const { data: institution } = await supabase
    .from("institutions")
    .select("vision, mission, description")
    .eq("slug", slug)
    .maybeSingle();

  // Resolve officers from leader_roles (not leaders.title / leaders.is_active).
  // A governor with another Active committee role still matches via the Governor role row.
  const { data: roleRows, error: rolesError } = await supabase
    .from("leader_roles")
    .select(
      `
      id, title, status, seat_type, entry_type, nomination_category,
      constituency, county, county_id, term_start_date, term_end_date,
      leaders!leader_roles_leader_id_fkey (
        id, slug, full_name, first_name, other_names, surname, image_url
      )
    `,
    )
    .or(`county_id.eq.${county.id},county.eq.${county.name}`);

  if (rolesError) {
    console.error("[county overview] leader_roles query failed:", rolesError);
  }

  const leadersByTitle: Record<string, OfficeBucket> = {
    Governor: { current: null, former: [] },
    "Deputy Governor": { current: null, former: [] },
    Senator: { current: null, former: [] },
    "Woman Representative": { current: null, former: [] },
  };

  const mpsByConstituency: Record<
    string,
    { current: Leader | null; former: Leader[] }
  > = {};

  for (const raw of roleRows || []) {
    const role = raw as RoleRow;
    const leader = unwrapLeader(role.leaders);
    if (!leader) continue;

    const matchedRole = classifyCountyRole(role);
    if (!matchedRole) continue;

    const active = isRoleActive(role);

    if (matchedRole === "MP") {
      const constName = role.constituency?.trim() || "Unknown Constituency";
      if (!mpsByConstituency[constName]) {
        mpsByConstituency[constName] = { current: null, former: [] };
      }
      if (active) {
        // Prefer the Active MP; never overwrite with a former
        if (!mpsByConstituency[constName].current) {
          mpsByConstituency[constName].current = leader;
        }
      } else {
        // Do not list someone as former if they are also the current holder
        if (mpsByConstituency[constName].current?.id !== leader.id) {
          pushUniqueFormer(mpsByConstituency[constName].former, leader);
        }
      }
      continue;
    }

    const bucket = leadersByTitle[matchedRole];
    if (!bucket) continue;

    if (active) {
      // Only Active roles become "current". Multi-role leaders still qualify
      // because we matched on this role's title, not leaders.title.
      if (!bucket.current) bucket.current = leader;
    } else {
      // Never promote a Former/Ended role to current
      if (bucket.current?.id !== leader.id) {
        pushUniqueFormer(bucket.former, leader);
      }
    }
  }

  // If someone appears in both current and former (data quirk), drop from former
  for (const key of Object.keys(leadersByTitle)) {
    const b = leadersByTitle[key];
    if (b.current) {
      b.former = b.former.filter((l) => l.id !== b.current!.id);
    }
  }
  for (const constName of Object.keys(mpsByConstituency)) {
    const b = mpsByConstituency[constName];
    if (b.current) {
      b.former = b.former.filter((l) => l.id !== b.current!.id);
    }
  }

  const { data: mcas } = await supabase
    .from("mcas")
    .select(
      `
      id, slug, first_name, other_names, surname, gender, seat_type,
      nomination_category, assembly_role, status,
      wards:ward_id (name, ward_code),
      political_parties:party_id (name, abbreviation)
    `,
    )
    .eq("county_id", county.id)
    .order("seat_type", { ascending: true })
    .order("surname", { ascending: true });

  const allMcas = (mcas || []) as unknown as Mca[];
  const isMcaActive = (m: Mca) => norm(m.status) === "active";
  const electedMcas = allMcas.filter(
    (m) => m.seat_type === "Elected" && isMcaActive(m),
  );
  const nominatedMcas = allMcas.filter(
    (m) => m.seat_type === "Nominated" && isMcaActive(m),
  );
  const formerMcas = allMcas.filter((m) => !isMcaActive(m));

  const hasAnyFormer =
    leadersByTitle.Governor.former.length > 0 ||
    leadersByTitle["Deputy Governor"].former.length > 0 ||
    leadersByTitle.Senator.former.length > 0 ||
    leadersByTitle["Woman Representative"].former.length > 0 ||
    Object.values(mpsByConstituency).some((b) => b.former.length > 0) ||
    formerMcas.length > 0;

  const sortedMpConstituencies = Object.keys(mpsByConstituency).sort((a, b) =>
    a.localeCompare(b),
  );

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
                {/\bcounty\b/i.test(county.name)
                  ? `${county.name} — Overview`
                  : `${county.name} County — Overview`}
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                {institution?.description ||
                  `Overview of ${county.name} leadership and representation across the County Executive, Senate, National Assembly, and County Assembly.`}
              </p>
            </div>
          </div>

          {(institution?.vision || institution?.mission) && (
            <div className="govuk-grid-row govuk-!-margin-bottom-8">
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  {institution?.vision && (
                    <div className="govuk-!-margin-bottom-4">
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                        Vision
                      </h2>
                      <p className="govuk-body govuk-!-margin-bottom-0">
                        {institution.vision}
                      </p>
                    </div>
                  )}
                  {institution?.mission && (
                    <div>
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                        Mission
                      </h2>
                      <p className="govuk-body govuk-!-margin-bottom-0">
                        {institution.mission}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <section
                className="govuk-!-margin-bottom-9"
                aria-labelledby="exec-heading"
              >
                <h2
                  id="exec-heading"
                  className="govuk-heading-l govuk-!-margin-bottom-4"
                >
                  County Executive Leadership
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The County Executive is headed by the Governor and Deputy
                  Governor.
                </p>
                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Current Leadership
                </h3>
                <div className="govuk-grid-row">
                  <LeaderCard
                    leader={leadersByTitle.Governor.current}
                    roleLabel="Governor"
                  />
                  <LeaderCard
                    leader={leadersByTitle["Deputy Governor"].current}
                    roleLabel="Deputy Governor"
                  />
                </div>
              </section>

              <section
                className="govuk-!-margin-bottom-9"
                aria-labelledby="senate-heading"
              >
                <h2
                  id="senate-heading"
                  className="govuk-heading-l govuk-!-margin-bottom-4"
                >
                  Senate Representation
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The elected Senator represents {county.name} in the Senate of
                  Kenya.
                </p>
                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Current Senator
                </h3>
                <div className="govuk-grid-row">
                  <LeaderCard
                    leader={leadersByTitle.Senator.current}
                    roleLabel="Senator"
                  />
                </div>
              </section>

              <section
                className="govuk-!-margin-bottom-9"
                aria-labelledby="na-heading"
              >
                <h2
                  id="na-heading"
                  className="govuk-heading-l govuk-!-margin-bottom-4"
                >
                  National Assembly Representation
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The county is represented by constituency MPs and a County
                  Woman Representative.
                </p>

                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Current Woman Representative
                </h3>
                <div className="govuk-grid-row govuk-!-margin-bottom-6">
                  <LeaderCard
                    leader={leadersByTitle["Woman Representative"].current}
                    roleLabel="Woman Representative"
                  />
                </div>

                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">
                  Members of Parliament
                </h3>
                {sortedMpConstituencies.length > 0 ? (
                  <dl className="govuk-summary-list">
                    {sortedMpConstituencies.map((constName) => {
                      const data = mpsByConstituency[constName];
                      return (
                        <div
                          key={constName}
                          className="govuk-summary-list__row"
                        >
                          <dt className="govuk-summary-list__key">
                            {constName}
                          </dt>
                          <dd className="govuk-summary-list__value">
                            {data.current ? (
                              <Link
                                href={`/government/people/${data.current.slug}`}
                                className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                              >
                                {displayName(data.current)}{" "}
                                <span className="govuk-tag govuk-tag--green govuk-!-font-size-14 govuk-!-margin-left-2">
                                  Current
                                </span>
                              </Link>
                            ) : (
                              <span className="govuk-body-s">
                                No current MP data
                              </span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : (
                  <p
                    className="govuk-body govuk-body-s"
                    style={{ color: "#505a5f" }}
                  >
                    MP data for this county is currently being updated.
                  </p>
                )}
              </section>

              <section
                className="govuk-!-margin-bottom-9"
                aria-labelledby="assembly-heading"
              >
                <h2
                  id="assembly-heading"
                  className="govuk-heading-l govuk-!-margin-bottom-4"
                >
                  County Assembly Members
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  The County Assembly comprises elected ward representatives and
                  nominated members for special interest groups.
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

                <details className="govuk-details govuk-!-margin-bottom-6">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      View Elected Ward Representatives ({electedMcas.length})
                    </span>
                  </summary>
                  <div className="govuk-details__text" style={{ padding: "0" }}>
                    {electedMcas.length > 0 ? (
                      <div className="govuk-table-responsive">
                        <table className="govuk-table govuk-!-margin-bottom-0">
                          <caption className="govuk-table__caption govuk-visually-hidden">
                            Elected ward representatives of {county.name}{" "}
                            Assembly
                          </caption>
                          <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                              <th scope="col" className="govuk-table__header">
                                MCA Name
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Ward
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Party
                              </th>
                            </tr>
                          </thead>
                          <tbody className="govuk-table__body">
                            {electedMcas.map((mca) => {
                              const fullName = [
                                mca.first_name,
                                mca.other_names,
                                mca.surname,
                              ]
                                .filter(Boolean)
                                .join(" ")
                                .trim();
                              const ward = Array.isArray(mca.wards)
                                ? mca.wards[0]
                                : mca.wards;
                              const party = Array.isArray(mca.political_parties)
                                ? mca.political_parties[0]
                                : mca.political_parties;
                              return (
                                <tr key={mca.id} className="govuk-table__row">
                                  <th
                                    scope="row"
                                    className="govuk-table__header govuk-body-s"
                                  >
                                    <Link
                                      href={`/government/people/${mca.slug}`}
                                      className="govuk-link govuk-link--no-visited-state"
                                    >
                                      Hon. {fullName}
                                    </Link>
                                  </th>
                                  <td className="govuk-table__cell govuk-body-s">
                                    {ward?.name || "—"}
                                    {ward?.ward_code ? (
                                      <span className="govuk-hint govuk-!-margin-bottom-0">
                                        {" "}
                                        ({ward.ward_code})
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="govuk-table__cell govuk-body-s">
                                    {party?.abbreviation || "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="govuk-body govuk-body-s govuk-!-padding-3">
                        Elected MCA data is currently being updated.
                      </p>
                    )}
                  </div>
                </details>

                <details className="govuk-details govuk-!-margin-bottom-6">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      View Nominated Special Interest Representatives (
                      {nominatedMcas.length})
                    </span>
                  </summary>
                  <div className="govuk-details__text" style={{ padding: "0" }}>
                    {nominatedMcas.length > 0 ? (
                      <div className="govuk-table-responsive">
                        <table className="govuk-table govuk-!-margin-bottom-0">
                          <caption className="govuk-table__caption govuk-visually-hidden">
                            Nominated special interest representatives of{" "}
                            {county.name} Assembly
                          </caption>
                          <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                              <th scope="col" className="govuk-table__header">
                                MCA Name
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Category
                              </th>
                              <th scope="col" className="govuk-table__header">
                                Party
                              </th>
                            </tr>
                          </thead>
                          <tbody className="govuk-table__body">
                            {nominatedMcas.map((mca) => {
                              const fullName = [
                                mca.first_name,
                                mca.other_names,
                                mca.surname,
                              ]
                                .filter(Boolean)
                                .join(" ")
                                .trim();
                              const party = Array.isArray(mca.political_parties)
                                ? mca.political_parties[0]
                                : mca.political_parties;
                              return (
                                <tr key={mca.id} className="govuk-table__row">
                                  <th
                                    scope="row"
                                    className="govuk-table__header govuk-body-s"
                                  >
                                    <Link
                                      href={`/government/people/${mca.slug}`}
                                      className="govuk-link govuk-link--no-visited-state"
                                    >
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
                      </div>
                    ) : (
                      <p className="govuk-body govuk-body-s govuk-!-padding-3">
                        Nominated MCA data is currently being updated.
                      </p>
                    )}
                  </div>
                </details>
              </section>

              {/* Former office-holders — one accordion below MCAs */}
              {hasAnyFormer && (
                <section
                  className="govuk-!-margin-bottom-9"
                  aria-labelledby="former-heading"
                >
                  <h2
                    id="former-heading"
                    className="govuk-heading-l govuk-!-margin-bottom-4"
                  >
                    Former office-holders
                  </h2>
                  <p className="govuk-body govuk-!-margin-bottom-4">
                    Browse people who previously held elected or nominated seats
                    associated with {county.name}.
                  </p>

                  <details className="govuk-details" open={false}>
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        View former Governors, Deputy Governors, Senators, MPs,
                        Woman Representatives and MCAs
                      </span>
                    </summary>
                    <div className="govuk-details__text">
                      {leadersByTitle.Governor.former.length > 0 && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-2 govuk-!-margin-bottom-2">
                            Former Governors
                          </h3>
                          <div className="govuk-grid-row">
                            {leadersByTitle.Governor.former.map((leader) => (
                              <LeaderCard
                                key={leader.id}
                                leader={leader}
                                roleLabel="Governor"
                                isFormer
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {leadersByTitle["Deputy Governor"].former.length > 0 && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
                            Former Deputy Governors
                          </h3>
                          <div className="govuk-grid-row">
                            {leadersByTitle["Deputy Governor"].former.map(
                              (leader) => (
                                <LeaderCard
                                  key={leader.id}
                                  leader={leader}
                                  roleLabel="Deputy Governor"
                                  isFormer
                                />
                              ),
                            )}
                          </div>
                        </>
                      )}

                      {leadersByTitle.Senator.former.length > 0 && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
                            Former Senators
                          </h3>
                          <div className="govuk-grid-row">
                            {leadersByTitle.Senator.former.map((leader) => (
                              <LeaderCard
                                key={leader.id}
                                leader={leader}
                                roleLabel="Senator"
                                isFormer
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {sortedMpConstituencies.some(
                        (c) => mpsByConstituency[c].former.length > 0,
                      ) && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
                            Former Members of Parliament
                          </h3>
                          <dl className="govuk-summary-list">
                            {sortedMpConstituencies.map((constName) => {
                              const formers =
                                mpsByConstituency[constName].former;
                              if (!formers.length) return null;
                              return (
                                <div
                                  key={`former-mp-${constName}`}
                                  className="govuk-summary-list__row"
                                >
                                  <dt className="govuk-summary-list__key">
                                    {constName}
                                  </dt>
                                  <dd className="govuk-summary-list__value">
                                    <ul className="govuk-list govuk-!-margin-bottom-0">
                                      {formers.map((mp) => (
                                        <li key={mp.id}>
                                          <Link
                                            href={`/government/people/${mp.slug}`}
                                            className="govuk-link govuk-link--no-visited-state"
                                          >
                                            {displayName(mp)}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                              );
                            })}
                          </dl>
                        </>
                      )}

                      {leadersByTitle["Woman Representative"].former.length >
                        0 && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
                            Former Woman Representatives
                          </h3>
                          <div className="govuk-grid-row">
                            {leadersByTitle["Woman Representative"].former.map(
                              (leader) => (
                                <LeaderCard
                                  key={leader.id}
                                  leader={leader}
                                  roleLabel="Woman Representative"
                                  isFormer
                                />
                              ),
                            )}
                          </div>
                        </>
                      )}

                      {formerMcas.length > 0 && (
                        <>
                          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
                            Former MCAs ({formerMcas.length})
                          </h3>
                          <ul className="govuk-list">
                            {formerMcas.map((mca) => {
                              const fullName = [
                                mca.first_name,
                                mca.other_names,
                                mca.surname,
                              ]
                                .filter(Boolean)
                                .join(" ")
                                .trim();
                              const ward = Array.isArray(mca.wards)
                                ? mca.wards[0]
                                : mca.wards;
                              return (
                                <li key={mca.id}>
                                  <Link
                                    href={`/government/people/${mca.slug}`}
                                    className="govuk-link govuk-link--no-visited-state"
                                  >
                                    Hon. {fullName}
                                  </Link>
                                  {ward?.name ? (
                                    <span className="govuk-hint">
                                      {" "}
                                      — {ward.name}
                                    </span>
                                  ) : mca.seat_type === "Nominated" ? (
                                    <span className="govuk-hint">
                                      {" "}
                                      — Nominated
                                      {mca.nomination_category
                                        ? ` (${mca.nomination_category})`
                                        : ""}
                                    </span>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  </details>
                </section>
              )}

            </div>

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
                    Land area
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.area_km2
                      ? `${formatNumber(county.area_km2)} km²`
                      : "N/A"}
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
                    Sub-counties
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
                    Electoral wards
                  </dt>
                  <dd className="govuk-body-s govuk-!-margin-bottom-3">
                    {county.wards ?? "N/A"}
                  </dd>
                </dl>
              </aside>
              <CountyAboutNav
                countySlug={slug}
                countyName={county.name}
                current="overview"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
