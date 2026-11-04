// app/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServiceBySlug } from "@/lib/services/queries";
import ServiceClientView from "./ServiceClientView";

const SITE_URL = "https://www.citizenguide.ke";

interface PageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  if (!slug) return { title: "Service Not Found - citizenguide.Ke" };

  const service = await getServiceBySlug(slug);

  if (!service) return { title: "Service Not Found - citizenguide.Ke" };

  return {
    title: `${service.title} - citizenguide.Ke`,
    description: service.summary,
    alternates: {
      canonical: `${SITE_URL}/${encodeURIComponent(slug)}`,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  if (!slug) notFound();

  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }



  return <ServiceClientView service={service} />;
}

// Service content is read-heavy and can safely be refreshed hourly.
export const revalidate = 3600;
