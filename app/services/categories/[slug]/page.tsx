import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getServiceDirectory } from "@/lib/services/queries";
import ServicesClientView, {
  type GovernmentCategoryFilter,
  type GovernmentServiceSummary,
} from "../../ServicesClientView";

const SITE_URL = "https://www.citizenguide.ke";



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
      <ServicesClientView
        initialServices={services}
        categories={categories}
        pathCategorySlug={slug}
      />
    </Suspense>
  );
}

// Publication changes must take effect without serving a cached draft.
export const dynamic = "force-dynamic";
