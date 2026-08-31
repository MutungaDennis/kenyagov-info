// app/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { client } from "@/sanity/lib/client"; 
import ServiceClientView from "./ServiceClientView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ALIGNED GROQ QUERY: Fetches metadata sizes, timestamps, structural portals, and nested ministries
const SERVICE_QUERY = `*[_type == "governmentService" && slug.current == $slug && (status != "draft")]{
  title,
  summary,
  body,
  status,
  reviewedAt,
  moreInformationUrl,
  relatedLinks[]{ label, href },
  _createdAt,
  _updatedAt,
  providingInstitutions[]{
    institutionId,
    name,
    slug,
    shortName,
    parentName
  },
  "providingBodies": providingBodies[]->{
    name,
    "slug": slug.current,
    parentMinistry->{
      name,
      "slug": slug.current
    }
  },
  processingTime,
  baseCostLabel,
  executionMode,
  timelineGuidancePoints,
  beforeYouStart,
  requiredDocuments,
  steps[] | order(stepNumber asc) {
    stepNumber,
    stepTitle,
    stepDescription
  },
  feesTable[],
  physicalVisits[],
  downloadableResources[]{
    label,
    "fileUrl": fileUpload.asset->url,
    "fileSize": fileUpload.asset->size,
    sourceUrl
  },
  commonMistakes[],
  faqs[],
  relatedServices[]->{
    title,
    "slug": slug.current
  },
  transactionPortals[]{
    portalLabel,
    portalUrl
  },
  "parentCategory": *[_type == "governmentCategory" && references(^._id)][0]{
    title,
    "slug": slug.current
  }
}`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  
  if (!slug) return { title: "Service Not Found - citizenguide.Ke" };
  
  const results = await client.fetch(SERVICE_QUERY, { slug });
  const service = results && results.length > 0 ? results[0] : null;
  
  if (!service) return { title: "Service Not Found - citizenguide.Ke" };

  return {
    title: `${service.title} - citizenguide.Ke`,
    description: service.summary,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  
  if (!slug) notFound();
  
  const results = await client.fetch(SERVICE_QUERY, { slug });
  const service = results && results.length > 0 ? results[0] : null;

  if (!service) {
    notFound();
  }

  const localizedService = {
    ...service,
    parentCategory: service.parentCategory && service.parentCategory.length > 0 
      ? service.parentCategory[0] 
      : undefined
  };

  return <ServiceClientView service={localizedService} />;
}
