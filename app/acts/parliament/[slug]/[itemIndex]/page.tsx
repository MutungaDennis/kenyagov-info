import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

import PortableTextContent from "@/components/sanity/PortableTextContent";
import { getActOfParliamentBySlug } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ slug: string; itemIndex: string }>;
};

export const revalidate = 3600;

export default async function ActItemViewPage({ params }: Props) {
  const { slug, itemIndex } = await params;
  const indexNum = parseInt(itemIndex, 10);

  const act = await getActOfParliamentBySlug(slug);
  if (!act || !act.parts || isNaN(indexNum) || indexNum < 0 || indexNum >= act.parts.length) {
    notFound();
  }

  const allItems = act.parts;
  const currentItem = allItems[indexNum];

  // Configure adjacent elements to drive the sequential linear navigation buttons
  const prevItem = indexNum > 0 ? allItems[indexNum - 1] : null;
  const nextItem = indexNum < allItems.length - 1 ? allItems[indexNum + 1] : null;

  const isPart = currentItem._type === "part";
  const currentHeading = isPart 
    ? `${currentItem.partNumber}: ${currentItem.partTitle?.toUpperCase()}`
    : `${currentItem.scheduleNumber}: ${currentItem.scheduleTitle?.toUpperCase()}`;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Acts of Parliament", href: "/acts/parliament" },
    { text: act.shortTitle, href: `/acts/parliament/${slug}` },
    { text: isPart ? currentItem.partNumber : currentItem.scheduleNumber, href: "#" },
  ];

  return (
  <>
    
      <GovUKBreadcrumbs items={breadcrumbs} />

      
        
        {/* Document Top Authority Caption Panel */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {act.shortTitle}
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-1" style={{ fontSize: "28px" }}>
            {currentHeading}
          </h1>
        </div>

        {/* 📱 MOBILE QUICK NAVIGATION DROPDOWN (Hidden on Desktop via media queries) */}
        <details 
          className="govuk-details mobile-only-navigation govuk-!-margin-bottom-4" 
          style={{ backgroundColor: "#f3f2f1", padding: "10px", borderLeft: "4px solid #1d70b8" }}
        >
          <summary className="govuk-details__summary" style={{ cursor: "pointer" }}>
            <span className="govuk-details__summary-text govuk-!-font-weight-bold" style={{ fontSize: "15px", color: "#1d70b8" }}>
              Navigate Act Document Structure ({allItems.length} Divisions)
            </span>
          </summary>
          <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "10px" }}>
            <ul className="govuk-list" style={{ margin: 0, padding: 0, fontSize: "14px" }}>
              <li style={{ padding: "6px 0", borderBottom: "1px solid #e5e5e5" }}>
                <Link href={`/acts/parliament/${slug}`} className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>
                  ↑ Main Table of Contents Index
                </Link>
              </li>
              {allItems.map((item: any, idx: number) => {
                const isCurrent = idx === indexNum;
                const textLabel = item._type === "part" ? item.partNumber : item.scheduleNumber;
                return (
                  <li 
                    key={idx} 
                    style={{ 
                      padding: "6px 6px", 
                      borderBottom: "1px solid #e5e5e5",
                      backgroundColor: isCurrent ? "#e5e5e5" : "transparent"
                    }}
                  >
                    {isCurrent ? (
                      <strong style={{ color: "#0b0c0c" }}>{textLabel} — {item._type === "part" ? item.partTitle : item.scheduleTitle} (Current)</strong>
                    ) : (
                      <Link href={`/acts/parliament/${slug}/${idx}`} className="govuk-link govuk-link--no-underline">
                        <strong>{textLabel}:</strong> {item._type === "part" ? item.partTitle : item.scheduleTitle}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </details>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        {/* Responsive Grid Frame: We use column-reverse on mobile to push the desktop sidebar underneath */}
        <div className="legislation-flex-container">
          
          {/* Left Column Sidebar: Pushed beneath content on mobile, sticky left column on desktop */}
          <aside className="legislation-sidebar-column" aria-label="Table of contents mapping profile">
            <div className="govuk-!-padding-3" style={{ backgroundColor: "#f3f2f1", borderTop: "3px solid #1d70b8" }}>
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "14px", color: "#1d70b8" }}>
                Act Document Structure
              </h2>
              <nav aria-label="Statutory sections shortcut bookmarks">
                <ul className="govuk-list govuk-!-margin-bottom-0" style={{ paddingLeft: 0, margin: 0, fontSize: "14px" }}>
                  <li className="govuk-!-margin-bottom-2" style={{ borderBottom: "1px solid #b1b4b6", paddingBottom: "4px" }}>
                    <Link href={`/acts/parliament/${slug}`} className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>
                      ↑ Table of Contents Index
                    </Link>
                  </li>
                  {allItems.map((item: any, idx: number) => {
                    const isCurrent = idx === indexNum;
                    const textLabel = item._type === "part" ? item.partNumber : item.scheduleNumber;
                    return (
                      <li 
                        key={idx} 
                        className="govuk-!-margin-bottom-1" 
                        style={{ 
                          lineHeight: "1.3",
                          backgroundColor: isCurrent ? "#e5e5e5" : "transparent",
                          padding: isCurrent ? "2px 4px" : "0",
                          borderLeft: isCurrent ? "3px solid #1d70b8" : "none",
                          paddingLeft: isCurrent ? "4px" : "0"
                        }}
                      >
                        {isCurrent ? (
                          <span className="govuk-body-s govuk-!-font-weight-bold" style={{ margin: 0, fontSize: "13px" }}>
                            {textLabel} — {item._type === "part" ? item.partTitle : item.scheduleTitle}
                          </span>
                        ) : (
                          <Link href={`/acts/parliament/${slug}/${idx}`} className="govuk-link govuk-link--no-underline" style={{ fontSize: "13px" }}>
                            <strong>{textLabel}:</strong> {item._type === "part" ? item.partTitle : item.scheduleTitle}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
          {/* Right Column: Main Content Viewport */}
          <div className="legislation-main-viewport">
            
            {/* Dynamic Statutory Provision Unit Render Block */}
            {isPart ? (
              <section className="legislation-part-content">
                {currentItem.sections?.map((section: any, j: number) => (
                  <div 
                    key={j} 
                    id={`section-${section.sectionNumber}`} 
                    className="govuk-!-margin-bottom-6" 
                    style={{ borderBottom: "1px solid #e5e5e5", paddingBottom: "15px" }}
                  >
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "18px", color: "#2b2b2b" }}>
                      <span style={{ fontWeight: "bold", marginRight: "8px" }}>{section.sectionNumber}.</span>
                      {section.sectionTitle}
                    </h2>
                    
                    {/* Official Provision Text */}
                    {section.officialText && (
                      <div className="govuk-body-m legislation-clause-text" style={{ fontSize: "16px", lineHeight: "1.5", color: "#0b0c0c" }}>
                        <PortableTextContent content={section.officialText} />
                      </div>
                    )}

                    {/* Collapsible Commentary */}
                    {section.plainSummary && (
                      <details className="govuk-details govuk-!-margin-top-3 govuk-!-margin-bottom-0" style={{ backgroundColor: "#f3f2f1", padding: "10px", borderLeft: "4px solid #1d70b8" }}>
                        <summary className="govuk-details__summary">
                          <span className="govuk-details__summary-text govuk-!-font-size-14" style={{ fontWeight: "bold", color: "#1d70b8" }}>
                            Plain English Summary
                          </span>
                        </summary>
                        <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "8px", paddingBottom: 0 }}>
                          <p className="govuk-body-s govuk-!-margin-0" style={{ lineHeight: "1.4" }}>{section.plainSummary}</p>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </section>
            ) : (
              // Appendix Schedules layout panel mapping frame
              <section className="legislation-schedule-content" style={{ border: "1px solid #b1b4b6", borderRadius: "2px", marginBottom: "20px" }}>
                <div className="govuk-!-padding-3" style={{ backgroundColor: "#1d70b8", color: "white" }}>
                  <span className="govuk-body-s" style={{ color: "#f3f2f1", textTransform: "uppercase", fontWeight: "bold" }}>Statutory Appendix</span>
                  {currentItem.relatedSection && (
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#f3f2f1", fontStyle: "italic" }}>
                      Cross-referenced to {currentItem.relatedSection}
                    </p>
                  )}
                </div>

                <div className="govuk-!-padding-3">
                  {currentItem.introText && (
                    <div className="govuk-body-m legislation-clause-text" style={{ fontStyle: "italic", marginBottom: "20px", borderBottom: "1px solid #e5e5e5", paddingBottom: "10px" }}>
                      <PortableTextContent content={currentItem.introText} />
                    </div>
                  )}

                  {currentItem.items?.map((scheduleItem: any, j: number) => (
                    <div key={j} className="govuk-!-margin-bottom-4" style={{ borderLeft: "3px solid #1d70b8", paddingLeft: "12px" }}>
                      <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
                        {scheduleItem.itemNumber} {scheduleItem.itemTitle && `— ${scheduleItem.itemTitle}`}
                      </h3>
                      
                      {scheduleItem.officialText && (
                        <div className="govuk-body-s legislation-clause-text" style={{ fontSize: "15px", lineHeight: "1.5" }}>
                          <PortableTextContent content={scheduleItem.officialText} />
                        </div>
                      )}

                      {scheduleItem.plainSummary && (
                        <details className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-0" style={{ backgroundColor: "#f3f2f1", padding: "8px" }}>
                          <summary className="govuk-details__summary">
                            <span className="govuk-details__summary-text govuk-!-font-size-14" style={{ fontWeight: "bold", color: "#1d70b8" }}>Summary Interpretation</span>
                          </summary>
                          <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "6px", paddingBottom: 0 }}>
                            <p className="govuk-body-s govuk-!-margin-0">{scheduleItem.plainSummary}</p>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* Sequential Statutory Linear Navigation Buttons */}
            <div 
              className="govuk-button-group govuk-!-margin-top-8" 
              style={{ display: "flex", justifyContent: "space-between", gap: "10px", borderTop: "1px solid #b1b4b6", paddingTop: "20px" }}
            >
              {prevItem ? (
                <Link
                  href={`/acts/parliament/${slug}/${indexNum - 1}`}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  style={{ textDecoration: "none", margin: 0 }}
                >
                  ← Previous ({prevItem._type === "part" ? prevItem.partNumber : prevItem.scheduleNumber})
                </Link>
              ) : (
                <Link
                  href={`/acts/parliament/${slug}`}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  style={{ textDecoration: "none", margin: 0 }}
                >
                  ← Cover / Contents
                </Link>
              )}

              {nextItem ? (
                <Link
                  href={`/acts/parliament/${slug}/${indexNum + 1}`}
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  style={{ textDecoration: "none", margin: 0 }}
                >
                  Next ({nextItem._type === "part" ? nextItem.partNumber : nextItem.scheduleNumber}) →
                </Link>
              ) : (
                <div />
              )}
            </div>

          </div>
        </div>

        
      

            {/* Global CSS Layout Overrides safe for Next App Architecture Layout Trees */}
      <style dangerouslySetInnerHTML={{__html: `
        summary::-webkit-details-marker { display: none !important; }
        summary { list-style: none !important; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        /* 📱 Mobile First Responsive Core Layout rules */
        .legislation-flex-container { 
          display: flex; 
          flex-direction: column-reverse; /* Content goes first, desktop sidebar drops below [1] */
          gap: 24px; 
        }
        .legislation-sidebar-column { width: 100%; }
        .legislation-content-column { width: 100%; }
        .mobile-only-navigation { display: block; }

        /* 🖥️ Widescreen Tablet & Desktop Breakpoint overrides */
        @media (min-width: 48.0625rem) {
          .legislation-flex-container { 
            flex-direction: row; /* Snaps side-by-side [1] */
          }
          .legislation-sidebar-column { 
            width: 280px; 
            position: sticky; 
            top: 20px; 
            align-self: start; 
            flex-shrink: 0; 
          }
          .legislation-content-column { 
            flex: 1; 
            min-width: 0; 
          }
          .mobile-only-navigation { 
            display: none !important; /* Disappears on big screens */
          }
        }
      `}} />

    
  
  </>
);
}
