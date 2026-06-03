// app/services/page.tsx
import React from "react";
import { client } from "@/sanity/lib/client";
import ServicesClientView from "./ServicesClientView";

export interface GovernmentServiceSummary {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  popularityWeight: number;
  executionMode: string;
  categorySlug: string | string[]; // FIXED: Removed '?' to perfectly match the client component interface
  subcategorySlug?: string;
  providingBody: string;
}

export interface GovernmentCategoryFilter {
  title: string;
  slug: string;
  subcategories?: Array<{ title: string; slug: string }>;
}

// Optimized GROQ query using coalesce to ensure an array fallback, avoiding 'undefined' errors
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
  title: "Services and guidance - CitizenGuide.co.ke",
  description: "Search, filter and find every government service available on the CitizenGuide documentation platform.",
};

export default async function ServicesHubPage() {
  const [services, categories] = await Promise.all([
    client.fetch<GovernmentServiceSummary[]>(ALL_SERVICES_QUERY),
    client.fetch<GovernmentCategoryFilter[]>(ALL_CATEGORIES_QUERY),
  ]);

  return (
    <div className="govuk-width-container mx-auto px-4 py-6 max-w-5xl bg-white antialiased">
      <ServicesClientView initialServices={services} categories={categories} />
    </div>
  );
}
