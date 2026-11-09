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

export type ReferralTemplateData = {
  heroIntro?: string;
  patientNotice?: string;
  services?: (string | ReferralService)[];
  departments?: string[];
  emergency?: string;
  visiting?: string;
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
