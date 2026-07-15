/**
 * Curated high-demand citizen tasks (not only CMS popularity weights).
 * Prefer internal topic/service hubs; external apply only via eCitizen guide.
 */

export type PopularService = {
  title: string;
  description: string;
  href: string;
  topicHref?: string;
};

export const popularServices: PopularService[] = [
  {
    title: "National ID and civil registration",
    description: "Birth and death certificates, national identity card and related records.",
    href: "/topics/identity-civil-registration",
    topicHref: "/topics/identity-civil-registration",
  },
  {
    title: "Passport and travel documents",
    description: "Apply for or renew a Kenyan passport and related travel processes.",
    href: "/topics/passports-travel",
  },
  {
    title: "Police clearance certificate",
    description: "Certificate of good conduct for work, study or travel.",
    href: "/topics/identity-civil-registration",
  },
  {
    title: "Driving licence and vehicle transfer",
    description: "Provisional licence, smart DL, renewals and change of ownership.",
    href: "/topics/driving-transport",
  },
  {
    title: "KRA PIN and tax returns",
    description: "Tax registration, iTax filing and compliance basics.",
    href: "/topics/money-tax",
  },
  {
    title: "Business name or company",
    description: "Register a business and understand county permits.",
    href: "/topics/business",
  },
  {
    title: "Land and property search",
    description: "Title searches, rates and property-related public processes.",
    href: "/topics/land-property",
  },
  {
    title: "eCitizen account and online services",
    description: "How Kenya’s main services portal works and how to use it safely.",
    href: "/ecitizen",
  },
  {
    title: "Voter registration",
    description: "Register, transfer or check voter details with the IEBC.",
    href: "/elections/voter-registration",
  },
  {
    title: "Find your representatives",
    description: "MP, senator, governor, woman representative and MCA.",
    href: "/find-your-representatives",
  },
];
