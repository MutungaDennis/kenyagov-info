import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import { getContent, listContent } from "@/lib/content/store";

// --- NEW GOV.UK TYPES ---
export type CriticalBlocker = { title: string; message: string };
export type WarningCallout = { title: string; message: string };
export type EdgeCaseScenario = { scenario: string; guidance: string };
export type FeeItem = { itemName: string; amount: string; condition?: string };

export type ServiceView = {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  _createdAt?: string; // ✅ ADDED to fix TypeScript build error
  _updatedAt?: string; // ✅ ADDED to fix TypeScript build error
  bodyText?: string;
  body?: unknown;
  providingInstitutions?: Array<{
    institutionId?: string;
    name: string;
    slug?: string;
    shortName?: string;
    parentName?: string;
  }>;
  executionMode: "online" | "hybrid" | "manual";
  processingTime?: string;
  baseCostLabel?: string;
  beforeYouStart?: string[];
  requiredDocuments?: string[];
  steps: { stepNumber: number; stepTitle: string; stepDescription: string }[];
  feesTable?: FeeItem[];
  physicalVisits?: { purpose: string; locations: string }[];
  commonMistakes?: { errorTitle: string; errorFix: string }[];
  faqs?: { question: string; answer: string }[];
  transactionPortals?: { portalLabel: string; portalUrl: string }[];
  providingBodies?: { name: string; slug: string; parentMinistry?: { name: string; slug: string } }[];
  relatedServices?: { title: string; slug: string }[];
  parentCategory?: { title: string; slug: string };
  
  // NEW GOV.UK FIELDS (CamelCase for frontend)
  criticalBlockers?: CriticalBlocker[];
  warnings?: WarningCallout[];
  edgeCases?: EdgeCaseScenario[];
  internationalUseGuidance?: string;
  gazetteReference?: string;
};

type Ref = { _ref: string };

// UPDATED: Added snake_case fields, allowed slug to be a string, and added timestamps
export type ServiceDocument = Omit<ServiceView, "providingBodies" | "relatedServices" | "slug"> & {
  _id: string;
  slug: { current: string } | string; 
  status?: string;
  popularityWeight?: number;
  servicePriority?: number;
  providingBodies?: Ref[];
  relatedServices?: Ref[];
  _createdAt?: string; // ✅ ADDED
  _updatedAt?: string; // ✅ ADDED
  
  // Supabase snake_case columns
  critical_blockers?: CriticalBlocker[];
  warnings?: WarningCallout[];
  edge_cases?: EdgeCaseScenario[];
  international_use_guidance?: string;
  gazette_reference?: string;
};

export type ServiceCategory = { 
  _id: string; 
  title: string; 
  slug: { current: string } | string; 
  description?: string; 
  priority?: number; 
  subTopics?: { heading?: string; slug?: string; description?: string; parentHeading?: string; priority?: number; services?: Ref[] }[] 
};

type Provider = { _id: string; name: string; slug: { current: string } | string; parentMinistry?: Ref };
type CategoryLink = { category_id: string; service_id: string; heading: string; position: number };

// Helper to safely extract slug whether it's a string or an object
const getSlug = (s: any): string => {
  if (!s) return "";
  if (typeof s === "string") return s;
  if (typeof s.slug === "string") return s.slug;
  return s.slug?.current || s.current || "";
};

export async function serviceCategoryLinks(db: SupabaseClient = createPublicClient()) {
  const rows: CategoryLink[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from("service_category_links").select("*").order("category_id").order("service_id").order("heading").range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 500) return rows;
  }
}

export async function serviceCatalogue(db: SupabaseClient = createPublicClient()) {
  const [services, categories, providers, links] = await Promise.all([
    listContent<ServiceDocument>("government_services", db), 
    listContent<ServiceCategory>("service_categories", db),
    listContent<Provider>("service_providers", db), 
    serviceCategoryLinks(db),
  ]);
  return { services, categories, providers, links };
}

export async function getServiceDirectory() {
  const { services, categories, providers, links } = await serviceCatalogue();
  const publishedServiceIds = new Set(services.map((service) => service._id));
  const activeLinks = links.filter((link) => publishedServiceIds.has(link.service_id));
  const activeCategoryIds = new Set(activeLinks.map((link) => link.category_id));
  const visibleCategories = categories
    .filter((category) => activeCategoryIds.has(category._id))
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100) || a.title.localeCompare(b.title));

  return {
    services: services.map(s => ({
      _id: s._id, 
      title: s.title, 
      summary: s.summary || "", 
      slug: getSlug(s),
      popularityWeight: s.popularityWeight || 0, 
      servicePriority: s.servicePriority || 0, 
      executionMode: s.executionMode,
      providingBody: providers.find(p => p._id === s.providingBodies?.[0]?._ref)?.name,
      categorySlug: visibleCategories.filter(c => activeLinks.some(l => l.category_id === c._id && l.service_id === s._id)).map(c => getSlug(c)),
      subcategorySlug: activeLinks.find(l => l.service_id === s._id)?.heading || undefined,
      subcategoryParent: (() => { const heading = activeLinks.find(l => l.service_id === s._id)?.heading; return visibleCategories.flatMap(c => c.subTopics || []).find(t => t.heading === heading)?.parentHeading; })(),
    })).sort((a, b) => (a.servicePriority || Number.MAX_SAFE_INTEGER) - (b.servicePriority || Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title)),
    categories: visibleCategories.map(c => ({
      title: c.title,
      slug: getSlug(c),
      description: c.description,
      subcategories: [...new Set(activeLinks.filter(l => l.category_id === c._id).map(l => l.heading || "General"))]
        .sort((a, b) => (c.subTopics?.find(t => t.heading === a)?.priority ?? 100) - (c.subTopics?.find(t => t.heading === b)?.priority ?? 100) || a.localeCompare(b))
        .map(h => ({ title: h, slug: h.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "-") })),
    })),
  };
}

