import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  href: string;
  meta?: string;
};

export default function GovUKCard({ title, description, href, meta }: Props) {
  return (
    <div className="govuk-card govuk-card--clickable">
      <div className="govuk-card__content">
        <h3 className="govuk-card__title">
          <Link href={href} className="govuk-card__title-link">{title}</Link>
        </h3>
        {meta && <p className="govuk-card__meta">{meta}</p>}
        {description && <p className="govuk-card__description">{description}</p>}
      </div>
    </div>
  );
}