import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceClientViewProps } from "@/app/[slug]/ServiceClientView";
import { createPublicClient } from "@/lib/supabase/public";
import { getContent, listContent } from "@/lib/content/store";

export type ServiceView = ServiceClientViewProps["service"];
type Ref = { _ref: string };
export type ServiceDocument = Omit<ServiceView, "providingBodies" | "relatedServices"> & {
  _id: string; slug: { current: string }; status?: string; popularityWeight?: number;
  providingBodies?: Ref[]; relatedServices?: Ref[];
};
export type ServiceCategory = { _id: string; title: string; slug: { current: string }; description?: string; subTopics?: { heading?: string; services?: Ref[] }[] };
type Provider = { _id: string; name: string; slug: { current: string }; parentMinistry?: Ref };
type CategoryLink = { category_id: string; service_id: string; heading: string; position: number };

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
    listContent<ServiceDocument>("government_services", db), listContent<ServiceCategory>("service_categories", db),
    listContent<Provider>("service_providers", db), serviceCategoryLinks(db),
  ]);
  return { services, categories, providers, links };
}
export async function getServiceDirectory() {
  const { services, categories, providers, links } = await serviceCatalogue();
  return {
    services: services.map(s => ({
      _id: s._id, title: s.title, summary: s.summary || "", slug: s.slug.current,
      popularityWeight: s.popularityWeight || 0, executionMode: s.executionMode,
      providingBody: s.providingInstitutions?.[0]?.name || providers.find(p => p._id === s.providingBodies?.[0]?._ref)?.name || "Government Agency",
      categorySlug: categories.filter(c => links.some(l => l.category_id === c._id && l.service_id === s._id)).map(c => c.slug.current),
    })).sort((a, b) => a.title.localeCompare(b.title)),
    categories: categories.map(c => ({ title: c.title, slug: c.slug.current,
      subcategories: [...new Set([...(c.subTopics || []).map(t => t.heading || "General"), ...links.filter(l => l.category_id === c._id).map(l => l.heading)])].map(h => ({ title: h, slug: h })),
    })),
  };
}
export async function getServiceBySlug(slug: string): Promise<ServiceView | null> {
  const db = createPublicClient();
  const service = await getContent<ServiceDocument>("government_services", "slug", slug, db);
  if (!service) return null;
  const [providers, links] = await Promise.all([listContent<Provider>("service_providers", db), serviceCategoryLinks(db)]);
  const categoryId = links.find(l => l.service_id === service._id)?.category_id;
  const category = categoryId ? await getContent<ServiceCategory>("service_categories", "id", categoryId, db) : null;
  const related = await Promise.all((service.relatedServices || []).map(ref => getContent<ServiceDocument>("government_services", "id", ref._ref, db)));
  return {
    ...service,
    steps: [...(service.steps || [])].sort((a, b) => a.stepNumber - b.stepNumber),
    providingBodies: (service.providingBodies || []).flatMap(ref => {
      const provider = providers.find(p => p._id === ref._ref);
      if (!provider) return [];
      const parent = providers.find(p => p._id === provider.parentMinistry?._ref);
      return [{ name: provider.name, slug: provider.slug.current, parentMinistry: parent ? { name: parent.name, slug: parent.slug.current } : undefined }];
    }),
    relatedServices: related.filter((s): s is ServiceDocument => !!s).map(s => ({ title: s.title, slug: s.slug.current })),
    parentCategory: category ? { title: category.title, slug: category.slug.current } : undefined,
  };
}
export async function getAdminServices(db: SupabaseClient, id?: string) {
  const { services, categories, providers, links } = await serviceCatalogue(db);
  const rows = services.map(s => ({
    ...s, slug: s.slug.current, portalCount: s.transactionPortals?.length || 0,
    providingBodyIds: (s.providingBodies || []).map(r => r._ref),
    relatedServiceIds: (s.relatedServices || []).map(r => r._ref),
    relatedServiceSlugs: services.filter(r => s.relatedServices?.some(ref => ref._ref === r._id)).map(r => r.slug.current),
    categoryIds: [...new Set(links.filter(l => l.service_id === s._id).map(l => l.category_id))],
    categoryTitles: categories.filter(c => links.some(l => l.service_id === s._id && l.category_id === c._id)).map(c => c.title),
  }));
  return { data: id ? rows.find(s => s._id === id) || null : rows,
    ministries: providers.map(p => ({ ...p, slug: p.slug.current })),
    categories: categories.map(c => ({ ...c, slug: c.slug.current,
      subTopics: [...new Set([...(c.subTopics || []).map(t => t.heading || "General"), ...links.filter(l => l.category_id === c._id).map(l => l.heading)])].map(heading => ({ heading, serviceIds: links.filter(l => l.category_id === c._id && l.heading === heading).map(l => l.service_id) })),
    })),
  };
}
