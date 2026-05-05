import Link from "next/link";

type Crumb = { text: string; href: string };

type Props = {
  items: Crumb[];
};

export default function GovUKBreadcrumbs({ items }: Props) {
  return (
    <div className="govuk-breadcrumbs">
      <ol className="govuk-breadcrumbs__list">
        {items.map((crumb, i) => (
          <li key={i} className="govuk-breadcrumbs__list-item">
            <Link href={crumb.href} className="govuk-breadcrumbs__link">
              {crumb.text}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}