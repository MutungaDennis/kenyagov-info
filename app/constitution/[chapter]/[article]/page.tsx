import { notFound } from "next/navigation";
import Link from "next/link";

//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import PortableTextContent from "@/components/sanity/PortableTextContent";

import { getConstitutionArticle, getChapterArticles } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ chapter: string; article: string }>;
};

export default async function ConstitutionArticlePage({ params }: Props) {
  const { chapter, article } = await params;
  const chapterNum = parseInt(chapter);
  const articleNum = parseInt(article);

  const articleData = await getConstitutionArticle(chapterNum, articleNum);
  const allArticlesInChapter = await getChapterArticles(chapterNum);

  if (!articleData) {
    notFound();
  }

  const currentIndex = allArticlesInChapter.findIndex(
    (a: any) => a.articleNumber === articleNum
  );

  const prevArticle = currentIndex > 0 ? allArticlesInChapter[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticlesInChapter.length - 1 
    ? allArticlesInChapter[currentIndex + 1] 
    : null;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: articleData.chapterTitle || `Chapter ${chapter}`, href: `/constitution/${chapter}` },
    { text: `Article ${article}`, href: "#" },
  ];

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href={`/constitution/${chapter}`} /> */}

      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* CHAPTER TITLE - Prominent */}
            <p className="govuk-heading-l govuk-!-margin-bottom-2">
              CHAPTER {chapter}—{articleData.chapterTitle?.toUpperCase()}
            </p>

            {/* PART TITLE - Only show if it exists */}
            {articleData.partNumber && articleData.partTitle && (
              <p className="govuk-heading-m govuk-!-margin-bottom-3 text-[#2B2B2B] font-medium">
                PART {articleData.partNumber}—{articleData.partTitle}
              </p>
            )}

            {/* ARTICLE TITLE - Smaller, as a subset */}
            <h1 className="govuk-heading-m govuk-!-margin-bottom-1">
              {articleData.articleNumber}. {articleData.articleTitle}
            </h1>

            {/* Official Constitutional Text */}
            <div className="govuk-!-margin-top-9">
              <h2 className="govuk-heading-m">Official Constitutional Text</h2>
              <div className="govuk-inset-text">
                <PortableTextContent content={articleData.officialText} />
              </div>
            </div>

            {/* Amplified / Plain English Explanation */}
            <div className="govuk-!-margin-top-9">
              <h2 className="govuk-heading-m">Plain English Explanation</h2>
              {articleData.amplifiedText ? (
                <PortableTextContent content={articleData.amplifiedText} />
              ) : (
                <p className="govuk-body">No simplified explanation available yet.</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="govuk-button-group govuk-!-margin-top-9">
              {prevArticle && (
                <Link
                  href={`/constitution/${chapter}/${prevArticle.articleNumber}`}
                  className="govuk-button govuk-button--secondary"
                >
                  ← Previous Article
                </Link>
              )}

              {nextArticle && (
                <Link
                  href={`/constitution/${chapter}/${nextArticle.articleNumber}`}
                  className="govuk-button govuk-button--secondary"
                >
                  Next Article →
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <div className="govuk-related-items" aria-labelledby="related-heading">
              <h2 id="related-heading" className="govuk-heading-m">Related Information</h2>

              <ul className="govuk-list govuk-list--spaced">
                {articleData.userIntents && articleData.userIntents.length > 0 && (
                  <li>
                    <strong>Relevant To:</strong><br />
                    {articleData.userIntents.join(", ")}
                  </li>
                )}

                {articleData.relatedActs && articleData.relatedActs.length > 0 && (
                  <li>
                    <strong>Related Laws</strong>
                    <ul className="govuk-list">
                      {articleData.relatedActs.map((act: any) => (
                        <li key={act._id}>
                          <Link href={`/acts/${act.slug}`} className="govuk-link">
                            {act.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}