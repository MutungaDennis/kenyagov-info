import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


import { getConstitutionChapter } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ chapter: string }>;
};

export default async function ConstitutionChapterPage({ params }: Props) {
  const { chapter } = await params;
  const chapterNum = parseInt(chapter);

  if (isNaN(chapterNum) || chapterNum < 0 || chapterNum > 18) {
    notFound();
  }

  const rawArticles = await getConstitutionChapter(chapterNum);

  if (!rawArticles || rawArticles.length === 0) {
    notFound();
  }

  const articles = [...rawArticles].sort(
    (a: any, b: any) => Number(a.articleNumber) - Number(b.articleNumber)
  );

  const chapterTitle = articles?.[0]?.chapterTitle || `Chapter ${chapter}`;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: `Chapter ${chapter}`, href: "#" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Document Context Header Panel */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            The Constitution of Kenya 2010
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-1" style={{ fontSize: "28px" }}>
            CHAPTER {chapter}: {chapterTitle.toUpperCase()}
          </h1>
        </div>

        {/* 📱 MOBILE QUICK NAVIGATION TOGGLE (Hidden on Desktop via CSS) */}
        <details 
          className="govuk-details mobile-only-navigation govuk-!-margin-bottom-4" 
          style={{ backgroundColor: "#f3f2f1", padding: "10px", borderLeft: "4px solid #1d70b8" }}
        >
          <summary className="govuk-details__summary" style={{ cursor: "pointer" }}>
            <span className="govuk-details__summary-text govuk-!-font-weight-bold" style={{ fontSize: "15px", color: "#1d70b8" }}>
              Navigate this Chapter ({articles.length} Articles)
            </span>
          </summary>
          <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "10px" }}>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              {articles.map((article: any) => (
                <li key={article._id} style={{ fontSize: "14px", padding: "4px 0", borderBottom: "1px solid #e5e5e5" }}>
                  <Link href={`/constitution/${chapter}/${article.articleNumber}`} className="govuk-link govuk-link--no-underline">
                    <strong>{article.articleNumber}.</strong> {article.articleTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        {/* Flex Layout: Reverse row direction on mobile screens to display main contents first */}
        <div className="legislation-flex-container">
          
          {/* Left Navigation Sidebar - Displayed first on Desktop, pushed to bottom on Mobile */}
          <div className="legislation-sidebar-column">
            <div style={{ borderTop: "2px solid #1d70b8", paddingTop: "8px" }}>
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "15px", color: "#1d70b8" }}>
                Chapter Contents
              </h2>
              <nav aria-label="Chapter directory links pagination">
                <ul className="govuk-list govuk-!-margin-bottom-0" style={{ paddingLeft: 0, margin: 0 }}>
                  {articles.map((article: any) => (
                    <li key={article._id} className="govuk-!-margin-bottom-1" style={{ fontSize: "14px", display: "flex", alignItems: "baseline" }}>
                      <span style={{ fontWeight: "bold", minWidth: "24px", display: "inline-block", color: "#505a5f" }}>
                        {article.articleNumber}
                      </span>
                      <Link href={`/constitution/${chapter}/${article.articleNumber}`} className="govuk-link govuk-link--no-underline">
                        {article.articleTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Right Main Focus Area - Content Index Entries */}
          <div className="legislation-content-column">
            <div style={{ borderTop: "1px solid #b1b4b6" }}>
              {articles.map((article: any) => {
                let previewText = "";
                if (typeof article.officialText === "string") {
                  previewText = article.officialText.substring(0, 180) + "...";
                } else if (article.officialText && Array.isArray(article.officialText)) {
                  const rawChildText = article.officialText[0]?.children?.map((c: any) => c.text).join("") || "";
                  previewText = rawChildText ? rawChildText.substring(0, 180) + "..." : "";
                }

                return (
                  <div key={article._id} className="govuk-!-padding-top-2 govuk-!-padding-bottom-2" style={{ borderBottom: "1px solid #b1b4b6" }}>
                    <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ display: "flex", alignItems: "baseline", margin: 0 }}>
                      <span className="govuk-body-s govuk-!-font-weight-bold" style={{ minWidth: "35px", display: "inline-block", flexShrink: 0 }}>
                        {article.articleNumber}.
                      </span>
                      <Link href={`/constitution/${chapter}/${article.articleNumber}`} className="govuk-link govuk-link--no-underline" style={{ fontSize: "16px" }}>
                        {article.articleTitle}
                      </Link>
                    </h3>
                    {previewText && (
                      <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-0 govuk-!-margin-top-1" style={{ paddingLeft: "35px" }}>
                        {previewText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="govuk-!-margin-top-6">
              <Link href="/constitution" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">
                ← Return to full Table of Contents
              </Link>
            </div>
          </div>

        </div>

        
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        /* Legislation Responsive Grid Assembly Rule */
        .legislation-flex-container {
          display: flex;
          flex-direction: column-reverse; /* Content on top, sidebar on bottom for mobile layout screens */
          gap: 20px;
        }
        .legislation-sidebar-column { width: 100%; }
        .legislation-content-column { width: 100%; }
        .mobile-only-navigation { display: block; }

        @media (min-width: 48.0625rem) {
          .legislation-flex-container {
            flex-direction: row; /* Classic standard left-to-right grid split layout for desktop screens */
          }
          .legislation-sidebar-column { width: 33.3333%; }
          .legislation-content-column { width: 66.6666%; }
          .mobile-only-navigation { display: none !important; } /* Hide compact dropdown on widescreen viewports */
        }
      `}} />
    </div>
  );
}
