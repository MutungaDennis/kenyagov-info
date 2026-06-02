// app/[slug]/ServiceClientView.tsx (Part 1 of 2)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

interface ServiceClientViewProps {
  service: {
    title: string;
    summary: string;
    processingTime: string;
    baseCostLabel: string;
    executionMode: string;
    timelineGuidance?: string;
    beforeYouStart: string[];
    requiredDocuments: string[];
    feesTable?: Array<{ itemName: string; amount: string }>;
    physicalVisits?: Array<{ purpose: string; locations: string }>;
    downloadableResources?: Array<{ label: string; fileUrl: string }>;
    commonMistakes?: Array<{ errorTitle: string; errorFix: string }>;
    faqs?: Array<{ question: string; answer: string }>;
    ecitizenUrl: string;
    parentCategory?: { title: string; slug: string };
  };
}

export default function ServiceClientView({ service }: ServiceClientViewProps) {
  // Safe execution mode mapping labels
  const modeLabels: Record<string, string> = {
    online: "100% Digital (Completely online)",
    hybrid: "Hybrid (Online form + Physical attendance required)",
    manual: "100% Manual (Physical office submission)",
  };

  // State management to track which FAQ indexes are expanded
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // FIXED: Properties renamed from 'label' to 'text' to solve TS compilation error
  const breadcrumbItems = [
    { text: "Home", url: "/" },
    ...(service.parentCategory
      ? [{ text: service.parentCategory.title, url: `/services?category=${service.parentCategory.slug}` }]
      : [{ text: "Services", url: "/services" }]),
    { text: service.title },
  ];

  return (
    <div className="govuk-width-container mx-auto px-4 py-6 max-w-5xl font-sans text-[#0b0c0c] bg-white antialiased">
      {/* Dynamic Breadcrumbs utilizing fixed items object layout */}
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Content Panel (Two-Thirds Column width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Block */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#0b0c0c]">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-[#0b0c0c] font-normal leading-relaxed mb-6 border-l-4 border-[#1d70b8] pl-4 italic">
              {service.summary}
            </p>
            
            {/* Informational Notification Banner */}
            <div className="bg-[#f3f4f4] border-t-4 border-[#1d70b8] p-4 text-sm md:text-base mb-6">
              <p className="font-bold mb-1">Informational Guidance Service Only</p>
              <p className="text-[#505a5f]">
                Review the legal steps, costs, and requirements below to prepare your files before launching your official application.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-[#b1b4b6] py-4 bg-[#f8f8f8] px-4">
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#505a5f] font-bold">Processing Time</span>
              <span className="text-base font-bold text-[#0b0c0c]">{service.processingTime || "Not Specified"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#505a5f] font-bold">Estimated Cost</span>
              <span className="text-base font-bold text-[#0b0c0c]">{service.baseCostLabel || "Free"}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#505a5f] font-bold">Execution Mode</span>
              <span className="text-base font-bold text-[#0b0c0c]">{modeLabels[service.executionMode] || "Standard"}</span>
            </div>
          </div>

          {/* Timeline Planning Section */}
          {service.timelineGuidance && (
            <section className="bg-[#f3f4f4] p-4 rounded-sm border-l-4 border-[#00703c]">
              <h2 className="text-lg font-bold text-[#0b0c0c] mb-1">📅 Recommended Timeline Planning</h2>
              <p className="text-base text-[#0b0c0c]">{service.timelineGuidance}</p>
            </section>
          )}

          {/* Before You Start Section */}
          <section>
            <h2 className="text-2xl font-bold border-b-2 border-[#b1b4b6] pb-1 mb-4 text-[#0b0c0c]">
              Before you start (Eligibility Core Requirements)
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base md:text-lg">
              {service.beforeYouStart?.map((item, idx) => (
                <li key={idx} className="pl-1">{item}</li>
              ))}
            </ul>
          </section>

          {/* Required Documents Section */}
          <section>
            <h2 className="text-2xl font-bold border-b-2 border-[#b1b4b6] pb-1 mb-4 text-[#0b0c0c]">
              Required papers & file scans
            </h2>
            <p className="text-base text-[#505a5f] mb-3">Ensure you have clear, original color copies of these items ready to upload:</p>
            <ul className="list-none space-y-2.5">
              {service.requiredDocuments?.map((doc, idx) => (
                <li key={idx} className="flex items-start text-base md:text-lg">
                  <span className="text-[#00703c] font-bold mr-2.5 text-xl leading-none">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </section>


          {/* Common Pitfalls Section */}
          {service.commonMistakes && service.commonMistakes.length > 0 && (
            <section className="bg-[#fff7e6] border-l-4 border-[#f47738] p-5">
              <h2 className="text-xl font-bold text-[#d4351c] mb-3 flex items-center">
                ⚠️ Critical Common Mistakes (Avoid Portal Rejections)
              </h2>
              <div className="space-y-4">
                {service.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="text-base">
                    <p className="font-bold text-[#0b0c0c]">{mistake.errorTitle}</p>
                    <p className="text-[#505a5f] mt-0.5">{mistake.errorFix}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Downloadable Templates Section */}
          {service.downloadableResources && service.downloadableResources.length > 0 && (
            <section className="bg-[#f3f4f4] p-5 border border-[#b1b4b6]">
              <h2 className="text-lg font-bold text-[#0b0c0c] mb-3">Downloadable Forms & Reference Blueprints</h2>
              <ul className="space-y-2">
                {service.downloadableResources.map((res, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-xl mr-2">📄</span>
                    <a 
                      href={res.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#1d70b8] font-bold underline hover:text-[#003078]"
                    >
                      {res.label} (PDF Reference File)
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Frequently Asked Questions (Accordion implementation) */}
          {service.faqs && service.faqs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold border-b-2 border-[#b1b4b6] pb-1 mb-4 text-[#0b0c0c]">
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {service.faqs.map((faq, idx) => {
                  const isOpen = !!openFaqs[idx];
                  return (
                    <div key={idx} className="border-b border-[#b1b4b6]">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left py-3 font-bold flex justify-between items-center text-base md:text-lg hover:bg-[#f8f8f8] px-2 focus:outline-none transition-colors"
                      >
                        <span>{faq.question}</span>
                        <span className={`summary-chevron transform transition-transform text-sm text-[#1d70b8] ${isOpen ? "rotate-90" : "rotate-0"}`}>
                          ▶
                        </span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 pb-4 px-2" : "max-h-0"}`}>
                        <p className="text-base text-[#333] leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* High-visibility Action Footer Area */}
          <div className="border-t border-[#b1b4b6] pt-6 mt-8">
            <p className="text-sm text-[#505a5f] mb-3">
              By clicking below, you will leave citizenguide.Ke and proceed directly to the authentic portal platform to process your files securely.
            </p>
            <Link 
              href={service.ecitizenUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between bg-[#00703c] text-white hover:bg-[#005a30] active:bg-[#004424] font-bold text-lg md:text-xl px-5 py-3 rounded-none shadow-md border-b-4 border-[#004424] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] group transition-all"
            >
              <span>Start now</span>
              <span className="ml-3 transform group-hover:translate-x-1 transition-transform font-mono">►</span>
            </Link>
          </div>
        </div>

        {/* Right Sidebar Area (One-Third Column width on desktop panels) */}
        <div className="space-y-6 lg:border-l lg:border-[#b1b4b6] lg:pl-6">
          
          {/* Itemized Fees Matrix Block */}
          {service.feesTable && service.feesTable.length > 0 && (
            <div className="border border-[#b1b4b6] p-4 bg-[#fdfdfd]">
              <h3 className="text-lg font-bold text-[#0b0c0c] mb-3 border-b border-[#b1b4b6] pb-1">
                Itemized Cost Matrix
              </h3>
              <table className="w-full text-sm text-left">
                <tbody>
                  {service.feesTable.map((fee, idx) => (
                    <tr key={idx} className="border-b border-[#f3f4f4] last:border-none">
                      <td className="py-2 pr-2 text-[#505a5f]">{fee.itemName}</td>
                      <td className="py-2 text-right font-bold text-[#0b0c0c] whitespace-nowrap">{fee.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Venues Matrix Block */}
          {service.physicalVisits && service.physicalVisits.length > 0 && (
            <div className="border border-[#b1b4b6] p-4 bg-[#fdfdfd]">
              <h3 className="text-lg font-bold text-[#0b0c0c] mb-3 border-b border-[#b1b4b6] pb-1">
                Required Office Visits
              </h3>
              <div className="space-y-3">
                {service.physicalVisits.map((visit, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-bold text-[#1d70b8]">📍 {visit.purpose}</p>
                    <p className="text-[#505a5f] mt-0.5 whitespace-pre-line">{visit.locations}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global CSS Overrides for clean handling */}
      <style dangerouslySetInnerHTML={{__html: `
        summary::-webkit-details-marker { display: none !important; }
        summary { list-style: none !important; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        details[open] summary .summary-chevron { transform: rotate(90deg); display: inline-block; top: 4px !important; }
      `}} />
    </div>
  );
}
