// components/views/MinistryHubView.tsx
"use client";

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import { PortableText } from "@portabletext/react"; // Handles Sanity's Rich Text

// Define custom GOV.UK typography layout overrides for Sanity's Portable Text blocks
const govukPortableTextComponents = {
  block: {
    normal: ({ children }: any) => <p className="govuk-body govuk-!-font-size-19 govuk-!-margin-bottom-4">{children}</p>,
    h2: ({ children }: any) => <h2 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="govuk-heading-s govuk-!-margin-top-3 govuk-!-margin-bottom-1">{children}</h3>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">{children}</ul>,
    number: ({ children }: any) => <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-4">{children}</ol>,
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
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Context Caption */}
            <span className="govuk-caption-l">{ministry.arm_of_government || "Executive Branch"}</span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">{ministry.name}</h1>
            
            {/* LAYER 1: Core Description Overview Block (Prioritizes Sanity, falls back to Supabase) */}
            {cms?.whatItDoes ? (
              <div className="govuk-!-margin-bottom-6">
                <PortableText value={cms.whatItDoes} components={govukPortableTextComponents} />
              </div>
            ) : (
              ministry.description && (
                <p className="govuk-body govuk-!-font-size-19 govuk-!-margin-bottom-6">
                  {ministry.description}
                </p>
              )
            )}

            {/* LAYER 2: Institutional Mandate Inset Panel (Supabase) */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-s govuk-!-margin-bottom-1">Constitutional Mandate & Purpose</h2>
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                {ministry.mandate || "Official operational framework pending publication."}
              </p>
            </div>

            {/* LAYER 3: Strategic Pillars (Supabase) */}
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Our Vision</h3>
                <p className="govuk-body-s">{ministry.vision || "Not Stated"}</p>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Our Mission</h3>
                <p className="govuk-body-s">{ministry.mission || "Not Stated"}</p>
              </div>
            </div>

            {/* LAYER 4: Public Service Delivery Charter (Sanity Rich Text Optional Addition) */}
            {cms?.servicesCharter && (
              <div className="govuk-!-margin-bottom-6" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "20px" }}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Ministry Citizen Service Charter</h2>
                <PortableText value={cms.servicesCharter} components={govukPortableTextComponents} />
              </div>
            )}

            {/* LAYER 5: Subordinate State Departments Roster (Supabase) */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">State Departments</h2>
            <p className="govuk-body">Select a state department to view its localized directorates, parastatals, and direct public services:</p>

            {subDepartments.length === 0 ? (
              <p className="govuk-body govuk-text-secondary">No active sub-departments listed under this administrative unit.</p>
            ) : (
              <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-8">
                {subDepartments.map((dept) => (
                  <li key={dept.slug} className="govuk-!-margin-bottom-4">
                    <Link 
                      href={`/government/${ministry.slug}/${dept.slug}`} 
                      className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19"
                    >
                      {dept.name}
                    </Link>
                    {dept.description && (
                      <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                        {dept.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* LAYER 6: Governing Statutory Legislation (Sanity References Bridge) */}
            {cms?.governingActs && cms.governingActs.length > 0 && (
              <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-8" style={{ border: "1px solid #b1b4b6", padding: "15px", backgroundColor: "#f3f4f5" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Enabling Legislative Framework</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-3">This ministry operates under and enforces the following active Acts of Parliament:</p>
                <ul className="govuk-list govuk-!-margin-bottom-0">
                  {cms.governingActs.map((act, idx) => (
                    <li key={idx} className="govuk-body-s">
                      <Link href={`/parliament/acts/${act.slug}`} className="govuk-link govuk-!-font-weight-bold">
                        {act.shortTitle}
                      </Link> — {act.citation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}