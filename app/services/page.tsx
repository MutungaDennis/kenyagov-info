// app/services/page.tsx
import React, { Suspense } from "react";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import ServicesClientView from "./ServicesClientView";

export interface GovernmentServiceSummary {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  popularityWeight: number;
  executionMode: string;
  categorySlug: string | string[];
  subcategorySlug?: string;
  providingBody: string;
}

export interface GovernmentCategoryFilter {
  title: string;
  slug: string;
  subcategories?: Array<{ title: string; slug: string }>;
}

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

const SITE_URL = "https://www.citizenguide.ke";

type PageProps = {
  searchParams: Promise<{ category?: string; subcategory?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category?.trim();

  if (category && category !== "all") {
    return {
      title: `Services: ${category.replace(/-/g, " ")}`,
      description: "Find government services filtered by topic.",
      alternates: {
        canonical: `${SITE_URL}/services/categories/${encodeURIComponent(category)}`,
      },
    };
  }

  return {
    title: "Services and guidance",
    description: "Find government services. Search or filter by topic.",
    alternates: {
      canonical: `${SITE_URL}/services`,
    },
  };
}

export default async function ServicesHubPage() {
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
      <ServicesClientView initialServices={services} categories={categories} />
    </Suspense>
  );
}
