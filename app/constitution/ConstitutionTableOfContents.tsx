"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


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

    return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Document Header Panel - Compacted typography */}
        <div className="govuk-!-margin-bottom-4">
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
            The Constitution of Kenya 2010
          </h1>
          <p className="govuk-body" style={{ fontSize: "19px", marginBottom: 0 }}>
            The supreme law of the Republic of Kenya. Searchable, readable, and explained in plain language.
          </p>
        </div>

        {/* Live Search Form Group */}
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

        {/* Compact Legislation Index Bar */}
        <div 
          className="govuk-!-margin-top-3 govuk-!-margin-bottom-3" 
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <div>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-1" style={{ fontSize: "20px" }}>
              Arrangement of Articles
            </h2>
            <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-0">
              Official structure of the Constitution of Kenya 2010
            </p>
          </div>

          {filteredData.chapters.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="govuk-body-s govuk-!-margin-bottom-1"
              style={{
                background: "none",
                border: "none",
                color: "#1d70b8",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                fontWeight: "bold"
              }}
            >
              {isAllOpen ? "Collapse all -" : "Expand all +"}
            </button>
          )}
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            
            {(!searchQuery || "preamble".includes(searchQuery.toLowerCase())) && (
              <div 
                className="govuk-!-padding-top-2 govuk-!-padding-bottom-2" 
                style={{ borderBottom: "1px solid #b1b4b6", paddingLeft: "24px" }}
              >
                <h3 className="govuk-heading-s govuk-!-margin-0">
                  <Link href="/constitution/0" className="govuk-link govuk-link--no-underline">
                    PREAMBLE
                  </Link>
                </h3>
              </div>
            )}

            {filteredData.chapters.length > 0 ? (
              filteredData.chapters.map((chapter) => {
                const isOpen = !!openChapters[chapter.chapter];
                return (
                  <details 
                    key={chapter.chapter} 
                    open={isOpen}
                    className="govuk-details govuk-!-margin-bottom-0"
                    style={{ 
                      borderBottom: "1px solid #b1b4b6", 
                      paddingTop: "4px", 
                      paddingBottom: "4px" 
                    }}
                  >
                    <summary 
                      className="govuk-details__summary govuk-!-margin-bottom-0" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleChapter(chapter.chapter, isOpen);
                      }}
                      style={{ 
                        cursor: "pointer", 
                        padding: "6px 0 6px 24px", 
                        position: "relative",
                        listStyle: "none"
                      }}
                    >
                      <span style={{ position: "absolute", left: "2px", top: "8px", fontSize: "11px", color: "#1d70b8", userSelect: "none" }}>
                        {isOpen ? "▼" : "▶"}
                      </span>
                      <span className="govuk-details__summary-text govuk-heading-s govuk-!-margin-0" style={{ fontSize: "16px", color: "#1d70b8" }}>
                        CHAPTER {chapter.chapter} — {chapter.chapterTitle?.toUpperCase()}
                      </span>
                    </summary>
                    
                    <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: "24px", paddingTop: "2px", paddingBottom: "6px" }}>
                      <ul className="govuk-list govuk-!-margin-bottom-0">
                        {articlesByChapter[chapter.chapter]?.map((article) => (
                          <li key={article._id} className="govuk-!-margin-bottom-1" style={{ display: "flex", alignItems: "baseline", marginTop: "1px" }}>
                            <span className="govuk-body-s govuk-!-font-weight-bold" style={{ minWidth: "35px", display: "inline-block", flexShrink: 0, margin: 0, color: "#505a5f" }}>
                              {article.articleNumber}.
                            </span>
                            <Link href={`/constitution/${chapter.chapter}/${article.articleNumber}`} className="govuk-link govuk-link--no-underline govuk-!-font-size-16">
                              {article.articleTitle}
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

        <div className="govuk-!-margin-top-4">
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Most Accessed Articles</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
              <ul className="govuk-list">
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/4/35" className="govuk-link govuk-link--no-underline">
                    Article 35 – Access to Information
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/4/40" className="govuk-link govuk-link--no-underline">
                    Article 40 – Protection of Right to Property
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-1">
                  <Link href="/constitution/4/43" className="govuk-link govuk-link--no-underline">
                    Article 43 – Economic and Social Rights
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        
      </main>

      {/* CSS Overrides to hide default summary markers using a valid template string */}
      <style dangerouslySetInnerHTML={{
        __html: `
          summary::-webkit-details-marker { 
            display: none !important; 
          } 
          summary { 
            list-style: none !important; 
          } 
          .govuk-link--no-underline { 
            text-decoration: none !important; 
            color: #1d70b8 !important; 
          } 
          .govuk-link--no-underline:hover { 
            text-decoration: underline !important; 
            color: #003078 !important; 
          }
        `
      }} />
    </div>
  );
}
