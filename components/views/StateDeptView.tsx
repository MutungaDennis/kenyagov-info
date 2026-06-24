// components/views/StateDeptView.tsx
"use client";

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import { PortableText } from "@portabletext/react"; // Handles Sanity's Rich Text

// Define custom GOV.UK typography layout overrides for Sanity's Portable Text blocks
const govukPortableTextComponents = {
  block: {
    normal: ({ children }: any) => <p className="govuk-body govuk-!-margin-bottom-4">{children}</p>,
    h2: ({ children }: any) => <h2 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="govuk-heading-s govuk-!-margin-top-3 govuk-!-margin-bottom-1">{children}</h3>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">{children}</ul>,
    number: ({ children }: any) => <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-4">{children}</ol>,
  },
};

interface StateDeptViewProps {
  department: any;
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

export default function StateDeptView({ department, segments, cms }: StateDeptViewProps) {
  const breadcrumbItems = generateBreadcrumbs(segments, department.name);
  const currentPath = `/government/${segments.join("/")}`;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Context Caption */}
            <span className="govuk-caption-l">State Department Hub</span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">{department.name}</h1>
            
            {/* LAYER 1: Core Description Block (Prioritizes Sanity, falls back to Supabase) */}
            {cms?.whatItDoes ? (
              <div className="govuk-!-margin-bottom-6">
                <PortableText value={cms.whatItDoes} components={govukPortableTextComponents} />
              </div>
            ) : (
              <p className="govuk-body govuk-!-margin-bottom-6">
                {department.description || department.mandate || "Administrative wing executing specialized portfolio policies."}
              </p>
            )}

            {/* LAYER 2: Public Service Delivery Charter (Sanity Rich Text Optional Addition) */}
            {cms?.servicesCharter && (
              <div className="govuk-!-margin-bottom-6 govuk-!-border-top-1 govuk-!-padding-top-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Departmental Service Charter</h2>
                <PortableText value={cms.servicesCharter} components={govukPortableTextComponents} />
              </div>
            )}

            {/* LAYER 3: Departmental Directories Links (Supabase Layout Directives) */}
            <h2 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-3">
              Departmental Directories & Portfolios
            </h2>
            <p className="govuk-body">Select a division to explore institutional registries, focal entities, and strategic services:</p>

            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-8">
              {/* Conditional Routing Interface tailored directly for MFA */}
              {department.slug === "foreign-affairs" ? (
                <li>
                  <Link href={`${currentPath}/missions`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                    Bilateral & Multilateral Missions Network
                  </Link>
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                    Access contact matrices, credentials records, and accreditation fields for outbound embassies and inbound foreign diplomatic corps.
                  </p>
                </li>
              ) : (
                /* Fallback default options for other administrative departments */
                <>
                  <li>
                    <Link href={`${currentPath}/directorates`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                      Internal Directorates & Task Divisions
                    </Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                      Review administrative wings managing policy design, technical operations, and sectoral research.
                    </p>
                  </li>
                  {department.is_regulator && (
                    <li>
                      <Link href={`${currentPath}/parastatals`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                        Regulated Corporations & Parastatals
                      </Link>
                      <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                        Explore standalone state agencies executing statutory enforcement powers under this docket.
                      </p>
                    </li>
                  )}
                </>
              )}
            </ul>

            {/* LAYER 4: Governing Statutory Legislation (Sanity References Bridge) */}
            {cms?.governingActs && cms.governingActs.length > 0 && (
              <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-8 govuk-inset-text govuk-!-background-grey">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Enabling Legislative Framework</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-3">This state department carries out its regulatory and operational mandates under:</p>
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
