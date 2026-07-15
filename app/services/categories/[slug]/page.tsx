import React, { Suspense } from "react";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import ServicesClientView, {
  type GovernmentCategoryFilter,
  type GovernmentServiceSummary,
} from "../../ServicesClientView";

const SITE_URL = "https://www.citizenguide.ke";

const ALL_SERVICES_QUERY = `*[_type == "governmentService"]{
  _id,
  title,
  summary,
  "slug": slug.current,
  "popularityWeight": coalesce(popularityWeight, 0),
  executionMode,
  "providingBody": coalesce(providingBody, "Government Agency"),
  "subcategorySlug": subcategory->slug.current,
  "categorySlug": coalesce(*[_type == "governmentCategory" && references(^._id)].slug.current, [])
}`;

const ALL_CATEGORIES_QUERY = `*[_type == "governmentCategory" && !defined(parentCategory)]{
  title,
  "slug": slug.current,
  "subcategories": *[_type == "governmentSubcategory" && references(^._id)]{
    title,
    "slug": slug.current
  }
}`;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ");
  return {
    title: `Services: ${label}`,
    description: `Find Kenyan government services in the ${label} category.`,
    alternates: {
      canonical: `${SITE_URL}/services/categories/${encodeURIComponent(slug)}`,
    },
  };
}

/**
 * Clean category URL for SEO and sharing.
 * Renders the same finder as /services with the category pre-selected from the path.
 * Legacy /services?category=… is 308-redirected here by middleware.
 */
export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [services, categories] = await Promise.all([
    client.fetch<GovernmentServiceSummary[]>(ALL_SERVICES_QUERY),
    client.fetch<GovernmentCategoryFilter[]>(ALL_CATEGORIES_QUERY),
  ]);

  return (
    <Suspense
      fallback={
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">Loading service directory...</p>
          </div>
        </div>
      }
    >
      <ServicesClientView
        initialServices={services}
        categories={categories}
        pathCategorySlug={slug}
      />
    </Suspense>
  );
}
