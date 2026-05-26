// components/views/IndividualMissionView.tsx (Part 1 of 3)
"use client";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import { PortableText } from "@portabletext/react"; 

// Custom GOV.UK typography layout overrides for Sanity's Portable Text blocks
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

// Universal utility mapping ISO country handles directly to clean Kenyan presentation records
const ISO_COUNTRY_MAP: Record<string, string> = {
  LY: "Libya",
  NE: "Niger",
  EH: "Saharawi Republic / Western Sahara",
  TN: "Tunisia",
  DZ: "Algeria",
  AU: "Australia",
  KE: "Kenya",
  NZ: "New Zealand",
  FJ: "Fiji",
  KI: "Kiribati",
  NR: "Nauru",
  PG: "Papua New Guinea",
  WS: "Samoa",
  TL: "Timor-Leste",
  VU: "Vanuatu",
  BE: "Belgium",
LU: "Luxembourg",
EU: "European Union",
BB: "Barbados",
  DO: "Dominican Republic",
  HT: "Haiti",
  GY: "Guyana",
  CU: "Cuba",
  JM: "Jamaica",
    AG: "Antigua and Barbuda",
    BS: "Bahamas",
    DM: "Dominica",
    GD: "Grenada",
    KN: "Saint Kitts and Nevis",
    LC: "Saint Lucia",
    VC: "Saint Vincent and the Grenadines",
      CF: "Central African Republic",
  CG: "Congo-Brazzaville",
  GA: "Gabon",
  CD: "Democratic Republic of the Congo",
  CI: "Côte d'Ivoire",
  DJ: "Djibouti",
  EG: "Egypt",
JO: "Jordan",
ER: "Eritrea",
SO: "Somalia",
FR: "France",
PT: "Portugal",
RS: "Serbia",
MC: "Monaco",
VA: "Holy See (Vatican City)",
DE: "Germany",
BG: "Bulgaria",
CZ: "Czech Republic",
PL: "Poland",
RO: "Romania",
GH: "Ghana",
BF: "Burkina Faso"



};

