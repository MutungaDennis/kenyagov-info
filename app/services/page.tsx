// app/services/page.tsx
import React, { Suspense } from "react"; // Added Suspense import
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

export const metadata = {
  title: "Services and guidance - CitizenGuide.KE",
  description: "Find government services. Search or filter by topic.",
};

export default async function ServicesHubPage() {
  const [services, categories] = await Promise.all([
    client.fetch<GovernmentServiceSummary[]>(ALL_SERVICES_QUERY),
    client.fetch<GovernmentCategoryFilter[]>(ALL_CATEGORIES_QUERY),
  ]);

  return (
    <div className="govuk-width-container">
      <Suspense 
        fallback={
          <div className="govuk-main-wrapper">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <p className="govuk-body">Loading service directory...</p>
              </div>
            </div>
          </div>
        }
      >
        <ServicesClientView initialServices={services} categories={categories} />
      </Suspense>
    </div>
  );
}
