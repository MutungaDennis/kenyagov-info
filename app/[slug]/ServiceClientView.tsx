// app/[slug]/ServiceClientView.tsx 
"use client";

import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

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
      <div className="mx-auto max-w-4xl px-4 py-6 font-sans text-[#0b0c0c] bg-white antialiased">
        <GovUKBreadcrumbs items={fallbackBreadcrumbs} />
        <main className="mt-12 max-w-2xl space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0b0c0c]">
            Page not found
          </h1>
          <p className="text-lg md:text-xl text-[#0b0c0c] leading-relaxed">
            If you typed the web address, check it is correct.
          </p>
        </main>
      </div>
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
    <div className="mx-auto max-w-4xl px-4 py-6 font-sans text-[#0b0c0c] bg-white antialiased selection:bg-[#ffdd00] selection:text-[#0b0c0c]">
      <GovUKBreadcrumbs items={breadcrumbItems} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden md:block md:col-span-1">
          <nav aria-labelledby="contents-heading" className="sticky top-6 border-t-2 border-[#0b0c0c] pt-3">
            <h2 id="contents-heading" className="text-sm font-bold uppercase tracking-wider text-[#505a5f] mb-3">
              Contents
            </h2>
            <ul className="space-y-3 text-sm font-bold text-[#1d70b8]">
              <li><a href="#quick-facts" className="underline hover:text-[#003078]">Quick facts</a></li>
              <li><a href="#before-you-start" className="underline hover:text-[#003078]">Before you start</a></li>
              <li><a href="#required-documents" className="underline hover:text-[#003078]">Required documents</a></li>
              {service.steps && service.steps.length > 0 && (
                <li><a href="#step-by-step" className="underline hover:text-[#003078]">Step by step process</a></li>
              )}
              {service.feesTable && service.feesTable.length > 0 && (
                <li><a href="#fees" className="underline hover:text-[#003078]">Fees and charges</a></li>
              )}
              {service.physicalVisits && service.physicalVisits.length > 0 && (
                <li><a href="#office-visits" className="underline hover:text-[#003078]">Office visits</a></li>
              )}
              {service.faqs && service.faqs.length > 0 && (
                <li><a href="#faqs" className="underline hover:text-[#003078]">Questions</a></li>
              )}
            </ul>
          </nav>
        </aside>

        {/* Core Content Flow */}
        <div className="md:col-span-3 space-y-12">
          
          {/* Header & Reusable Multi-Agency Reference Layout */}
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-[#0b0c0c]">
              {service.title}
            </h1>
            
            {/* Renders multi-nested Departments and parent Ministries dynamically */}
            {service.providingBodies && service.providingBodies.length > 0 && (
              <div className="text-sm text-[#505a5f] mb-6 space-y-2 border-b border-[#b1b4b6] pb-4">
                {service.providingBodies.map((body, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="block text-[#0b0c0c]">
                      Department: <strong className="font-bold">{body.name}</strong>
                    </span>
                    {body.parentMinistry && (
                      <span className="block text-xs text-[#505a5f] font-normal italic">
                        Ministry: {body.parentMinistry.name}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Information Validity Timestamps Callout Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs font-mono text-[#505a5f]">
                  <p>Published: {formatDate(service._createdAt)}</p>
                  <p className="border-l border-[#b1b4b6] pl-4">Updated: {formatDate(service._updatedAt)}</p>
                </div>
              </div>
            )}

            <p className="text-xl md:text-2xl text-[#0b0c0c] font-normal leading-relaxed mb-6">
              {service.summary}
            </p>
          </div>
          {/* Quick Facts Section */}
          <section id="quick-facts" aria-labelledby="quick-facts-heading" className="pt-2">
            <h2 id="quick-facts-heading" className="text-2xl font-bold mb-4 text-[#0b0c0c]">Service quick facts</h2>
            <div className="w-full overflow-x-auto border-t-2 border-[#0b0c0c]">
              <table className="w-full text-base border-collapse min-w-[280px]">
                <tbody>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c] w-1/3 min-w-[120px]">Processing time</th>
                    <td className="py-3 text-[#0b0c0c]">{service.processingTime}</td>
                  </tr>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c]">Estimated base cost</th>
                    <td className="py-3 text-[#0b0c0c]">{service.baseCostLabel}</td>
                  </tr>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c]">Application method</th>
                    <td className="py-3 text-[#0b0c0c]">{modeLabels[service.executionMode]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Before You Start Section */}
          <section id="before-you-start" aria-labelledby="before-you-start-heading">
            <h2 id="before-you-start-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
              Before you start
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#0b0c0c] leading-relaxed">
              {service.beforeYouStart?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Required Documents Section */}
          <section id="required-documents" aria-labelledby="required-docs-heading">
            <h2 id="required-docs-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
              Required documents and file scans
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#0b0c0c] leading-relaxed">
              {service.requiredDocuments?.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </section>
          {/* Chronological Steps Timeline */}
          {service.steps && service.steps.length > 0 && (
            <section id="step-by-step" aria-labelledby="step-by-step-heading">
              <h2 id="step-by-step-heading" className="text-2xl md:text-3xl font-bold mb-6 text-[#0b0c0c]">
                Step by step process
              </h2>
              <ol className="relative border-l-4 border-[#0b0c0c] ml-3 pl-6 space-y-8">
                {service.steps.map((step, idx) => (
                  <li key={idx} className="relative">
                    <span className="absolute -left-[38px] top-0 bg-[#0b0c0c] text-white rounded-none font-bold text-sm w-7 h-7 flex items-center justify-center font-mono">
                      {step.stepNumber}
                    </span>
                    <h3 className="text-xl font-bold text-[#0b0c0c] mb-2 pt-0.5">
                      {step.stepTitle}
                    </h3>
                    <p className="text-base text-[#505a5f] leading-relaxed">
                      {step.stepDescription}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Mobile Responsive Fees Table */}
          {service.feesTable && service.feesTable.length > 0 && (
            <section id="fees" aria-labelledby="fees-heading">
              <h2 id="fees-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
                Fees and charges
              </h2>
              <div className="w-full overflow-x-auto border-b border-[#b1b4b6]">
                <table className="w-full text-base text-left border-collapse min-w-[280px]">
                  <thead>
                    <tr className="border-b-2 border-[#0b0c0c]">
                      <th className="py-2 pr-4 font-bold text-[#0b0c0c]">Item or condition</th>
                      <th className="py-2 text-right font-bold text-[#0b0c0c] w-24">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.feesTable.map((fee, idx) => (
                      <tr key={idx} className="border-b border-[#b1b4b6] hover:bg-[#f8f8f8]">
                        <td className="py-3 pr-4 text-[#0b0c0c] font-normal leading-normal">{fee.itemName}</td>
                        <td className="py-3 text-right font-bold text-[#0b0c0c] whitespace-nowrap">{fee.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          {/* FAQ Framework Accordions */}
          {service.faqs && service.faqs.length > 0 && (
            <section id="faqs" aria-labelledby="faqs-heading">
              <h2 id="faqs-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
                Frequently asked questions
              </h2>
              <div className="space-y-1">
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
                      className="border-b border-[#b1b4b6] group"
                    >
                      <summary className="w-full text-left py-4 font-bold flex justify-between items-center text-base text-[#1d70b8] hover:text-[#003078] cursor-pointer focus:bg-[#ffdd00] focus:text-[#0b0c0c] select-none list-none [&::-webkit-details-marker]:hidden">
                        <span className="underline decoration-2 text-left">{faq.question}</span>
                        <span className="text-xs text-[#505a5f] no-underline font-normal ml-4 shrink-0 group-open:hidden">Show</span>
                        <span className="text-xs text-[#505a5f] no-underline font-normal ml-4 shrink-0 hidden group-open:inline">Hide</span>
                      </summary>
                      <div className="pb-6 pt-2 text-base text-[#0b0c0c] leading-relaxed whitespace-pre-line max-w-none">
                        {faq.answer}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Services Content Links */}
          {service.relatedServices && service.relatedServices.length > 0 && (
            <section id="related" aria-labelledby="related-heading" className="pt-6 border-t border-[#b1b4b6]">
              <h2 id="related-heading" className="text-xl font-bold text-[#0b0c0c] mb-4">
                Related services
              </h2>
              <ul className="space-y-3 text-base">
                {service.relatedServices.map((rel, idx) => (
                  <li key={idx}>
                    <Link 
                      href={`/${rel.slug}`} 
                      className="text-[#1d70b8] underline decoration-2 font-bold hover:text-[#003078]"
                    >
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Multi-Portal Direct Outbound Redirection Section */}
          <div className="border-t border-[#b1b4b6] pt-8 mt-12">
            <div className="border-l-4 border-[#b1b4b6] pl-5 py-1 mb-6">
              <p className="text-base text-[#0b0c0c]">
                Applications are processed securely by clicking the matching official digital execution gateways below:
              </p>
            </div>
            
            {/* FIXED: Formats your array loop metrics dynamically. Rendered buttons will display perfectly */}
            <div className="flex flex-wrap gap-4">
              {service.transactionPortals && service.transactionPortals.length > 0 ? (
                service.transactionPortals.map((portal, pIdx) => (
                  <a 
                    key={pIdx}
                    href={portal.portalUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-[#00703c] text-white hover:bg-[#005a30] active:bg-[#004424] font-bold text-lg px-5 py-3 border-b-4 border-[#004424] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] focus:text-[#0b0c0c] focus:bg-[#ffdd00] transition-colors"
                  >
                    {portal.portalLabel || "Start now"}
                    <svg 
                      className="ml-3 fill-current w-4 h-4 inline-block align-middle pointer-events-none" 
                      xmlns="http://w3.org" 
                      viewBox="0 0 33 40" 
                      aria-hidden="true" 
                      focusable="false"
                    >
                      <path d="M0 0h13l20 20-20 20H0l20-20z" />
                    </svg>
                  </a>
                ))
              ) : (
                <div className="text-sm font-bold text-[#d4351c] font-sans">
                  System notice: Action portals have not yet been assigned to this guide document template.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}