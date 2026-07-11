import Link from "next/link";

interface DashboardCardProps {
  title: string;
  href: string;
  description: string;
  metaText?: string;
}

/**
 * Content card for hub/directory listings.
 * Uses app-prefixed styles (not a core GOV.UK component).
 */
export default function GovUKDashboardCard({
  title,
  href,
  description,
  metaText,
}: DashboardCardProps) {
  return (
    <div className="app-card app-card--dashboard govuk-!-margin-bottom-4">
      {metaText && (
        <p className="govuk-body-s govuk-!-margin-bottom-1 app-card__meta">
          {metaText}
        </p>
      )}
      <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
        <Link href={href} className="govuk-link">
          {title}
        </Link>
      </h3>
      <p className="govuk-body govuk-!-margin-bottom-0">{description}</p>
    </div>
  );
}
