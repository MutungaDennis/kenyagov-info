"use client";

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import { PortableText } from "@portabletext/react"; // Handles Sanity's Rich Text

// Define custom GOV.UK typography layout overrides scaled up for high authority
const govukPortableTextComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="govuk-body govuk-!-margin-bottom-4" style={{ fontSize: "18px", color: "#111418", lineHeight: "1.6" }}>
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3" style={{ fontSize: "24px", fontWeight: 700, color: "#0b0c0c" }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2" style={{ fontSize: "19px", fontWeight: 700, color: "#0b0c0c" }}>
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4" style={{ fontSize: "17px", color: "#262c2e" }}>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-4" style={{ fontSize: "17px", color: "#262c2e" }}>
        {children}
      </ol>
    ),
  },
};

interface SubDept {
  name: string;
  slug: string;
  description: string;
}

interface MinistryHubProps {
  ministry: any;
  subDepartments: SubDept[];
  segments: string[];
  cms?: {
    contentType?: string;
    whatItDoes?: any[]; // Portable text block from Sanity
    servicesCharter?: any[];
    coverBannerUrl?: string;
    downloadableDocuments?: Array<{ documentName: string; fileUrl: string }>;
    governingActs?: Array<{ shortTitle: string; citation: string; slug: string }>;
  } | null;
}

export default function MinistryHubView({ ministry, subDepartments, segments, cms }: MinistryHubProps) {
  const breadcrumbItems = generateBreadcrumbs(segments, ministry.name);

  return (
    <>
      {/* 
        CRITICAL ACCESSIBILITY FIX: Removed nested govuk-width-container wrapper.
        The container logic is already managed globally inside app/layout.tsx.
      */}
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            
            {/* Context Caption Header Block */}
            <span className="govuk-caption-l" style={{ fontSize: "19px", color: "#3b4246", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {ministry.arm_of_government || "Executive arm of Government"}
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4" style={{ fontSize: "42px", fontWeight: 800, color: "#0b0c0c", letterSpacing: "-0.02em", lineHeight: "1.15" }}>
              {ministry.name}
            </h1>
            
            {/* LAYER 1: Core Description Overview Block */}
            {cms?.whatItDoes ? (
              <div className="govuk-!-margin-bottom-6">
                <PortableText value={cms.whatItDoes} components={govukPortableTextComponents} />
              </div>
            ) : (
              ministry.description && (
                <p className="govuk-body govuk-!-margin-bottom-6" style={{ fontSize: "19px", color: "#111418", lineHeight: "1.65" }}>
                  {ministry.description}
                </p>
              )
            )}
            {/* LAYER 2: Institutional Mandate Inset Panel */}
            <div 
              className="govuk-inset-text govuk-!-margin-bottom-6" 
              style={{ borderLeftColor: "#00664f", paddingLeft: "20px", marginTop: "24px", marginBottom: "24px" }}
            >
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "19px", fontWeight: 700, color: "#0b0c0c" }}>
                Constitutional Mandate & Purpose
              </h2>
              <p className="govuk-body-s govuk-!-margin-bottom-0" style={{ fontSize: "16px", color: "#111418", lineHeight: "1.5" }}>
                {ministry.mandate || "Official operational framework pending publication."}
              </p>
            </div>

            {/* LAYER 3: Strategic Pillars Grid Layout */}
            <div className="govuk-grid-row govuk-!-margin-bottom-8" style={{ marginTop: "24px", marginBottom: "32px" }}>
              <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "18px", fontWeight: 700, color: "#0b0c0c" }}>
                  Our Vision
                </h3>
                <p className="govuk-body-s" style={{ fontSize: "16px", color: "#262c2e", lineHeight: "1.5" }}>
                  {ministry.vision || "Not Stated"}
                </p>
              </div>
              <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "18px", fontWeight: 700, color: "#0b0c0c" }}>
                  Our Mission
                </h3>
                <p className="govuk-body-s" style={{ fontSize: "16px", color: "#262c2e", lineHeight: "1.5" }}>
                  {ministry.mission || "Not Stated"}
                </p>
              </div>
            </div>

            {/* LAYER 4: Public Service Delivery Charter */}
            {cms?.servicesCharter && (
              <div className="govuk-!-margin-bottom-8" style={{ borderTop: "2px solid #bfc1c3", paddingTop: "24px", marginBottom: "32px" }}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "26px", fontWeight: 700, color: "#0b0c0c" }}>
                  Ministry Citizen Service Charter
                </h2>
                <PortableText value={cms.servicesCharter} components={govukPortableTextComponents} />
              </div>
            )}
            {/* LAYER 5: Subordinate State Departments Roster */}
            <h2 className="govuk-heading-m govuk-!-margin-top-8 govuk-!-margin-bottom-3" style={{ fontSize: "26px", fontWeight: 700, color: "#0b0c0c" }}>
              State Departments
            </h2>
            <p className="govuk-body" style={{ fontSize: "17px", color: "#111418", lineHeight: "1.5", marginBottom: "24px" }}>
              Select a state department to view its localized directorates, parastatals, and direct public services:
            </p>

            {subDepartments.length === 0 ? (
              <p className="govuk-body" style={{ fontSize: "17px", color: "#3b4246", fontStyle: "italic" }}>
                No active sub-departments listed under this administrative unit.
              </p>
            ) : (
              <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-8" style={{ margin: 0, padding: 0 }}>
                {subDepartments.map((dept) => (
                  <li key={dept.slug} className="govuk-!-margin-bottom-6" style={{ listStyleType: "none" }}>
                    <Link 
                      href={`/government/${ministry.slug}/${dept.slug}`} 
                      className="govuk-link govuk-link--no-underline"
                      style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}
                    >
                      {dept.name}
                    </Link>
                    {dept.description && (
                      <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
                        {dept.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* LAYER 6: Governing Statutory Legislation */}
            {cms?.governingActs && cms.governingActs.length > 0 && (
              <div 
                className="govuk-!-margin-top-8 govuk-!-margin-bottom-8" 
                style={{ border: "2px solid #bfc1c3", padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "4px", marginTop: "32px", marginBottom: "32px" }}
              >
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "19px", fontWeight: 700, color: "#0b0c0c" }}>
                  Enabling Legislative Framework
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-4" style={{ fontSize: "16px", color: "#3b4246", lineHeight: "1.5" }}>
                  This ministry operates under and enforces the following active Acts of Parliament:
                </p>
                <ul className="govuk-list govuk-!-margin-bottom-0" style={{ margin: 0, padding: 0 }}>
                  {cms.governingActs.map((act, idx) => (
                    <li key={idx} className="govuk-body-s" style={{ listStyleType: "none", paddingBottom: idx === cms.governingActs!.length - 1 ? 0 : "12px" }}>
                      <Link 
                        href={`/parliament/acts/${act.slug}`} 
                        className="govuk-link"
                        style={{ fontWeight: 700, fontSize: "16px", textDecoration: "underline", color: "#1d70b8" }}
                      >
                        {act.shortTitle}
                      </Link> 
                      <span style={{ fontSize: "16px", color: "#111418" }}> — {act.citation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </>
  );
}
