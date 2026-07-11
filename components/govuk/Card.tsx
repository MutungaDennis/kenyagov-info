import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  href: string;
  meta?: string;
};

/**
 * Simple linked content card.
 * Prefixed app- classes — core GOV.UK Frontend has no card component.
 */
export default function GovUKCard({ title, description, href, meta }: Props) {
  return (
    <div className="app-card">
      <div className="app-card__content">
        <h3 className="govuk-heading-s govuk-!-margin-bottom-2 app-card__title">
          <Link href={href} className="govuk-link app-card__link">
            {title}
          </Link>
        </h3>
        {meta && (
          <p className="govuk-body-s govuk-!-margin-bottom-1 app-card__meta">
            {meta}
          </p>
        )}
        {description && (
          <p className="govuk-body govuk-!-margin-bottom-0 app-card__description">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
