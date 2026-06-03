// app/[slug]/ServiceClientView.tsx (Part 1 of 3)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

interface ServiceClientViewProps {
  service: {
    title: string;
    summary: string;
    providingBody: string;
    processingTime: string;
    baseCostLabel: string;
    executionMode: string;
    timelineGuidance?: string;
    beforeYouStart: string[];
    requiredDocuments: string[];
    steps?: Array<{ stepNumber: number; stepTitle: string; stepDescription: string }>;
    feesTable?: Array<{ itemName: string; amount: string }>;
    physicalVisits?: Array<{ purpose: string; locations: string }>;
    downloadableResources?: Array<{ label: string; fileUrl: string }>;
    commonMistakes?: Array<{ errorTitle: string; errorFix: string }>;
    faqs?: Array<{ question: string; answer: string }>;
    ecitizenUrl: string;
    parentCategory?: { title: string; slug: string };
    relatedServices?: Array<{ title: string; url: string }>;
  };
}

export default function ServiceClientView({ service }: ServiceClientViewProps) {
  const modeLabels: Record<string, string> = {
    online: "Online (Digital submission)",
    hybrid: "Hybrid (Online form and physical attendance required)",
    manual: "Manual (Physical office submission)",
  };

  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const breadcrumbItems = [
    { text: "Home", url: "/" },
    ...(service.parentCategory
      ? [{ text: service.parentCategory.title, url: `/services?category=${service.parentCategory.slug}` }]
      : [{ text: "Services", url: "/services" }]),
    { text: service.title },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 font-sans text-[#0b0c0c] bg-white antialiased selection:bg-[#ffdd00] selection:text-[#0b0c0c]">
      {/* Accessible Navigation Path */}
      <GovUKBreadcrumbs items={breadcrumbItems} />

      {/* Main Structural Grid Layout */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sticky Table of Contents Sidebar */}
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
              {service.relatedServices && service.relatedServices.length > 0 && (
                <li><a href="#related" className="underline hover:text-[#003078]">Related services</a></li>
              )}
            </ul>
          </nav>
        </aside>

        {/* Core Narrative Stream Panel */}
        <div className="md:col-span-3 space-y-12">
          
          {/* Header & Authority Block */}
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0b0c0c]">
              {service.title}
            </h1>
            
            <p className="text-base text-[#505a5f] mb-6">
              Provided by: <span className="font-bold">{service.providingBody || "Government Agency"}</span>
            </p>

            <p className="text-xl md:text-2xl text-[#0b0c0c] font-normal leading-relaxed mb-8">
              {service.summary}
            </p>
            
            {/* GOV.UK Standard Inset Block */}
            <div className="border-l-4 border-[#b1b4b6] pl-5 py-1 my-6">
              <p className="text-base text-[#0b0c0c] font-bold mb-1">Informational guidance service</p>
              <p className="text-[#505a5f] text-base leading-relaxed">
                Review the official legal steps, pricing layers, and verification documents below to prepare your files successfully.
              </p>
            </div>
          </div>

          {/* Quick Facts Summary Box Pattern */}
          <section id="quick-facts" aria-labelledby="quick-facts-heading" className="pt-2">
            <h2 id="quick-facts-heading" className="text-2xl font-bold mb-4 text-[#0b0c0c]">Service quick facts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-base border-collapse">
                <tbody>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c] w-1/3">Processing time</th>
                    <td className="py-3 text-[#0b0c0c]">{service.processingTime || "Not specified"}</td>
                  </tr>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c]">Estimated base cost</th>
                    <td className="py-3 text-[#0b0c0c]">{service.baseCostLabel || "Free"}</td>
                  </tr>
                  <tr className="border-b border-[#b1b4b6]">
                    <th className="py-3 pr-4 font-bold text-left text-[#0b0c0c]">Application method</th>
                    <td className="py-3 text-[#0b0c0c]">{modeLabels[service.executionMode] || "Standard submission"}</td>
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
            <p className="text-base md:text-lg text-[#0b0c0c] mb-4">
              Verify your structural eligibility before starting your application:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-[#0b0c0c] leading-relaxed">
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
            <div className="border-l-4 border-[#b1b4b6] pl-5 py-1 mb-4">
              <p className="text-base text-[#0b0c0c]">
                Ensure you have clear, original color copies of these items ready to upload:
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-[#0b0c0c] leading-relaxed">
              {service.requiredDocuments?.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </section>

          {/* Step-by-Step Chronological Process */}
          {service.steps && service.steps.length > 0 && (
            <section id="step-by-step" aria-labelledby="step-by-step-heading">
              <h2 id="step-by-step-heading" className="text-2xl md:text-3xl font-bold mb-6 text-[#0b0c0c]">
                Step by step process
              </h2>
              <ol className="relative border-l-4 border-[#0b0c0c] ml-3 pl-6 space-y-8">
                {service.steps
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step, idx) => (
                    <li key={idx} className="relative">
                      {/* Step Number Badge Anchor Indicator */}
                      <span className="absolute -left-[38px] top-0 bg-[#0b0c0c] text-white rounded-none font-bold text-sm w-7 h-7 flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <h3 className="text-xl font-bold text-[#0b0c0c] mb-2 pt-0.5">
                        {step.stepTitle}
                      </h3>
                      <p className="text-base md:text-lg text-[#505a5f] leading-relaxed">
                        {step.stepDescription}
                      </p>
                    </li>
                  ))}
              </ol>
            </section>
          )}

          {/* Fees Section */}
          {service.feesTable && service.feesTable.length > 0 && (
            <section id="fees" aria-labelledby="fees-heading">
              <h2 id="fees-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
                Fees and charges
              </h2>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-base text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#0b0c0c]">
                      <th className="py-2 pr-4 font-bold text-[#0b0c0c]">Item or condition</th>
                      <th className="py-2 text-right font-bold text-[#0b0c0c]">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.feesTable.map((fee, idx) => (
                      <tr key={idx} className="border-b border-[#b1b4b6]">
                        <td className="py-3 pr-4 text-[#0b0c0c] font-normal">{fee.itemName}</td>
                        <td className="py-3 text-right font-bold text-[#0b0c0c] whitespace-nowrap">{fee.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* Office Attendance Section */}
          {service.physicalVisits && service.physicalVisits.length > 0 && (
            <section id="office-visits" aria-labelledby="visits-heading">
              <h2 id="visits-heading" className="text-2xl md:text-3xl font-bold mb-4 text-[#0b0c0c]">
                Required office attendance
              </h2>
              <div className="space-y-6">
                {service.physicalVisits.map((visit, idx) => (
                  <div key={idx} className="text-base text-[#0b0c0c]">
                    <p className="font-bold text-[#0b0c0c] mb-1">{visit.purpose}</p>
                    <p className="text-[#505a5f] whitespace-pre-line leading-relaxed">{visit.locations}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline Advice Layout (Conditional fallback display point) */}
          {service.timelineGuidance && !service.steps && (
            <div className="border-l-4 border-[#00703c] pl-5 py-1">
              <p className="text-base font-bold text-[#00703c] mb-1">Recommended timeline</p>
              <p className="text-base text-[#0b0c0c] leading-relaxed">{service.timelineGuidance}</p>
            </div>
          )}

          {/* Common Portal Pitfalls and Warnings Section */}
          {service.commonMistakes && service.commonMistakes.length > 0 && (
            <section className="border-l-4 border-[#d4351c] pl-5 py-1" aria-labelledby="pitfalls-heading">
              <h2 id="pitfalls-heading" className="text-xl font-bold text-[#d4351c] mb-3">
                Important application warnings
              </h2>
              <div className="space-y-4">
                {service.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="text-base text-[#0b0c0c]">
                    <p className="font-bold text-[#0b0c0c]">{mistake.errorTitle}</p>
                    <p className="text-[#505a5f] mt-0.5 leading-relaxed">{mistake.errorFix}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Downloadable Reference Section */}
          {service.downloadableResources && service.downloadableResources.length > 0 && (
            <section aria-labelledby="downloads-heading" className="pt-2">
              <h2 id="downloads-heading" className="text-xl font-bold text-[#0b0c0c] mb-3">
                Downloadable reference attachments
              </h2>
              <ul className="space-y-2">
                {service.downloadableResources.map((res, idx) => (
                  <li key={idx}>
                    <a 
                      href={res.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#1d70b8] font-bold underline decoration-2 hover:text-[#003078] focus:bg-[#ffdd00] focus:text-[#0b0c0c] focus:no-underline text-base"
                    >
                      {res.label} (PDF format)
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Frequently Asked Questions Accordion Framework */}
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
                        <span className="text-xs text-[#505a5f] no-underline font-normal ml-4 shrink-0 group-open:hidden" aria-hidden="true">Show</span>
                        <span className="text-xs text-[#505a5f] no-underline font-normal ml-4 shrink-0 hidden group-open:inline" aria-hidden="true">Hide</span>
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

          {/* Contextual Related Services Section */}
          {service.relatedServices && service.relatedServices.length > 0 && (
            <section id="related" aria-labelledby="related-heading" className="pt-6 border-t border-[#b1b4b6]">
              <h2 id="related-heading" className="text-xl font-bold text-[#0b0c0c] mb-4">
                Related services
              </h2>
              <ul className="space-y-3 text-base">
                {service.relatedServices.map((rel, idx) => (
                  <li key={idx}>
                    <Link 
                      href={rel.url} 
                      className="text-[#1d70b8] underline decoration-2 font-bold hover:text-[#003078] focus:bg-[#ffdd00] focus:text-[#0b0c0c]"
                    >
                      {rel.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Strict GOV.UK Direct Outbound Redirection Callout */}
          <div className="border-t border-[#b1b4b6] pt-8 mt-12">
            <div className="border-l-4 border-[#b1b4b6] pl-5 py-1 mb-6">
              <p className="text-base text-[#0b0c0c]">
                Applications are submitted securely through the official government eCitizen portal platform.
              </p>
            </div>
            <Link 
              href={service.ecitizenUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#00703c] text-white hover:bg-[#005a30] active:bg-[#004424] font-bold text-xl px-6 py-3 border-b-4 border-[#004424] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] focus:text-[#0b0c0c] focus:bg-[#ffdd00] transition-colors"
            >
              Start now
              <svg 
                className="ml-3 fill-current w-5 h-5 inline-block align-middle pointer-events-none" 
                xmlns="http://w3.org" 
                viewBox="0 0 33 40" 
                aria-hidden="true" 
                focusable="false"
              >
                <path d="M0 0h13l20 20-20 20H0l20-20z" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}