// app/[slug]/ServiceClientView.tsx 
"use client";

import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";

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
    steps?: Array<{ stepNumber: number; stepTitle: string; stepDescription: string }>;
    feesTable?: Array<{ itemName: string; amount: string }>;
    physicalVisits?: Array<{ purpose: string; locations: string }>;
    downloadableResources?: Array<{ label: string; fileUrl?: string; fileSize?: number; sourceUrl?: string }>;
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

  // GOV.UK Compliance Helper: Converts bytes from Sanity CDN into clean metadata strings
  const formatBytes = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    const kib = bytes / 1024;
    if (kib < 1024) return `${kib.toFixed(1)} KB`;
    const mib = kib / 1024;
    return `${mib.toFixed(1)} MB`;
  };

  // GOV.UK Compliance Helper: Formats ISO timestamps into human readable valid dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (!service || !service.title) {
    const fallbackBreadcrumbs = [
      { text: "Home", url: "/" },
      ...(service?.parentCategory
        ? [{ text: service.parentCategory.title, url: `/services?category=${service.parentCategory.slug}` }]
        : [{ text: "Services", url: "/services" }]),
      { text: "Page not found" }
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
            </div>
          </div>
        
      
    
  </>
);
  }

  const breadcrumbItems = [
    { text: "Home", url: "/" },
    ...(service.parentCategory
      ? [{ text: service.parentCategory.title, url: `/services?category=${service.parentCategory.slug}` }]
      : [{ text: "Services", url: "/services" }]),
    { text: service.title },
  ];

  return (
  <>
    
      <GovUKBreadcrumbs items={breadcrumbItems} />

      
        <div className="govuk-grid-row">
          {/* Sidebar (one-third) - sticky contents nav like GOV.UK */}
          <div className="govuk-grid-column-one-third">
            <nav aria-labelledby="contents-heading" className="govuk-!-margin-bottom-6 govuk-!-padding-top-2" style={{ position: 'sticky', top: '20px' }}>
              <h2 id="contents-heading" className="govuk-heading-s govuk-!-margin-bottom-2">Contents</h2>
              <ul className="govuk-list govuk-list--bullet">
              <li><a href="#quick-facts" className="govuk-link">Quick facts</a></li>
              <li><a href="#before-you-start" className="govuk-link">Before you start</a></li>
              <li><a href="#required-documents" className="govuk-link">Documents you need</a></li>
              {service.steps && service.steps.length > 0 && (
                <li><a href="#step-by-step" className="govuk-link">Step by step</a></li>
              )}
              {service.feesTable && service.feesTable.length > 0 && (
                <li><a href="#fees" className="govuk-link">Fees</a></li>
              )}
              {service.physicalVisits && service.physicalVisits.length > 0 && (
                <li><a href="#office-visits" className="govuk-link">Office visits</a></li>
              )}
              {service.faqs && service.faqs.length > 0 && (
                <li><a href="#faqs" className="govuk-link">Questions</a></li>
              )}
            </ul>
          </nav>
        </div>

        {/* Main article content (two-thirds) */}
        <div className="govuk-grid-column-two-thirds">
          
          {/* Header */}
          <div>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              {service.title}
            </h1>
            
            {/* Responsible bodies */}
            {service.providingBodies && service.providingBodies.length > 0 && (
              <div className="govuk-body-s govuk-!-margin-bottom-4 govuk-!-color-grey">
                {service.providingBodies.map((body, idx) => (
                  <div key={idx} className="govuk-!-margin-bottom-1">
                    <strong className="govuk-!-font-weight-bold">{body.name}</strong>
                    {body.parentMinistry && <> (under {body.parentMinistry.name})</>}
                  </div>
                ))}
                <div className="govuk-!-margin-top-2 govuk-body-s">
                  Published: {formatDate(service._createdAt)} · Updated: {formatDate(service._updatedAt)}
                </div>
              </div>
            )}

            <p className="govuk-body-l govuk-!-margin-bottom-6">
              {service.summary}
            </p>
          </div>
          {/* Quick facts - using GOV.UK summary list for scannability */}
          <section id="quick-facts" aria-labelledby="quick-facts-heading" className="govuk-!-margin-bottom-6">
            <h2 id="quick-facts-heading" className="govuk-heading-m govuk-!-margin-bottom-3">Quick facts</h2>
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
                  value: modeLabels[service.executionMode] || "Check official guidance",
                },
              ]}
            />
          </section>

          {/* Before you start */}
          <section id="before-you-start" aria-labelledby="before-you-start-heading" className="govuk-!-margin-bottom-6">
            <h2 id="before-you-start-heading" className="govuk-heading-m">Before you start</h2>
            <ul className="govuk-list govuk-list--bullet">
              {service.beforeYouStart?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Required documents */}
          <section id="required-documents" aria-labelledby="required-docs-heading" className="govuk-!-margin-bottom-6">
            <h2 id="required-docs-heading" className="govuk-heading-m">Documents you need</h2>
            <ul className="govuk-list govuk-list--bullet">
              {service.requiredDocuments?.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </section>
          {/* Step by step */}
          {service.steps && service.steps.length > 0 && (
            <section id="step-by-step" aria-labelledby="step-by-step-heading" className="govuk-!-margin-bottom-6">
              <h2 id="step-by-step-heading" className="govuk-heading-m">Step by step</h2>
              <ol className="govuk-list govuk-list--number">
                {service.steps.map((step, idx) => (
                  <li key={idx} className="govuk-!-margin-bottom-3">
                    <span className="govuk-!-font-weight-bold">{step.stepTitle}</span>
                    {step.stepDescription && <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">{step.stepDescription}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Fees table */}
          {service.feesTable && service.feesTable.length > 0 && (
            <section id="fees" aria-labelledby="fees-heading" className="govuk-!-margin-bottom-6">
              <h2 id="fees-heading" className="govuk-heading-m">Fees and charges</h2>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Item</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Cost</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {service.feesTable.map((fee, idx) => (
                    <tr key={idx} className="govuk-table__row">
                      <td className="govuk-table__cell">{fee.itemName}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{fee.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Dynamic Download Resources Tracking with Byte-Calculated Sizes */}
          {service.downloadableResources && service.downloadableResources.length > 0 && (
            <section aria-labelledby="downloads-heading" className="pt-2">
              <h2 id="downloads-heading" className="text-xl font-bold text-[#0b0c0c] mb-3">
                Downloadable reference attachments
              </h2>
              <ul className="space-y-4">
                {service.downloadableResources.map((res, idx) => (
                  <li key={idx} className="text-base border-l-2 border-[#1d70b8] pl-3 py-0.5">
                    {res.fileUrl && (
                      <a 
                        href={res.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#1d70b8] font-bold underline decoration-2 hover:text-[#003078] block"
                      >
                        {res.label}{" "}
                        {res.fileSize && (
                          <span className="text-xs text-[#505a5f] font-normal font-mono no-underline">
                            ({formatBytes(res.fileSize)})
                          </span>
                        )}
                      </a>
                    )}
                    {res.sourceUrl && (
                      <a 
                        href={res.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#505a5f] underline block mt-0.5 hover:text-[#0b0c0c] break-all"
                      >
                        Verified source: {res.sourceUrl}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {/* FAQs using GOV.UK details component */}
          {service.faqs && service.faqs.length > 0 && (
            <section id="faqs" aria-labelledby="faqs-heading" className="govuk-!-margin-bottom-6">
              <h2 id="faqs-heading" className="govuk-heading-m">Questions</h2>
              {service.faqs.map((faq, idx) => {
                const isOpen = !!openFaqs[idx];
                return (
                  <details
                    key={idx}
                    open={isOpen}
                    onToggle={(e) => {
                      const target = e.target as HTMLDetailsElement;
                      setOpenFaqs(prev => ({ ...prev, [idx]: target.open }));
                    }}
                    className="govuk-details"
                  >
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">{faq.question}</span>
                    </summary>
                    <div className="govuk-details__text">
                      {faq.answer}
                    </div>
                  </details>
                );
              })}
            </section>
          )}

          {/* Related services */}
          {service.relatedServices && service.relatedServices.length > 0 && (
            <section id="related" aria-labelledby="related-heading" className="govuk-!-margin-bottom-6">
              <h2 id="related-heading" className="govuk-heading-m">Related services</h2>
              <ul className="govuk-list">
                {service.relatedServices.map((rel, idx) => (
                  <li key={idx}>
                    <Link href={`/${rel.slug}`} className="govuk-link">{rel.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Start your application */}
          <div className="govuk-!-margin-top-8">
            <p className="govuk-body">
              Apply on the official government site:
            </p>
            <div className="govuk-button-group">
              {service.transactionPortals && service.transactionPortals.length > 0 ? (
                service.transactionPortals.map((portal, pIdx) => (
                  <a 
                    key={pIdx}
                    href={portal.portalUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-button"
                  >
                    {portal.portalLabel || "Start now"}
                  </a>
                ))
              ) : (
                <p className="govuk-body-s">No direct link is available yet. Search for this service on eCitizen or the relevant ministry website.</p>
              )}
            </div>
          </div>
        </div>
        </div>
      
    
  
  </>
);
}