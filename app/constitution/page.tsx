import type { Metadata } from "next";
import Link from "next/link";

import ConstitutionSearch from "@/components/constitution/ConstitutionSearch";
import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getConstitutionStructure } from "@/lib/constitution/data";

export const metadata: Metadata = {
  title: "Constitution of Kenya, 2010 | CitizenGuide.KE",
  description:
    "Read, search and navigate the Constitution of Kenya, 2010 by chapter, part, article and schedule.",
};

export default async function ConstitutionPage() {
  const structure = await getConstitutionStructure();

  if (!structure) {
    return (
      <ConstitutionShell
        title="The Constitution of Kenya, 2010"
        caption="Laws of Kenya"
      >
        <div
          className="govuk-notification-banner"
          role="region"
          aria-labelledby="constitution-load-error-title"
        >
          <div className="govuk-notification-banner__header">
            <h2
              className="govuk-notification-banner__title"
              id="constitution-load-error-title"
            >
              Constitution data could not be loaded
            </h2>
          </div>

          <div className="govuk-notification-banner__content">
            <p className="govuk-body">
              CitizenGuide could not retrieve the Constitution structure from
              the database. Please try again.
            </p>
          </div>
        </div>
      </ConstitutionShell>
    );
  }

  const { constitution, chapters, parts, articles, schedules } = structure;

  return (
    <ConstitutionShell
      title={constitution.official_title || "The Constitution of Kenya, 2010"}
      caption="Laws of Kenya"
    >
      <p className="govuk-body-l constitution-intro">
        Browse the Constitution by chapter, part, article or schedule. Article
        pages are designed for focused reading, direct linking and easy
        movement to the next provision.
      </p>

      <div className="govuk-inset-text">
        Promulgated on 27 August 2010. CitizenGuide presents the constitutional
        text in a structured, searchable format while preserving the source
        wording.
      </div>

      <ConstitutionSearch />

      <div className="constitution-actions govuk-!-margin-bottom-7">
        <Link
          href="/constitution/preamble"
          className="govuk-button govuk-button--secondary"
        >
          Read the Preamble
        </Link>

        <a
          href="#schedules"
          className="govuk-button govuk-button--secondary"
        >
          Go to Schedules
        </a>
      </div>

      <h2 className="govuk-heading-l">Chapters</h2>

      <div className="constitution-chapter-grid">
        {chapters.map((chapter: any) => {
          const chapterParts = parts.filter(
            (part: any) => part.chapter_id === chapter.id
          );

          const chapterArticles = articles.filter(
            (article: any) => article.chapter_id === chapter.id
          );

          return (
            <article
              key={chapter.id}
              className="constitution-chapter-card"
            >
              <Link
                href={`/constitution/chapter/${chapter.chapter_number}`}
                className="govuk-link govuk-link--no-visited-state constitution-card-link"
              >
                <span className="govuk-caption-m">
                  Chapter {chapter.chapter_number}
                </span>

                <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                  {chapter.title}
                </h3>
              </Link>

              <p className="govuk-body-s govuk-!-margin-bottom-0">
                {chapterArticles.length} article
                {chapterArticles.length === 1 ? "" : "s"}
                {chapterParts.length
                  ? ` · ${chapterParts.length} part${
                      chapterParts.length === 1 ? "" : "s"
                    }`
                  : ""}
              </p>
            </article>
          );
        })}
      </div>

      <section
        id="schedules"
        className="govuk-!-margin-top-9"
      >
        <h2 className="govuk-heading-l">Schedules</h2>

        <ul className="govuk-list constitution-schedule-list">
          {schedules.map((schedule: any) => (
            <li key={schedule.id}>
              <Link
                className="govuk-link govuk-link--no-visited-state"
                href={`/constitution/schedules/${schedule.slug}`}
              >
                <strong>{schedule.schedule_label}</strong> — {schedule.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ConstitutionShell>
  );
}