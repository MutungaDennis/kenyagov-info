export type ReferralService = {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  audience?: string;
  referralRequired?: string;
  clinicDays?: string;
  location?: string;
  access?: string;
  firstVisit?: string;
  emergencyNote?: string;
  details?: string[];
};

export type VisitingPeriod = {
  days: string;
  hours: string;
  note?: string;
};

export type HealthcareContentEntry = {
  title: string;
  description?: string;
  linkLabel?: string;
  href?: string;
};

export const DEFAULT_CARE_VISITS: HealthcareContentEntry[] = [
  {
    title: "Prepare for your visit",
    description: "Find out what to bring, how referral letters work, and how to check in for a clinic appointment.",
    href: "/government/institutions/{slug}/how-to-get-care#appointments",
  },
  {
    title: "Check visiting hours",
    description: "See daily visiting times, ward entry rules, and guidance for family and friends.",
    href: "/government/institutions/{slug}/patient-information#visiting",
  },
  {
    title: "Find emergency care",
    description: "Learn where to go in an emergency, ambulance numbers, and 24-hour walk-in rules.",
    href: "/government/institutions/{slug}/how-to-get-care#emergency",
  },
  {
    title: "Pay for care and insurance",
    description: "Check details on Social Health Authority (SHA) cover, M-Pesa, cash, and credit support.",
    href: "/government/institutions/{slug}/patient-information#billing",
  },
];

export type ReferralTemplateData = {
  heroIntro?: string;
  patientNotice?: string;
  services?: (string | ReferralService)[];
  departments?: string[];
  emergency?: string;
  visiting?: string;
  visitingHours?: VisitingPeriod[];
  visitingInstructions?: string[];
  insurance?: string;
  faqs?: { question: string; answer: string }[];
};

export function toService(value: string | ReferralService): ReferralService {
  if (typeof value !== "string") return value;
  const [name, description, category, referralRequired, clinicDays, location, access, firstVisit, emergencyNote, details] = value.split("|").map((part) => part.trim());
  return { name, description, category, referralRequired, clinicDays, location, access, firstVisit, emergencyNote, details: details ? details.split(";").map((item) => item.trim()).filter(Boolean) : undefined };
}

export function categorySlug(category: string) {
  return category.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function serviceSlug(service: ReferralService) {
  return (service.slug || service.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getServices(data: ReferralTemplateData | null | undefined) {
  return Array.isArray(data?.services) ? data.services.map(toService).filter((service) => service.name) : [];
}
