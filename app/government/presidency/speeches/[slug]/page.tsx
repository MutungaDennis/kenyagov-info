import Link from "next/link";
import { notFound } from "next/navigation";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ExternalLink from "@/components/site/ExternalLink";
import {
  getPublicPresidentialSpeechBySlug,
} from "@/lib/presidential-speeches/queries";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-KE",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone:
        "Africa/Nairobi",
    },
  ).format(
    new Date(
      `${date}T12:00:00+03:00`,
    ),
  );
}

export default async function PresidentialSpeechPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const publication =
    await getPublicPresidentialSpeechBySlug(
      slug,
    );

  if (!publication) {
    notFound();
  }

  const isCommunique =
    publication.recordKind ===
    "communique";

  const presidentName =
    publication.president
      ?.preferredName ??
    publication.president
      ?.fullName ??
    publication.speakerName;

  const presidentHref =
    publication.president?.slug
      ? `/government/presidency/speeches?president=${publication.president.slug}`
      : null;

  const location = [
    publication.locality,
    publication.county,
    publication.country,
  ]
    .filter(Boolean)
    .join(", ");

  /*
   * Avoid rendering the primary official source twice.
   *
   * `officialSourceUrl` is the canonical official-source link shown as
   * "Official source". The related sources table may contain the same URL
   * for provenance, so remove that duplicate from the visible list.
   *
   * If no canonical official source URL has been supplied, do not surface
   * rows marked as official. This avoids presenting an "official" source
   * to users when the publication itself has not been given a confirmed
   * official-source URL.
   */
  const additionalSources =
    publication.sources.filter(
      (source) =>
        source.url !==
          publication.officialSourceUrl &&
        (!source.isOfficial ||
          Boolean(
            publication.officialSourceUrl,
          )),
    );

  const hasSourcesOrMedia =
    Boolean(
      publication.officialSourceUrl ||
        publication.sourceFileUrl ||
        publication.sourceArchiveUrl ||
        publication.videoUrl ||
        publication.audioUrl ||
        publication.livestreamUrl ||
        additionalSources.length > 0,
    );

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
            text: "The Presidency",
            href:
              "/government/presidency",
          },
          {
            text:
              "Speeches and communications",
            href:
              "/government/presidency/speeches",
          },
        ]}
      />

      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <main className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              {publication.speechType
                ?.name ??
                (isCommunique
                  ? "Communiqué"
                  : "Presidential speech")}
            </span>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              {publication.title}
            </h1>

            {publication.summary && (
              <p className="govuk-body-l govuk-!-margin-bottom-7">
                {publication.summary}
              </p>
            )}

            <dl className="govuk-summary-list govuk-!-margin-bottom-8">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {isCommunique
                    ? "Associated President"
                    : "President"}
                </dt>

                <dd className="govuk-summary-list__value">
                  {presidentHref ? (
                    <Link
                      href={
                        presidentHref
                      }
                      className="govuk-link"
                    >
                      {presidentName}
                    </Link>
                  ) : (
                    presidentName
                  )}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Date
                </dt>

                <dd className="govuk-summary-list__value">
                  <time
                    dateTime={
                      publication.speechDate
                    }
                  >
                    {formatDate(
                      publication.speechDate,
                    )}
                  </time>
                </dd>
              </div>

              {publication.issuingAuthority && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Issuing authority
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {
                      publication.issuingAuthority
                    }
                  </dd>
                </div>
              )}

              {publication.occasion && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Occasion
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {
                      publication.occasion
                    }
                  </dd>
                </div>
              )}

              {publication.venue && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Venue
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {
                      publication.venue
                    }
                  </dd>
                </div>
              )}

              {location && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Location
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {location}
                  </dd>
                </div>
              )}

              {publication.agreementParties &&
                publication
                  .agreementParties.length >
                  0 && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Parties
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {publication.agreementParties.join(
                        ", ",
                      )}
                    </dd>
                  </div>
                )}

              {publication.effectiveDate && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Effective date
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {formatDate(
                      publication.effectiveDate,
                    )}
                  </dd>
                </div>
              )}

              {publication.implementationDeadline && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Implementation
                    deadline
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {formatDate(
                      publication.implementationDeadline,
                    )}
                  </dd>
                </div>
              )}

              {publication.topics.length >
                0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Topics
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {publication.topics.map(
                      (
                        topic,
                        index,
                      ) => (
                        <span
                          key={
                            topic.slug
                          }
                        >
                          {index > 0
                            ? ", "
                            : ""}

                          <Link
                            href={`/government/presidency/speeches?topic=${topic.slug}`}
                            className="govuk-link"
                          >
                            {topic.name}
                          </Link>
                        </span>
                      ),
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <section
              aria-labelledby="publication-text-heading"
              className="govuk-!-margin-bottom-8"
            >
              <h2
                id="publication-text-heading"
                className="govuk-heading-l"
              >
                {isCommunique
                  ? "Full communiqué"
                  : "Speech"}
              </h2>

              {publication.bodyHtml ? (
                <div
                  className="cg-document-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      publication.bodyHtml,
                  }}
                />
              ) : publication.bodyText ? (
                publication.bodyText
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
                        {paragraph}
                      </p>
                    ),
                  )
              ) : (
                <p className="govuk-body">
                  Full text is not
                  available in this
                  archive.
                </p>
              )}
            </section>

            {publication.editorialNote && (
              <section className="govuk-!-margin-bottom-8">
                <h2 className="govuk-heading-m">
                  Editorial note
                </h2>

                <div className="govuk-inset-text">
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    {
                      publication.editorialNote
                    }
                  </p>
                </div>
              </section>
            )}

            {hasSourcesOrMedia && (
              <section className="govuk-!-margin-top-8">
                <h2 className="govuk-heading-l">
                  Sources and media
                </h2>

                <ul className="govuk-list govuk-list--spaced">
                  {publication.officialSourceUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.officialSourceUrl
                        }
                      >
                        Official source
                      </ExternalLink>
                    </li>
                  )}

                  {publication.sourceFileUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.sourceFileUrl
                        }
                      >
                        Source document
                      </ExternalLink>
                    </li>
                  )}

                  {publication.sourceArchiveUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.sourceArchiveUrl
                        }
                      >
                        Archived source
                      </ExternalLink>
                    </li>
                  )}

                  {publication.videoUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.videoUrl
                        }
                      >
                        Watch the publication
                      </ExternalLink>
                    </li>
                  )}

                  {publication.audioUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.audioUrl
                        }
                      >
                        Listen to the publication
                      </ExternalLink>
                    </li>
                  )}

                  {publication.livestreamUrl && (
                    <li>
                      <ExternalLink
                        href={
                          publication.livestreamUrl
                        }
                      >
                        Livestream
                      </ExternalLink>
                    </li>
                  )}

                  {additionalSources.map(
                    (source) => (
                      <li key={source.id}>
                        <ExternalLink
                          href={
                            source.url
                          }
                        >
                          {source.title ??
                            source.sourceType}
                        </ExternalLink>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            )}
          </main>

          <div className="govuk-grid-column-one-third">
            <aside
              className="govuk-!-display-none-print"
              role="complementary"
              aria-labelledby="related-content-heading"
            >
              <h2
                id="related-content-heading"
                className="govuk-heading-m govuk-!-margin-bottom-3"
              >
                Related content
              </h2>

              <nav aria-label="Related content">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link
                      href="/government/presidency/speeches"
                      className="govuk-link"
                    >
                      All Presidential
                      publications
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/government/presidency"
                      className="govuk-link"
                    >
                      The Presidency
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}