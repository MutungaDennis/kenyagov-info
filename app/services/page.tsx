// app/services/page.tsx
import React from "react";
import { client } from "@/sanity/lib/client";
import ServicesClientView from "./ServicesClientView"; // Capital S to match file system exactly

export interface GovernmentServiceSummary {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  popularityWeight: number;
  executionMode: string;
  categorySlug?: string | string[];
  categoryTitle?: string | string[];
}

export interface GovernmentCategoryFilter {
  title: string;
  slug: string;
}

const ALL_SERVICES_QUERY = `*[_type == "governmentService"]{
  _id,
  title,
  summary,
  "slug": slug.current,
  "popularityWeight": coalesce(popularityWeight, 0),
  executionMode,
  "categorySlug": *[_type == "governmentCategory" && references(^._id)].slug.current,
  "categoryTitle": *[_type == "governmentCategory" && references(^._id)].title
}`;

const ALL_CATEGORIES_QUERY = `*[_type == "governmentCategory"]{
  title,
  "slug": slug.current
}`;

export const metadata = {
  title: "Services Finder - citizenguide.Ke",
  description: "Search, filter and find every government service available on the citizenguide.Ke documentation platform.",
};

export default async function ServicesHubPage() {
  const [services, categories] = await Promise.all([
    client.fetch<GovernmentServiceSummary[]>(ALL_SERVICES_QUERY),
    client.fetch<GovernmentCategoryFilter[]>(ALL_CATEGORIES_QUERY),
  ]);

  return (
    <div className="govuk-width-container mx-auto px-4 py-6 max-w-5xl font-sans text-[#0b0c0c] bg-white antialiased">
      <div className="border-b-4 border-[#1d70b8] pb-4 mb-6">
        <span className="text-sm md:text-base text-[#505a5f] block font-bold mb-1">citizenguide.Ke Navigation</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0b0c0c]">
          All Government Services and Guides
        </h1>
      </div>

      <ServicesClientView initialServices={services} categories={categories} />
    </div>
  );
}
