// components/govuk/Breadcrumbs.tsx
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = "https://www.citizenguide.ke";

export type Crumb = {
  text: string;
  /** Omit on the current page. Last item is never linked. */
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Optional collapse on mobile (GOV.UK breadcrumbs--collapse-on-mobile) */
  collapseOnMobile?: boolean;
  /**
   * Emit BreadcrumbList JSON-LD (default true).
   * Helps search engines understand hierarchy for sitelinks eligibility.
   */
  jsonLd?: boolean;
};

function absoluteUrl(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;
}

/**
 * GOV.UK Breadcrumbs + optional BreadcrumbList structured data.
 * The last item is always the current page (plain text, aria-current="page").
 * @see https://design-system.service.gov.uk/components/breadcrumbs/
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export default function GovUKBreadcrumbs({
  items,
  collapseOnMobile = false,
  jsonLd = true,
}: Props) {
  if (!items.length) return null;

  const classes = [
    "govuk-breadcrumbs",
    "govuk-!-display-none-print",
    collapseOnMobile ? "govuk-breadcrumbs--collapse-on-mobile" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const breadcrumbSchema =
    jsonLd && items.length >= 2
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((crumb, i) => {
            const position = i + 1;
            const isLast = i === items.length - 1;
            const entry: Record<string, unknown> = {
              "@type": "ListItem",
              position,
              name: crumb.text,
            };
            // Include URL when known (prefer href; last crumb may omit)
            if (crumb.href) {
              entry.item = absoluteUrl(crumb.href);
            } else if (!isLast) {
              // Non-terminal without href — skip item URL
            }
            return entry;
          }),
        }
      : null;

  return (
    <>
      {breadcrumbSchema ? <JsonLd data={breadcrumbSchema} /> : null}
      <nav className={classes} aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          {items.map((crumb, i) => {
            const isLast = i === items.length - 1;
            // Current page must not be a link (even if callers pass href)
            const showAsLink = !isLast && Boolean(crumb.href);

            return (
              <li
                key={`${crumb.text}-${i}`}
                className="govuk-breadcrumbs__list-item"
              >
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
    </>
  );
}
