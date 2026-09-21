import Link from "next/link";
import type { CabinetBriefListItem } from "@/lib/cabinet/types";

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Nairobi",
});

export default function CabinetBriefCard({
  brief,
  compact = false,
}: {
  brief: CabinetBriefListItem;
  compact?: boolean;
}) {
  return (
    <article className="govuk-!-margin-bottom-6">
      <p className="govuk-body-s govuk-!-margin-bottom-1">
        <strong>{brief.publicationLabel}</strong>
        {" · "}
        <time dateTime={brief.briefDate}>
          {dateFormatter.format(new Date(`${brief.briefDate}T12:00:00+03:00`))}
        </time>
      </p>

      <h3 className={`${compact ? "govuk-heading-s" : "govuk-heading-m"} govuk-!-margin-bottom-2`}>
        <Link href={brief.canonicalPath} className="govuk-link govuk-link--no-visited-state">
          {brief.title}
        </Link>
      </h3>

      {(brief.excerpt || brief.summary) && (
        <p className="govuk-body govuk-!-margin-bottom-2">{brief.excerpt || brief.summary}</p>
      )}

      {!compact && brief.topics.length > 0 && (
        <p className="govuk-body-s govuk-!-margin-bottom-0">
          <span className="govuk-visually-hidden">Topics: </span>
          {brief.topics.join(" · ")}
        </p>
      )}
    </article>
  );
}
