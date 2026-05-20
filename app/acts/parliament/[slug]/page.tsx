import Link from "next/link";
import { notFound } from "next/navigation";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import PrintPageButton from "@/components/govuk/PrintPageButton";

import { getActOfParliamentBySlug } from "@/lib/sanity/client";

// SANITY PORTABLE TEXT
import { PortableText } from "@portabletext/react";

// ==========================
// PAGE
// ==========================
export default async function ActPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const act = await getActOfParliamentBySlug(slug);

  if (!act) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      {/* ================= BACK LINK ================= */}
      <GovUKBackLink href="/acts/parliament" />

      {/* ================= BREADCRUMBS ================= */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Acts of Parliament", href: "/acts/parliament" },
          {
            text: act.shortTitle,
            href: `/acts/parliament/${act.slug.current}`,
          },
        ]}
      />

      <main className="govuk-main-wrapper">
        {/* ================= TITLE ================= */}
        <span className="govuk-caption-xl">
          Parliament of Kenya
        </span>

        <h1 className="govuk-heading-xl">
          {act.shortTitle}
        </h1>

        <p className="govuk-body-l">
          {act.title}
        </p>

        {/* ================= ACTIONS ================= */}
        <div
          className="govuk-!-margin-bottom-7"
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <PrintPageButton />

          {act.pdfDocument?.asset?.url && (
            <Link
              href={act.pdfDocument.asset.url}
              className="govuk-link"
              target="_blank"
            >
              Download PDF Act
            </Link>
          )}

          {act.officialKenyaLawUrl && (
            <Link
              href={act.officialKenyaLawUrl}
              className="govuk-link"
              target="_blank"
            >
              View on Kenya Law
            </Link>
          )}
        </div>

        {/* ================= SUMMARY ================= */}
        <div
          className="govuk-!-padding-5 govuk-!-margin-bottom-8"
          style={{
            borderLeft: "6px solid #ffdd00",
            backgroundColor: "#fffbea",
          }}
        >
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
            Summary
          </h2>

          <p className="govuk-body govuk-!-margin-bottom-0">
            {act.globalSummary ||
              "No summary available yet."}
          </p>
        </div>

        {/* ================= MAIN LAYOUT ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px minmax(0, 1fr)",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* ================= TABLE OF CONTENTS ================= */}
          <aside
            aria-label="Table of contents"
            style={{
              position: "sticky",
              top: "1rem",
              alignSelf: "start",
            }}
          >
            <div
              className="govuk-!-padding-4"
              style={{
                backgroundColor: "#f3f2f1",
                borderTop: "4px solid #1d70b8",
              }}
            >
              <h2 className="govuk-heading-s">
                Contents
              </h2>

              <ul className="govuk-list">
                <li>
                  <a
                    href="#summary"
                    className="govuk-link"
                  >
                    Summary
                  </a>
                </li>

                <li>
                  <a
                    href="#act-information"
                    className="govuk-link"
                  >
                    Act Information
                  </a>
                </li>

                {act.constitutionalBasis?.length >
                  0 && (
                  <li>
                    <a
                      href="#constitutional-basis"
                      className="govuk-link"
                    >
                      Constitutional Basis
                    </a>
                  </li>
                )}

                {act.parts?.map((item: any, i: number) => {
  // NORMAL PART
  if (item._type === "part") {
    return (
      <li key={i}>
        <a
          href={`#part-${i}`}
          className="govuk-link"
        >
          {item.partNumber} — {item.partTitle}
        </a>
      </li>
    );
  }

  // SCHEDULE
  if (item._type === "schedule") {
    return (
      <li key={i}>
        <a
          href={`#schedule-${i}`}
          className="govuk-link"
        >
          {item.scheduleNumber} —{" "}
          {item.scheduleTitle}
        </a>
      </li>
    );
  }

  return null;
})}

                {act.amendments?.length > 0 && (
                  <li>
                    <a
                      href="#amendments"
                      className="govuk-link"
                    >
                      Amendments
                    </a>
                  </li>
                )}

                {act.subsidiaryLegislation
                  ?.length > 0 && (
                  <li>
                    <a
                      href="#subsidiary-legislation"
                      className="govuk-link"
                    >
                      Subsidiary Legislation
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <div>
            {/* ================= ACT INFORMATION ================= */}
            <section
              id="act-information"
              className="govuk-!-margin-bottom-8"
            >
              <h2 className="govuk-heading-l">
                Act Information
              </h2>

              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Official Title
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {act.title}
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Citation
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {act.citation}
                  </dd>
                </div>

                {act.capNumber && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Cap Number
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {act.capNumber}
                    </dd>
                  </div>
                )}

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Year Enacted
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {act.yearEnacted}
                  </dd>
                </div>

                {act.dateOfAssent && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Date of Assent
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {act.dateOfAssent}
                    </dd>
                  </div>
                )}

                {act.dateOfCommencement && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Date of Commencement
                    </dt>

                    <dd className="govuk-summary-list__value">
                      {act.dateOfCommencement}
                    </dd>
                  </div>
                )}

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Current Status
                  </dt>

                  <dd className="govuk-summary-list__value">
                    <strong
                      className="govuk-tag"
                      style={{
                        backgroundColor:
                          act.status === "active"
                            ? "#00703c"
                            : act.status ===
                              "amended"
                            ? "#1d70b8"
                            : "#d4351c",
                      }}
                    >
                      {act.status}
                    </strong>
                  </dd>
                </div>

                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    House of Origin
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {act.houseOfOrigin ===
                    "nationalAssembly"
                      ? "National Assembly"
                      : "Senate"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* ================= CONSTITUTIONAL BASIS ================= */}
            {act.constitutionalBasis?.length >
              0 && (
              <section
                id="constitutional-basis"
                className="govuk-!-margin-bottom-8"
              >
                <h2 className="govuk-heading-l">
                  Constitutional Basis
                </h2>

                <ul className="govuk-list govuk-list--bullet">
                  {act.constitutionalBasis.map(
                    (article: any) => (
                      <li key={article._id}>
                        <Link
                          href={`/constitution/article-${article.articleNumber}`}
                          className="govuk-link"
                        >
                          Article{" "}
                          {article.articleNumber}
                        </Link>

                        {article.articleTitle &&
                          ` — ${article.articleTitle}`}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* ================= SEARCH ================= */}
            <section className="govuk-!-margin-bottom-8">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--m"
                  htmlFor="search-sections"
                >
                  Search within this Act
                </label>

                <input
                  id="search-sections"
                  className="govuk-input"
                  type="text"
                  placeholder="Search sections, provisions or parts"
                />
              </div>
            </section>

            {/* ================= PARTS & SECTIONS ================= */}
            {act.parts?.length > 0 && (
              <section className="govuk-!-margin-bottom-8">
                <h2 className="govuk-heading-l">
                  Parts and Sections
                </h2>

                {act.parts.map(
                  (part: any, i: number) => (
                    <div
                      key={i}
                      id={`part-${i}`}
                      className="govuk-!-margin-bottom-8"
                    >
                      {/* PART HEADER */}
                      <div
                        className="govuk-!-padding-3 govuk-!-margin-bottom-4"
                        style={{
                          backgroundColor:
                            "#f3f2f1",
                          borderLeft:
                            "5px solid #505a5f",
                        }}
                      >
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-0">
                          {part.partNumber} —{" "}
                          {part.partTitle}
                        </h3>
                      </div>

                      {/* SECTIONS */}
                      {part.sections?.map(
                        (
                          section: any,
                          j: number
                        ) => (
                          <div
                            key={j}
                            id={`section-${section.sectionNumber}`}
                            className="govuk-!-padding-4 govuk-!-margin-bottom-5"
                            style={{
                              borderLeft:
                                "5px solid #ffdd00",
                              backgroundColor:
                                "#fffbea",
                            }}
                          >
                            <h4 className="govuk-heading-s">
                              Section{" "}
                              {
                                section.sectionNumber
                              }
                              {section.sectionTitle &&
                                ` — ${section.sectionTitle}`}
                            </h4>

                            {/* ================= OFFICIAL LEGAL TEXT FIRST ================= */}
                            {section.officialText && (
                              <details className="govuk-details govuk-!-margin-bottom-4">
                                <summary className="govuk-details__summary">
                                  <span className="govuk-details__summary-text">
                                    View official legal
                                    text
                                  </span>
                                </summary>

                                <div className="govuk-details__text">
                                  <PortableText
                                    value={
                                      section.officialText
                                    }
                                  />
                                </div>
                              </details>
                            )}

                            {/* ================= PLAIN ENGLISH SUMMARY SECOND ================= */}
                            {section.plainSummary && (
                              <details className="govuk-details">
                                <summary className="govuk-details__summary">
                                  <span className="govuk-details__summary-text">
                                    Plain English
                                    summary
                                  </span>
                                </summary>

                                <div className="govuk-details__text">
                                  <p className="govuk-body govuk-!-margin-bottom-0">
                                    {
                                      section.plainSummary
                                    }
                                  </p>
                                </div>
                              </details>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </section>
            )}

            {/* ================= AMENDMENTS ================= */}
            {act.amendments?.length > 0 && (
              <section
                id="amendments"
                className="govuk-!-margin-bottom-8"
              >
                <h2 className="govuk-heading-l">
                  Major Amendments
                </h2>

                <ul className="govuk-list govuk-list--bullet">
                  {act.amendments.map(
                    (
                      amendment: any,
                      i: number
                    ) => (
                      <li key={i}>
                        <strong>
                          {amendment.amendingAct}
                        </strong>{" "}
                        ({amendment.year})

                        {amendment.notes && (
                          <>
                            <br />
                            {amendment.notes}
                          </>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* ================= SUBSIDIARY LEGISLATION ================= */}
            {/* ================= PARTS, SECTIONS & SCHEDULES ================= */}
{act.parts?.length > 0 && (
  <section className="govuk-!-margin-bottom-8">
    <h2 className="govuk-heading-l">
      Parts, Sections and Schedules
    </h2>

    {act.parts.map((item: any, i: number) => {
      // =====================================================
      // PARTS
      // =====================================================
      if (item._type === "part") {
        return (
          <div
            key={i}
            id={`part-${i}`}
            className="govuk-!-margin-bottom-8"
          >
            {/* PART HEADER */}
            <div
              className="govuk-!-padding-3 govuk-!-margin-bottom-4"
              style={{
                backgroundColor: "#f3f2f1",
                borderLeft: "5px solid #505a5f",
              }}
            >
              <h3 className="govuk-heading-m govuk-!-margin-bottom-0">
                {item.partNumber} — {item.partTitle}
              </h3>
            </div>

            {/* SECTIONS */}
            {item.sections?.map(
              (section: any, j: number) => (
                <div
                  key={j}
                  id={`section-${section.sectionNumber}`}
                  className="govuk-!-padding-4 govuk-!-margin-bottom-5"
                  style={{
                    borderLeft: "5px solid #ffdd00",
                    backgroundColor: "#fffbea",
                  }}
                >
                  <h4 className="govuk-heading-s">
                    Section {section.sectionNumber}
                    {section.sectionTitle &&
                      ` — ${section.sectionTitle}`}
                  </h4>

                  {/* OFFICIAL TEXT */}
                  {section.officialText && (
                    <details className="govuk-details govuk-!-margin-bottom-4">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          View official legal text
                        </span>
                      </summary>

                      <div className="govuk-details__text">
                        <PortableText
                          value={section.officialText}
                        />
                      </div>
                    </details>
                  )}

                  {/* PLAIN SUMMARY */}
                  {section.plainSummary && (
                    <details className="govuk-details">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          Plain English summary
                        </span>
                      </summary>

                      <div className="govuk-details__text">
                        <p className="govuk-body govuk-!-margin-bottom-0">
                          {section.plainSummary}
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              )
            )}
          </div>
        );
      }

      // =====================================================
      // SCHEDULES
      // =====================================================
      if (item._type === "schedule") {
        return (
          <section
            key={i}
            id={`schedule-${i}`}
            className="govuk-!-margin-bottom-9"
          >
            <div
              className="govuk-!-padding-4 govuk-!-margin-bottom-5"
              style={{
                backgroundColor: "#1d70b8",
                color: "white",
              }}
            >
              <h3
                className="govuk-heading-m govuk-!-margin-bottom-1"
                style={{ color: "white" }}
              >
                {item.scheduleNumber}
              </h3>

              <p
                className="govuk-body govuk-!-margin-bottom-0"
                style={{ color: "white" }}
              >
                {item.scheduleTitle}
              </p>

              {item.relatedSection && (
                <p
                  className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0"
                  style={{ color: "white" }}
                >
                  Related to {item.relatedSection}
                </p>
              )}
            </div>

            {/* INTRO TEXT */}
            {item.introText && (
              <div className="govuk-!-margin-bottom-5">
                <PortableText value={item.introText} />
              </div>
            )}

            {/* SCHEDULE ITEMS */}
            {item.items?.map(
              (scheduleItem: any, j: number) => (
                <div
                  key={j}
                  className="govuk-!-padding-4 govuk-!-margin-bottom-5"
                  style={{
                    borderLeft: "5px solid #1d70b8",
                    backgroundColor: "#f8f8f8",
                  }}
                >
                  <h4 className="govuk-heading-s">
                    {scheduleItem.itemNumber}
                    {scheduleItem.itemTitle &&
                      ` — ${scheduleItem.itemTitle}`}
                  </h4>

                  {/* OFFICIAL TEXT */}
                  {scheduleItem.officialText && (
                    <details className="govuk-details govuk-!-margin-bottom-4">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          View official legal text
                        </span>
                      </summary>

                      <div className="govuk-details__text">
                        <PortableText
                          value={
                            scheduleItem.officialText
                          }
                        />
                      </div>
                    </details>
                  )}

                  {/* PLAIN SUMMARY */}
                  {scheduleItem.plainSummary && (
                    <details className="govuk-details">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          Plain English summary
                        </span>
                      </summary>

                      <div className="govuk-details__text">
                        <p className="govuk-body govuk-!-margin-bottom-0">
                          {
                            scheduleItem.plainSummary
                          }
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              )
            )}
          </section>
        );
      }

      return null;
    })}
  </section>
)}

            {/* ================= RELATED ACTS ================= */}
            <aside
              className="govuk-!-padding-5 govuk-!-margin-bottom-8"
              style={{
                backgroundColor: "#f3f2f1",
              }}
            >
              <h2 className="govuk-heading-m">
                Related Acts
              </h2>

              <p className="govuk-body">
                Related legislation and
                constitutional provisions
                will appear here.
              </p>
            </aside>
          </div>
        </div>

        <GovUKFeedback />
      </main>

      {/* ================= RESPONSIVE ================= */}
      <style>{`
        @media (max-width: 900px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }

        .govuk-details__text p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}