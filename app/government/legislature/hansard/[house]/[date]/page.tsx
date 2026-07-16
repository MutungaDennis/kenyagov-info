import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import ContributionCard from "@/components/hansard/ContributionCard";
import {
  publicHansardDayPath,
  publicHansardHousePath,
} from "@/lib/hansard/speech";
import {
  countsTowardMemberStats,
  isPresidingOfficerContribution,
  chairRoleDisplayLabel,
  resolveChairRole,
  presidingRoleLabel,
} from "@/lib/hansard/stats";

export const revalidate = 3600;

const sanityClient = createSanityClient({ useCdn: true, token: null });

type ContributionType =
  | "spoken"
  | "procedural"
  | "header"
  | "mini-header";

interface Contribution {
  _key: string;
  order: number;
  type: ContributionType;
  supabaseLeaderId?: string;
  speakerName?: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  isChairContribution?: boolean;
  startTime?: string;
  sectionHeader?: string;
  speech: unknown[];
}

interface EnrichedContribution extends Contribution {
  enrichedSpeaker?: {
    full_name: string;
    title?: string;
    current_constituency?: string;
    current_party?: string;
    current_county?: string;
    slug?: string;
    image_url?: string | null;
    contributionCount?: number;
  };
}

interface PresidingOfficer {
  role?: string;
  displayName?: string;
  supabaseLeaderId?: string;
  notes?: string;
}

interface Sitting {
  _id: string;
  title: string;
  houseType: string;
  countyName?: string;
  sittingDate: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  editorialSummary?: unknown[];
  keyEvents?: string[];
  topics?: string[];
  presidingOfficer?: PresidingOfficer;
  contributions: Contribution[];
}

interface PageProps {
  params: Promise<{ house: string; date: string }>;
}

function houseLabel(house: string) {
  if (house === "national-assembly") return "National Assembly";
  if (house === "senate") return "Senate";
  if (house === "county-assembly") return "County Assembly";
  return house;
}

export async function generateMetadata({ params }: PageProps) {
  const { house, date } = await params;
  return {
    title: `Hansard — ${houseLabel(house)} — ${date}`,
    description: `Official Hansard proceedings for ${houseLabel(house)} on ${date}.`,
  };
}

