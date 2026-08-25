import Link from "next/link";

const TOPICS = [
  {
    slug: "overview",
    title: "Overview and leadership",
  },
  {
    slug: "demographics",
    title: "Demographics and population",
  },
  {
    slug: "health",
    title: "Health and social services",
  },
  {
    slug: "education",
    title: "Education and skills",
  },
  {
    slug: "economy",
    title: "Economy and agriculture",
  },
  {
    slug: "infrastructure",
    title: "Infrastructure, water and housing",
  },
  {
    slug: "tourism-culture",
    title: "Tourism, culture and environment",
  },
] as const;

type Props = {
  countySlug: string;
  countyName: string;
  current?: (typeof TOPICS)[number]["slug"];
};

/**
 * GOV.UK-style related-topic nav for county About subpages.
 * Keeps information architecture consistent across mobile and desktop.
 */
export default function CountyAboutNav({
  countySlug,
  countyName,
  current,
}: Props) {
  const base = `/government/institutions/${countySlug}/about`;

  return (
    <aside className="govuk-!-display-none-print" role="complementary">
      <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
        About {countyName}
      </h2>
      <nav aria-label={`About ${countyName} topics`}>
        <ul className="govuk-list govuk-list--spaced">
          <li>
            <Link href={base} className="govuk-link">
              About index
            </Link>
          </li>
          {TOPICS.map((topic) => (
            <li key={topic.slug}>
              {current === topic.slug ? (
                <span className="govuk-body govuk-!-font-weight-bold">
                  {topic.title}
                </span>
              ) : (
                <Link href={`${base}/${topic.slug}`} className="govuk-link">
                  {topic.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
        Related
      </h2>
      <ul className="govuk-list govuk-list--spaced">
        <li>
          <Link
            href={`/government/institutions/${countySlug}`}
            className="govuk-link"
          >
            {countyName} home
          </Link>
        </li>
        <li>
          <Link href="/government/counties" className="govuk-link">
            All 47 counties
          </Link>
        </li>
      </ul>
    </aside>
  );
}
