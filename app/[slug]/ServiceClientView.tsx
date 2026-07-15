// app/[slug]/ServiceClientView.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import FromAttribution from "@/components/site/FromAttribution";

interface MinistryReference {
  name: string;
  slug: string;
  parentMinistry?: {
    name: string;
    slug: string;
  };
}

interface ServiceClientViewProps {
  service: {
    title: string;
    summary: string;
    _createdAt: string;
    _updatedAt: string;
    providingBodies: MinistryReference[];
    processingTime: string;
    baseCostLabel: string;
    executionMode: string;
    timelineGuidancePoints?: string[];
    beforeYouStart: string[];
    requiredDocuments: string[];
    steps?: Array<{
      stepNumber: number;
      stepTitle: string;
      stepDescription: string;
    }>;
    feesTable?: Array<{ itemName: string; amount: string }>;
    physicalVisits?: Array<{ purpose: string; locations: string }>;
    downloadableResources?: Array<{
      label: string;
      fileUrl?: string;
      fileSize?: number;
      sourceUrl?: string;
    }>;
    commonMistakes?: Array<{ errorTitle: string; errorFix: string }>;
    faqs?: Array<{ question: string; answer: string }>;
    relatedServices?: Array<{ title: string; slug: string }>;
    transactionPortals: Array<{ portalLabel: string; portalUrl: string }>;
    parentCategory?: { title: string; slug: string };
  };
}

