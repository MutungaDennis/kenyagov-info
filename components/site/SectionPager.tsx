import Link from "next/link";

type Target = { href: string; title: string } | null;

type Props = {
  previous: Target;
  next: Target;
  parent: { href: string; title: string };
};

/** Previous/next navigation between parts of a multi-page guide. */
export default function SectionPager({ previous, next, parent }: Props) {
  return (
    <nav
      className="govuk-!-margin-top-8 govuk-!-margin-bottom-6"
      aria-label="Guide pages"
    >
      <ul className="govuk-list">
        {previous ? (
          <li>
            <span className="govuk-body-s govuk-!-display-block">Previous</span>
            <Link href={previous.href} className="govuk-link govuk-!-font-weight-bold">
              {previous.title}
            </Link>
          </li>
        ) : null}
        {next ? (
          <li>
            <span className="govuk-body-s govuk-!-display-block">Next</span>
            <Link href={next.href} className="govuk-link govuk-!-font-weight-bold">
              {next.title}
            </Link>
          </li>
        ) : null}
        <li>
          <Link href={parent.href} className="govuk-link">
            Back to {parent.title}
          </Link>
        </li>
      </ul>
    </nav>
  );
}