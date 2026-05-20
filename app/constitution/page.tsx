import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

import { getAllConstitutionArticles, getChapters } from "@/lib/sanity/client";

export default async function ConstitutionPage() {
  const articles = await getAllConstitutionArticles();
  const chapters = await getChapters();

  // Group articles by chapter
  const articlesByChapter = articles.reduce((acc: any, article: any) => {
    const ch = article.chapter || 0;
    if (!acc[ch]) acc[ch] = [];
    acc[ch].push(article);
    return acc;
  }, {});

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">The Constitution of Kenya 2010</h1>
        <p className="govuk-body-l">
          The supreme law of the Republic of Kenya. Searchable, readable, and explained in plain language.
        </p>

        {/* Quick Search */}
        <div className="govuk-form-group govuk-!-margin-top-9">
          <label className="govuk-label govuk-label--m" htmlFor="constitution-search">
            Search the Constitution
          </label>
          <input
            className="govuk-input govuk-input--width-full"
            id="constitution-search"
            type="text"
            placeholder="e.g. Article 35, Access to Information, Devolution, Land rights..."
          />
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Arrangement of Articles */}
        <h2 className="govuk-heading-l">Arrangement of Articles</h2>
        <p className="govuk-body">Official structure of the Constitution of Kenya 2010</p>

        <div className="govuk-grid-row govuk-!-margin-top-6">
          {/* Preamble */}
          <div className="govuk-grid-column-full govuk-!-margin-bottom-8">
            <div className="govuk-card">
              <div className="govuk-card__content">
                <h3 className="govuk-heading-m">
                  <Link href="/constitution/0" className="govuk-link">
                    PREAMBLE
                  </Link>
                </h3>
              </div>
            </div>
          </div>

          {/* Chapters */}
          {chapters.map((chapter: any) => (
            <div key={chapter.chapter} className="govuk-grid-column-one-half govuk-!-margin-bottom-8">
              <div className="govuk-card">
                <div className="govuk-card__content">
                  <h3 className="govuk-heading-m">
                    CHAPTER {chapter.chapter} — {chapter.chapterTitle?.toUpperCase()}
                  </h3>

                  <ul className="govuk-list govuk-list--bullet">
                    {articlesByChapter[chapter.chapter]?.map((article: any) => (
                      <li key={article._id}>
                        <Link 
                          href={`/constitution/${chapter.chapter}/${article.articleNumber}`}
                          className="govuk-link"
                        >
                          {article.articleNumber} — {article.articleTitle}
                        </Link>
                      </li>
                    )) || <li className="govuk-body-s">Articles coming soon...</li>}
                  </ul>

                  <Link 
                    href={`/constitution/${chapter.chapter}`}
                    className="govuk-button govuk-button--secondary govuk-!-margin-top-4"
                  >
                    Browse all articles in this chapter →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Popular / Most Important Articles */}
        <h2 className="govuk-heading-l">Most Accessed Articles</h2>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/35" className="govuk-link">Article 35 – Access to Information</Link>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/40" className="govuk-link">Article 40 – Protection of Right to Property</Link>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/43" className="govuk-link">Article 43 – Economic and Social Rights</Link>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}