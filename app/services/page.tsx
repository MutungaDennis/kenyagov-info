// app/services/page.tsx
import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServiceDirectory } from "@/lib/services/queries";
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

export default async function ServicesHubPage({ searchParams }: PageProps) {
  // Preserve legacy category URLs without running public authentication middleware.
  const params = await searchParams;
  const category = params.category?.trim();
  if (category && category !== "all") {
    redirect(`/services/categories/${encodeURIComponent(category)}`);
  }

  const { services, categories } = await getServiceDirectory();

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

// Publication changes must take effect without serving a cached draft.
export const dynamic = "force-dynamic";
