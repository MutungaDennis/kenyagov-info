import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { topics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Browse topics",
  description:
    "Browse Kenyan public services and civic information by topic — identity, tax, health, counties, elections and more.",
};

export default function TopicsIndexPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Topics" },
        ]}
        title="Browse topics"
        lead="Find government information by what you need to do — not only by ministry name. Each topic links to guidance on this site and to official services where you apply or pay."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              CitizenGuide.KE is independent and does not process applications.
              For official transactions use{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>
              , agency portals or{" "}
              <Link href="/huduma-centres" className="govuk-link">
                Huduma Centres
              </Link>
              .
            </p>
          </div>

          <h2 className="govuk-heading-m">All topics</h2>
          <ul className="govuk-list govuk-list--spaced">
            {topics.map((topic) => (
              <li key={topic.slug} className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="govuk-link"
                  >
                    {topic.title}
                  </Link>
                </h3>
                <p className="govuk-body govuk-!-margin-bottom-0">
                  {topic.summary}
                </p>
              </li>
            ))}
          </ul>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">Other ways to find services</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/services" className="govuk-link">
                Search and filter all services
              </Link>
            </li>
            <li>
              <Link href="/services/a-z" className="govuk-link">
                Services A to Z
              </Link>
            </li>
            <li>
              <Link href="/guides" className="govuk-link">
                Step-by-step guides
              </Link>
            </li>
            <li>
              <Link href="/find-your-representatives" className="govuk-link">
                Find your representatives
              </Link>
            </li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside role="complementary">
            <h2 className="govuk-heading-m">Popular starting points</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/topics/identity-civil-registration" className="govuk-link">
                  Identity and civil registration
                </Link>
              </li>
              <li>
                <Link href="/topics/money-tax" className="govuk-link">
                  Money and tax
                </Link>
              </li>
              <li>
                <Link href="/topics/driving-transport" className="govuk-link">
                  Driving and transport
                </Link>
              </li>
              <li>
                <Link href="/topics/digital-government" className="govuk-link">
                  Digital government
                </Link>
              </li>
              <li>
                <Link href="/topics/local-county-services" className="govuk-link">
                  Local and county services
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
