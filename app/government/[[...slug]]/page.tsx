// app/government/[[...slug]]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr"; 
import { createClient } from "@/lib/supabase/server"; 
import { getInstitutionContent } from "@/lib/sanity/client"; // Your exact centralized client library

import MinistryHubView from "@/components/views/MinistryHubView";
import StateDeptView from "@/components/views/StateDeptView";
import MissionsDirectoryView from "@/components/views/MissionsDirectoryView";
import IndividualMissionView from "@/components/views/IndividualMissionView";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

interface MinistryListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

/**
 * Generates static routing paths during production builds.
 * Uses an isolated server client to bypass cookie injection safely.
 */
export async function generateStaticParams() {
  const staticSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  );

  const { data: institutions } = await staticSupabase
    .from("institutions")
    .select("slug")
    .eq("is_active", true);

  if (!institutions) return [];

  return institutions.map((inst: { slug: string }) => ({
    slug: [inst.slug],
  }));
}

export default async function GovernmentCatchAllPage({ params }: PageProps) {
  // 1. Resolve Next.js 15 Async Parameters & Instantiate Server Client
  const resolvedParams = await params;
  const segments = resolvedParams.slug || [];
  const supabase = await createClient();

  // ==========================================
  // LAYER 1: Root Index Portfolio (/government)
  // ==========================================
  if (segments.length === 0) {
    const { data: ministries } = await supabase
      .from("institutions")
      .select("id, name, slug, description")
      .eq("institution_type", "Ministry")
      .eq("is_active", true)
      .order("name");

    const ministryList = (ministries as MinistryListItem[] | null) || [];

    return React.createElement(
      "div",
      { className: "govuk-width-container" },
      React.createElement(
        "main",
        { className: "govuk-main-wrapper govuk-!-padding-top-2", id: "main-content", role: "main" },
        React.createElement(
          "div",
          { className: "govuk-grid-row" },
          React.createElement(
            "div",
            { className: "govuk-grid-column-two-thirds" },
            React.createElement("span", { className: "govuk-caption-l" }, "Citizen Guide Ministries Index"),
            React.createElement("h1", { className: "govuk-heading-l govuk-!-margin-bottom-3" }, "Ministries of the Government of Kenya"),
            React.createElement(
              "p",
              { className: "govuk-body govuk-!-margin-bottom-6" },
              "Explore operational frameworks, technical directorates, parastatals, and direct citizen service links managed across the 21 executive ministries of state."
            ),
            React.createElement(
              "ul",
              { className: "govuk-list govuk-list--spaced govuk-!-margin-bottom-8" },
              ministryList.map((min) =>
                React.createElement(
                  "li",
                  { key: min.id, className: "govuk-!-margin-bottom-4", style: { borderBottom: "1px solid #b1b4b6", paddingBottom: "15px" } },
                  React.createElement("a", { href: `/government/${min.slug}`, className: "govuk-link govuk-!-font-weight-bold govuk-!-font-size-19" }, min.name),
                  React.createElement("p", { className: "govuk-body-s govuk-!-margin-top-1 govuk-text-secondary" }, min.description || "No official abstract description published.")
                )
              )
            )
          )
        )
      )
    );
  }

  const currentSlug = segments[segments.length - 1];

    // ==========================================
  // LAYER 2: Virtual Filter Directories (e.g., /.../missions)
  // ==========================================
  const virtualCategories = ["missions", "parastatals", "directorates"];
  
  if (virtualCategories.includes(currentSlug)) {
    const parentSlug = segments[segments.length - 2];
    
    // Find the Ministry ID or State Dept ID anchor context
    const { data: parentDept } = await supabase
      .from("institutions")
      .select("id, name")
      .eq("slug", parentSlug)
      .single();

    if (!parentDept) notFound();

    // FIXED SEARCH QUERY: Fetches direct missions AND subordinate hosted foreign nodes
    const { data: items } = await supabase
      .from("institutions")
      .select(`
        id, name, slug, email, phone, website_url, description,
        diplomatic_extensions (
          mission_direction, 
          diplomatic_plate_code
        )
      `)
      .or(`parent_institution_id.eq.${parentDept.id},supervising_ministry_id.eq.971f3ed7-b464-459c-98a7-08d88f862cf7`)
      .in("institution_type", ["Diplomatic Mission", "Foreign Mission"])
      .eq("is_active", true)
      .order("name");

    return React.createElement(MissionsDirectoryView, {
      items: (items as any) || [],
      parentName: parentDept.name,
      category: currentSlug,
      segments: segments
    });
  }

      // ==========================================
  // LAYER 3: Core Database Record Resolution
  // ==========================================
  const { data: entity } = await supabase
    .from("institutions")
    .select(`
      *,
      diplomatic_extensions (
        id,
        mission_direction,
        host_country_iso_code,
        diplomatic_plate_code,
        credentials_presentation_date,
        sanity_content_id,
        diplomatic_accreditations (
          accredited_country_iso_code
        )
      ),
      institution_leaders (
        name,
        title,
        start_date,
        is_current
      ),
      institution_locations (
        id,
        office_name,
        address,
        latitude,
        longitude,
        is_headquarters
      )
    `)
    .eq("slug", currentSlug)
    .eq("is_active", true)
    .single();

  if (!entity) notFound();


  // ==========================================
  // LAYER 4: Centralized Sanity CMS Document Sync
  // ==========================================
  let cmsContent = null;
  if (currentSlug) {
    try {
      // Queries where institutionSlug.current matching current active page URL parameter
      cmsContent = await getInstitutionContent(currentSlug);
    } catch (e) {
      console.error("Centralized Sanity fetch pipeline processing error:", e);
    }
  }

  // ==========================================
  // POLYMORPHIC VIEW ROUTER (Pure Function Mapping)
  // ==========================================
    // ==========================================
  // ENGINE VIEW SELECTION (Pure Function Mapping with Type Casts)
  // ==========================================
  if (entity.institution_type === "Ministry") {
    const { data: subDepts } = await supabase
      .from("institutions")
      .select("name, slug, description")
      .eq("parent_institution_id", entity.id)
      .eq("institution_type", "State Department")
      .eq("is_active", true);

    return React.createElement(MinistryHubView as any, {
      ministry: entity,
      subDepartments: (subDepts as any) || [],
      cms: cmsContent, 
      segments: segments
    });
  }

  if (entity.institution_type === "State Department") {
    return React.createElement(StateDeptView as any, {
      department: entity,
      cms: cmsContent,
      segments: segments
    });
  }

  if (entity.institution_type === "Diplomatic Mission" || entity.institution_type === "Foreign Mission") {
    return React.createElement(IndividualMissionView as any, {
      mission: entity,
      cms: cmsContent, 
      segments: segments
    });
  }

  return notFound();
}
