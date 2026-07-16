"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import {
  chairRoleDisplayLabel,
  resolveChairRole,
  type PresidingOfficerRef,
  type PresidingRole,
} from "@/lib/hansard/stats";

export type EnrichedSpeaker = {
  full_name: string;
  title?: string;
  current_constituency?: string;
  current_party?: string;
  current_county?: string;
  slug?: string;
  image_url?: string | null;
  /** Member floor stats total (excludes chair interventions) */
  contributionCount?: number;
};

export type ContributionCardProps = {
  order: number;
  startTime?: string;
  sectionHeader?: string;
  speech: unknown[];
  speakerName?: string;
  speakerTitle?: string;
  constituency?: string;
  party?: string;
  role?: string;
  isChairContribution?: boolean;
  supabaseLeaderId?: string;
  /** Sitting-level “Presiding officer” from admin — labels Temporary Speaker etc. */
  presidingOfficer?: PresidingOfficerRef | null;
  enrichedSpeaker?: EnrichedSpeaker;
};

const speechComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p
        style={{
          margin: "0 0 0.75em",
          fontSize: "1.0625rem",
          lineHeight: 1.6,
          color: "#0b0c0c",
        }}
      >
        {children}
      </p>
    ),
  },
};

/**
 * Public Hansard spoken contribution.
 * Chair interventions are labelled The Speaker / Temporary Speaker / etc.
 */
export default function ContributionCard({
  order,
  startTime,
  sectionHeader,
  speech,
  speakerName,
  speakerTitle,
  constituency,
  party,
  role,
  isChairContribution: isChairFlag,
  supabaseLeaderId,
  presidingOfficer,
  enrichedSpeaker,
}: ContributionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const chairRole: PresidingRole | null = resolveChairRole({
    isChairContribution: isChairFlag,
    speakerTitle,
    role,
    speakerName,
    supabaseLeaderId,
    presidingOfficer,
  });
  const isChair = chairRole !== null;
  const chairLabel = chairRoleDisplayLabel(chairRole);

  const displayName =
    enrichedSpeaker?.full_name || speakerName || "Speaker not linked";
  // Floor members: Hansard honorific first, else Supabase title.
  // Chair: always use chair role label (not personal job title from Supabase).
  const displayTitle = isChair
    ? chairLabel
    : speakerTitle || enrichedSpeaker?.title;
  const displayParty = isChair
    ? undefined
    : enrichedSpeaker?.current_party || party;
  const displayConst = isChair
    ? undefined
    : enrichedSpeaker?.current_constituency || constituency;
  const displayCounty = enrichedSpeaker?.current_county;
  const slug = enrichedSpeaker?.slug;
  const imageUrl = enrichedSpeaker?.image_url;
  const contributionCount = enrichedSpeaker?.contributionCount;
  const canExpand = Boolean(
    enrichedSpeaker ||
      displayParty ||
      displayConst ||
      displayCounty ||
      isChair ||
      displayTitle,
  );

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberHref = slug
    ? `/government/legislature/hansard/member/${slug}`
    : null;

  const nameEl = memberHref ? (
    <Link
      href={memberHref}
      className="govuk-link"
      style={{ fontWeight: 700, textDecorationThickness: "1px" }}
    >
      {displayName}
    </Link>
  ) : (
    <strong>{displayName}</strong>
  );

  return (
    <article
      className="govuk-!-margin-bottom-5"
      id={`contribution-${order}`}
      style={{
        borderTop: "1px solid #b1b4b6",
        paddingTop: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "0.5rem 1rem",
          marginBottom: "0.4rem",
        }}
      >
        <h3
          className="govuk-heading-s"
          style={{
            margin: 0,
            fontSize: "1.15rem",
            lineHeight: 1.4,
          }}
        >
          {isChair && chairLabel ? (
            <>
              <span
                style={{
                  fontWeight: 700,
                  color: "#0b0c0c",
                  marginRight: "0.35rem",
                }}
              >
                {chairLabel}
              </span>
              <span style={{ fontWeight: 400, color: "#505a5f" }}>(</span>
              {nameEl}
              <span style={{ fontWeight: 400, color: "#505a5f" }}>)</span>
            </>
          ) : (
            <>
              {displayTitle ? (
                <span style={{ fontWeight: 400, color: "#505a5f" }}>
                  {displayTitle}{" "}
                </span>
              ) : null}
              {nameEl}
              {displayParty && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color: "#505a5f",
                    fontWeight: 400,
                    fontSize: "1rem",
                  }}
                >
                  ({displayParty}
                  {displayConst ? ` · ${displayConst}` : ""})
                </span>
              )}
              {!displayParty && displayConst && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    color: "#505a5f",
                    fontWeight: 400,
                    fontSize: "1rem",
                  }}
                >
                  ({displayConst})
                </span>
              )}
            </>
          )}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          {startTime && (
            <span style={{ color: "#505a5f", fontSize: "0.95rem" }}>
              {startTime}
            </span>
          )}
          {canExpand && (
            <button
              type="button"
              className="govuk-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                color: "#1d70b8",
                padding: 0,
                fontSize: "0.95rem",
              }}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((v) => !v)}
            >
              [{expanded ? "Collapse" : "Expand"}]
            </button>
          )}
        </div>
      </div>

      {sectionHeader && (
        <p
          style={{
            margin: "0 0 0.55rem",
            color: "#505a5f",
            fontSize: "0.95rem",
          }}
        >
          {sectionHeader}
        </p>
      )}

      {expanded && (
        <div
          id={panelId}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "0.85rem",
            padding: "0.7rem 0.9rem",
            background: isChair ? "#fff7e6" : "#f3f2f1",
            borderLeft: isChair ? "4px solid #f47738" : "4px solid #1d70b8",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={44}
              height={44}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #b1b4b6",
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isChair ? "#f47738" : "#1d70b8",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 160 }}>
            <p
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {isChair && chairLabel ? (
                <>
                  {chairLabel}
                  {" — "}
                  {memberHref ? (
                    <Link href={memberHref} className="govuk-link">
                      {displayName}
                    </Link>
                  ) : (
                    displayName
                  )}
                </>
              ) : memberHref ? (
                <Link href={memberHref} className="govuk-link">
                  {displayName}
                </Link>
              ) : (
                displayName
              )}
            </p>
            <p
              style={{
                margin: "0.15rem 0 0",
                fontSize: "0.9rem",
                color: "#505a5f",
                lineHeight: 1.35,
              }}
            >
              {isChair ? (
                <>
                  Moderating this sitting (not a floor debate contribution).
                  {typeof contributionCount === "number" && (
                    <>
                      {" "}
                      Member floor total:{" "}
                      <strong style={{ color: "#0b0c0c" }}>
                        {contributionCount}
                      </strong>
                      .
                    </>
                  )}
                </>
              ) : (
                <>
                  {[
                    enrichedSpeaker?.current_party || party,
                    enrichedSpeaker?.current_constituency || constituency,
                    displayCounty,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Member"}
                  {typeof contributionCount === "number" && (
                    <>
                      {" · "}
                      <strong style={{ color: "#0b0c0c" }}>
                        {contributionCount} floor contribution
                        {contributionCount === 1 ? "" : "s"}
                      </strong>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="hansard-speech">
        {speech?.length ? (
          <PortableText
            value={speech as never}
            components={speechComponents as never}
          />
        ) : (
          <p className="govuk-hint" style={{ fontSize: "1rem" }}>
            No speech text recorded.
          </p>
        )}
      </div>
    </article>
  );
}
