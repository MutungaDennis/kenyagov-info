// --- NEW TYPES FOR GOV.UK ENHANCEMENTS ---
export type CriticalBlocker = { title: string; message: string };
export type WarningCallout = { title: string; message: string };
export type EdgeCaseScenario = { scenario: string; guidance: string };
export type FeeItem = { itemName: string; amount: string; condition?: string };

export type ServiceFormState = {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  bodyText: string;
  originalBodyText?: string;
  bodyBlocks?: unknown[];
  status: "published" | "draft";
  reviewedAt: string;
  moreInformationUrl: string;
  copyrightNotice: string;
  licenseUrl: string;
  sourceLinks: Array<{ label: string; href: string }>;
  pathwayQuestion: string;
  pathways: Array<{ title: string; summary: string; details: string; portalUrl: string }>;
  countyRequirements: Array<{ county: string; requirements: string; sourceUrl: string }>;
  popularityWeight: number;
  servicePriority: number;
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
  
  // UPDATED: Fees table now includes an optional 'condition' field
  feesTable: FeeItem[]; 
  
  physicalVisits: Array<{ purpose: string; locations: string }>;
  downloadableResources: Array<{ label: string; sourceUrl: string; fileUrl?: string; fileSize?: number }>;
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
  subSubTopicHeading: string;

  // --- NEW GOV.UK FIELDS ---
  criticalBlockers: CriticalBlocker[];
  warnings: WarningCallout[];
  edgeCases: EdgeCaseScenario[];
  internationalUseGuidance: string;
  gazetteReference: string;
};

export type MinistryOption = { _id: string; name: string; slug?: string };
export type CategoryOption = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  priority?: number;
  subTopics?: Array<{ heading?: string; slug?: string; description?: string; parentHeading?: string; parentSlug?: string; priority?: number; serviceIds?: string[] }>;
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
    copyrightNotice: "",
    licenseUrl: "",
    sourceLinks: [],
    pathwayQuestion: "",
    pathways: [],
    countyRequirements: [],
    popularityWeight: 0,
    servicePriority: 0,
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
    subSubTopicHeading: "",
    // New fields defaults
    criticalBlockers: [],
    warnings: [],
    edgeCases: [],
    internationalUseGuidance: "",
    gazetteReference: "",
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
  
  // Use 'any' casting here to safely check for both snake_case (from DB) and camelCase (if normalized by API)
  const d = data as any;

  return {
    ...base,
    _id: d._id ? String(d._id) : undefined,
    title: String(d.title || ""),
    slug: String(d.slug?.current || d.slug || ""),
    summary: String(d.summary || ""),
    bodyText: blocksToPlainText(d.body),
    originalBodyText: blocksToPlainText(d.body),
    bodyBlocks: Array.isArray(d.body) ? d.body : undefined,
    status: d.status === "draft" ? "draft" : "published",
    reviewedAt: d.reviewedAt ? String(d.reviewedAt).slice(0, 10) : "",
    moreInformationUrl: String(d.moreInformationUrl || ""),
    copyrightNotice: String(d.copyrightNotice || ""),
    licenseUrl: String(d.licenseUrl || ""),
    sourceLinks: Array.isArray(d.sourceLinks) ? (d.sourceLinks as ServiceFormState["sourceLinks"]) : [],
    pathwayQuestion: String(d.pathwayQuestion || ""),
    pathways: Array.isArray(d.pathways) ? (d.pathways as ServiceFormState["pathways"]) : [],
    countyRequirements: Array.isArray(d.countyRequirements) ? (d.countyRequirements as ServiceFormState["countyRequirements"]) : [],
    popularityWeight: Number(d.popularityWeight) || 0,
    servicePriority: Number(d.servicePriority) || 0,
    processingTime: String(d.processingTime || ""),
    baseCostLabel: String(d.baseCostLabel || ""),
    executionMode:
      d.executionMode === "hybrid" || d.executionMode === "manual"
        ? d.executionMode
        : "online",
    timelineGuidancePoints: linesToText(d.timelineGuidancePoints as string[]),
    beforeYouStart: linesToText(d.beforeYouStart as string[]),
    requiredDocuments: linesToText(d.requiredDocuments as string[]),
    steps: Array.isArray(d.steps) && d.steps.length
      ? (d.steps as ServiceFormState["steps"])
      : base.steps,
    feesTable: Array.isArray(d.fees_table || d.feesTable)
      ? (d.fees_table || d.feesTable) as ServiceFormState["feesTable"]
      : [],
    physicalVisits: Array.isArray(d.physicalVisits)
      ? (d.physicalVisits as ServiceFormState["physicalVisits"])
      : [],
    downloadableResources: Array.isArray(d.downloadableResources)
      ? (d.downloadableResources as ServiceFormState["downloadableResources"])
      : [],
    commonMistakes: Array.isArray(d.commonMistakes)
      ? (d.commonMistakes as ServiceFormState["commonMistakes"])
      : [],
    faqs: Array.isArray(d.faqs)
      ? (d.faqs as ServiceFormState["faqs"])
      : [],
    relatedLinks: Array.isArray(d.relatedLinks)
      ? (d.relatedLinks as ServiceFormState["relatedLinks"])
      : [],
    transactionPortals:
      Array.isArray(d.transactionPortals) && d.transactionPortals.length
        ? (d.transactionPortals as ServiceFormState["transactionPortals"])
        : base.transactionPortals,
    providingInstitutions: Array.isArray(d.providingInstitutions)
      ? (d.providingInstitutions as ServiceFormState["providingInstitutions"]).map(
          (p: any) => ({
            institutionId: String(p.institutionId || ""),
            name: String(p.name || ""),
            slug: p.slug ? String(p.slug) : undefined,
            shortName: p.shortName ? String(p.shortName) : undefined,
            parentName: p.parentName ? String(p.parentName) : undefined,
          }),
        )
      : [],
    providingBodyIds: Array.isArray(d.providingBodyIds)
      ? d.providingBodyIds.map(String)
      : [],
    relatedServiceIds: Array.isArray(d.relatedServiceIds)
      ? d.relatedServiceIds.map(String)
      : [],
    categoryId: Array.isArray(d.categoryIds) && d.categoryIds[0]
      ? String(d.categoryIds[0])
      : "",
    subTopicHeading: "General",
    subSubTopicHeading: "",
    
    // ✅ FOOLPROOF MAPPING: Checks for BOTH snake_case (DB) and camelCase (API)
    criticalBlockers: Array.isArray(d.criticalBlockers || d.critical_blockers) 
      ? (d.criticalBlockers || d.critical_blockers) 
      : [],
    warnings: Array.isArray(d.warnings) 
      ? d.warnings 
      : [],
    edgeCases: Array.isArray(d.edgeCases || d.edge_cases) 
      ? (d.edgeCases || d.edge_cases) 
      : [],
    internationalUseGuidance: String(d.internationalUseGuidance || d.international_use_guidance || ""),
    gazetteReference: String(d.gazetteReference || d.gazette_reference || ""),
  };
}

