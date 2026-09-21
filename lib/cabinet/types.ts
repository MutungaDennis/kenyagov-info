export type CabinetBriefListItem = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string | null;
  publicationLabel: string;
  briefDate: string;
  venue: string | null;
  locality: string | null;
  summary: string | null;
  excerpt: string | null;
  topics: string[];
  wordCount: number | null;
  readingTimeMinutes: number | null;
  canonicalPath: string;
};

export type CabinetBriefSource = {
  id: string;
  sourceType: string;
  title: string | null;
  publisher: string | null;
  url: string;
  publishedAt: string | null;
  isPrimary: boolean;
  isOfficial: boolean;
  mimeType: string | null;
  notes: string | null;
};

export type CabinetBrief = CabinetBriefListItem & {
  originalTitle: string | null;
  meetingType: string | null;
  chairName: string | null;
  chairTitle: string | null;
  county: string | null;
  country: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  officialSourceUrl: string | null;
  sourcePublisher: string | null;
  sourceTitle: string | null;
  isOfficialSource: boolean;
  editorialNote: string | null;
  reviewStatus: string | null;
  sources: CabinetBriefSource[];
};

export type CabinetBriefFilters = {
  query?: string;
  label?: string;
  year?: number;
  page?: number;
  pageSize?: number;
};

export type CabinetBriefsResult = {
  items: CabinetBriefListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
