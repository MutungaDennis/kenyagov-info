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
      <p className="govuk-body govuk-!-margin-bottom-4 govuk-!-font-size-18 govuk-!-text-colour-primary">
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-4">
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
            <span className="govuk-caption-l govuk-!-font-size-19 govuk-!-text-colour-secondary govuk-!-font-weight-bold">
              {ministry.arm_of_government || "Executive arm of Government"}
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">
              {ministry.name}
            </h1>
            
            {/* LAYER 1: Core Description Overview Block */}
            {cms?.whatItDoes ? (
              <div className="govuk-!-margin-bottom-6">
                <PortableText value={cms.whatItDoes} components={govukPortableTextComponents} />
              </div>
            ) : (
              ministry.description && (
                <p className="govuk-body govuk-!-margin-bottom-6">
                  {ministry.description}
                </p>
              )
            )}
            {/* LAYER 2: Institutional Mandate Inset Panel */}
            <div 
              className="govuk-inset-text govuk-!-border-color-green govuk-!-padding-left-4 govuk-!-margin-top-4 govuk-!-margin-bottom-4"
            >
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
                Constitutional Mandate & Purpose
              </h2>
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                {ministry.mandate || "Official operational framework pending publication."}
              </p>
            </div>

            {/* LAYER 3: Strategic Pillars Grid Layout */}
            <div className="govuk-grid-row govuk-!-margin-bottom-8 govuk-!-margin-top-4">
              <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                  Our Vision
                </h3>
                <p className="govuk-body-s">
                  {ministry.vision || "Not Stated"}
                </p>
              </div>
              <div className="govuk-grid-column-one-half-from-desktop govuk-grid-column-full">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                  Our Mission
                </h3>
                <p className="govuk-body-s">
                  {ministry.mission || "Not Stated"}
                </p>
              </div>
            </div>

            {/* LAYER 4: Public Service Delivery Charter */}
            {cms?.servicesCharter && (
              <div className="govuk-!-margin-bottom-8 govuk-!-border-top-2 govuk-!-padding-top-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
                  Ministry Citizen Service Charter
                </h2>
                <PortableText value={cms.servicesCharter} components={govukPortableTextComponents} />
              </div>
            )}
            {/* LAYER 5: Subordinate State Departments Roster */}
            <h2 className="govuk-heading-m govuk-!-margin-top-8 govuk-!-margin-bottom-3">
              State Departments
            </h2>
            <p className="govuk-body">
              Select a state department to view its localized directorates, parastatals, and direct public services:
            </p>

            {subDepartments.length === 0 ? (
              <p className="govuk-body govuk-!-text-colour-secondary govuk-!-font-style-italic">
                No active sub-departments listed under this administrative unit.
              </p>
            ) : (
              <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-8 govuk-!-margin-0 govuk-!-padding-0">
                {subDepartments.map((dept) => (
                  <li key={dept.slug} className="govuk-!-margin-bottom-6">
                    <Link 
                      href={`/government/${ministry.slug}/${dept.slug}`} 
                      className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold"
                    >
                      {dept.name}
                    </Link>
                    {dept.description && (
                      <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">
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
                className="govuk-!-margin-top-8 govuk-!-margin-bottom-8 govuk-!-border-2 govuk-!-padding-4 govuk-!-background-grey govuk-!-margin-top-6 govuk-!-margin-bottom-6"
              >
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                  Enabling Legislative Framework
                </h3>
                <p className="govuk-body-s govuk-!-margin-bottom-4">
                  This ministry operates under and enforces the following active Acts of Parliament:
                </p>
                <ul className="govuk-list govuk-!-margin-bottom-0 govuk-!-margin-0 govuk-!-padding-0">
                  {cms.governingActs.map((act, idx) => (
                    <li key={idx} className="govuk-body-s">
                      <Link 
                        href={`/parliament/acts/${act.slug}`} 
                        className="govuk-link govuk-!-font-weight-bold" 
                      >
                        {act.shortTitle}
                      </Link> 
                      <span> — {act.citation}</span>
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
