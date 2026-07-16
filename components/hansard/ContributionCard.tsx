"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

export type EnrichedSpeaker = {
  full_name: string;
  title?: string;
  current_constituency?: string;
  current_party?: string;
  current_county?: string;
  slug?: string;
  image_url?: string | null;
  /** Total published Hansard contributions for this member */
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
  enrichedSpeaker?: EnrichedSpeaker;
};

const speechComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p
        style={{
          margin: "0 0 0.65em",
          fontSize: "0.95rem",
          lineHeight: 1.55,
          color: "#0b0c0c",
        }}
      >
        {children}
      </p>
    ),
  },
};

/**
 * Public Hansard spoken contribution — NZ/Canada style: clickable member name,
 * Expand for brief meta (no bio), slightly smaller speech text for long reading.
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
  enrichedSpeaker,
}: ContributionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const displayName =
    enrichedSpeaker?.full_name || speakerName || "Speaker not linked";
  const displayTitle = enrichedSpeaker?.title || speakerTitle;
  const displayParty = enrichedSpeaker?.current_party || party;
  const displayConst =
    enrichedSpeaker?.current_constituency || constituency;
  const displayCounty = enrichedSpeaker?.current_county;
  const slug = enrichedSpeaker?.slug;
  const imageUrl = enrichedSpeaker?.image_url;
  const contributionCount = enrichedSpeaker?.contributionCount;
  const canExpand = Boolean(
    enrichedSpeaker || displayParty || displayConst || displayCounty || displayTitle,
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
        paddingTop: "0.85rem",
      }}
    >
      {/* Speaker line — ourcommons / NZ style */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "0.5rem 1rem",
          marginBottom: "0.35rem",
        }}
      >
        <h3
          className="govuk-heading-s"
          style={{
            margin: 0,
            fontSize: "1.05rem",
            lineHeight: 1.35,
          }}
        >
          {displayTitle ? (
            <span style={{ fontWeight: 400, color: "#505a5f" }}>
              {displayTitle}{" "}
            </span>
          ) : null}
          {nameEl}
          {displayParty && (
            <span
              className="govuk-body-s"
              style={{
                marginLeft: "0.5rem",
                color: "#505a5f",
                fontWeight: 400,
              }}
            >
              ({displayParty}
              {displayConst ? ` · ${displayConst}` : ""})
            </span>
          )}
          {!displayParty && displayConst && (
            <span
              className="govuk-body-s"
              style={{
                marginLeft: "0.5rem",
                color: "#505a5f",
                fontWeight: 400,
              }}
            >
              ({displayConst})
            </span>
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
            <span className="govuk-body-s" style={{ color: "#505a5f" }}>
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
                fontSize: "0.875rem",
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
          className="govuk-body-s"
          style={{ margin: "0 0 0.5rem", color: "#505a5f" }}
        >
          {sectionHeader}
        </p>
      )}

      {/* Brief member strip — no bio */}
      {expanded && (
        <div
          id={panelId}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
            padding: "0.65rem 0.85rem",
            background: "#f3f2f1",
            borderLeft: "4px solid #1d70b8",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={40}
              height={40}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #b1b4b6",
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#1d70b8",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
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
                fontSize: "0.9rem",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {memberHref ? (
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
                fontSize: "0.8125rem",
                color: "#505a5f",
                lineHeight: 1.35,
              }}
            >
              {[displayParty, displayConst, displayCounty]
                .filter(Boolean)
                .join(" · ") || "Member"}
              {typeof contributionCount === "number" && (
                <>
                  {" · "}
                  <strong style={{ color: "#0b0c0c" }}>
                    {contributionCount} contribution
                    {contributionCount === 1 ? "" : "s"}
                  </strong>
                  {" in Hansard"}
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
          <p className="govuk-hint" style={{ fontSize: "0.9rem" }}>
            No speech text recorded.
          </p>
        )}
      </div>
    </article>
  );
}
