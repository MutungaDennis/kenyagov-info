// app/services/page.tsx
import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServiceDirectory } from "@/lib/services/queries";

// ✅ Ensure this points to the exact file name: ServicesClientView.tsx
import ServicesClientView from "./ServicesClientView";

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
    const formattedCategory = category.replace(/-/g, " ");
    return {
      title: `${formattedCategory} - Services and information`,
      description: `Find Kenyan government services, guides, and information related to ${formattedCategory}.`,
      alternates: {
        canonical: `${SITE_URL}/services/${encodeURIComponent(category)}`,
      },
    };
  }

  return {
    title: "Services and information",
    description: "Browse Kenyan government services, step-by-step guides, and official information by topic.",
    alternates: {
      canonical: `${SITE_URL}/services`,
    },
  };
}

export default async function ServicesHubPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category?.trim();
  
  if (category && category !== "all") {
    redirect(`/services/${encodeURIComponent(category)}`);
  }

  const { services, categories } = await getServiceDirectory();

  return (
    <Suspense
      fallback={
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl">Services and information</h1>
                <p className="govuk-body">Loading service directory...</p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ServicesClientView initialServices={services} categories={categories} />
    </Suspense>
  );
}

export const revalidate = 3600;