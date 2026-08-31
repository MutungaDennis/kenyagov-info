export type ServiceFormState = {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  bodyText: string;
  status: "published" | "draft";
  reviewedAt: string;
  moreInformationUrl: string;
  popularityWeight: number;
  processingTime: string;
  baseCostLabel: string;
  executionMode: "online" | "hybrid" | "manual";
  timelineGuidancePoints: string;
  beforeYouStart: string;
  requiredDocuments: string;
  steps: Array<{
    stepNumber: number;
    stepTitle: string;
    stepDescription: string;
  }>;
  feesTable: Array<{ itemName: string; amount: string }>;
  physicalVisits: Array<{ purpose: string; locations: string }>;
  downloadableResources: Array<{ label: string; sourceUrl: string }>;
  commonMistakes: Array<{ errorTitle: string; errorFix: string }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ label: string; href: string }>;
  transactionPortals: Array<{ portalLabel: string; portalUrl: string }>;
  providingInstitutions: Array<{
    institutionId: string;
    name: string;
    slug?: string;
    shortName?: string;
    parentName?: string;
  }>;
  /** @deprecated legacy Sanity ministry refs — kept for migration only */
  providingBodyIds: string[];
  relatedServiceIds: string[];
  categoryId: string;
  subTopicHeading: string;
};

export type MinistryOption = { _id: string; name: string; slug?: string };
export type CategoryOption = {
  _id: string;
  title: string;
  slug?: string;
  subTopics?: Array<{ heading?: string; serviceIds?: string[] }>;
};
export type ServiceListRow = {
  _id: string;
  title?: string;
  slug?: string;
  executionMode?: string;
  popularityWeight?: number;
  status?: string;
  _updatedAt?: string;
  portalCount?: number;
  categoryIds?: string[];
  categoryTitles?: string[];
};

export function emptyServiceForm(): ServiceFormState {
  return {
    title: "",
    slug: "",
    summary: "",
    bodyText: "",
    status: "published",
    reviewedAt: "",
    moreInformationUrl: "",
    popularityWeight: 0,
    processingTime: "",
    baseCostLabel: "",
    executionMode: "online",
    timelineGuidancePoints: "",
    beforeYouStart: "",
    requiredDocuments: "",
    steps: [{ stepNumber: 1, stepTitle: "", stepDescription: "" }],
    feesTable: [],
    physicalVisits: [],
    downloadableResources: [],
    commonMistakes: [],
    faqs: [],
    relatedLinks: [],
    transactionPortals: [{ portalLabel: "Start on eCitizen", portalUrl: "" }],
    providingInstitutions: [],
    providingBodyIds: [],
    relatedServiceIds: [],
    categoryId: "",
    subTopicHeading: "General",
  };
}

export function linesToText(lines?: string[] | null): string {
  return (lines || []).join("\n");
}

export function textToLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function blocksToPlainText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const paras: string[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    const block = b as {
      _type?: string;
      children?: Array<{ text?: string }>;
    };
    if (block._type !== "block" || !Array.isArray(block.children)) continue;
    paras.push(block.children.map((c) => c.text || "").join(""));
  }
  return paras.filter(Boolean).join("\n\n");
}

