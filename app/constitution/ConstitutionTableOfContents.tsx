"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import { JsonLd } from "@/components/JsonLd";

interface Article {
  _id: string;
  articleNumber: string | number;
  articleTitle: string;
  chapter: number;
}

interface Chapter {
  chapter: number;
  chapterTitle: string;
}

interface ConstitutionPageProps {
  initialArticles: unknown[];
  initialChapters: unknown[];
}

export default function ConstitutionTableOfContents({
  initialArticles,
  initialChapters,
}: ConstitutionPageProps) {
  const articles = (initialArticles || []) as Article[];
  const chapters = (initialChapters || []) as Chapter[];

  const [searchQuery, setSearchQuery] = useState("");
  
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(() => {
    return chapters.reduce<Record<number, boolean>>((acc, ch) => {
      acc[ch.chapter] = true;
      return acc;
    }, {});
  });

  const isAllOpen = useMemo(() => {
    if (chapters.length === 0) return false;
    return chapters.every((ch) => openChapters[ch.chapter] === true);
  }, [chapters, openChapters]);

  const handleToggleAll = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextState = !isAllOpen;
    const updated: Record<number, boolean> = {};
    chapters.forEach((ch) => {
      updated[ch.chapter] = nextState;
    });
    setOpenChapters(updated);
  };

  const handleToggleChapter = (chapterNum: number, currentOpenState: boolean) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterNum]: !currentOpenState,
    }));
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { chapters, articles };

    const activeArticles = articles.filter((art) => {
      const matchTitle = art.articleTitle?.toLowerCase().includes(query);
      const matchNumber = String(art.articleNumber).toLowerCase() === query || 
                          `article ${art.articleNumber}`.includes(query);
      return matchTitle || matchNumber;
    });

    const activeChapters = chapters.filter((ch) => {
      const matchTitle = ch.chapterTitle?.toLowerCase().includes(query);
      const matchNumber = String(ch.chapter).toLowerCase() === query || 
                          `chapter ${ch.chapter}`.includes(query);
      const hasMatchingArticles = activeArticles.some((art) => art.chapter === ch.chapter);
      
      return matchTitle || matchNumber || hasMatchingArticles;
    });

    return { chapters: activeChapters, articles: activeArticles };
  }, [searchQuery, articles, chapters]);

  const articlesByChapter = useMemo(() => {
    return filteredData.articles.reduce<Record<number, Article[]>>((acc, article) => {
      const ch = article.chapter || 0;
      if (!acc[ch]) acc[ch] = [];
      acc[ch].push(article);
      return acc;
    }, {});
  }, [filteredData.articles]);

  // ==========================================
  // SCHEMA.ORG
  // ==========================================
  const constitutionSchema = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    "name": "Constitution of Kenya, 2010",
    "legislationIdentifier": "Constitution of Kenya 2010",
    "legislationType": "Constitution",
    "jurisdiction": {
      "@type": "Country",
      "name": "Kenya"
    },
    "url": "https://www.citizenguide.ke/constitution",
    "description": "The supreme law of the Republic of Kenya. Searchable, readable, and explained in plain language.",
    "inLanguage": "en-KE"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.citizenguide.ke" },
      { "@type": "ListItem", "position": 2, "name": "Constitution of Kenya 2010", "item": "https://www.citizenguide.ke/constitution" }
    ]
  };

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
        ]}
      />

      {/* Schema.org Structured Data */}
      <JsonLd data={constitutionSchema} />
      <JsonLd data={breadcrumbSchema} />

      
        {/* Header */}
        <div className="govuk-!-margin-bottom-4">
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
            The Constitution of Kenya 2010
          </h1>
          <p className="govuk-body">
            The supreme law of the Republic of Kenya. Searchable, readable, and explained in plain language.
          </p>
        </div>

        <PrintPageButton />

        {/* Search */}
        <div className="govuk-form-group govuk-!-margin-bottom-4">
          <label className="govuk-label govuk-label--s" htmlFor="constitution-search">
            Search the Constitution
          </label>
          <div id="search-hint" className="govuk-hint govuk-!-font-size-14">
            Search by chapter name, article title, or article numbers (e.g., "Article 35")
          </div>
          <input
            className="govuk-input govuk-input--width-full"
            id="constitution-search"
            aria-describedby="search-hint"
            type="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--s" />

        {/* Arrangement Header */}
        <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-3">
          <div>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
              Arrangement of articles
            </h2>
            <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-0">
              Official structure of the Constitution of Kenya 2010
            </p>
          </div>

          {filteredData.chapters.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="govuk-link govuk-!-margin-bottom-1"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              {isAllOpen ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            
            {/* Preamble */}
            {(!searchQuery || "preamble".includes(searchQuery.toLowerCase())) && (
              <div className="govuk-!-padding-top-2 govuk-!-padding-bottom-2" style={{ borderBottom: "1px solid #b1b4b6" }}>
                <h3 className="govuk-heading-s govuk-!-margin-0">
                  <Link href="/constitution/chapter/0" className="govuk-link">
                    Preamble
                  </Link>
                </h3>
              </div>
            )}

            {/* Chapters with improved UX */}
            {filteredData.chapters.length > 0 ? (
              filteredData.chapters.map((chapter) => {
                const isOpen = !!openChapters[chapter.chapter];
                
                return (
                  <details 
                    key={chapter.chapter} 
                    open={isOpen}
                    className="govuk-details govuk-!-margin-bottom-0"
                    style={{ borderBottom: "1px solid #b1b4b6" }}
                  >
                    <summary 
                      className="govuk-details__summary govuk-!-margin-bottom-0" 
                      onClick={(e) => {
                        // Only toggle if user didn't click on the link
                        const target = e.target as HTMLElement;
                        if (!target.closest('a')) {
                          handleToggleChapter(chapter.chapter, isOpen);
                        }
                      }}
                    >
                      <span className="govuk-details__summary-text">
                        {/* Chapter title is now a clickable link */}
                        <Link 
                          href={`/constitution/chapter/${chapter.chapter}`}
                          className="govuk-link"
                          onClick={(e) => {
                            // Prevent the details toggle when clicking the link
                            e.stopPropagation();
                          }}
                        >
                          Chapter {chapter.chapter} — {chapter.chapterTitle}
                        </Link>
                      </span>
                    </summary>
                    
                    <div className="govuk-details__text">
                      <ul className="govuk-list govuk-!-margin-bottom-0">
                        {articlesByChapter[chapter.chapter]?.map((article) => (
                          <li key={article._id} className="govuk-!-margin-bottom-1">
                            <Link 
                              href={`/constitution/chapter/${chapter.chapter}/article/${article.articleNumber}`} 
                              className="govuk-link"
                            >
                              {article.articleNumber}. {article.articleTitle}
                            </Link>
                          </li>
                        )) || (
                          <li className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-0">
                            No matching articles found in this chapter.
                          </li>
                        )}
                      </ul>
                    </div>
                  </details>
                );
              })
            ) : (
              <p className="govuk-body govuk-!-margin-top-4">
                No constitutional text found matching your search.
              </p>
            )}
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-6" />

        {/* Most Accessed Articles */}
        <div className="govuk-!-margin-top-4">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Most Accessed Articles</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
              <ul className="govuk-list">
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/chapter/4/article/35" className="govuk-link govuk-link--no-underline">
                    Article 35 – Access to Information
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/chapter/4/article/40" className="govuk-link govuk-link--no-underline">
                    Article 40 – Protection of Right to Property
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/chapter/4/article/43" className="govuk-link govuk-link--no-underline">
                    Article 43 – Economic and Social Rights
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

      

      {/* CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          summary::-webkit-details-marker { display: none !important; } 
          summary { list-style: none !important; } 
          .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; } 
          .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        `
      }} />
    
  
  </>
);
}