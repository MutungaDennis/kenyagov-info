// components/govuk/Breadcrumbs.tsx
import Link from "next/link";

export type Crumb = {
  text: string;
  /** Omit on the current page. Last item is never linked. */
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Optional collapse on mobile (GOV.UK breadcrumbs--collapse-on-mobile) */
  collapseOnMobile?: boolean;
};

/**
 * GOV.UK Breadcrumbs.
 * The last item is always the current page (plain text, aria-current="page").
 * @see https://design-system.service.gov.uk/components/breadcrumbs/
 */
export default function GovUKBreadcrumbs({
  items,
  collapseOnMobile = false,
}: Props) {
  if (!items.length) return null;

  const classes = [
    "govuk-breadcrumbs",
    "govuk-!-display-none-print",
    collapseOnMobile ? "govuk-breadcrumbs--collapse-on-mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={classes} aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          // Current page must not be a link (even if callers pass href)
          const showAsLink = !isLast && Boolean(crumb.href);

          return (
            <li key={`${crumb.text}-${i}`} className="govuk-breadcrumbs__list-item">
              {showAsLink ? (
                <Link href={crumb.href!} className="govuk-breadcrumbs__link">
                  {crumb.text}
                </Link>
              ) : (
                <span {...(isLast ? { "aria-current": "page" as const } : {})}>
                  {crumb.text}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