export async function getServiceBySlug(slug: string): Promise<ServiceView | null> {
  const db = createPublicClient();
  const service = await getContent<ServiceDocument>("government_services", "slug", slug, db);
  if (!service) return null;
  
  const [providers, links] = await Promise.all([
    listContent<Provider>("service_providers", db), 
    serviceCategoryLinks(db)
  ]);
  
  const categoryId = links.find(l => l.service_id === service._id)?.category_id;
  const category = categoryId ? await getContent<ServiceCategory>("service_categories", "id", categoryId, db) : null;
  const related = await Promise.all((service.relatedServices || []).map(ref => getContent<ServiceDocument>("government_services", "id", ref._ref, db)));
  
  return {
    ...service,
    slug: getSlug(service),
    steps: [...(service.steps || [])].sort((a, b) => a.stepNumber - b.stepNumber),
    providingBodies: (service.providingBodies || []).flatMap(ref => {
      const provider = providers.find(p => p._id === ref._ref);
      if (!provider) return [];
      const parent = providers.find(p => p._id === provider.parentMinistry?._ref);
      return [{ name: provider.name, slug: getSlug(provider), parentMinistry: parent ? { name: parent.name, slug: getSlug(parent) } : undefined }];
    }),
    relatedServices: related.filter((s): s is ServiceDocument => !!s).map(s => ({ title: s.title, slug: getSlug(s) })),
    parentCategory: category ? { title: category.title, slug: getSlug(category) } : undefined,
    
    // Map snake_case to camelCase for the public frontend
    criticalBlockers: service.critical_blockers || [],
    warnings: service.warnings || [],
    edgeCases: service.edge_cases || [],
    internationalUseGuidance: service.international_use_guidance || "",
    gazetteReference: service.gazette_reference || "",
  };
}

export async function getAdminServices(db: SupabaseClient, id?: string) {
  const { services, categories, providers, links } = await serviceCatalogue(db);
  
  const rows = services.map(s => ({
    ...s, 
    slug: getSlug(s), 
    portalCount: (s as any).transactionPortals?.length || 0,
    providingBodyIds: ((s as any).providingBodies || []).map((r: any) => r._ref),
    relatedServiceIds: ((s as any).relatedServices || []).map((r: any) => r._ref),
    relatedServiceSlugs: services.filter(r => (s as any).relatedServices?.some((ref: any) => ref._ref === r._id)).map(r => getSlug(r)),
    categoryIds: [...new Set(links.filter(l => l.service_id === s._id).map(l => l.category_id))],
    categoryTitles: categories.filter(c => links.some(l => l.service_id === s._id && l.category_id === c._id)).map(c => c.title),
    
    // EXPLICITLY PASS THE SNAKE_CASE FIELDS TO THE ADMIN FRONTEND (and camelCase fallback)
    criticalBlockers: (s as any).criticalBlockers || (s as any).critical_blockers || [],
    warnings: (s as any).warnings || [],
    edgeCases: (s as any).edgeCases || (s as any).edge_cases || [],
    internationalUseGuidance: (s as any).internationalUseGuidance || (s as any).international_use_guidance || "",
    gazetteReference: (s as any).gazetteReference || (s as any).gazette_reference || "",
  }));

  return { 
    data: id ? rows.find(s => s._id === id) || null : rows,
    ministries: providers.map(p => ({ ...p, slug: getSlug(p) })),
    categories: categories.map(c => ({ 
      ...c, slug: getSlug(c),
      subTopics: [...new Set([...((c as any).subTopics || []).map((t: any) => t.heading || "General"), ...links.filter(l => l.category_id === c._id).map(l => l.heading)])].map((heading: string) => ({ 
        heading, 
        slug: (c as any).subTopics?.find((t: any) => t.heading === heading)?.slug || heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), 
        description: (c as any).subTopics?.find((t: any) => t.heading === heading)?.description, 
        parentHeading: (c as any).subTopics?.find((t: any) => t.heading === heading)?.parentHeading, 
        serviceIds: links.filter(l => l.category_id === c._id && l.heading === heading).map(l => l.service_id) 
      })),
    })),
  };
}
