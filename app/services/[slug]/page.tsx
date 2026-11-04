import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceDirectory } from "@/lib/services/queries";
import ServicesClientView from "../ServicesClientView";

const SITE_URL = "https://www.citizenguide.ke";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ");

  return {
    title: `Services: ${label}`,
    description: `Find Kenyan government services and information about ${label}.`,
    alternates: {
      canonical: `${SITE_URL}/services/${encodeURIComponent(slug)}`,
    },
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const { services, categories } = await getServiceDirectory();
  const category = categories.find((item) => item.slug === slug);

  if (!category) notFound();

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

export const revalidate = 3600;
