import Link from "next/link";

export type ChevronLinkItem = {
  title: string;
  href: string;
  description?: string;
  meta?: string;
};

type Props = {
  items: ChevronLinkItem[];
  /** Accessible name for the list */
  ariaLabel?: string;
  className?: string;
};

/**
 * GOV.UK-style topic / popular-link list:
 * full-row link, border separators, trailing chevron.
 * Prefer this over cards for hub and directory navigation.
 */
export default function ChevronLinkList({
  items,
  ariaLabel,
  className = "",
}: Props) {
  if (!items.length) return null;

  return (
    <ul
      className={`govuk-list app-popular-services ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <li key={item.href} className="app-popular-services__item">
          <Link
            href={item.href}
            className="app-popular-services__link govuk-link govuk-link--no-visited-state"
          >
            <span className="app-popular-services__text">
              {item.meta ? (
                <span className="app-popular-services__meta govuk-body-s">
                  {item.meta}
                </span>
              ) : null}
              <span className="app-popular-services__title">{item.title}</span>
              {item.description ? (
                <span className="app-popular-services__description govuk-body">
                  {item.description}
                </span>
              ) : null}
            </span>
            <span className="app-popular-services__chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
