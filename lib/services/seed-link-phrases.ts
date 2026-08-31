/** Default service glossary phrases for admin seed. */
export const SEED_SERVICE_LINK_PHRASES = [
  {
    phrase: "eCitizen",
    matchMode: "caseInsensitive" as const,
    internalHref: "/ecitizen",
    externalHref: "https://accounts.ecitizen.go.ke/",
    externalLabel: "eCitizen",
    sortOrder: 10,
    enabled: true,
  },
  {
    phrase: "Huduma Centre",
    matchMode: "caseInsensitive" as const,
    internalHref: "/services",
    sortOrder: 20,
    enabled: true,
  },
  {
    phrase: "Huduma Centres",
    matchMode: "caseInsensitive" as const,
    internalHref: "/services",
    sortOrder: 21,
    enabled: true,
  },
  {
    phrase: "Kenya Revenue Authority",
    matchMode: "caseInsensitive" as const,
    internalHref: "/government/institutions",
    externalHref: "https://www.kra.go.ke/",
    externalLabel: "KRA",
    sortOrder: 30,
    enabled: true,
  },
  {
    phrase: "National Identity Card",
    matchMode: "caseInsensitive" as const,
    internalHref: "/services",
    sortOrder: 40,
    enabled: true,
  },
];