export default function ServiceClientView({ service }: ServiceClientViewProps) {
  const modeLabels: Record<string, string> = {
    online: "Online (Digital submission)",
    hybrid: "Hybrid (Online form and physical attendance required)",
    manual: "Manual (Physical office submission)",
  };

  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    const kib = bytes / 1024;
    if (kib < 1024) return `${kib.toFixed(1)} KB`;
    const mib = kib / 1024;
    return `${mib.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!service || !service.title) {
    const fallbackBreadcrumbs = [
      { text: "Home", href: "/" },
      ...(service?.parentCategory
        ? [
            {
              text: service.parentCategory.title,
              href: `/services/categories/${service.parentCategory.slug}`,
            },
          ]
        : [{ text: "Services", href: "/services" }]),
      { text: "Page not found" },
    ];

    return (
      <>
        <GovUKBreadcrumbs items={fallbackBreadcrumbs} />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Page not found</h1>
            <p className="govuk-body">
              If you typed the web address, check it is correct.
            </p>
            <p className="govuk-body">
              <Link href="/services" className="govuk-link">
                Browse services
              </Link>
            </p>
          </div>
        </div>
      </>
    );
  }

  const breadcrumbItems = [
    { text: "Home", href: "/" },
    { text: "Services", href: "/services" },
    ...(service.parentCategory
      ? [
          {
            text: service.parentCategory.title,
            href: `/services/categories/${service.parentCategory.slug}`,
          },
        ]
      : []),
    { text: service.title },
  ];

  const primaryPortal = service.transactionPortals?.[0];
  const secondaryPortals = service.transactionPortals?.slice(1) ?? [];

  const contentItems = [
    { href: "#overview", text: "Overview" },
    { href: "#quick-facts", text: "Quick facts" },
    { href: "#before-you-start", text: "Before you start" },
    { href: "#required-documents", text: "Documents you need" },
    ...(service.steps?.length
      ? [{ href: "#step-by-step", text: "Step by step" }]
      : []),
    ...(service.feesTable?.length
      ? [{ href: "#fees", text: "Fees" }]
      : []),
    ...(service.physicalVisits?.length
      ? [{ href: "#office-visits", text: "Office visits" }]
      : []),
    ...(service.downloadableResources?.length
      ? [{ href: "#downloads", text: "Downloads" }]
      : []),
    ...(service.faqs?.length ? [{ href: "#faqs", text: "Questions" }] : []),
    ...(service.relatedServices?.length
      ? [{ href: "#related", text: "Related" }]
      : []),
  ];

  const fromBodies =
    service.providingBodies?.map((body) => ({
      name: body.parentMinistry
        ? `${body.name} (under ${body.parentMinistry.name})`
        : body.name,
    })) ?? [];

  return (
    <>
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <nav
            aria-labelledby="contents-heading"
            className="govuk-!-margin-bottom-6 govuk-!-padding-top-2 app-service-contents"
          >
            <h2
              id="contents-heading"
              className="govuk-heading-s govuk-!-margin-bottom-2"
            >
              Contents
            </h2>
            <ol className="govuk-list govuk-list--number">
              {contentItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="govuk-link">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="govuk-grid-column-two-thirds">
          <div id="overview">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">
              {service.title}
            </h1>

            <FromAttribution
              bodies={
                fromBodies.length
                  ? fromBodies
                  : [{ name: "Government of Kenya (public information)" }]
              }
              published={
                service._createdAt ? formatDate(service._createdAt) : undefined
              }
              updated={
                service._updatedAt ? formatDate(service._updatedAt) : undefined
              }
            />

            <p className="govuk-body-l govuk-!-margin-bottom-4">
              {service.summary}
            </p>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning </span>
                This is an independent guide — not a government website. Never
                share passwords or OTPs with agents. Only pay through official
                portals.{" "}
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </strong>
            </div>

            {/* GOV.UK Start now — single primary CTA */}
            <div className="govuk-!-margin-bottom-6">
              {primaryPortal?.portalUrl ? (
                <>
                  <a
                    href={primaryPortal.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-button"
                    data-module="govuk-button"
                  >
                    {primaryPortal.portalLabel || "Start on official website"}
                    <span className="govuk-visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                  <p className="govuk-body-s govuk-!-margin-top-2">
                    You will leave CitizenGuide.KE to complete the application
                    on an official system.
                  </p>
                </>
              ) : (
                <p className="govuk-body">
                  No direct application link is listed yet. Try{" "}
                  <Link href="/ecitizen" className="govuk-link">
                    eCitizen
                  </Link>{" "}
                  or{" "}
                  <Link href="/contact-government" className="govuk-link">
                    contact government
                  </Link>
                  .
                </p>
              )}
              {secondaryPortals.length > 0 && (
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-3">
                  {secondaryPortals.map((portal, pIdx) => (
                    <li key={pIdx}>
                      <a
                        href={portal.portalUrl}
                        className="govuk-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {portal.portalLabel || "Related official website"}
                        <span className="govuk-visually-hidden">
                          {" "}
                          (opens in a new tab)
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <section
            id="quick-facts"
            aria-labelledby="quick-facts-heading"
            className="govuk-!-margin-bottom-6"
          >
            <h2
              id="quick-facts-heading"
              className="govuk-heading-m govuk-!-margin-bottom-3"
            >
              Quick facts
            </h2>
            <GovUKSummaryList
              items={[
                {
                  key: "Processing time",
                  value: service.processingTime || "Not specified",
                },
                {
                  key: "Base cost",
                  value: service.baseCostLabel || "Free or not specified",
                },
                {
                  key: "How to apply",
                  value:
                    modeLabels[service.executionMode] ||
                    "Check official guidance",
                },
              ]}
            />
            <p className="govuk-body-s">
              Fees and times can change. Confirm on the official site before you
              pay.
            </p>
          </section>

          <section
            id="before-you-start"
            aria-labelledby="before-you-start-heading"
            className="govuk-!-margin-bottom-6"
          >
            <h2 id="before-you-start-heading" className="govuk-heading-m">
              Before you start
            </h2>
            <ul className="govuk-list govuk-list--bullet">
              {service.beforeYouStart?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section
            id="required-documents"
            aria-labelledby="required-docs-heading"
            className="govuk-!-margin-bottom-6"
          >
            <h2 id="required-docs-heading" className="govuk-heading-m">
              Documents you need
            </h2>
            <ul className="govuk-list govuk-list--bullet">
              {service.requiredDocuments?.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </section>

          {service.steps && service.steps.length > 0 && (
            <section
              id="step-by-step"
              aria-labelledby="step-by-step-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="step-by-step-heading" className="govuk-heading-m">
                Step by step
              </h2>
              <ol className="govuk-list govuk-list--number">
                {service.steps.map((step, idx) => (
                  <li key={idx} className="govuk-!-margin-bottom-3">
                    <span className="govuk-!-font-weight-bold">
                      {step.stepTitle}
                    </span>
                    {step.stepDescription && (
                      <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        {step.stepDescription}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {service.feesTable && service.feesTable.length > 0 && (
            <section
              id="fees"
              aria-labelledby="fees-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="fees-heading" className="govuk-heading-m">
                Fees and charges
              </h2>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                      Item
                    </th>
                    <th
                      scope="col"
                      className="govuk-table__header govuk-table__header--numeric"
                    >
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {service.feesTable.map((fee, idx) => (
                    <tr key={idx} className="govuk-table__row">
                      <td className="govuk-table__cell">{fee.itemName}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">
                        {fee.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {service.physicalVisits && service.physicalVisits.length > 0 && (
            <section
              id="office-visits"
              aria-labelledby="office-visits-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="office-visits-heading" className="govuk-heading-m">
                Office visits
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {service.physicalVisits.map((visit, idx) => (
                  <li key={idx}>
                    <strong>{visit.purpose}</strong>
                    {visit.locations ? ` — ${visit.locations}` : null}
                  </li>
                ))}
              </ul>
              <p className="govuk-body">
                You may also use a{" "}
                <Link href="/huduma-centres" className="govuk-link">
                  Huduma Centre
                </Link>{" "}
                where the service is offered.
              </p>
            </section>
          )}

          {service.downloadableResources &&
            service.downloadableResources.length > 0 && (
              <section
                id="downloads"
                aria-labelledby="downloads-heading"
                className="govuk-!-margin-bottom-6"
              >
                <h2 id="downloads-heading" className="govuk-heading-m">
                  Downloads
                </h2>
                <ul className="govuk-list govuk-list--bullet">
                  {service.downloadableResources.map((res, idx) => (
                    <li key={idx}>
                      {res.fileUrl ? (
                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="govuk-link"
                        >
                          {res.label}
                          {res.fileSize
                            ? ` (${formatBytes(res.fileSize)})`
                            : ""}
                          <span className="govuk-visually-hidden">
                            {" "}
                            (opens in a new tab)
                          </span>
                        </a>
                      ) : (
                        res.label
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {service.faqs && service.faqs.length > 0 && (
            <section
              id="faqs"
              aria-labelledby="faqs-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="faqs-heading" className="govuk-heading-m">
                Questions
              </h2>
              {service.faqs.map((faq, idx) => {
                const isOpen = !!openFaqs[idx];
                return (
                  <details
                    key={idx}
                    open={isOpen}
                    onToggle={(e) => {
                      const target = e.target as HTMLDetailsElement;
                      setOpenFaqs((prev) => ({
                        ...prev,
                        [idx]: target.open,
                      }));
                    }}
                    className="govuk-details"
                  >
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        {faq.question}
                      </span>
                    </summary>
                    <div className="govuk-details__text">{faq.answer}</div>
                  </details>
                );
              })}
            </section>
          )}

          <section
            id="related"
            aria-labelledby="related-heading"
            className="govuk-!-margin-bottom-6"
          >
            <h2 id="related-heading" className="govuk-heading-m">
              Explore the topic
            </h2>
            <ul className="govuk-list govuk-list--bullet">
              {service.parentCategory && (
                <li>
                  <Link
                    href={`/services/categories/${service.parentCategory.slug}`}
                    className="govuk-link"
                  >
                    More in {service.parentCategory.title}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/topics" className="govuk-link">
                  Browse all topics
                </Link>
              </li>
              <li>
                <Link href="/services/popular" className="govuk-link">
                  Popular services
                </Link>
              </li>
              <li>
                <Link href="/ecitizen" className="govuk-link">
                  eCitizen explained
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="govuk-link">
                  Disclaimer
                </Link>
              </li>
            </ul>
            {service.relatedServices && service.relatedServices.length > 0 && (
              <>
                <h3 className="govuk-heading-s">Related services</h3>
                <ul className="govuk-list">
                  {service.relatedServices.map((rel, idx) => (
                    <li key={idx}>
                      <Link href={`/${rel.slug}`} className="govuk-link">
                        {rel.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {primaryPortal?.portalUrl && (
            <div className="govuk-!-margin-top-6">
              <a
                href={primaryPortal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-button"
              >
                {primaryPortal.portalLabel || "Start on official website"}
                <span className="govuk-visually-hidden">
                  {" "}
                  (opens in a new tab)
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
