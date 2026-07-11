import Link from "next/link";

type Props = {
  name: string;
  type: string;
  slug: string;
  shortDesc?: string;
};

/**
 * Entity listing card — app-prefixed styles (not a core GOV.UK component).
 */
export default function GovUKEntityCard({ name, type, slug, shortDesc }: Props) {
  return (
    <div className="app-card app-card--dashboard govuk-!-margin-bottom-4">
      <p className="govuk-caption-m govuk-!-margin-bottom-1">{type}</p>
      <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
        <Link href={`/entities/${slug}`} className="govuk-link app-card__link">
          {name}
        </Link>
      </h3>
      {shortDesc && (
        <p className="govuk-body govuk-!-margin-bottom-0">{shortDesc}</p>
      )}
    </div>
  );
}