export default async function DailySittingPage({ params }: PageProps) {
  const { house, date } = await params;

  const validHouses = ["national-assembly", "senate", "county-assembly"];
  if (!validHouses.includes(house)) notFound();

  const sitting: Sitting | null = await sanityClient.fetch(
    `*[_type == "hansardSitting" && houseType == $house && sittingDate == $date && isActive != false][0] {
      _id, title, houseType, countyName, sittingDate, sittingPeriod, parliamentaryTerm,
      youtubeUrl, officialHansardUrl, editorialSummary, keyEvents, topics,
      presidingOfficer,
      contributions[] {
        _key, order, type, supabaseLeaderId, speakerName, speakerTitle,
        constituency, party, role, isChairContribution, startTime, sectionHeader, speech
      }
    }`,
    { house, date },
  );

  const crumbs = [
    { text: "Home", href: "/" },
    { text: "Government", href: "/government" },
    { text: "Legislature", href: "/government/legislature" },
    {
      text: "Hansard",
      href: "/government/legislature/hansard/national-assembly",
    },
    {
      text: houseLabel(house),
      href: publicHansardHousePath(house),
    },
    { text: date },
  ];

  if (!sitting) {
    return (
      <>
        <GovUKBreadcrumbs items={crumbs} />
        <h1 className="govuk-heading-xl">Sitting not found</h1>
        <p className="govuk-body">
          No published Hansard record for{" "}
          <strong>{houseLabel(house)}</strong> on <strong>{date}</strong>.
        </p>
        <p className="govuk-body">
          <Link href={publicHansardHousePath(house)} className="govuk-link">
            Browse other sittings
          </Link>
        </p>
      </>
    );
  }

  const enriched = await enrichContributions(
    sitting.contributions || [],
    sitting.presidingOfficer,
  );
  const ordered = [...enriched].sort((a, b) => a.order - b.order);

  const speakersInSitting = ordered
    .filter((c) => c.type === "spoken")
    .reduce<
      Array<{
        name: string;
        slug?: string;
        order: number;
        key: string;
        chairLabel?: string | null;
      }>
    >((acc, c) => {
      const name =
        c.enrichedSpeaker?.full_name || c.speakerName || "Unknown";
      if (acc.some((s) => s.name === name && s.order === c.order)) return acc;
      const chair = resolveChairRole({
        isChairContribution: c.isChairContribution,
        speakerTitle: c.speakerTitle,
        role: c.role,
        speakerName: c.speakerName,
        supabaseLeaderId: c.supabaseLeaderId,
        presidingOfficer: sitting.presidingOfficer,
      });
      acc.push({
        name,
        slug: c.enrichedSpeaker?.slug,
        order: c.order,
        key: c._key,
        chairLabel: chairRoleDisplayLabel(chair),
      });
      return acc;
    }, []);

  const chair = sitting.presidingOfficer;
  const chairLabel = chair
    ? [
        presidingRoleLabel(chair.role),
        chair.displayName ? `(${chair.displayName})` : null,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <>
      <GovUKBreadcrumbs items={crumbs} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-l">
            {houseLabel(sitting.houseType)}
            {sitting.parliamentaryTerm
              ? ` · ${sitting.parliamentaryTerm}`
              : ""}
          </span>
          <h1 className="govuk-heading-xl">{sitting.title}</h1>
          <p className="govuk-body-l govuk-!-margin-bottom-1">
            {new Date(sitting.sittingDate + "T12:00:00").toLocaleDateString(
              "en-KE",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
            {sitting.sittingPeriod ? ` — ${sitting.sittingPeriod}` : ""}
          </p>
          {sitting.countyName && (
            <p className="govuk-body">{sitting.countyName} County Assembly</p>
          )}
          {chairLabel && (
            <p className="govuk-body govuk-!-margin-bottom-1">
              <strong>In the Chair:</strong> {chairLabel}
              {chair?.notes ? (
                <span className="govuk-hint"> — {chair.notes}</span>
              ) : null}
            </p>
          )}
          <PrintPageButton />
        </div>
      </div>

      {(sitting.youtubeUrl || sitting.officialHansardUrl) && (
        <ul className="govuk-list govuk-list--bullet">
          {sitting.officialHansardUrl && (
            <li>
              <a
                href={sitting.officialHansardUrl}
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Hansard PDF (source)
              </a>
            </li>
          )}
          {sitting.youtubeUrl && (
            <li>
              <a
                href={sitting.youtubeUrl}
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch sitting video
              </a>
            </li>
          )}
        </ul>
      )}

      {sitting.editorialSummary &&
        Array.isArray(sitting.editorialSummary) &&
        sitting.editorialSummary.length > 0 && (
          <div className="govuk-inset-text">
            <h2 className="govuk-heading-s">Summary</h2>
            <div className="govuk-body" style={{ fontSize: "1.05rem" }}>
              <PortableText value={sitting.editorialSummary as never} />
            </div>
          </div>
        )}

      {sitting.topics && sitting.topics.length > 0 && (
        <p className="govuk-body">
          {sitting.topics.map((t) => (
            <span
              key={t}
              className="govuk-tag govuk-tag--blue govuk-!-margin-right-1"
            >
              {t}
            </span>
          ))}
        </p>
      )}

      {speakersInSitting.length > 3 && (
        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Speakers in this sitting ({speakersInSitting.length})
            </span>
          </summary>
          <div className="govuk-details__text">
            <ul className="govuk-list govuk-list--bullet">
              {speakersInSitting.map((s) => (
                <li key={`${s.key}-${s.order}`}>
                  {s.chairLabel ? (
                    <strong>{s.chairLabel}</strong>
                  ) : null}
                  {s.chairLabel ? " — " : null}
                  {s.slug ? (
                    <Link
                      href={`/government/legislature/hansard/member/${s.slug}`}
                      className="govuk-link"
                    >
                      {s.name}
                    </Link>
                  ) : (
                    s.name
                  )}
                  {" · "}
                  <a href={`#contribution-${s.order}`} className="govuk-link">
                    Jump to speech
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-4" />

      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
        Debate ({ordered.length}{" "}
        {ordered.length === 1 ? "entry" : "entries"})
      </h2>
      <p className="govuk-hint govuk-!-margin-bottom-4">
        Select a member&apos;s name for their speaking record. The Speaker,
        Deputy Speaker, or Temporary Speaker are labelled as such when they are
        in the Chair. Use <strong>[Expand]</strong> for brief member details;
        floor contribution counts exclude moderating turns.
      </p>

      {ordered.length === 0 ? (
        <div className="govuk-inset-text">
          No contributions have been published for this sitting yet.
        </div>
      ) : (
        <div className="hansard-debate govuk-grid-column-full" style={{ float: "none", width: "100%", padding: 0 }}>
          {ordered.map((contrib) => {
            if (contrib.type === "header") {
              return (
                <div
                  key={contrib._key}
                  className="govuk-!-margin-top-8 govuk-!-margin-bottom-3"
                  id={`contribution-${contrib.order}`}
                >
                  <h3
                    className="govuk-heading-m"
                    style={{
                      marginBottom: "0.4rem",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      fontSize: "1.2rem",
                    }}
                  >
                    {contrib.sectionHeader || "Section"}
                  </h3>
                  <hr className="govuk-section-break govuk-section-break--visible" />
                </div>
              );
            }

            if (contrib.type === "mini-header") {
              return (
                <div
                  key={contrib._key}
                  className="govuk-!-margin-top-5 govuk-!-margin-bottom-2"
                  id={`contribution-${contrib.order}`}
                >
                  <h4
                    className="govuk-heading-s"
                    style={{
                      marginBottom: "0.25rem",
                      fontSize: "1.05rem",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      color: "#1d70b8",
                      fontWeight: 700,
                    }}
                  >
                    {contrib.sectionHeader || "Topic"}
                  </h4>
                </div>
              );
            }

            if (contrib.type === "procedural") {
              return (
                <div
                  key={contrib._key}
                  id={`contribution-${contrib.order}`}
                  style={{
                    margin: "0.85rem 0",
                    padding: "0.55rem 0.85rem",
                    borderLeft: "3px solid #b1b4b6",
                    background: "#f8f8f8",
                    fontSize: "1rem",
                    color: "#505a5f",
                    fontStyle: "italic",
                  }}
                >
                  {contrib.startTime ? (
                    <span style={{ fontStyle: "normal", marginRight: 8 }}>
                      {contrib.startTime}
                    </span>
                  ) : null}
                  {contrib.speech?.length ? (
                    <PortableText value={contrib.speech as never} />
                  ) : (
                    <em>—</em>
                  )}
                </div>
              );
            }

            return (
              <ContributionCard
                key={contrib._key}
                order={contrib.order}
                startTime={contrib.startTime}
                sectionHeader={contrib.sectionHeader}
                speech={contrib.speech || []}
                speakerName={contrib.speakerName}
                speakerTitle={contrib.speakerTitle}
                constituency={contrib.constituency}
                party={contrib.party}
                role={contrib.role}
                supabaseLeaderId={contrib.supabaseLeaderId}
                isChairContribution={Boolean(contrib.isChairContribution)}
                presidingOfficer={sitting.presidingOfficer}
                enrichedSpeaker={contrib.enrichedSpeaker}
              />
            );
          })}
        </div>
      )}

      <p className="govuk-body govuk-!-margin-top-8">
        <Link href={publicHansardHousePath(house)} className="govuk-link">
          ← Back to {houseLabel(house)} Hansard archive
        </Link>
        {" · "}
        <Link
          href={publicHansardDayPath(house, date)}
          className="govuk-link"
        >
          Permanent link to this day
        </Link>
      </p>
    </>
  );
}

async function enrichContributions(
  contributions: Contribution[],
  sittingPresiding?: {
    role?: string;
    displayName?: string;
    supabaseLeaderId?: string;
  } | null,
): Promise<EnrichedContribution[]> {
  // Also resolve leaders who are only linked as presiding officer
  const leaderIds = Array.from(
    new Set(
      [
        ...contributions.map((c) => c.supabaseLeaderId),
        sittingPresiding?.supabaseLeaderId,
      ].filter(Boolean) as string[],
    ),
  );

  if (leaderIds.length === 0) {
    return contributions.map((c) => ({ ...c }));
  }

  try {
    const supabase = createPublicClient();
    const { data: leaders } = await supabase
      .from("leaders")
      .select(
        "id, slug, full_name, title, current_constituency, current_party, current_county, image_url",
      )
      .in("id", leaderIds);

    const leaderMap = new Map((leaders || []).map((l) => [l.id, l]));

    // Floor speeches only — exclude sitting-level Temporary Speaker etc.
    const sittingRows: Array<{
      presidingOfficer?: {
        role?: string;
        displayName?: string;
        supabaseLeaderId?: string;
      };
      contributions?: Array<{
        id?: string;
        speakerName?: string;
        isChairContribution?: boolean;
        type?: string;
        speakerTitle?: string;
        role?: string;
      }>;
    }> = await sanityClient.fetch(
      `*[_type == "hansardSitting" && isActive != false]{
        presidingOfficer,
        "contributions": contributions[supabaseLeaderId in $ids]{
          "id": supabaseLeaderId,
          speakerName,
          isChairContribution,
          type,
          speakerTitle,
          role
        }
      }`,
      { ids: leaderIds },
    );

    const totalByLeader = new Map<string, number>();
    for (const sitting of sittingRows || []) {
      const po = sitting.presidingOfficer;
      for (const row of sitting.contributions || []) {
        if (!row?.id) continue;
        if (
          !countsTowardMemberStats({
            type: row.type,
            isChairContribution: row.isChairContribution,
            speakerTitle: row.speakerTitle,
            role: row.role,
            speakerName: row.speakerName,
            supabaseLeaderId: row.id,
            presidingOfficer: po,
          })
        ) {
          continue;
        }
        totalByLeader.set(row.id, (totalByLeader.get(row.id) || 0) + 1);
      }
    }

    return contributions.map((contrib) => {
      // Prefer explicit link; if unlinked but matches sitting chair, use chair's leader
      let leaderId = contrib.supabaseLeaderId;
      if (
        !leaderId &&
        sittingPresiding?.supabaseLeaderId &&
        isPresidingOfficerContribution(
          { speakerName: contrib.speakerName },
          sittingPresiding,
        )
      ) {
        leaderId = sittingPresiding.supabaseLeaderId;
      }

      const leader = leaderId ? leaderMap.get(leaderId) : null;
      return {
        ...contrib,
        supabaseLeaderId: leaderId || contrib.supabaseLeaderId,
        enrichedSpeaker: leader
          ? {
              full_name: leader.full_name,
              title: leader.title,
              current_constituency: leader.current_constituency,
              current_party: leader.current_party,
              current_county: leader.current_county,
              slug: leader.slug,
              image_url: leader.image_url,
              contributionCount: totalByLeader.get(leader.id) ?? 0,
            }
          : undefined,
      };
    });
  } catch {
    return contributions.map((c) => ({ ...c }));
  }
}