export function detailToForm(data: Record<string, unknown>): ServiceFormState {
  const base = emptyServiceForm();
  return {
    ...base,
    _id: data._id ? String(data._id) : undefined,
    title: String(data.title || ""),
    slug: String(data.slug || ""),
    summary: String(data.summary || ""),
    bodyText: blocksToPlainText(data.body),
    status: data.status === "draft" ? "draft" : "published",
    reviewedAt: data.reviewedAt ? String(data.reviewedAt).slice(0, 10) : "",
    moreInformationUrl: String(data.moreInformationUrl || ""),
    popularityWeight: Number(data.popularityWeight) || 0,
    processingTime: String(data.processingTime || ""),
    baseCostLabel: String(data.baseCostLabel || ""),
    executionMode:
      data.executionMode === "hybrid" || data.executionMode === "manual"
        ? data.executionMode
        : "online",
    timelineGuidancePoints: linesToText(
      data.timelineGuidancePoints as string[],
    ),
    beforeYouStart: linesToText(data.beforeYouStart as string[]),
    requiredDocuments: linesToText(data.requiredDocuments as string[]),
    steps: Array.isArray(data.steps) && data.steps.length
      ? (data.steps as ServiceFormState["steps"])
      : base.steps,
    feesTable: Array.isArray(data.feesTable)
      ? (data.feesTable as ServiceFormState["feesTable"])
      : [],
    physicalVisits: Array.isArray(data.physicalVisits)
      ? (data.physicalVisits as ServiceFormState["physicalVisits"])
      : [],
    downloadableResources: Array.isArray(data.downloadableResources)
      ? (data.downloadableResources as ServiceFormState["downloadableResources"])
      : [],
    commonMistakes: Array.isArray(data.commonMistakes)
      ? (data.commonMistakes as ServiceFormState["commonMistakes"])
      : [],
    faqs: Array.isArray(data.faqs)
      ? (data.faqs as ServiceFormState["faqs"])
      : [],
    relatedLinks: Array.isArray(data.relatedLinks)
      ? (data.relatedLinks as ServiceFormState["relatedLinks"])
      : [],
    transactionPortals:
      Array.isArray(data.transactionPortals) && data.transactionPortals.length
        ? (data.transactionPortals as ServiceFormState["transactionPortals"])
        : base.transactionPortals,
    providingInstitutions: Array.isArray(data.providingInstitutions)
      ? (data.providingInstitutions as ServiceFormState["providingInstitutions"]).map(
          (p) => ({
            institutionId: String(p.institutionId || ""),
            name: String(p.name || ""),
            slug: p.slug ? String(p.slug) : undefined,
            shortName: p.shortName ? String(p.shortName) : undefined,
            parentName: p.parentName ? String(p.parentName) : undefined,
          }),
        )
      : [],
    providingBodyIds: Array.isArray(data.providingBodyIds)
      ? data.providingBodyIds.map(String)
      : [],
    relatedServiceIds: Array.isArray(data.relatedServiceIds)
      ? data.relatedServiceIds.map(String)
      : [],
    categoryId: Array.isArray(data.categoryIds) && data.categoryIds[0]
      ? String(data.categoryIds[0])
      : "",
    subTopicHeading: "General",
  };
}

export function formToPayload(form: ServiceFormState) {
  return {
    _id: form._id,
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    bodyParagraphs: form.bodyText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
    status: form.status,
    reviewedAt: form.reviewedAt || undefined,
    moreInformationUrl: form.moreInformationUrl || undefined,
    popularityWeight: form.popularityWeight,
    processingTime: form.processingTime,
    baseCostLabel: form.baseCostLabel,
    executionMode: form.executionMode,
    timelineGuidancePoints: textToLines(form.timelineGuidancePoints),
    beforeYouStart: textToLines(form.beforeYouStart),
    requiredDocuments: textToLines(form.requiredDocuments),
    steps: form.steps,
    feesTable: form.feesTable,
    physicalVisits: form.physicalVisits,
    downloadableResources: form.downloadableResources,
    commonMistakes: form.commonMistakes,
    faqs: form.faqs,
    relatedLinks: form.relatedLinks,
    transactionPortals: form.transactionPortals,
    providingInstitutions: form.providingInstitutions,
    providingBodyIds: form.providingBodyIds,
    relatedServiceIds: form.relatedServiceIds,
    categoryId: form.categoryId || undefined,
    subTopicHeading: form.subTopicHeading || "General",
  };
}

/** Stable snapshot for dirty-checking the editor. */
export function formSnapshot(form: ServiceFormState): string {
  return JSON.stringify(formToPayload(form));
}
