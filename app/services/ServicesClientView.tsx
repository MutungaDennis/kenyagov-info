import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ChevronLinkList from "@/components/site/ChevronLinkList";

export interface GovernmentServiceSummary {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  popularityWeight: number;
  servicePriority?: number;
  executionMode: string;
  categorySlug: string | string[];
  subcategorySlug?: string;
  providingBody: string;
}

export interface GovernmentCategoryFilter {
  title: string;
  slug: string;
  description?: string;
  subcategories?: Array<{ title: string; slug: string }>;
}

interface ServicesClientViewProps {
  initialServices: GovernmentServiceSummary[];
  categories: GovernmentCategoryFilter[];
  pathCategorySlug?: string;
}

function categoryHasService(service: GovernmentServiceSummary, slug: string) {
  return Array.isArray(service.categorySlug)
    ? service.categorySlug.includes(slug)
    : service.categorySlug === slug;
}

export default function ServicesClientView({
  initialServices,
  categories,
  pathCategorySlug,
}: ServicesClientViewProps) {
  const category = pathCategorySlug
    ? categories.find((item) => item.slug === pathCategorySlug)
    : undefined;

  if (!pathCategorySlug) {
    return (
      <>
        <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Services" }]} />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Services and information</h1>
            <p className="govuk-body-l">Find government services, forms and information.</p>
            <p className="govuk-body">Choose a topic to find the service you need. We explain what to do and link you to the official organisation when you are ready to apply.</p>
          </div>
        </div>
        <section aria-labelledby="browse-services-heading" className="govuk-!-margin-top-6">
          <h2 id="browse-services-heading" className="govuk-heading-l">Browse services by topic</h2>
          <ChevronLinkList
            ariaLabel="Browse services by topic"
            items={categories.map((item) => ({
              href: `/services/categories/${item.slug}`,
              title: item.title,
              description: item.description || "Government services and information",
            }))}
          />
        </section>
      </>
    );
  }

  const services = initialServices
    .filter((service) => categoryHasService(service, pathCategorySlug))
    .sort((a, b) => (a.servicePriority || Number.MAX_SAFE_INTEGER) - (b.servicePriority || Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title));
  const grouped = new Map<string, GovernmentServiceSummary[]>();
  for (const service of services) {
    const heading = service.subcategorySlug || "Services in this topic";
    grouped.set(heading, [...(grouped.get(heading) || []), service]);
  }

  return (
    <>
      <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Services", href: "/services" }, { text: category?.title || pathCategorySlug }]} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{category?.title || pathCategorySlug.replaceAll("-", " ")}</h1>
          <p className="govuk-body-l">{category?.description || "Government services and information in this topic."}</p>
          <p className="govuk-body">Select a service to see the steps, requirements and official links.</p>
        </div>
      </div>
      {services.length === 0 ? (
        <p className="govuk-body">There are no published services in this topic yet.</p>
      ) : (
        <div className="govuk-!-margin-top-6">
          {Array.from(grouped.entries()).map(([heading, items]) => (
            <section key={heading} aria-labelledby={`group-${heading}`} className="govuk-!-margin-bottom-7">
              <h2 id={`group-${heading}`} className="govuk-heading-l">{heading}</h2>
              <ChevronLinkList
                ariaLabel={heading}
                items={items.map((service) => ({ href: `/${service.slug}`, title: service.title, description: service.summary, meta: service.providingBody }))}
              />
            </section>
          ))}
        </div>
      )}
      <p className="govuk-body govuk-!-margin-top-6"><Link href="/services" className="govuk-link">Browse all service topics</Link></p>
    </>
  );
}
