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

export const revalidate = 3600;

const sanityClient = createSanityClient({ useCdn: true, token: null });

type ContributionType = "spoken" | "procedural" | "header";

interface Contribution {
  _key: string;
  order: number;
  type: ContributionType;
  supabaseLeaderId?: string;
  speakerName?: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
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
      contributions[] {
        _key, order, type, supabaseLeaderId, speakerName, speakerTitle,
        constituency, party, startTime, sectionHeader, speech
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

  const enriched = await enrichContributions(sitting.contributions || []);
  const ordered = [...enriched].sort((a, b) => a.order - b.order);

  const speakersInSitting = ordered
    .filter((c) => c.type === "spoken")
    .reduce<
      Array<{ name: string; slug?: string; order: number; key: string }>
    >((acc, c) => {
      const name =
        c.enrichedSpeaker?.full_name || c.speakerName || "Unknown";
      if (acc.some((s) => s.name === name && s.order === c.order)) return acc;
      acc.push({
        name,
        slug: c.enrichedSpeaker?.slug,
        order: c.order,
        key: c._key,
      });
      return acc;
    }, []);

  return (
    <>
      <GovUKBreadcrumbs items={crumbs} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
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
            <div className="govuk-body" style={{ fontSize: "0.95rem" }}>
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
        Select a member&apos;s name for their full speaking record. Use{" "}
        <strong>[Expand]</strong> for party, constituency, county, and how often
        they appear in Hansard.
      </p>

      {ordered.length === 0 ? (
        <div className="govuk-inset-text">
          No contributions have been published for this sitting yet.
        </div>
      ) : (
        <div
          className="hansard-debate"
          style={{ maxWidth: "42rem" }}
        >
          {ordered.map((contrib) => {
            if (contrib.type === "header") {
              return (
                <div
                  key={contrib._key}
                  className="govuk-!-margin-top-7 govuk-!-margin-bottom-3"
                  id={`contribution-${contrib.order}`}
                >
                  <h3
                    className="govuk-heading-s"
                    style={{
                      marginBottom: "0.35rem",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      color: "#505a5f",
                    }}
                  >
                    {contrib.sectionHeader || "Section"}
                  </h3>
                  <hr className="govuk-section-break govuk-section-break--visible" />
                </div>
              );
            }

            if (contrib.type === "procedural") {
              return (
                <div
                  key={contrib._key}
                  id={`contribution-${contrib.order}`}
                  style={{
                    margin: "0.75rem 0",
                    padding: "0.5rem 0.75rem",
                    borderLeft: "3px solid #b1b4b6",
                    background: "#f8f8f8",
                    fontSize: "0.9rem",
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
): Promise<EnrichedContribution[]> {
  const leaderIds = Array.from(
    new Set(
      contributions
        .map((c) => c.supabaseLeaderId)
        .filter(Boolean) as string[],
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

    // Total published contribution counts per leader (for Expand panel)
    const countRows: Array<{ id?: string }> = await sanityClient.fetch(
      `*[_type == "hansardSitting" && isActive != false].contributions[supabaseLeaderId in $ids]{
        "id": supabaseLeaderId
      }`,
      { ids: leaderIds },
    );
    const totalByLeader = new Map<string, number>();
    for (const row of countRows || []) {
      if (!row?.id) continue;
      totalByLeader.set(row.id, (totalByLeader.get(row.id) || 0) + 1);
    }

    return contributions.map((contrib) => {
      const leader = contrib.supabaseLeaderId
        ? leaderMap.get(contrib.supabaseLeaderId)
        : null;
      return {
        ...contrib,
        enrichedSpeaker: leader
          ? {
              full_name: leader.full_name,
              title: leader.title,
              current_constituency: leader.current_constituency,
              current_party: leader.current_party,
              current_county: leader.current_county,
              slug: leader.slug,
              image_url: leader.image_url,
              contributionCount: totalByLeader.get(leader.id),
            }
          : undefined,
      };
    });
  } catch {
    return contributions.map((c) => ({ ...c }));
  }
}
