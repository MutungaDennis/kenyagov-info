
import { safeHtml } from "@/lib/safe-html";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

import {
  getPublicCabinetBriefBySlug,
} from "@/lib/cabinet/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat(
  "en-KE",
  {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  },
);

function formatDate(date: string) {
  return dateFormatter.format(
    new Date(`${date}T12:00:00+03:00`),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const brief =
    await getPublicCabinetBriefBySlug(slug);

  if (!brief) {
    return {
      title: "Cabinet brief not found",
    };
  }

  return {
    title:
      brief.metaTitle ||
      brief.shortTitle ||
      brief.title,

    description:
      brief.metaDescription ||
      brief.excerpt ||
      brief.summary ||
      undefined,

    alternates: {
      canonical:
        brief.canonicalPath,
    },
  };
}

export default async function CabinetBriefPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const brief =
    await getPublicCabinetBriefBySlug(slug);

  if (!brief) {
    notFound();
  }

  const publishedDate =
    formatDate(brief.briefDate);

  const additionalSources =
    brief.sources.filter(
      (source) =>
        source.url !==
        brief.officialSourceUrl,
    );

  const hasOfficialSource =
    Boolean(
      brief.officialSourceUrl,
    );

  const hasAdditionalSources =
    additionalSources.length > 0;

  const hasAnySource =
    hasOfficialSource ||
    hasAdditionalSources;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          {
            text: "Home",
            href: "/",
          },
          {
            text: "Government",
            href: "/government",
          },
          {
            text: "Cabinet",
            href: "/government/cabinet",
          },
          {
            text: "Cabinet briefs",
            href: "/government/cabinet/briefs",
          },
          {
            text:
              brief.shortTitle ||
              brief.title,
          },
        ]}
      />

      <div className="govuk-width-container">
        <main
          className="govuk-main-wrapper govuk-!-padding-top-4"
          id="main-content"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-xl">
                {brief.publicationLabel}
              </span>

              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                {brief.title}
              </h1>

              {brief.excerpt && (
                <p className="govuk-body-l govuk-!-margin-bottom-7">
                  {brief.excerpt}
                </p>
              )}

              <dl className="govuk-summary-list govuk-!-margin-bottom-8">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Published
                  </dt>

                  <dd className="govuk-summary-list__value">
                    <time
                      dateTime={
                        brief.briefDate
                      }
                    >
                      {publishedDate}
                    </time>
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Publication
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {
                      brief.publicationLabel
                    }
                  </dd>
                </div>

                {brief.meetingType && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Meeting
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {
                        brief.meetingType
                      }
                    </dd>
                  </div>
                )}

                {brief.chairName && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Chaired by
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {
                        brief.chairName
                      }

                      {brief.chairTitle
                        ? `, ${brief.chairTitle}`
                        : ""}
                    </dd>
                  </div>
                )}

                {(brief.venue ||
                  brief.locality ||
                  brief.county) && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Location
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {[
                        brief.venue,
                        brief.locality,
                        brief.county,
                      ]
                        .filter(
                          Boolean,
                        )
                        .filter(
                          (
                            value,
                            index,
                            array,
                          ) =>
                            array.indexOf(
                              value,
                            ) ===
                            index,
                        )
                        .join(", ")}
                    </dd>
                  </div>
                )}
              </dl>

              {brief.summary && (
                <section className="govuk-!-margin-bottom-8">
                  <h2 className="govuk-heading-l">
                    Summary
                  </h2>

                  <p className="govuk-body">
                    {brief.summary}
                  </p>
                </section>
              )}

              <section
                id="cabinet-communication"
                className="govuk-!-margin-bottom-9"
              >
                <h2 className="govuk-heading-l">
                  Cabinet communication
                </h2>

                {brief.bodyHtml ? (
                  <div
                    className="cabinet-brief-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        safeHtml(brief.bodyHtml),
                    }}
                  />
                ) : brief.bodyText ? (
                  brief.bodyText
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map(
                      (
                        paragraph,
                        index,
                      ) => (
                        <p
                          key={index}
                          className="govuk-body"
                        >
                          {
                            paragraph
                          }
                        </p>
                      ),
                    )
                ) : (
                  <p className="govuk-body">
                    Full text is not
                    available for this
                    publication.
                  </p>
                )}
              </section>

              {hasAnySource && (
                <section
                  id="source"
                  className="govuk-!-margin-bottom-8"
                >
                  <h2 className="govuk-heading-l">
                    Source
                  </h2>

                  {hasOfficialSource && (
                    <>
                      <p className="govuk-body">
                        This record was
                        prepared from an
                        official Presidency
                        publication.
                      </p>

                      <p className="govuk-body">
                        <a
                          href={
                            brief.officialSourceUrl!
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="govuk-link"
                        >
                          View the official{" "}
                          {brief.sourceTitle ||
                            brief.publicationLabel}

                          <span className="govuk-visually-hidden">
                            {" "}
                            (opens in a new
                            tab)
                          </span>

                          {" ↗"}
                        </a>
                      </p>
                    </>
                  )}

                  {hasAdditionalSources && (
                    <>
                      {hasOfficialSource && (
                        <h3 className="govuk-heading-m">
                          Additional
                          sources
                        </h3>
                      )}

                      <ul className="govuk-list govuk-list--bullet">
                        {additionalSources.map(
                          (
                            source,
                          ) => (
                            <li
                              key={
                                source.id
                              }
                            >
                              <a
                                href={
                                  source.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="govuk-link"
                              >
                                {source.title ||
                                  source.publisher ||
                                  "View source"}

                                <span className="govuk-visually-hidden">
                                  {" "}
                                  (opens in
                                  a new tab)
                                </span>

                                {" ↗"}
                              </a>

                              {source.isOfficial && (
                                <>
                                  {" "}
                                  <span className="govuk-tag govuk-tag--grey">
                                    Official
                                  </span>
                                </>
                              )}
                            </li>
                          ),
                        )}
                      </ul>
                    </>
                  )}
                </section>
              )}

              {brief.editorialNote && (
                <section className="govuk-!-margin-bottom-8">
                  <h2 className="govuk-heading-l">
                    Editorial note
                  </h2>

                  <div className="govuk-inset-text">
                    {
                      brief.editorialNote
                    }
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}