// components/views/MissionsDirectoryView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";

interface MissionItem {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  description?: string;
  diplomatic_extensions?: {
    mission_direction: "Outbound" | "Inbound";
    diplomatic_plate_code?: number;
  };
}

interface DirectoryProps {
  items: MissionItem[];
  parentName: string;
  category: string;
  segments: string[];
  cms?: any; // 👈 Appended to handle the combined function mapping safely
}

export default function MissionsDirectoryView({ items, parentName, category, segments, cms }: DirectoryProps) {
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound">("outbound");
  const breadcrumbItems = generateBreadcrumbs(segments, "Diplomatic Missions");

  // Filter items using your schema columns mapping direction rules
  const outboundMissions = items.filter(i => i.diplomatic_extensions?.mission_direction === "Outbound");
  const inboundMissions = items.filter(i => i.diplomatic_extensions?.mission_direction === "Inbound");

  // Construct dynamic path roots avoiding route bleeding
  const parentPath = `/government/${segments.slice(0, segments.length - 1).join("/")}`;

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-l">{parentName}</span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">Diplomatic Missions Directory</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Comprehensive registry managing Kenya's sovereign external offices alongside bilateral international representation hosted within Nairobi.
            </p>

            {/* GOV.UK Styled Tab Block Primitives */}
            <div className="govuk-tabs" data-module="govuk-tabs">
              <ul className="govuk-tabs__list">
                <li className={`govuk-tabs__list-item ${activeTab === "outbound" ? "govuk-tabs__list-item--selected" : ""}`}>
                  <button 
                    onClick={() => setActiveTab("outbound")} 
                    className="govuk-tabs__tab govuk-link" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    Kenya's Missions Abroad ({outboundMissions.length})
                  </button>
                </li>
                <li className={`govuk-tabs__list-item ${activeTab === "inbound" ? "govuk-tabs__list-item--selected" : ""}`}>
                  <button 
                    onClick={() => setActiveTab("inbound")} 
                    className="govuk-tabs__tab govuk-link" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    Foreign Presence in Kenya ({inboundMissions.length})
                  </button>
                </li>
              </ul>

              <div className="govuk-tabs__panel">
                {activeTab === "outbound" ? (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Embassies & High Commissions</h2>
                    <ul className="govuk-list govuk-list--spaced">
                      {outboundMissions.length === 0 ? (
                        <p className="govuk-body govuk-text-secondary">No outbound missions recorded for this sector.</p>
                      ) : (
                        outboundMissions.map(m => (
                          <li key={m.id} className="govuk-!-padding-bottom-2 govuk-!-border-bottom-1">
                            <Link href={`${parentPath}/${m.slug}`} className="govuk-link govuk-!-font-weight-bold">
                              {m.name}
                            </Link>
                            <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">
                              Contact: {m.email || "No direct email listed"} | {m.phone || "No direct phone line"}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                  </>
                ) : (
                  <>
                    <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Resident Foreign Diplomatic Corps</h2>
                    <ul className="govuk-list govuk-list--spaced">
                      {inboundMissions.length === 0 ? (
                        <p className="govuk-body govuk-text-secondary">No hosted foreign representations recorded for this sector.</p>
                      ) : (
                        inboundMissions.map(m => (
                          <li key={m.id} className="govuk-!-padding-bottom-2 govuk-!-border-bottom-1">
                            <div className="govuk-!-display-flex govuk-!-justify-content-space-between govuk-!-align-items-center">
                              <Link href={`${parentPath}/${m.slug}`} className="govuk-link govuk-!-font-weight-bold">
                                {m.name}
                              </Link>
                              {/* {m.diplomatic_extensions?.diplomatic_plate_code && (
                                <strong className="govuk-tag govuk-tag--grey">
                                  {m.diplomatic_extensions.diplomatic_plate_code} CD
                                </strong>
                              )} */}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
