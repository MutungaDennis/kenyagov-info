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

  const { data: historicalRoles } = await supabase
    .from("leader_roles")
    .select("title, party, constituency, term_start_date, term_end_date")
    .eq("leader_id", leader.id)
    .order("term_start_date", { ascending: false });

  const rawSittings: Array<{
    sittingDate: string;
    houseType: string;
    title: string;
    matchingContributions: Array<{
      _key: string;
      order: number;
      startTime?: string;
      sectionHeader?: string;
      speech: unknown[];
    }>;
  }> = await sanityClient.fetch(
    `*[_type == "hansardSitting" && isActive != false && count(contributions[supabaseLeaderId == $leaderId]) > 0] | order(sittingDate desc) {
      sittingDate, houseType, title,
      "matchingContributions": contributions[supabaseLeaderId == $leaderId] {
        _key, order, startTime, sectionHeader, speech
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
    })),
  );

  // Heatmap uses the full unfiltered record (true activity pulse)
  const dayCountMap = new Map<string, number>();
  fullRecord.forEach((c) => {
    dayCountMap.set(c.sittingDate, (dayCountMap.get(c.sittingDate) || 0) + 1);
  });
  const heatmapDays = Array.from(dayCountMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  let allContributions = [...fullRecord];

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
  const totalAll = fullRecord.length;
  const uniqueSittings = new Set(fullRecord.map((c) => c.sittingDate)).size;
  const firstSpeech =
    fullRecord.length > 0
      ? [...fullRecord].sort((a, b) =>
          a.sittingDate.localeCompare(b.sittingDate),
        )[0].sittingDate
      : null;
  const lastSpeech =
    fullRecord.length > 0
      ? [...fullRecord].sort((a, b) =>
          b.sittingDate.localeCompare(a.sittingDate),
        )[0].sittingDate
      : null;

  const houseMap = new Map<string, number>();
  fullRecord.forEach((c) => {
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
            <p className="govuk-body-s govuk-!-margin-bottom-0">
              {leader.title || currentRole?.title}
            </p>
          )}
        </div>
      </div>

      {/* Compact stats row */}
      <dl
        className="govuk-!-margin-bottom-6"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
          margin: 0,
        }}
      >
        {[
          { label: "Contributions", value: String(totalAll) },
          { label: "Sittings", value: String(uniqueSittings) },
          {
            label: "First recorded",
            value: firstSpeech
              ? new Date(firstSpeech + "T12:00:00").toLocaleDateString(
                  "en-KE",
                  { month: "short", year: "numeric" },
                )
              : "—",
          },
          {
            label: "Latest",
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

      {/* GitHub-style contribution pulse — primary visual */}
      {heatmapDays.length > 0 && (
        <ContributionHeatmap
          days={heatmapDays}
          memberPath={memberPath}
          memberName={leader.full_name}
        />
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
                        {new Date(role.term_start_date).getFullYear()} –{" "}
                        {role.term_end_date
                          ? new Date(role.term_end_date).getFullYear()
                          : "Present"}
                      </strong>
                      : {role.title}
                      {role.constituency ? ` for ${role.constituency}` : ""}
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

      {/* List */}
      <h2 className="govuk-heading-m">
        Spoken contributions
        {hasActiveFilter ? ` (${total} of ${totalAll})` : ` (${total})`}
      </h2>
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
