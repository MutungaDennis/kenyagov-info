import { notFound } from "next/navigation";
import Link from "next/link";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import PortableTextContent from "@/components/sanity/PortableTextContent";

import { getConstitutionArticle } from "@/lib/sanity/client";

type Props = {
  params: Promise<{ chapter: string; article: string }>;
};

export default async function ConstitutionArticlePage({ params }: Props) {
  const { chapter, article } = await params;
  const chapterNum = parseInt(chapter);
  const articleNum = parseInt(article);

  const articleData = await getConstitutionArticle(chapterNum, articleNum);

  if (!articleData) {
    notFound();
  }

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Constitution", href: "/constitution" },
    { text: `Chapter ${chapter}`, href: `/constitution/${chapter}` },
    { text: `Article ${article}`, href: "#" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={`/constitution/${chapter}`} />

      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-caption-l">Chapter {chapter} • Article {article}</p>
            <h1 className="govuk-heading-xl">{articleData.articleTitle}</h1>

            {/* Official Text */}
            <div className="govuk-!-margin-top-9">
              <h2 className="govuk-heading-m">Official Text</h2>
              <div className="govuk-inset-text">
                <p className="govuk-body">{articleData.officialText}</p>
              </div>
            </div>

            {/* Amplified / Plain English Version */}
            <div className="govuk-!-margin-top-9">
              <h2 className="govuk-heading-m">Plain English Explanation</h2>
              {articleData.amplifiedText ? (
                <PortableTextContent content={articleData.amplifiedText} />
              ) : (
                <p className="govuk-body">No simplified explanation available yet.</p>
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