import Link from "next/link";

export type RelatedLink = {
  text: string;
  href: string;
};

type Props = {
  title?: string;
  links: RelatedLink[];
};

/**
 * Standard one-third related links sidebar.
 */
export default function RelatedNav({
  title = "Related pages",
  links = [],
}: Props) {
  if (!links.length) return null;

  return (
    <div className="govuk-grid-column-one-third">
      <aside className="govuk-!-display-none-print app-no-print" role="complementary">
        <h2 className="govuk-heading-m">{title}</h2>
        <nav aria-label={title}>
          <ul className="govuk-list govuk-list--spaced">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="govuk-link">
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
