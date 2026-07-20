import Link from "next/link";
import { notFound } from "next/navigation";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ContributionHeatmap from "@/components/hansard/ContributionHeatmap";
import {
  publicHansardDayPath,
  publicHansardHousePath,
  portableTextToPlain,
} from "@/lib/hansard/speech";
import { countsTowardMemberStats } from "@/lib/hansard/stats";
import {
  buildMemberTenure,
  resolvePulseYear,
  yearWindowInTenure,
  yearsWithActivity,
} from "@/lib/hansard/tenure";
import ParliamentExplainer from "@/components/hansard/ParliamentExplainer";

export const revalidate = 3600;

const sanityClient = createSanityClient({ useCdn: true, token: null });

interface Leader {
  id: string;
  slug: string;
  full_name: string;
  title?: string | null;
  current_party?: string | null;
  current_constituency?: string | null;
  current_county?: string | null;
  bio?: string | null;
  image_url?: string | null;
  official_website?: string | null;
  contact_email?: string | null;
  phone?: string | null;
}

interface Contribution {
  _key: string;
  order: number;
  startTime?: string;
  sectionHeader?: string;
  speech: unknown[];
  isChairContribution?: boolean;
  type?: string;
  speakerTitle?: string;
  speakerName?: string;
  role?: string;
  supabaseLeaderId?: string;
  sittingDate: string;
  houseType: string;
  sittingTitle: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: "newest" | "oldest";
    section?: string;
    month?: string;
    /** Calendar year for the tenure-aware pulse */
    pulseYear?: string;
  }>;
}