export interface IndividualMissionProps {
  mission: any;
  segments: string[];
  cms?: {
    contentType?: string;
    whatItDoes?: any[];
    servicesCharter?: any[];
    consularHoursDescription?: string;
    localPublicHolidays?: Array<{ name: string; dateObserved: string }>;
    coverBannerUrl?: string;
    downloadableDocuments?: Array<{ documentName: string; fileUrl: string }>;
    governingActs?: Array<{ shortTitle: string; citation: string; slug: string }>;
  } | null;
}
// components/views/IndividualMissionView.tsx (Part 2 of 3)
export default function IndividualMissionView({ mission, segments, cms }: IndividualMissionProps) {
  const breadcrumbItems = generateBreadcrumbs(segments, mission.name);
  const ext = mission.diplomatic_extensions;
  const currentLeaders = mission.institution_leaders || [];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbItems} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Context Caption Identifier */}
            <span className="govuk-caption-l">
              {ext?.mission_direction === "Outbound" ? "Kenya Mission Abroad" : "Hosted Foreign Mission"}
            </span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">{mission.name}</h1>
            
            {/* Multi-Personnel Leadership Registry Panel */}
            {currentLeaders.length > 0 && (
              <div className="govuk-!-margin-bottom-6" style={{ borderLeft: "4px solid #00703c", paddingLeft: "15px", backgroundColor: "#f3f4f5", padding: "12px" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Active Diplomatic Leadership</h3>
                {currentLeaders.map((leader: any, idx: number) => (
                  <div key={idx} className="govuk-!-margin-bottom-2">
                    <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-0">{leader.name}</p>
                    <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-0">{leader.title}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Core Operational Abstract / History Overview */}
            {cms?.whatItDoes ? (
              <div className="govuk-!-margin-bottom-6">
                <PortableText value={cms.whatItDoes} components={govukPortableTextComponents} />
              </div>
            ) : (
              <p className="govuk-body govuk-!-margin-bottom-4">
                {mission.description || "Official informational portal detailing operational configurations."}
              </p>
            )}

            {/* Structural Geographical & Multi-Box Addresses */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Location & Postal Address</h2>
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <strong>Physical Office Location:</strong> {mission.physical_address || "Not Listed"}<br />
              
              {/* Maps out dynamic P.O. Box arrays cleanly from your Supabase aliases schema */}
              {mission.aliases && mission.aliases.length > 0 && (
                <span className="govuk-!-margin-top-2" style={{ display: "block" }}>
                  <strong>Postal Delivery Channels:</strong>
                  <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                    {mission.aliases.map((box: string, i: number) => (
                      <li key={i} className="govuk-body-s">{box}</li>
                    ))}
                  </ul>
                </span>
              )}
            </div>

            {/* Detailed Digital and Technical Communications Directory */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Consular & Communications Matrix</h2>
            <table className="govuk-table govuk-!-margin-bottom-6">
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header" style={{ width: "35%" }}>Official Email</th>
                  <td className="govuk-table__cell">{mission.email || "Not available"}</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">Telephone Network</th>
                  <td className="govuk-table__cell" style={{ whiteSpace: "pre-line" }}>{mission.phone || "Not available"}</td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">External Website</th>
                  <td className="govuk-table__cell">
                    {mission.website_url ? (
                      <a href={mission.website_url} target="_blank" rel="noreferrer" className="govuk-link">
                        {mission.website_url}
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </td>
                </tr>
                {cms?.consularHoursDescription && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Consular Windows</th>
                    <td className="govuk-table__cell">{cms.consularHoursDescription}</td>
                  </tr>
                )}
                {/* Dynamically highlights wireless and secondary logs stored in the descriptions field */}
                {mission.description && mission.description.includes("Fax") && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Fax Parameters</th>
                    <td className="govuk-table__cell govuk-body-s">{mission.description}</td>
                  </tr>
                )}
                {ext?.diplomatic_plate_code && (
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Diplomatic Code</th>
                    <td className="govuk-table__cell">
                      <strong className="govuk-tag govuk-tag--grey">{ext.diplomatic_plate_code} CD</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Public Service Delivery Charter Layout (Sanity CMS Portable Text) */}
            {cms?.servicesCharter && (
              <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-6" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "20px" }}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Public Service Delivery Charter</h2>
                <PortableText value={cms.servicesCharter} components={govukPortableTextComponents} />
              </div>
            )}

            {/* Host Nation Local Closures Calendar Panel (Sanity CMS Array Objects) */}
            {cms?.localPublicHolidays && cms.localPublicHolidays.length > 0 && (
              <div className="govuk-!-margin-bottom-6" style={{ backgroundColor: "#f3f4f5", padding: "15px", borderLeft: "4px solid #b1b4b6" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Host Nation Local Holidays</h3>
                <p className="govuk-body-s govuk-text-secondary govuk-!-margin-bottom-2">
                  This administrative center is physically closed to the public on the following sovereign dates outside of standard Kenyan statutory public holidays:
                </p>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                  {cms.localPublicHolidays.map((holiday: any, idx: number) => (
                    <li key={idx} className="govuk-body-s">
                      <strong>{holiday.dateObserved}:</strong> {holiday.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Downloadable Content Attachments List Module */}
            {cms?.downloadableDocuments && cms.downloadableDocuments.length > 0 && (
              <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-8" style={{ border: "1px solid #b1b4b6", padding: "15px", backgroundColor: "#f3f4f5" }}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Downloadable Application Forms</h2>
                <p className="govuk-body-s govuk-!-margin-bottom-3">Print, complete, and compile these official paperwork briefs prior to scheduling validation windows:</p>
                <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-0">
                  {cms.downloadableDocuments.map((doc: any, idx: number) => (
                    <li key={idx}>
                      <a href={doc.fileUrl} className="govuk-link govuk-!-font-weight-bold" download target="_blank" rel="noreferrer">
                        Download {doc.documentName} (PDF document)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Multi-Country Structural Accreditation Network Matrix */}
            {ext?.diplomatic_accreditations && ext.diplomatic_accreditations.length > 0 && (
              <div style={{ backgroundColor: "#f0f4f8", padding: "15px", marginBottom: "30px", borderLeft: "4px solid #1d70b8" }}>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Territorial Jurisdictions & Accreditations</h3>
                <p className="govuk-body-s govuk-!-margin-bottom-2">
                  This strategic office extends dual bilateral diplomatic coverage over the following sovereign regions:
                </p>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                  {ext.diplomatic_accreditations.map((acc: any, idx: number) => {
                    const code = acc.accredited_country_iso_code;
                    const fullName = ISO_COUNTRY_MAP[code] || code;
                    return (
                      <li key={idx} className="govuk-body-s">
                        Sovereign coverage area: <strong>{fullName}</strong>
                      </li>
                    );
                  })}
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
