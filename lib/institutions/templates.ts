export type TemplateField = { key: string; label: string; description: string; kind: "text" | "list" };

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
    key: "healthcare-referral-hospital",
    name: "Kenya referral hospital",
    summary: "A patient-first hospital profile for finding care, services and practical visit information.",
    audience: "National referral and teaching hospitals",
    sections: ["How to get care", "Services", "Departments and clinics", "Emergency care", "Visiting patients", "Payment and insurance", "Common questions", "Contact"],
    fields: [
      { key: "heroIntro", label: "Intro for patients", description: "One short sentence explaining how this hospital helps patients.", kind: "text" },
      { key: "mandate", label: "Short mandate", description: "One or two sentences about the hospital's role.", kind: "text" },
      { key: "emergencyMain", label: "Emergency / A&E number", description: "The number shown at the top of every hospital page.", kind: "text" },
      { key: "referralLine", label: "Referral line", description: "The number for referrals and appointments.", kind: "text" },
      { key: "ambulance", label: "National ambulance number", description: "Usually 922.", kind: "text" },
      { key: "mapUrl", label: "Google Maps link", description: "Paste the Google Maps share link for this facility. It appears as an accessible Open map action.", kind: "text" },
      { key: "quickLinks", label: "Additional links", description: "Use the format Link label | /path, one per line.", kind: "list" },
      { key: "patientNotice", label: "Before you visit", description: "Referral letters, appointment or registration instructions.", kind: "text" },
      { key: "services", label: "Services and clinics", description: "One service per line. For richer pages use: Name | description | category | referral needed | clinic days | location | how to access | first visit | emergency note | detail 1; detail 2.", kind: "list" },
      { key: "departments", label: "Departments and clinics", description: "One department or clinic per line.", kind: "list" },
      { key: "emergency", label: "Emergency care", description: "Where to go and what to do in an emergency.", kind: "text" },
      { key: "visiting", label: "Visiting patients", description: "Visiting hours and visitor guidance.", kind: "text" },
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
      { key: "heroIntro", label: "Intro for patients", description: "A short description of the care available.", kind: "text" },
      { key: "services", label: "Services", description: "One service per line.", kind: "list" },
      { key: "patientNotice", label: "Before you visit", description: "Appointment, referral or registration guidance.", kind: "text" },
    ],
  },
];

export function getInstitutionTemplate(key?: string | null) {
  return INSTITUTION_TEMPLATES.find((template) => template.key === key) || INSTITUTION_TEMPLATES[0];
}
