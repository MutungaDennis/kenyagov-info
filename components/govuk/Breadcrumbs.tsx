// components/govuk/Breadcrumbs.tsx
import Link from "next/link";

export type Crumb = {
  text: string;
  href?: string;  
};

type Props = {
  items: Crumb[];
};

export default function GovUKBreadcrumbs({ items }: Props) {
  return (
    <div className="govuk-breadcrumbs">
      <ol className="govuk-breadcrumbs__list">
        {items.map((crumb, i) => (
          <li key={i} className="govuk-breadcrumbs__list-item">
            {crumb.href ? (
              <Link href={crumb.href} className="govuk-breadcrumbs__link">
                {crumb.text}
              </Link>
            ) : (
              <span aria-current="page" className="govuk-breadcrumbs__link-active">
                {crumb.text}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
