import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

import PrintPageButton from "@/components/govuk/PrintPageButton";
import { getActOfParliamentBySlug } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export default async function ActTableOfContentsPage({ params }: Props) {
  const { slug } = await params;
  const act = await getActOfParliamentBySlug(slug);

  if (!act) {
    notFound();
  }

  const items = act.parts || [];

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Acts of Parliament", href: "/acts/parliament" },
          { text: act.shortTitle, href: `/acts/parliament/${slug}` },
        ]}
      />

      
        {/* Document Context Header Panel */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Parliament of Kenya
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "32px" }}>
            {act.shortTitle}
          </h1>
          <p className="govuk-body" style={{ fontSize: "17px", color: "#505a5f", margin: 0, lineHeight: "1.4" }}>
            {act.title}
          </p>
        </div>

        {/* Action Controls Cluster Row */}
        <div className="govuk-!-margin-bottom-4" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <PrintPageButton />
          {act.pdfDocument?.asset?.url && (
            <a href={act.pdfDocument.asset.url} className="govuk-link govuk-link--no-underline" target="_blank" rel="noopener noreferrer">
              Download PDF Act
            </a>
          )}
          {act.officialKenyaLawUrl && (
            <a href={act.officialKenyaLawUrl} className="govuk-link govuk-link--no-underline" target="_blank" rel="noopener noreferrer">
              View on Kenya Law
            </a>
          )}
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            
            <div className="govuk-!-margin-top-4 govuk-!-margin-bottom-4">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-1" style={{ fontSize: "22px" }}>
                Arrangement of Act
              </h2>
              <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-0">
                Official structure of {act.shortTitle} (Citation: {act.citation})
              </p>
            </div>

            {/* Legislation-style Table of Contents Index Tree */}
            <div className="legislation-toc-tree-container" style={{ borderTop: "1px solid #b1b4b6" }}>
              {items.map((item: any, i: number) => {
                const isPart = item._type === "part";
                const headingText = isPart 
                  ? `${item.partNumber} — ${item.partTitle?.toUpperCase()}` 
                  : `${item.scheduleNumber} — ${item.scheduleTitle?.toUpperCase()}`;

                return (
                  <details 
                    key={i} 
                    open 
                    className="govuk-details govuk-!-margin-bottom-0"
                    style={{ borderBottom: "1px solid #b1b4b6", paddingTop: "8px", paddingBottom: "8px" }}
                  >
                    <summary className="govuk-details__summary govuk-!-margin-bottom-0" style={{ cursor: "pointer", paddingLeft: "20px", position: "relative", listStyle: "none" }}>
                      <span className="summary-chevron" style={{ position: "absolute", left: "0", top: "4px", fontSize: "10px", color: "#1d70b8" }}>▶</span>
                      <span className="govuk-details__summary-text govuk-heading-s govuk-!-margin-0" style={{ fontSize: "16px", color: "#1d70b8" }}>
                        {headingText}
                      </span>
                    </summary>

                    <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: "20px", paddingTop: "6px", paddingBottom: "2px" }}>
                      {isPart ? (
                        <ul className="govuk-list govuk-!-margin-bottom-0">
                          {item.sections?.map((section: any, j: number) => (
                            <li key={j} className="govuk-!-margin-bottom-1" style={{ display: "flex", alignItems: "baseline" }}>
                              <span style={{ fontWeight: "bold", minWidth: "30px", display: "inline-block", color: "#505a5f", fontSize: "14px" }}>
                                {section.sectionNumber}.
                              </span>
                              <a href={`/acts/parliament/${slug}/${i}#section-${section.sectionNumber}`} className="govuk-link govuk-link--no-underline" style={{ fontSize: "15px" }}>
                                {section.sectionTitle}
                              </a>
                            </li>
                          )) || <li className="govuk-body-s govuk-!-text-colour-dark-grey">No sections loaded.</li>}
                        </ul>
                      ) : (
                        <ul className="govuk-list govuk-!-margin-bottom-0">
                          {item.items?.map((schedItem: any, j: number) => (
                            <li key={j} className="govuk-!-margin-bottom-1" style={{ display: "flex", alignItems: "baseline" }}>
                              <span style={{ fontWeight: "bold", minWidth: "30px", display: "inline-block", color: "#505a5f", fontSize: "14px" }}>
                                {schedItem.itemNumber}.
                              </span>
                              <a href={`/acts/parliament/${slug}/${i}`} className="govuk-link govuk-link--no-underline" style={{ fontSize: "15px" }}>
                                {schedItem.itemTitle || "Schedule Provision Clause"}
                              </a>
                            </li>
                          )) || <li className="govuk-body-s govuk-!-text-colour-dark-grey">No schedule items loaded.</li>}
                        </ul>
                      )}

                      <div className="govuk-!-margin-top-3" style={{ paddingLeft: "30px" }}>
                        <a href={`/acts/parliament/${slug}/${i}`} className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold" style={{ fontSize: "14px" }}>
                          Go to full text for this section →
                        </a>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>

          </div>
        </div>

      

      <style dangerouslySetInnerHTML={{__html: `
        summary::-webkit-details-marker { display: none !important; }
        summary { list-style: none !important; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        details[open] summary .summary-chevron { transform: rotate(90deg); display: inline-block; top: 6px !important; }
      `}} />
    
  
  </>
);
}
