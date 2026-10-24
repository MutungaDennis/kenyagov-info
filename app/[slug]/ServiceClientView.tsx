// app/[slug]/ServiceClientView.tsx
"use client";

import ExternalLinkIcon from "@/components/govuk/ExternalLinkIcon";
import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import FromAttribution from "@/components/site/FromAttribution";
import ServicePortableText from "@/components/sanity/ServicePortableText";

interface MinistryReference {
  name: string;
  slug: string;
  parentMinistry?: {
    name: string;
    slug: string;
  };
}

export interface ServiceClientViewProps {
  service: {
    title: string;
    summary: string;
    body?: unknown;
    reviewedAt?: string;
    moreInformationUrl?: string;
    copyrightNotice?: string;
    licenseUrl?: string;
    sourceLinks?: Array<{ label: string; href: string }>;
    pathways?: Array<{ title: string; summary?: string; details?: string; portalUrl?: string }>;
    countyRequirements?: Array<{ county: string; requirements: string; sourceUrl?: string }>;
    relatedLinks?: Array<{ label: string; href: string }>;
    _createdAt: string;
    _updatedAt: string;
    providingInstitutions?: Array<{
      institutionId?: string;
      name: string;
      slug?: string;
      shortName?: string;
      parentName?: string;
    }>;
    providingBodies?: MinistryReference[];
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
    online: "Online only",
    hybrid: "Online and in person",
    manual: "In person only",
  };

  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const [selectedCounty, setSelectedCounty] = useState("");

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
              href: `/services/${service.parentCategory.slug}`,
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
            href: `/services/${service.parentCategory.slug}`,
          },
        ]
      : []),
    { text: service.title },
  ];

  const primaryPortal = service.transactionPortals?.[0];
  const secondaryPortals = service.transactionPortals?.slice(1) ?? [];

  const hasRelated =
    Boolean(service.relatedServices?.length) ||
    Boolean(service.relatedLinks?.length) ||
    Boolean(service.moreInformationUrl);

  const contentItems = [
    { href: "#overview", text: "Overview" },
    { href: "#quick-facts", text: "Quick facts" },
    ...(Array.isArray(service.body) && service.body.length
      ? [{ href: "#guidance", text: "Guidance" }]
      : []),
    ...(service.pathways?.length
      ? [{ href: "#pathways", text: "Choose a pathway" }]
      : []),
    ...(service.countyRequirements?.length
      ? [{ href: "#county-requirements", text: "Requirements by county" }]
      : []),
    { href: "#before-you-start", text: "Before you start" },
    ...(service.timelineGuidancePoints?.length
      ? [{ href: "#timeline", text: "Timeline" }]
      : []),
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
    ...(service.commonMistakes?.length
      ? [{ href: "#common-mistakes", text: "Common mistakes" }]
      : []),
    ...(service.downloadableResources?.length
      ? [{ href: "#downloads", text: "Downloads" }]
      : []),
    ...(service.faqs?.length ? [{ href: "#faqs", text: "Questions" }] : []),
    ...(hasRelated ? [{ href: "#related", text: "Related" }] : []),
  ];

  const fromBodies =
    (service.providingInstitutions?.length
      ? service.providingInstitutions.map((inst) => ({
          name: inst.parentName
            ? `${inst.name} (under ${inst.parentName})`
            : inst.name,
          href: inst.slug
            ? `/government/institutions/${inst.slug}`
            : undefined,
        }))
      : service.providingBodies?.map((body) => ({
          name: body.parentMinistry
            ? `${body.name} (under ${body.parentMinistry.name})`
            : body.name,
          href: body.slug
            ? `/government/institutions/${body.slug}`
            : undefined,
        }))) ?? [];

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

            <p className="govuk-body-l govuk-!-margin-bottom-4">
              {service.summary}
            </p>

            <p className="govuk-body-s govuk-!-margin-bottom-6">
              Use this guide to understand the process, then start on the official
              website below. You do not apply through CitizenGuide.KE.
            </p>
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

          {/* GOV.UK Start now — single primary CTA (external) */}
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
                  <ExternalLinkIcon />
                  <span className="govuk-visually-hidden">
                    {" "}
                    (opens in a new tab)
                  </span>
                </a>
                <p className="govuk-body-s govuk-!-margin-top-2">
                  You will leave CitizenGuide.KE to complete the application on
                  an official system.
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
                      <ExternalLinkIcon />
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

          {Array.isArray(service.body) && service.body.length > 0 ? (
            <section
              id="guidance"
              aria-labelledby="guidance-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="guidance-heading" className="govuk-heading-m">
                Guidance
              </h2>
              <ServicePortableText value={service.body} />
            </section>
          ) : null}

  {service.pathways && service.pathways.length > 0 ? (
    <section id="pathways" aria-labelledby="pathways-heading" className="govuk-!-margin-bottom-6">
      <h2 id="pathways-heading" className="govuk-heading-m">Choose a pathway</h2>
      <p className="govuk-body">Select the option that matches what you want to do.</p>
      {service.pathways.map((pathway, idx) => (
        <details key={idx} className="govuk-details">
          <summary className="govuk-details__summary"><span className="govuk-details__summary-text">{pathway.title}</span></summary>
          <div className="govuk-details__text">
            {pathway.summary ? <p className="govuk-body">{pathway.summary}</p> : null}
            {pathway.details
              ? pathway.details.split(/\n\n+/).map((paragraph, paragraphIndex) => (
                  <p className="govuk-body" key={paragraphIndex}>{paragraph}</p>
                ))
              : null}
            {pathway.portalUrl ? <a className="govuk-link" href={pathway.portalUrl} target="_blank" rel="noopener noreferrer">Apply for {pathway.title}</a> : null}
          </div>
        </details>
      ))}
    </section>
  ) : null}

  {service.countyRequirements && service.countyRequirements.length > 0 ? (
    <section id="county-requirements" aria-labelledby="county-heading" className="govuk-!-margin-bottom-6">
      <h2 id="county-heading" className="govuk-heading-m">Requirements by county</h2>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="county-select">Select a county</label>
        <select id="county-select" className="govuk-select" value={selectedCounty} onChange={(event) => setSelectedCounty(event.target.value)}>
          <option value="">Select a county</option>
          {service.countyRequirements.map((item) => <option key={item.county} value={item.county}>{item.county}</option>)}
        </select>
      </div>
      {selectedCounty ? (() => {
        const county = service.countyRequirements?.find((item) => item.county === selectedCounty);
        return county ? <div className="govuk-inset-text"><p className="govuk-body">{county.requirements}</p>{county.sourceUrl ? <a className="govuk-link" href={county.sourceUrl} target="_blank" rel="noopener noreferrer">Check the county source</a> : null}</div> : null;
      })() : null}
    </section>
  ) : null}

          {service.beforeYouStart?.length > 0 && (
            <section id="before-you-start" className="govuk-!-margin-bottom-6">
              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Before you start</span>
                </summary>
                <div className="govuk-details__text">
                  <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                    {service.beforeYouStart.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </details>
            </section>
          )}


          {service.timelineGuidancePoints &&
            service.timelineGuidancePoints.length > 0 && (
              <section id="timeline" className="govuk-!-margin-bottom-6">
                <details className="govuk-details">
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">Timeline</span>
                  </summary>
                  <div className="govuk-details__text">
                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                      {service.timelineGuidancePoints.map((point, idx) => <li key={idx}>{point}</li>)}
                    </ul>
                  </div>
                </details>
              </section>
            )}

          {service.requiredDocuments?.length > 0 && (
            <section id="required-documents" className="govuk-!-margin-bottom-6">
              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Documents you need</span>
                </summary>
                <div className="govuk-details__text">
                  <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                    {service.requiredDocuments.map((doc, idx) => <li key={idx}>{doc}</li>)}
                  </ul>
                </div>
              </details>
            </section>
          )}

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

          {service.commonMistakes && service.commonMistakes.length > 0 && (
            <section
              id="common-mistakes"
              aria-labelledby="common-mistakes-heading"
              className="govuk-!-margin-bottom-6"
            >
              <h2 id="common-mistakes-heading" className="govuk-heading-m">
                Common mistakes
              </h2>
              <dl className="govuk-summary-list">
                {service.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="govuk-summary-list__row"
                  >
                    <dt className="govuk-summary-list__key">
                      {mistake.errorTitle}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {mistake.errorFix || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
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
                  {service.downloadableResources.map((res, idx) => {
                    const href = res.fileUrl || res.sourceUrl || "";
                    return (
                      <li key={idx}>
                        {href ? (
                          <a
                            href={href}
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
                    );
                  })}
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
              {service.moreInformationUrl ? (
                <li>
                  <a
                    href={service.moreInformationUrl}
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More information on the official website
                    <span className="govuk-visually-hidden">
                      {" "}
                      (opens in a new tab)
                    </span>
                  </a>
                </li>
              ) : null}
              {service.relatedLinks?.map((link, idx) => (
                <li key={`rl-${idx}`}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className="govuk-link">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="govuk-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <span className="govuk-visually-hidden">
                        {" "}
                        (opens in a new tab)
                      </span>
                    </a>
                  )}
                </li>
              ))}
              {service.relatedServices?.map((rel) => (
                <li key={rel.slug}>
                  <Link href={`/${rel.slug}`} className="govuk-link">
                    {rel.title}
                  </Link>
                </li>
              ))}
              {service.parentCategory && (
                <li>
                  <Link
                    href={`/services/${service.parentCategory.slug}`}
                    className="govuk-link"
                  >
                    More in {service.parentCategory.title}
                  </Link>
                </li>
              )}
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

          <div className="govuk-!-margin-top-8 govuk-!-margin-bottom-4">
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
            {service.reviewedAt ? (
              <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                Last reviewed {formatDate(service.reviewedAt)}
              </p>
            ) : null}
            {service.copyrightNotice ? <p className="govuk-body-s govuk-!-margin-top-2">{service.copyrightNotice}{service.licenseUrl ? <> <a className="govuk-link" href={service.licenseUrl} target="_blank" rel="noopener noreferrer">Read the licence</a></> : null}</p> : null}
            {service.sourceLinks && service.sourceLinks.length > 0 ? (
              <div className="govuk-!-margin-top-3"><h3 className="govuk-heading-s">Sources</h3><ul className="govuk-list govuk-list--bullet">{service.sourceLinks.map((source, idx) => <li key={idx}><a className="govuk-link" href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></div>
            ) : null}
          </div>

          {primaryPortal?.portalUrl && (
            <div className="govuk-!-margin-top-4">
              <a
                href={primaryPortal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="govuk-button"
              >
                {primaryPortal.portalLabel || "Start on official website"}
                <ExternalLinkIcon />
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
