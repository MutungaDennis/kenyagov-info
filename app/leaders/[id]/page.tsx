import { leaders } from "@/data/leaders";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default async function LeaderProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const leader = leaders.find((l) => l.id === id);

  if (!leader) {
    notFound();
  }

  // Related leaders (same category)
  const relatedLeaders = leaders
    .filter((l) => l.category === leader.category && l.id !== leader.id)
    .slice(0, 3);

  return (
    <div className="govuk-width-container">
      {/* Back */}
      <GovUKBackLink href="/leaders" />

      {/* Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: leader.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          {/* MAIN CONTENT */}
          <div className="govuk-grid-column-two-thirds">
            {/* Title */}
            <p className="govuk-caption-l govuk-!-margin-bottom-1">
              {leader.title}
            </p>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">
              {leader.name}
            </h1>

            {/* Image */}
            <div className="govuk-!-margin-bottom-6">
              {leader.image ? (
                <Image
                  src={leader.image}
                  alt={`Official portrait of ${leader.name}`}
                  width={280}
                  height={350}
                  className="govuk-!-margin-bottom-2"
                  priority
                />
              ) : (
                <div className="w-[280px] h-[350px] bg-gray-100 border border-gray-300 flex items-center justify-center text-6xl">
                  👤
                </div>
              )}
            </div>

            {/* KEY INFORMATION */}
            <h2 className="govuk-heading-l">Key information</h2>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Full name</dt>
                <dd className="govuk-summary-list__value">
                  {leader.name}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Position</dt>
                <dd className="govuk-summary-list__value">
                  {leader.title}
                </dd>
              </div>

              {leader.category && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Category</dt>
                  <dd className="govuk-summary-list__value">
                    {leader.category}
                  </dd>
                </div>
              )}

              {leader.organization && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Organisation
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {leader.organization}
                  </dd>
                </div>
              )}

              {leader.county && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">County</dt>
                  <dd className="govuk-summary-list__value">
                    {leader.county}
                  </dd>
                </div>
              )}

              {leader.constituency && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Constituency / Ward
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {leader.constituency}
                  </dd>
                </div>
              )}
            </dl>

            {/* BIOGRAPHY */}
            <h2 id="biography" className="govuk-heading-l">
              Biography
            </h2>

            <div className="govuk-body">
              <p>{leader.description}</p>
            </div>

            {/* CURRENT ROLE */}
            <h2
              id="role"
              className="govuk-heading-l govuk-!-margin-top-9"
            >
              Current role
            </h2>

            <div className="govuk-body">
              <p className="govuk-!-font-weight-bold">
                {leader.title}
              </p>

              {leader.organization && (
                <p>
                  Organisation:{" "}
                  <strong>{leader.organization}</strong>
                </p>
              )}

              {leader.county && (
                <p>
                  County: <strong>{leader.county}</strong>
                </p>
              )}

              {leader.constituency && (
                <p>
                  Constituency / Ward:{" "}
                  <strong>{leader.constituency}</strong>
                </p>
              )}
            </div>

            {/* RELATED LEADERS */}
            {relatedLeaders.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-9">
                  Related leaders
                </h2>

                <ul className="govuk-list">
                  {relatedLeaders.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/leaders/${l.id}`}
                        className="govuk-link"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="govuk-grid-column-one-third">
            <nav
              className="govuk-related-items"
              aria-labelledby="contents-heading"
            >
              <h2
                id="contents-heading"
                className="govuk-heading-m"
              >
                Contents
              </h2>

              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <a href="#biography" className="govuk-link">
                    Biography
                  </a>
                </li>
                <li>
                  <a href="#role" className="govuk-link">
                    Current role
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Feedback */}
        <GovUKFeedback />
      </main>
    </div>
  );
}