function houseLabel(house: string) {
  if (house === "national-assembly") return "National Assembly";
  if (house === "senate") return "Senate";
  if (house === "county-assembly") return "County Assembly";
  return house.replace(/-/g, " ");
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Hansard contributions — ${slug.replace(/-/g, " ")}`,
    description: `Parliamentary speaking record and contribution activity.`,
  };
}

export default async function MemberContributionsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const memberPath = `/government/legislature/hansard/member/${slug}`;

  const supabase = createPublicClient();

  const { data: leaderData } = await supabase
    .from("leaders")
    .select(
      `id, slug, full_name, title, current_party, current_constituency, current_county, bio, image_url, official_website, contact_email, phone`,
    )
    .eq("slug", slug)
    .single();

  if (!leaderData) notFound();

  const leader = leaderData as Leader;

  // Prefer rich role fields when present; ignore unknown columns via soft fallback
  let historicalRoles: Array<{
    title?: string | null;
    party?: string | null;
    constituency?: string | null;
    term_start_date?: string | null;
    term_end_date?: string | null;
    entry_type?: string | null;
    status?: string | null;
  }> | null = null;

  {
    const rich = await supabase
      .from("leader_roles")
      .select(
        "title, party, constituency, term_start_date, term_end_date, entry_type, status",
      )
      .eq("leader_id", leader.id)
      .order("term_start_date", { ascending: false });

    if (!rich.error) {
      historicalRoles = rich.data;
    } else {
      const basic = await supabase
        .from("leader_roles")
        .select("title, party, constituency, term_start_date, term_end_date")
        .eq("leader_id", leader.id)
        .order("term_start_date", { ascending: false });
      historicalRoles = basic.data;
    }
  }

  const rawSittings: Array<{
    sittingDate: string;
    houseType: string;
    title: string;
    presidingOfficer?: {
      role?: string;
      displayName?: string;
      supabaseLeaderId?: string;
    };
    matchingContributions: Array<{
      _key: string;
      order: number;
      startTime?: string;
      sectionHeader?: string;
      speech: unknown[];
      isChairContribution?: boolean;
      type?: string;
      speakerTitle?: string;
      role?: string;
      speakerName?: string;
      supabaseLeaderId?: string;
    }>;
  }> = await sanityClient.fetch(
    `*[_type == "hansardSitting" && isActive != false && (
      count(contributions[supabaseLeaderId == $leaderId]) > 0 ||
      presidingOfficer.supabaseLeaderId == $leaderId
    )] | order(sittingDate desc) {
      sittingDate, houseType, title, presidingOfficer,
      "matchingContributions": contributions[supabaseLeaderId == $leaderId] {
        _key, order, startTime, sectionHeader, speech, isChairContribution, type,
        speakerTitle, role, speakerName, supabaseLeaderId
      }
    }`,
    { leaderId: leader.id },
  );

  const fullRecord: Contribution[] = rawSittings.flatMap((sitting) =>
    (sitting.matchingContributions || []).map((c) => ({
      ...c,
      sittingDate: sitting.sittingDate,
      houseType: sitting.houseType,
      sittingTitle: sitting.title,
      // Carry sitting chair so stats can exclude Temporary Speaker sittings
      _presidingOfficer: sitting.presidingOfficer,
    })),
  );

  type Row = Contribution & {
    _presidingOfficer?: {
      role?: string;
      displayName?: string;
      supabaseLeaderId?: string;
    };
  };

  const asStatsCtx = (c: Row) => ({
    type: c.type || "spoken",
    isChairContribution: c.isChairContribution,
    speakerTitle: c.speakerTitle,
    role: c.role,
    speakerName: c.speakerName || c.speakerTitle,
    supabaseLeaderId: c.supabaseLeaderId || leader.id,
    // Sitting-level Temporary Speaker must not rewrite historical turns
  });

  // Floor debates only — exclude when this member was the sitting's Temporary/Deputy/Speaker
  const memberRecord = (fullRecord as Row[]).filter((c) =>
    countsTowardMemberStats(asStatsCtx(c)),
  );
  const chairOnlyCount = (fullRecord as Row[]).filter(
    (c) =>
      (c.type || "spoken") === "spoken" &&
      !countsTowardMemberStats(asStatsCtx(c)),
  ).length;

  // Heatmap: member floor activity (not chair turns)
  const dayCountMap = new Map<string, number>();
  memberRecord.forEach((c) => {
    dayCountMap.set(c.sittingDate, (dayCountMap.get(c.sittingDate) || 0) + 1);
  });
  const heatmapDays = Array.from(dayCountMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const firstSpeech =
    memberRecord.length > 0
      ? [...memberRecord].sort((a, b) =>
          a.sittingDate.localeCompare(b.sittingDate),
        )[0].sittingDate
      : null;
  const lastSpeech =
    memberRecord.length > 0
      ? [...memberRecord].sort((a, b) =>
          b.sittingDate.localeCompare(a.sittingDate),
        )[0].sittingDate
      : null;

  const tenure = buildMemberTenure({
    roles: historicalRoles,
    activityFirst: firstSpeech,
    activityLast: lastSpeech,
  });

  const activityYears = yearsWithActivity(heatmapDays, tenure.years);
  const pulseYear = resolvePulseYear(
    filters.pulseYear,
    tenure.years.length ? tenure.years : activityYears,
    activityYears,
  );

  const yearWin =
    pulseYear && tenure.tenureStart && tenure.tenureEnd
      ? yearWindowInTenure(pulseYear, tenure.tenureStart, tenure.tenureEnd)
      : pulseYear && firstSpeech && lastSpeech
        ? yearWindowInTenure(
            pulseYear,
            firstSpeech,
            lastSpeech > new Date().toISOString().slice(0, 10)
              ? new Date().toISOString().slice(0, 10)
              : lastSpeech,
          )
        : null;

  const tenureActiveDays = heatmapDays.filter((d) => {
    if (!tenure.tenureStart || !tenure.tenureEnd) return true;
    return d.date >= tenure.tenureStart && d.date <= tenure.tenureEnd;
  }).length;

  let allContributions = [...memberRecord];

  const keyword = filters.keyword?.toLowerCase().trim();
  let dateFrom = filters.dateFrom;
  let dateTo = filters.dateTo;
  const sort = filters.sort || "newest";

  if (filters.month) {
    dateFrom = `${filters.month}-01`;
    const lastDay = new Date(
      new Date(dateFrom).getFullYear(),
      new Date(dateFrom).getMonth() + 1,
      0,
    ).getDate();
    dateTo = `${filters.month}-${lastDay.toString().padStart(2, "0")}`;
  }

  if (keyword) {
    allContributions = allContributions.filter((c) =>
      portableTextToPlain(c.speech).toLowerCase().includes(keyword),
    );
  }
  if (dateFrom) {
    allContributions = allContributions.filter(
      (c) => c.sittingDate >= dateFrom!,
    );
  }
  if (dateTo) {
    allContributions = allContributions.filter((c) => c.sittingDate <= dateTo!);
  }

  allContributions.sort((a, b) =>
    sort === "oldest"
      ? a.sittingDate.localeCompare(b.sittingDate)
      : b.sittingDate.localeCompare(a.sittingDate),
  );

  const total = allContributions.length;
  const totalAll = memberRecord.length;
  const uniqueSittings = new Set(memberRecord.map((c) => c.sittingDate)).size;

  const houseMap = new Map<string, number>();
  memberRecord.forEach((c) => {
    houseMap.set(c.houseType, (houseMap.get(c.houseType) || 0) + 1);
  });
  const houseBreakdown = Array.from(houseMap.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  const currentRole = historicalRoles?.[0];
  const hasContact =
    leader.contact_email || leader.phone || leader.official_website;
  const hasBio = !!leader.bio;
  const hasHistory = Boolean(historicalRoles && historicalRoles.length > 0);

  const initials = leader.full_name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasActiveFilter = Boolean(
    keyword || dateFrom || dateTo || filters.month,
  );

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
          {
            text: "Members",
            href: "/government/legislature/hansard/members",
          },
          { text: leader.full_name },
        ]}
      />

      <Link
        href="/government/legislature/hansard/members"
        className="govuk-back-link"
      >
        Back to members
      </Link>

      <p className="govuk-body-s govuk-!-margin-bottom-3">
        <Link href="/find-your-representatives" className="govuk-link">
          Find your representatives
        </Link>
        {" · "}
        <Link
          href="/government/legislature/hansard/national-assembly"
          className="govuk-link"
        >
          National Assembly sittings
        </Link>
        {" · "}
        <Link
          href="/government/legislature/hansard/senate"
          className="govuk-link"
        >
          Senate sittings
        </Link>
      </p>

      {/* Identity — compact */}
      <div
        className="govuk-!-margin-bottom-5"
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {leader.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={leader.image_url}
            alt=""
            width={80}
            height={80}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #b1b4b6",
            }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "#1d70b8",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-1">
            {leader.full_name}
          </h1>
          <p className="govuk-body govuk-!-margin-bottom-1">
            {[
              leader.current_party,
              leader.current_constituency,
              leader.current_county,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {(leader.title || currentRole) && (
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              {leader.title || currentRole?.title}
            </p>
          )}
          {tenure.summaryLabel && tenure.summaryLabel !== "Office tenure not recorded" && (
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              <strong>Office tenure (for pulse):</strong> {tenure.summaryLabel}
              {tenure.stillServing ? " · still serving" : ""}
            </p>
          )}
        </div>
      </div>

      <ParliamentExplainer variant="member" memberName={leader.full_name} />

      {/* Compact stats row */}
      <dl
        className="govuk-!-margin-bottom-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
          margin: 0,
        }}
      >
        {[
          {
            label: "Floor speeches (on this site)",
            value: String(totalAll),
          },
          {
            label: "Sitting days with a speech",
            value: String(uniqueSittings),
          },
          {
            label: "First speech here",
            value: firstSpeech
              ? new Date(firstSpeech + "T12:00:00").toLocaleDateString(
                  "en-KE",
                  { month: "short", year: "numeric" },
                )
              : "—",
          },
          {
            label: "Latest speech here",
            value: lastSpeech
              ? new Date(lastSpeech + "T12:00:00").toLocaleDateString(
                  "en-KE",
                  { month: "short", year: "numeric" },
                )
              : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              border: "1px solid #b1b4b6",
              padding: "12px 14px",
              background: "#fff",
            }}
          >
            <dt
              className="govuk-body-s"
              style={{ margin: 0, color: "#505a5f" }}
            >
              {stat.label}
            </dt>
            <dd
              className="govuk-heading-m"
              style={{ margin: "4px 0 0", fontSize: "1.35rem" }}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {chairOnlyCount > 0 && (
        <div className="govuk-inset-text govuk-!-margin-bottom-4">
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            <strong>{chairOnlyCount}</strong> intervention
            {chairOnlyCount === 1 ? "" : "s"} as Speaker, Deputy Speaker, or
            Temporary Speaker (moderating the House) are{" "}
            <strong>not included</strong> in floor totals, the activity pulse, or
            the list below. Chairing is important, but it is not the same as
            speaking as a Member in debate — we keep them separate so
            accountability stays fair.
          </p>
        </div>
      )}

      {totalAll > 0 && (
        <p className="govuk-body-s govuk-!-margin-bottom-4">
          <strong>In plain language:</strong> On sittings we have published and
          linked, this member made floor contributions on{" "}
          <strong>{uniqueSittings}</strong> day
          {uniqueSittings === 1 ? "" : "s"} (
          <strong>{totalAll}</strong> speech
          {totalAll === 1 ? "" : "es"}). Use the pulse below to see{" "}
          <em>when</em>, and open a sitting to see <em>what</em> was said.
        </p>
      )}

      {/* Tenure-aware contribution pulse — floor activity only */}
      {yearWin && pulseYear && (
        <ContributionHeatmap
          days={heatmapDays}
          memberPath={memberPath}
          memberName={leader.full_name}
          rangeStart={yearWin.rangeStart}
          rangeEnd={yearWin.rangeEnd}
          tenureSegments={tenure.segments.map((s) => ({
            start: s.start,
            end: s.end,
          }))}
          pulseYear={pulseYear}
          yearOptions={
            tenure.years.length
              ? tenure.years
              : activityYears.length
                ? activityYears
                : [pulseYear]
          }
          yearsWithActivity={activityYears}
          queryPreserve={{
            keyword: filters.keyword,
            sort: filters.sort,
          }}
          tenureSummary={tenure.summaryLabel}
          coverageNote={tenure.coverageNote}
          entryHints={tenure.entryHints}
          stillServing={tenure.stillServing}
          tenureTotals={{
            contributions: totalAll,
            activeDays: tenureActiveDays,
          }}
        />
      )}

      {!yearWin && heatmapDays.length === 0 && (
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            No floor contributions linked yet. When sittings are published and
            linked to this member, a tenure-aware activity pulse will appear
            here.
          </p>
        </div>
      )}

      {houseBreakdown.length > 0 && (
        <p className="govuk-body-s govuk-!-margin-bottom-6">
          By house:{" "}
          {houseBreakdown.map(([house, count], i) => (
            <span key={house}>
              {i > 0 ? " · " : ""}
              <Link
                href={publicHansardHousePath(house)}
                className="govuk-link"
              >
                {houseLabel(house)}
              </Link>{" "}
              ({count})
            </span>
          ))}
        </p>
      )}

      {/* Secondary details collapsed */}
      {(hasBio || hasContact || hasHistory) && (
        <div className="govuk-!-margin-bottom-6">
          {hasBio && (
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">About</span>
              </summary>
              <div
                className="govuk-details__text govuk-body-s"
                style={{ whiteSpace: "pre-line" }}
              >
                {leader.bio}
              </div>
            </details>
          )}
          {hasContact && (
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Contact</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  {leader.contact_email && (
                    <li>
                      <a
                        href={`mailto:${leader.contact_email}`}
                        className="govuk-link"
                      >
                        {leader.contact_email}
                      </a>
                    </li>
                  )}
                  {leader.phone && (
                    <li>
                      <a href={`tel:${leader.phone}`} className="govuk-link">
                        {leader.phone}
                      </a>
                    </li>
                  )}
                  {leader.official_website && (
                    <li>
                      <a
                        href={leader.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="govuk-link"
                      >
                        Official website
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </details>
          )}
          {hasHistory && (
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Parliamentary history
                </span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  {historicalRoles!.map((role, idx) => (
                    <li key={idx}>
                      <strong>
                        {role.term_start_date
                          ? new Date(
                              role.term_start_date.slice(0, 10) + "T12:00:00",
                            ).toLocaleDateString("en-KE", {
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}{" "}
                        –{" "}
                        {role.term_end_date
                          ? new Date(
                              role.term_end_date.slice(0, 10) + "T12:00:00",
                            ).toLocaleDateString("en-KE", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Present"}
                      </strong>
                      : {role.title}
                      {role.constituency ? ` for ${role.constituency}` : ""}
                      {role.entry_type
                        ? ` (${String(role.entry_type).replace(/_/g, " ")})`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Search / filter — under activity */}
      <form
        method="GET"
        className="govuk-!-margin-bottom-5"
        style={{ backgroundColor: "#f3f2f1", padding: 16 }}
      >
        <h2 className="govuk-heading-s govuk-!-margin-bottom-3">
          Search speeches
        </h2>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="keyword">
                Keyword
              </label>
              <input
                className="govuk-input"
                id="keyword"
                name="keyword"
                type="search"
                defaultValue={keyword || ""}
                placeholder="Search speeches…"
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="dateFrom">
                From
              </label>
              <input
                className="govuk-input"
                id="dateFrom"
                type="date"
                name="dateFrom"
                defaultValue={filters.month ? "" : dateFrom || ""}
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="dateTo">
                To
              </label>
              <input
                className="govuk-input"
                id="dateTo"
                type="date"
                name="dateTo"
                defaultValue={filters.month ? "" : dateTo || ""}
              />
            </div>
          </div>
        </div>
        <div className="govuk-form-group govuk-!-margin-bottom-3">
          <label className="govuk-label" htmlFor="sort">
            Sort
          </label>
          <select
            className="govuk-select"
            id="sort"
            name="sort"
            defaultValue={sort}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="govuk-button-group govuk-!-margin-bottom-0">
          <button type="submit" className="govuk-button">
            Search
          </button>
          <Link
            href={memberPath}
            className="govuk-button govuk-button--secondary"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* List — floor debate only */}
      <h2 className="govuk-heading-m">
        Floor contributions
        {hasActiveFilter ? ` (${total} of ${totalAll})` : ` (${total})`}
      </h2>
      <p className="govuk-hint">
        Speeches made as a Member in debate. Does not include turns as Speaker,
        Deputy Speaker, or Temporary Speaker while moderating the sitting.
      </p>
      {hasActiveFilter && (
        <p className="govuk-body-s">
          Filters applied.{" "}
          <Link href={memberPath} className="govuk-link">
            Show all
          </Link>
        </p>
      )}

      {total === 0 ? (
        <div className="govuk-inset-text">
          No contributions found matching your filters.
        </div>
      ) : (
        <div style={{ maxWidth: "42rem" }}>
          {allContributions.map((contrib, index) => {
            const preview = portableTextToPlain(contrib.speech);
            return (
              <article
                key={`${contrib.sittingDate}-${contrib._key || index}`}
                style={{
                  borderTop: "1px solid #b1b4b6",
                  padding: "0.85rem 0",
                }}
              >
                <h3
                  className="govuk-heading-s"
                  style={{ margin: "0 0 0.35rem", fontSize: "1rem" }}
                >
                  <Link
                    href={publicHansardDayPath(
                      contrib.houseType,
                      contrib.sittingDate,
                    )}
                    className="govuk-link"
                  >
                    {new Date(
                      contrib.sittingDate + "T12:00:00",
                    ).toLocaleDateString("en-KE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Link>
                  <span
                    style={{
                      fontWeight: 400,
                      color: "#505a5f",
                      marginLeft: 8,
                      fontSize: "0.875rem",
                    }}
                  >
                    {houseLabel(contrib.houseType)}
                  </span>
                </h3>
                <p
                  className="govuk-body-s"
                  style={{ margin: "0 0 0.35rem", color: "#505a5f" }}
                >
                  {contrib.sittingTitle}
                  {contrib.sectionHeader ? ` · ${contrib.sectionHeader}` : ""}
                  {contrib.startTime ? ` · ${contrib.startTime}` : ""}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                    color: "#0b0c0c",
                  }}
                >
                  {preview.length > 240
                    ? preview.slice(0, 240) + "…"
                    : preview || "—"}
                </p>
                <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                  <Link
                    href={publicHansardDayPath(
                      contrib.houseType,
                      contrib.sittingDate,
                    )}
                    className="govuk-link"
                  >
                    Open sitting
                  </Link>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
