import { notFound } from "next/navigation";
import Link from "next/link";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

import { getConstitutionChapter } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ chapter: string }>;
};

export default async function ConstitutionChapterPage({ params }: Props) {
  const { chapter } = await params;
  const chapterNum = parseInt(chapter);

  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 18) {
    notFound();
  }

  const articles = await getConstitutionChapter(chapterNum);

  if (!articles || articles.length === 0) {
    notFound();
  }

  const chapterTitle = articles[0]?.chapterTitle || `Chapter ${chapter}`;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: chapterTitle, href: "#" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/constitution" />

      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">{chapterTitle}</h1>
        <p className="govuk-body-l">Browse all articles in this chapter</p>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-two-thirds">
            <ul className="govuk-list govuk-list--spaced">
              {articles.map((article: any) => (
                <li key={article._id} className="govuk-!-margin-bottom-6">
                  <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                    <Link 
                      href={`/constitution/${chapter}/${article.articleNumber}`}
                      className="govuk-link"
                    >
                      Article {article.articleNumber}: {article.articleTitle}
                    </Link>
                  </h3>
                  {article.officialText && (
                    <p className="govuk-body-s line-clamp-3">
                      {article.officialText.substring(0, 220)}...
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-related-items" aria-labelledby="chapter-contents">
              <h2 id="chapter-contents" className="govuk-heading-m">In this chapter</h2>
              <nav>
                <ul className="govuk-list">
                  {articles.map((article: any) => (
                    <li key={article._id}>
                      <Link 
                        href={`/constitution/${chapter}/${article.articleNumber}`}
                        className="govuk-link"
                      >
                        Article {article.articleNumber}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}