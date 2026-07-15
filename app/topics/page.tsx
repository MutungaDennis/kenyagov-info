import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
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
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Topics" },
        ]}
        title="Browse topics"
        lead="Find government information by what you need to do — not only by ministry name. Each topic links to guidance on this site and to official services where you apply or pay."
      />

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          CitizenGuide.KE is independent and does not process applications. For
          official transactions use{" "}
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
      <ChevronLinkList
        ariaLabel="All topics"
        items={topics.map((topic) => ({
          title: topic.title,
          href: `/topics/${topic.slug}`,
          description: topic.summary,
        }))}
      />

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
    </>
  );
}
