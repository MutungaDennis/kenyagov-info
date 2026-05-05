import Link from "next/link";

type Props = {
  name: string;
  type: string;
  slug: string;
  shortDesc?: string;
};

export default function GovUKEntityCard({ name, type, slug, shortDesc }: Props) {
  return (
    <div className="govuk-card govuk-card--clickable">
      <div className="govuk-card__content">
        <span className="govuk-caption-m">{type}</span>
        <h3 className="govuk-card__title">
          <Link href={`/entities/${slug}`} className="govuk-card__title-link">
            {name}
          </Link>
        </h3>
        {shortDesc && <p className="govuk-card__description">{shortDesc}</p>}
      </div>
    </div>
  );
}