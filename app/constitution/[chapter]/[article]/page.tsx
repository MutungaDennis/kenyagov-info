import { notFound } from "next/navigation";
import Link from "next/link";
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

  const articlesInChapter = [...allArticlesInChapter].sort(
    (a: any, b: any) => Number(a.articleNumber) - Number(b.articleNumber)
  );

  const currentIndex = articlesInChapter.findIndex((a: any) => a.articleNumber === articleNum);
  const prevArticle = currentIndex > 0 ? articlesInChapter[currentIndex - 1] : null;
  const nextArticle = currentIndex < articlesInChapter.length - 1 ? articlesInChapter[currentIndex + 1] : null;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: articleData.chapterTitle || `Chapter ${chapter}`, href: `/constitution/${chapter}` },
    { text: `Article ${article}`, href: "#" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Top Header Identity Map */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            CHAPTER {chapter}: {articleData.chapterTitle?.toUpperCase()}
          </span>
          {articleData.partNumber && articleData.partTitle && (
            <span className="govuk-caption-s govuk-!-margin-top-1" style={{ display: "block", color: "#505a5f", fontWeight: "bold" }}>
              PART {articleData.partNumber} — {articleData.partTitle.toUpperCase()}
            </span>
          )}
          <h1 className="govuk-heading-l govuk-!-margin-top-1 govuk-!-margin-bottom-2" style={{ fontSize: "28px" }}>
            {articleData.articleNumber}. {articleData.articleTitle}
          </h1>
        </div>

        {/* 📱 MOBILE QUICK NAVIGATION TOGGLE COMPONENT */}
        <details 
          className="govuk-details mobile-only-navigation govuk-!-margin-bottom-4" 
          style={{ backgroundColor: "#f3f2f1", padding: "10px", borderLeft: "4px solid #1d70b8" }}
        >
          <summary className="govuk-details__summary" style={{ cursor: "pointer" }}>
            <span className="govuk-details__summary-text govuk-!-font-weight-bold" style={{ fontSize: "15px", color: "#1d70b8" }}>
              Navigate this Chapter ({articlesInChapter.length} Articles)
            </span>
          </summary>
          <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "10px" }}>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              {articlesInChapter.map((art: any) => {
                const isCurrent = art.articleNumber === articleNum;
                return (
                  <li key={art._id} style={{ fontSize: "14px", padding: "5px 6px", backgroundColor: isCurrent ? "#e5e5e5" : "transparent" }}>
                    {isCurrent ? (
                      <strong>{art.articleNumber}. {art.articleTitle} (Current)</strong>
                    ) : (
                      <Link href={`/constitution/${chapter}/${art.articleNumber}`} className="govuk-link govuk-link--no-underline">
                        <strong>{art.articleNumber}.</strong> {art.articleTitle}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </details>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        {/* Flex Responsive Container Setup */}
        <div className="legislation-flex-container">
          
          {/* Side Panel Index - Loaded first on Desktop layout, wraps underneath on mobile viewport screens */}
          <div className="legislation-sidebar-column">
            <div style={{ borderTop: "2px solid #1d70b8", paddingTop: "8px" }}>
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "15px", color: "#1d70b8" }}>
                In this Chapter
              </h2>
              <nav aria-label="Articles within this chapter navigation">
                <ul className="govuk-list govuk-!-margin-bottom-0" style={{ paddingLeft: 0, margin: 0 }}>
                  {articlesInChapter.map((art: any) => {
                    const isCurrent = art.articleNumber === articleNum;
                    return (
                      <li key={art._id} className="govuk-!-margin-bottom-1" style={{ fontSize: "14px", lineHeight: "1.3", display: "flex", alignItems: "baseline", backgroundColor: isCurrent ? "#f3f2f1" : "transparent", padding: isCurrent ? "4px 6px" : "2px 0", borderLeft: isCurrent ? "3px solid #1d70b8" : "none" }}>
                        <span style={{ fontWeight: "bold", minWidth: "24px", display: "inline-block", color: isCurrent ? "#1d70b8" : "#505a5f" }}>
                          {art.articleNumber}
                        </span>
                        {isCurrent ? (
                          <span className="govuk-body-s govuk-!-font-weight-bold" style={{ margin: 0 }}>{art.articleTitle}</span>
                        ) : (
                          <Link href={`/constitution/${chapter}/${art.articleNumber}`} className="govuk-link govuk-link--no-underline">{art.articleTitle}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Primary View Focus Area */}
          <div className="legislation-content-column">
            
            {/* Source text entry rendering */}
            <div className="govuk-!-margin-bottom-4" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "12px" }}>
              <h2 className="govuk-heading-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-2" style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Official Constitutional Text
              </h2>
              <div className="govuk-body" style={{ fontSize: "16px", lineHeight: "1.5" }}>
                <PortableTextContent content={articleData.officialText} />
              </div>
            </div>

            {/* Plain English Details Toggle */}
            <details className="govuk-details govuk-!-margin-bottom-4" style={{ backgroundColor: "#f3f2f1", padding: "12px", borderLeft: "4px solid #1d70b8" }}>
              <summary className="govuk-details__summary" style={{ cursor: "pointer" }}>
                <span className="govuk-details__summary-text govuk-!-font-weight-bold" style={{ fontSize: "16px", color: "#1d70b8" }}>
                  Plain English Explanation
                </span>
              </summary>
              <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "10px", paddingBottom: 0 }}>
                <p className="govuk-body-s govuk-!-margin-bottom-3" style={{ color: "#505a5f", fontStyle: "italic" }}>
                  This is a simplified summary prepared by legal scholars to explain this article in clear language. It is not the legal text of the Constitution.
                </p>
                {articleData.amplifiedText ? (
                  <div className="govuk-body-s" style={{ lineHeight: "1.5" }}>
                    <PortableTextContent content={articleData.amplifiedText} />
                  </div>
                ) : (
                  <p className="govuk-body-s">A simplified explanation is being prepared for this article.</p>
                )}
              </div>
            </details>

            {/* Case Scenarios Layout block */}
            {articleData.caseScenarios && articleData.caseScenarios.length > 0 && (
              <div className="govuk-!-padding-4 govuk-!-margin-bottom-6" style={{ backgroundColor: "#ffffff", border: "1px solid #b1b4b6", borderTop: "4px solid #00703c" }}>
                <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-2" style={{ color: "#00703c", fontSize: "16px" }}>Real-life Case Scenarios</h3>
                <div className="govuk-body-s" style={{ lineHeight: "1.5" }}>
                  <PortableTextContent content={articleData.caseScenarios} />
                </div>
              </div>
            )}

            {/* Relative info meta blocks list */}
            {(articleData.userIntents?.length > 0 || articleData.relatedActs?.length > 0) && (
              <div className="govuk-!-margin-top-6 govuk-!-padding-top-4" style={{ borderTop: "1px solid #b1b4b6" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "16px" }}>Related Information</h3>
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

            {/* Bottom Linear Step Navigation block */}
            <div className="govuk-button-group govuk-!-margin-top-8" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              {prevArticle ? (
                <Link 
                  href={`/constitution/${chapter}/${prevArticle.articleNumber}`} 
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" 
                  style={{ textDecoration: "none", margin: 0 }}
                >
                  ← Article {prevArticle.articleNumber}
                </Link>
              ) : (
                <div />
              )}
              
              {nextArticle ? (
                <Link 
                  href={`/constitution/${chapter}/${nextArticle.articleNumber}`} 
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" 
                  style={{ textDecoration: "none", margin: 0 }}
                >
                  Article {nextArticle.articleNumber} →
                </Link>
              ) : (
                <div />
              )}
            </div>

          </div>
        </div>

        <GovUKFeedback />
      </main>

      {/* CSS Overrides for responsive layout controls and link behaviors */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .govuk-link--no-underline { 
            text-decoration: none !important; 
            color: #1d70b8 !important; 
          }
          .govuk-link--no-underline:hover { 
            text-decoration: underline !important; 
            color: #003078 !important; 
          }
          .legislation-flex-container { 
            display: flex; 
            flex-direction: column-reverse; 
            gap: 20px; 
          }
          .legislation-sidebar-column { 
            width: 100%; 
          }
          .legislation-content-column { 
            width: 100%; 
          }
          .mobile-only-navigation { 
            display: block; 
          }
          @media (min-width: 48.0625rem) {
            .legislation-flex-container { 
              flex-direction: row; 
            }
            .legislation-sidebar-column { 
              width: 33.3333%; 
            }
            .legislation-content-column { 
              width: 66.6666%; 
            }
            .mobile-only-navigation { 
              display: none !important; 
            }
          }
        `
      }} />
    </div>
  );
}
