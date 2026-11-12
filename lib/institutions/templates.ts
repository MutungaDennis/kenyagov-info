export type TemplateField = { key: string; label: string; description: string; kind: "text" | "list" | "schedule" | "collection" };

export type InstitutionTemplate = {
  key: string;
  name: string;
  summary: string;
  audience: string;
  sections: string[];
  fields: TemplateField[];
};

export const INSTITUTION_TEMPLATES: InstitutionTemplate[] = [
  {
    key: "default",
    name: "Default institution profile",
    summary: "The standard GOV.UK-inspired public institution profile.",
    audience: "Government institutions and temporary bodies",
    sections: ["Overview", "Mandate", "People", "Documents", "Relationships"],
    fields: [],
  },
  {
    key: "healthcare",
    name: "Healthcare facility",
    summary: "The Healthcare main category with six level-of-care subcategories for Kenya.",
    audience: "Community units, dispensaries, health centres, sub-county, county referral and national referral facilities",
    sections: ["Manage your care and visits", "Services", "Featured", "More information and advice", "Opening hours", "Contact", "Referral guidance"],
    fields: [
      { key: "heroIntro", label: "Intro for patients", description: "One short, factual sentence describing the facility and its services. Avoid writing as though this independent information site provides care.", kind: "text" },
      { key: "aboutOverview", label: "About page overview", description: "Add the fuller description of this hospital or facility shown on its About page: its role, history, responsibilities and relationship to the health system.", kind: "text" },
      { key: "careVisitsTitle", label: "Care and visits section heading", description: "Heading shown above links that help visitors manage care and visits.", kind: "text" },
      { key: "careVisits", label: "Manage your care and visits links", description: "Add patient tasks with descriptions. Use the suggested links or enter a same-site path or external http(s) URL for each item.", kind: "collection" },
      { key: "servicesTitle", label: "Services section heading", description: "Heading shown above featured service links.", kind: "text" },
      { key: "serviceLinks", label: "Featured service links", description: "Add service links for the homepage. Destinations can be internal paths or external http(s) URLs; blank destinations open the full service directory.", kind: "collection" },
      { key: "featuredTitle", label: "Featured section heading", description: "Heading shown above featured information cards.", kind: "text" },
      { key: "featured", label: "Featured information", description: "Add featured cards with titles, descriptions, and optional internal paths or external http(s) URLs for further reading.", kind: "collection" },
      { key: "moreInformationTitle", label: "More information section heading", description: "Heading shown above additional information and advice.", kind: "text" },
      { key: "moreInformation", label: "More information and advice", description: "Add guidance with a short description and optional internal path or external http(s) URL.", kind: "collection" },
      { key: "footerColumns", label: "Healthcare footer link groups", description: "Add footer groups with a heading, link label, and destination. Add one entry per link; repeat a group heading to show several links together.", kind: "collection" },
      { key: "mandate", label: "Primary mandate", description: "What this level of care is designed to provide.", kind: "text" },
      { key: "services", label: "Services", description: "One service per line. Add a description after a pipe, for example: Immunisation | Childhood vaccines and routine immunisation.", kind: "list" },
      { key: "patientNotice", label: "Before you visit", description: "What a patient should bring or know before attending.", kind: "text" },
      { key: "visitingHours", label: "Visiting schedule", description: "Add each day or day group and its visiting times. You can also add a note for a period.", kind: "schedule" },
      { key: "visitingInstructions", label: "Visiting instructions", description: "Add one instruction per line, such as visitor limits, check-in steps or ward-specific guidance.", kind: "list" },
      { key: "visiting", label: "Additional visiting information", description: "Optional general guidance for visitors. Existing free-text guidance remains supported.", kind: "text" },
      { key: "referralGuidance", label: "Referral guidance", description: "When patients should be referred to a higher or lower level.", kind: "text" },
      { key: "referralLine", label: "Referral lines", description: "Add one number per line, or separate multiple numbers with semicolons.", kind: "list" },
      { key: "relatedFacilities", label: "Related facilities", description: "Search for facilities already in the database and add them as nearby or higher-level care options.", kind: "list" },
    ],
  },
  {
    key: "healthcare-referral-hospital",
    name: "Kenya referral hospital",
    summary: "A patient-first hospital profile for finding care, services and practical visit information.",
    audience: "National referral and teaching hospitals",
    sections: ["Manage your care and visits", "Services", "Featured", "More information and advice", "Departments and clinics", "Emergency care", "Visiting patients", "Payment and insurance", "Common questions", "Contact"],
    fields: [
      { key: "heroIntro", label: "Intro for patients", description: "One short, factual sentence about the hospital. Avoid writing as though this independent information site provides care.", kind: "text" },
      { key: "aboutOverview", label: "About page overview", description: "Add the fuller description shown on the About page: the hospital's role, history, responsibilities and place in Kenya's health system.", kind: "text" },
      { key: "careVisitsTitle", label: "Care and visits section heading", description: "Heading shown above links that help visitors manage care and visits.", kind: "text" },
      { key: "careVisits", label: "Manage your care and visits links", description: "Add patient tasks with descriptions. Use the suggested links or enter a same-site path or external http(s) URL for each item.", kind: "collection" },
      { key: "servicesTitle", label: "Services section heading", description: "Heading shown above featured service links.", kind: "text" },
      { key: "serviceLinks", label: "Featured service links", description: "Add service links for the homepage. Destinations can be internal paths or external http(s) URLs; blank destinations open the full service directory.", kind: "collection" },
      { key: "featuredTitle", label: "Featured section heading", description: "Heading shown above featured information cards.", kind: "text" },
      { key: "featured", label: "Featured information", description: "Add featured cards with titles, descriptions, and optional internal paths or external http(s) URLs for further reading.", kind: "collection" },
      { key: "moreInformationTitle", label: "More information section heading", description: "Heading shown above additional information and advice.", kind: "text" },
      { key: "moreInformation", label: "More information and advice", description: "Add guidance with a short description and optional internal path or external http(s) URL.", kind: "collection" },
      { key: "footerColumns", label: "Healthcare footer link groups", description: "Add footer groups with a heading, link label, and destination. Add one entry per link; repeat a group heading to show several links together.", kind: "collection" },
      { key: "mandate", label: "Short mandate", description: "One or two sentences about the hospital's role.", kind: "text" },
      { key: "emergencyMain", label: "Emergency / A&E number", description: "The number shown at the top of every hospital page.", kind: "text" },
      { key: "referralLine", label: "Referral lines", description: "Add one number per line, or separate multiple numbers with semicolons.", kind: "list" },
      { key: "ambulance", label: "National ambulance number", description: "Usually 922.", kind: "text" },
      { key: "quickLinks", label: "Additional links", description: "Use the format Link label | /path, one per line.", kind: "list" },
      { key: "patientNotice", label: "Before you visit", description: "Referral letters, appointment or registration instructions.", kind: "text" },
      { key: "services", label: "Services and clinics", description: "One service per line. For richer pages use: Name | description | category | referral needed | clinic days | location | how to access | first visit | emergency note | detail 1; detail 2.", kind: "list" },
      { key: "departments", label: "Departments and clinics", description: "One department or clinic per line.", kind: "list" },
      { key: "emergency", label: "Emergency care", description: "Where to go and what to do in an emergency.", kind: "text" },
      { key: "visitingHours", label: "Visiting schedule", description: "Add each day or day group and its visiting times. You can also add a note for a period.", kind: "schedule" },
      { key: "visitingInstructions", label: "Visiting instructions", description: "Add one instruction per line, such as visitor limits, check-in steps or ward-specific guidance.", kind: "list" },
      { key: "visiting", label: "Additional visiting information", description: "Optional general guidance for visitors. Existing free-text guidance remains supported.", kind: "text" },
      { key: "insurance", label: "Payment and insurance", description: "SHA, insurance and payment information.", kind: "text" },
      { key: "faqs", label: "Common questions", description: "Add questions and answers when patients need extra guidance.", kind: "list" },
    ],
  },
  {
    key: "healthcare-facility",
    name: "Healthcare facility",
    summary: "A lighter patient-facing profile for other hospitals and healthcare facilities.",
    audience: "County, sub-county and specialist facilities",
    sections: ["Services", "Opening hours", "How to get care", "Contact"],
    fields: [
      { key: "heroIntro", label: "Intro for patients", description: "A short, factual sentence about this facility. Avoid writing as though this independent information site provides care.", kind: "text" },
      { key: "aboutOverview", label: "About page overview", description: "Add the fuller description shown on the About page, including this facility's role, responsibilities and place in the health system.", kind: "text" },
      { key: "careVisitsTitle", label: "Care and visits section heading", description: "Heading shown above links that help visitors manage care and visits.", kind: "text" },
      { key: "careVisits", label: "Manage your care and visits links", description: "Add patient tasks with descriptions and internal paths or external http(s) URLs.", kind: "collection" },
      { key: "servicesTitle", label: "Services section heading", description: "Heading shown above featured service links.", kind: "text" },
      { key: "serviceLinks", label: "Featured service links", description: "Add service links for the homepage. Destinations can be internal paths or external http(s) URLs; blank destinations open the full service directory.", kind: "collection" },
      { key: "featuredTitle", label: "Featured section heading", description: "Heading shown above featured information cards.", kind: "text" },
      { key: "featured", label: "Featured information", description: "Add featured cards with titles, descriptions, and optional internal paths or external http(s) URLs for further reading.", kind: "collection" },
      { key: "moreInformationTitle", label: "More information section heading", description: "Heading shown above additional information and advice.", kind: "text" },
      { key: "moreInformation", label: "More information and advice", description: "Add guidance with a short description and optional internal path or external http(s) URL.", kind: "collection" },
      { key: "footerColumns", label: "Healthcare footer link groups", description: "Add footer groups with a heading, link label, and destination. Repeat a group heading to show several links together.", kind: "collection" },
      { key: "emergencyMain", label: "Emergency / A&E number", description: "The emergency number shown near the top of the profile.", kind: "text" },
      { key: "referralLine", label: "Referral lines", description: "Add one number per line, or separate multiple numbers with semicolons.", kind: "list" },
      { key: "services", label: "Services", description: "One service per line.", kind: "list" },
      { key: "patientNotice", label: "Before you visit", description: "Appointment, referral or registration guidance.", kind: "text" },
    ],
  },
];

export function getInstitutionTemplate(key?: string | null) {
  return INSTITUTION_TEMPLATES.find((template) => template.key === key) || INSTITUTION_TEMPLATES[0];
}
