import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import PortableTextContent from "@/components/sanity/PortableTextContent";
import { JsonLd } from "@/components/JsonLd";

import { getConstitutionArticle, getChapterArticles } from "@/lib/sanity/client";

export const revalidate = 3600;


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

  const articlesInChapter = [...allArticlesInChapter].sort(
    (a: any, b: any) => Number(a.articleNumber) - Number(b.articleNumber)
  );

  const currentIndex = articlesInChapter.findIndex((a: any) => a.articleNumber === articleNum);
  const prevArticle = currentIndex > 0 ? articlesInChapter[currentIndex - 1] : null;
  const nextArticle = currentIndex < articlesInChapter.length - 1 ? articlesInChapter[currentIndex + 1] : null;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: articleData.chapterTitle || `Chapter ${chapter}`, href: `/constitution/chapter/${chapter}` },
    { text: `Article ${article}`, href: "#" },
  ];

  // ==========================================
  // SCHEMA.ORG
  // ==========================================
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    "name": `Article ${articleData.articleNumber} — ${articleData.articleTitle}`,
    "legislationIdentifier": `Article ${articleData.articleNumber}`,
    "legislationType": "Constitutional Article",
    "jurisdiction": {
      "@type": "Country",
      "name": "Kenya"
    },
    "isPartOf": {
      "@type": "Legislation",
      "name": "Constitution of Kenya, 2010",
      "legislationIdentifier": "Constitution of Kenya 2010"
    },
    "url": `https://www.citizenguide.ke/constitution/chapter/${chapter}/article/${article}`,
    "description": articleData.articleTitle,
    "keywords": articleData.userIntents?.length > 0 ? articleData.userIntents.join(", ") : undefined,
    "inLanguage": "en-KE"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.citizenguide.ke" },
      { "@type": "ListItem", "position": 2, "name": "Constitution of Kenya 2010", "item": "https://www.citizenguide.ke/constitution" },
      { "@type": "ListItem", "position": 3, "name": articleData.chapterTitle || `Chapter ${chapter}`, "item": `https://www.citizenguide.ke/constitution/chapter/${chapter}` },
      { "@type": "ListItem", "position": 4, "name": `Article ${articleData.articleNumber}`, "item": `https://www.citizenguide.ke/constitution/chapter/${chapter}/article/${article}` }
    ]
  };

  return (
  <>
    
      <GovUKBreadcrumbs items={breadcrumbs} />

      {/* Schema.org Structured Data */}
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      
        
        {/* Header */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m">
            Chapter {chapter}: {articleData.chapterTitle}
          </span>
          {articleData.partNumber && articleData.partTitle && (
            <span className="govuk-caption-s govuk-!-margin-top-1 govuk-!-display-block">
              Part {articleData.partNumber} — {articleData.partTitle}
            </span>
          )}
          <h1 className="govuk-heading-l govuk-!-margin-top-1 govuk-!-margin-bottom-2">
            Article {articleData.articleNumber}. {articleData.articleTitle}
          </h1>
        </div>

        <PrintPageButton />

        {/* Mobile Quick Navigation */}
        <details className="govuk-details mobile-only-navigation govuk-!-margin-bottom-4">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text govuk-!-font-weight-bold">
              Navigate this chapter ({articlesInChapter.length} articles)
            </span>
          </summary>
          <div className="govuk-details__text">
            <ul className="govuk-list">
              {articlesInChapter.map((art: any) => {
                const isCurrent = art.articleNumber === articleNum;
                return (
                  <li key={art._id} className={isCurrent ? "govuk-!-font-weight-bold" : ""}>
                    {isCurrent ? (
                      <span>{art.articleNumber}. {art.articleTitle} (current)</span>
                    ) : (
                      <Link href={`/constitution/chapter/${chapter}/article/${art.articleNumber}`} className="govuk-link">
                        {art.articleNumber}. {art.articleTitle}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </details>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        <div className="legislation-flex-container">
          
          {/* Sidebar: In this Chapter */}
          <div className="legislation-sidebar-column">
            <div className="society-top-border">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2 govuk-!-text-colour-blue">
                In this Chapter
              </h2>
              <nav aria-label="Articles within this chapter navigation">
                <ul className="govuk-list govuk-!-margin-bottom-0 govuk-!-padding-left-0">
                  {articlesInChapter.map((art: any) => {
                    const isCurrent = art.articleNumber === articleNum;
                    return (
                      <li key={art._id} className={`govuk-!-margin-bottom-1 ${isCurrent ? 'govuk-!-background-color-light-grey govuk-!-padding-1 govuk-!-border-left-3' : ''}`}>
                        <span className={`govuk-!-font-weight-bold govuk-!-min-width-24 govuk-!-display-inline-block ${isCurrent ? 'govuk-!-text-colour-blue' : 'govuk-!-text-colour-secondary'}`}>
                          {art.articleNumber}.
                        </span>
                        {isCurrent ? (
                          <span className="govuk-body-s govuk-!-font-weight-bold"> {art.articleTitle}</span>
                        ) : (
                          <Link href={`/constitution/chapter/${chapter}/article/${art.articleNumber}`} className="govuk-link govuk-link--no-underline"> {art.articleTitle}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="legislation-content-column">
            
            {/* Official Text */}
            <div className="govuk-!-margin-bottom-4 govuk-!-border-top-1 govuk-!-padding-top-3">
              <h2 className="govuk-heading-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-2 govuk-!-font-size-13">
                Official Constitutional Text
              </h2>
              <div className="govuk-body">
                <PortableTextContent content={articleData.officialText} />
              </div>
            </div>

            {/* Plain English Explanation - UPDATED TEXT */}
            <details className="govuk-details govuk-!-margin-bottom-4 govuk-!-background-grey govuk-!-padding-2 govuk-!-border-left-4">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text govuk-!-font-weight-bold govuk-!-text-colour-blue">
                  Plain English Explanation
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body-s govuk-!-margin-bottom-3 govuk-!-text-colour-secondary govuk-!-font-style-italic">
                  This is a simplified summary to explain this article in clear language. It is not the legal text of the Constitution.
                </p>
                {articleData.amplifiedText ? (
                  <div className="govuk-body-s">
                    <PortableTextContent content={articleData.amplifiedText} />
                  </div>
                ) : (
                  <p className="govuk-body-s">A simplified explanation is being prepared for this article.</p>
                )}
              </div>
            </details>

            {/* Case Scenarios */}
            {articleData.caseScenarios && articleData.caseScenarios.length > 0 && (
              <div className="govuk-!-padding-4 govuk-!-margin-bottom-6">
                <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-2 govuk-!-text-colour-green">Real-life Case Scenarios</h3>
                <div className="govuk-body-s">
                  <PortableTextContent content={articleData.caseScenarios} />
                </div>
              </div>
            )}

            {/* Related Information */}
            {(articleData.userIntents?.length > 0 || articleData.relatedActs?.length > 0) && (
              <div className="govuk-!-margin-top-6 govuk-!-padding-top-4 govuk-!-border-top-1">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Related Information</h3>
                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-0">
                  {articleData.userIntents && articleData.userIntents.length > 0 && (
                    <li className="govuk-body-s"><strong>Relevant to:</strong> {articleData.userIntents.join(", ")}</li>
                  )}
                  {articleData.relatedActs && articleData.relatedActs.length > 0 && (
                    <li className="govuk-body-s">
                      <strong>Related Laws:</strong>{" "}
                      {articleData.relatedActs.map((act: any, idx: number) => (
                        <span key={act._id}>
                          <Link href={`/acts/${act.slug}`} className="govuk-link govuk-link--no-underline">
                            {act.title}
                          </Link>
                          {idx < articleData.relatedActs.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="govuk-button-group govuk-!-margin-top-8 govuk-!-display-flex govuk-!-justify-content-space-between">
              {prevArticle ? (
                <Link 
                  href={`/constitution/chapter/${chapter}/article/${prevArticle.articleNumber}`} 
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" 
                  style={{ margin: 0 }}
                >
                  ← Article {prevArticle.articleNumber}
                </Link>
              ) : (
                <div />
              )}
              
              {nextArticle ? (
                <Link 
                  href={`/constitution/chapter/${chapter}/article/${nextArticle.articleNumber}`} 
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" 
                  style={{ margin: 0 }}
                >
                  Article {nextArticle.articleNumber} →
                </Link>
              ) : (
                <div />
              )}
            </div>

          </div>
        </div>

      

      {/* CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
          .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
          .legislation-flex-container { display: flex; flex-direction: column-reverse; gap: 20px; }
          .legislation-sidebar-column { width: 100%; }
          .legislation-content-column { width: 100%; }
          .mobile-only-navigation { display: block; }
          @media (min-width: 48.0625rem) {
            .legislation-flex-container { flex-direction: row; }
            .legislation-sidebar-column { width: 33.3333%; }
            .legislation-content-column { width: 66.6666%; }
            .mobile-only-navigation { display: none !important; }
          }
        `
      }} />
    
  
  </>
);
}