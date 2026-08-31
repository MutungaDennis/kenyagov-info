/** Default service glossary phrases for admin seed. */
export type SeedServiceLinkPhrase = {
  phrase: string;
  matchMode: "caseInsensitive" | "exact";
  internalHref?: string;
  externalHref?: string;
  externalLabel?: string;
  sortOrder: number;
  enabled: boolean;
};

export const SEED_SERVICE_LINK_PHRASES: SeedServiceLinkPhrase[] = [
  {
    phrase: "eCitizen",
    matchMode: "caseInsensitive",
    internalHref: "/ecitizen",
    externalHref: "https://accounts.ecitizen.go.ke/",
    externalLabel: "eCitizen",
    sortOrder: 10,
    enabled: true,
  },
  {
    phrase: "Huduma Centre",
    matchMode: "caseInsensitive",
    internalHref: "/services",
    sortOrder: 20,
    enabled: true,
  },
  {
    phrase: "Huduma Centres",
    matchMode: "caseInsensitive",
    internalHref: "/services",
    sortOrder: 21,
    enabled: true,
  },
  {
    phrase: "Kenya Revenue Authority",
    matchMode: "caseInsensitive",
    internalHref: "/government/institutions",
    externalHref: "https://www.kra.go.ke/",
    externalLabel: "KRA",
    sortOrder: 30,
    enabled: true,
  },
  {
    phrase: "National Identity Card",
    matchMode: "caseInsensitive",
    internalHref: "/services",
    sortOrder: 40,
    enabled: true,
  },
];
