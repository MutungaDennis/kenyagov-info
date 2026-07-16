import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import LastUpdated from "@/components/govuk/LastUpdated";
import {

  getHubCategoryItems,
  getSortedCategories,
} from "@/lib/data/national-events";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "National events",
  description:
    "Official national days, agricultural and trade expositions, governance conferences, cultural festivals and major sporting gatherings in Kenya.",
};

export default function NationalEventsHubPage() {
  const categories = getSortedCategories();

  return (
    <>
      <PageIntro
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "National events" },
        ]}
        caption="National identity and heritage"
        title="National events"
        lead="Major official celebrations, trade and agricultural shows, governance gatherings, education and arts festivals, cultural festivals and sporting events that form part of Kenya’s public calendar."
        showPrint
      >
        <p className="govuk-body">
          This is an overview hub. Open each topic for a short guide. Dates,
          venues and programmes change — always confirm with the organiser or
          official announcements for the current year. For gazetted days off
          work, see{" "}
          <Link href="/society-and-culture/holidays" className="govuk-link">
            public holidays
          </Link>
          . For community-seasonal observances, see the{" "}
          <Link
            href="/society-and-culture/cultural-calendar"
            className="govuk-link"
          >
            cultural calendar
          </Link>
          .
        </p>
      </PageIntro>

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ol className="govuk-list govuk-list--number">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <a className="govuk-link" href={`#${cat.slug}`}>
                {cat.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {categories.map((cat, index) => {
        const items = getHubCategoryItems(cat.slug);
        return (
          <section
            key={cat.slug}
            id={cat.slug}
            className="govuk-!-margin-bottom-8"
          >
            {index > 0 && (
              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            )}
            <h2 className="govuk-heading-l">{cat.title}</h2>
            <p className="govuk-body">{cat.description}</p>
            <ChevronLinkList items={items} ariaLabel={cat.title} />
          </section>
        );
      })}

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related guidance</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link href="/society-and-culture/holidays" className="govuk-link">
            National days and public holidays
          </Link>
        </li>
        <li>
          <Link
            href="/society-and-culture/heritage-sites"
            className="govuk-link"
          >
            Heritage sites
          </Link>
        </li>
        <li>
          <Link
            href="/society-and-culture/cultural-calendar"
            className="govuk-link"
          >
            Cultural calendar
          </Link>
        </li>
        <li>
          <Link
            href="/national-symbols"
            className="govuk-link"
          >
            National symbols
          </Link>
        </li>
        <li>
          <Link href="/government/counties/devolution" className="govuk-link">
            Devolution
          </Link>
        </li>
      </ul>

      <div className="govuk-inset-text govuk-!-margin-top-6">
        <p className="govuk-body govuk-!-margin-bottom-0">
          CitizenGuide.KE is independent. This page is not an official government
          events calendar. If you spot an error, use{" "}
          <Link href="/corrections" className="govuk-link">
            corrections
          </Link>
          .
        </p>
      </div>

      <LastUpdated published="2026-05-22" lastUpdated="2026-07-15" />
    </>
  );
}
