import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import { JsonLd } from "@/components/JsonLd";

import { getConstitutionChapter } from "@/lib/sanity/client";

export const revalidate = 3600;


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

  // ==========================================
  // SCHEMA.ORG
  // ==========================================
  const chapterSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Chapter ${chapter}: ${chapterTitle}`,
    "description": `All articles under Chapter ${chapter} of the Constitution of Kenya 2010`,
    "isPartOf": {
      "@type": "Legislation",
      "name": "Constitution of Kenya, 2010",
      "legislationIdentifier": "Constitution of Kenya 2010"
    },
    "url": `https://www.citizenguide.ke/constitution/chapter/${chapter}`,
    "numberOfItems": articles.length
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.citizenguide.ke" },
      { "@type": "ListItem", "position": 2, "name": "Constitution of Kenya 2010", "item": "https://www.citizenguide.ke/constitution" },
      { "@type": "ListItem", "position": 3, "name": `Chapter ${chapter}`, "item": `https://www.citizenguide.ke/constitution/chapter/${chapter}` }
    ]
  };

  return (
  <>
    
      <GovUKBreadcrumbs items={breadcrumbs} />

      {/* Schema.org Structured Data */}
      <JsonLd data={chapterSchema} />
      <JsonLd data={breadcrumbSchema} />

        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m">
            The Constitution of Kenya 2010
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-1">
            Chapter {chapter}: {chapterTitle}
          </h1>
        </div>

        <PrintPageButton />

        {/* Mobile Quick Navigation */}
        <details className="govuk-details mobile-only-navigation govuk-!-margin-bottom-4">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text govuk-!-font-weight-bold">
              Navigate this chapter ({articles.length} articles)
            </span>
          </summary>
          <div className="govuk-details__text">
            <ul className="govuk-list">
              {articles.map((article: any) => (
                <li className="govuk-!-font-size-14" key={article._id}>
                  <Link href={`/constitution/chapter/${chapter}/article/${article.articleNumber}`} className="govuk-link">
                    {article.articleNumber}. {article.articleTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        <div className="legislation-flex-container">
          
          {/* Sidebar */}
          <div className="legislation-sidebar-column">
            <div className="govuk-!-border-top-2 govuk-!-padding-top-2">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
                Chapter contents
              </h2>
              <nav aria-label="Chapter directory links pagination">
                <ul className="govuk-list govuk-!-margin-bottom-0">
                  {articles.map((article: any) => (
                    <li key={article._id} className="govuk-!-margin-bottom-1">
                      <Link href={`/constitution/chapter/${chapter}/article/${article.articleNumber}`} className="govuk-link">
                        <strong>{article.articleNumber}.</strong> {article.articleTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="legislation-content-column">
            <div className="govuk-!-border-top-1">
              {articles.map((article: any) => {
                let previewText = "";
                if (typeof article.officialText === "string") {
                  previewText = article.officialText.substring(0, 180) + "...";
                } else if (article.officialText && Array.isArray(article.officialText)) {
                  const rawChildText = article.officialText[0]?.children?.map((c: any) => c.text).join("") || "";
                  previewText = rawChildText ? rawChildText.substring(0, 180) + "..." : "";
                }

                return (
                  <div key={article._id} className="govuk-!-padding-top-2 govuk-!-padding-bottom-2 govuk-!-border-bottom-1">
                    <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                      <Link href={`/constitution/chapter/${chapter}/article/${article.articleNumber}`} className="govuk-link">
                        {article.articleNumber}. {article.articleTitle}
                      </Link>
                    </h3>
                    {previewText && (
                      <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-0 govuk-!-margin-top-1 govuk-!-margin-left-4">
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

      

      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        .legislation-flex-container {
          display: flex;
          flex-direction: column-reverse;
          gap: 20px;
        }
        .legislation-sidebar-column { width: 100%; }
        .legislation-content-column { width: 100%; }
        .mobile-only-navigation { display: block; }

        @media (min-width: 48.0625rem) {
          .legislation-flex-container { flex-direction: row; }
          .legislation-sidebar-column { width: 33.3333%; }
          .legislation-content-column { width: 66.6666%; }
          .mobile-only-navigation { display: none !important; }
        }
      `}} />
    
  
  </>
);
}