export function formToPayload(form: ServiceFormState) {
  return {
    _id: form._id,
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    body: form.bodyText === form.originalBodyText ? form.bodyBlocks : undefined,
    bodyParagraphs: form.bodyText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
    status: form.status,
    reviewedAt: form.reviewedAt || undefined,
    moreInformationUrl: form.moreInformationUrl || undefined,
    copyrightNotice: form.copyrightNotice || undefined,
    licenseUrl: form.licenseUrl || undefined,
    sourceLinks: form.sourceLinks,
    pathwayQuestion: form.pathwayQuestion.trim() || undefined,
    pathways: form.pathways,
    countyRequirements: form.countyRequirements,
    popularityWeight: form.popularityWeight,
    servicePriority: form.servicePriority,
    processingTime: form.processingTime,
    baseCostLabel: form.baseCostLabel,
    executionMode: form.executionMode,
    timelineGuidancePoints: textToLines(form.timelineGuidancePoints),
    beforeYouStart: textToLines(form.beforeYouStart),
    requiredDocuments: textToLines(form.requiredDocuments),
    steps: form.steps,
    fees_table: form.feesTable, // Updated to snake_case for Supabase
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
    subTopicHeading: form.subSubTopicHeading || form.subTopicHeading || "General",
    
    // Send new GOV.UK fields to Supabase in snake_case
    critical_blockers: form.criticalBlockers,
    warnings: form.warnings,
    edge_cases: form.edgeCases,
    international_use_guidance: form.internationalUseGuidance || undefined,
    gazette_reference: form.gazetteReference || undefined,
  };
}

/** Stable snapshot for dirty-checking the editor. */
export function formSnapshot(form: ServiceFormState): string {
  return JSON.stringify(formToPayload(form));
}
