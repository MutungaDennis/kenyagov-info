import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { SchoolSummary } from "./types";

type InstitutionLink = { name: string; short_name: string | null; slug: string };
export type SchoolProfile = SchoolSummary & {
  description: string | null;
  institution_type: string;
  registration_status: string | null;
  constituency: string | null;
  ward: string | null;
  physical_address: string | null;
  postal_address: string | null;
  latitude: number | null;
  longitude: number | null;
  public_phone: string | null;
  public_email: string | null;
  website_url: string | null;
  nemis_code: string | null;
  knec_code: string | null;
  tsc_code: string | null;
  sponsor_name: string | null;
  special_needs_status: string | null;
  sne_categories: string[] | null;
  total_enrollment: number | null;
  total_teachers: number | null;
  water_source: string | null;
  power_source: string | null;
  internet_connectivity: string | null;
  verification_status: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
  sources: Array<{
    id: string;
    external_record_id: string;
    external_name: string;
    review_status: string;
    source: {
      title: string;
      publisher: string;
      source_url: string | null;
      licence: string | null;
      publication_date: string | null;
      reference_year: number | null;
    } | null;
  }>;
  officials: Array<{
    id: string;
    full_name: string;
    role_title: string;
    start_date: string | null;
    end_date: string | null;
    biography: string | null;
    photo_url: string | null;
  }>;
  parent: InstitutionLink | null;
  ministry: InstitutionLink | null;
};

const PROFILE_SELECT = `id,slug,official_name,short_name,ownership,main_tier,county,sub_county,county_code,
  moe_category,gender_type,accommodation_type,operational_status,description,institution_type,
  registration_status,constituency,ward,physical_address,postal_address,latitude,longitude,
  public_phone,public_email,website_url,nemis_code,knec_code,tsc_code,sponsor_name,special_needs_status,
  sne_categories,total_enrollment,total_teachers,water_source,power_source,internet_connectivity,
  verification_status,last_verified_at,created_at,updated_at,
  parent:institutions!education_schools_parent_institution_id_fkey(name,short_name,slug),
  ministry:institutions!education_schools_supervising_ministry_id_fkey(name,short_name,slug)`;

// Shared by the page and metadata; always public, even for logged-in admins.
export const getPublicSchool = cache(async (slug: string): Promise<SchoolProfile | null> => {
  const db = createPublicClient();
  const result = await db.from("education_schools").select(PROFILE_SELECT)
    .eq("ownership", "public").eq("is_published", true).eq("slug", slug).maybeSingle();
  if (result.error) throw new Error("The school directory is temporarily unavailable.");
  let school = result.data;
  if (!school) {
    const alias = await db.from("education_school_slug_aliases").select("school_id").eq("slug",slug).maybeSingle();
    if (alias.error) throw new Error("The school directory is temporarily unavailable.");
    if (!alias.data) return null;
    const canonical = await db.from("education_schools").select(PROFILE_SELECT)
      .eq("ownership", "public").eq("is_published", true).eq("id",alias.data.school_id).maybeSingle();
    if (canonical.error) throw new Error("The school directory is temporarily unavailable.");
    school = canonical.data;
  }
  if (!school) return null;

  const [sourceResult, officialResult] = await Promise.all([
    db.from("education_school_source_records").select(`
      id, external_record_id, external_name, review_status,
      source:education_data_sources!education_school_source_records_source_id_fkey(
        title, publisher, source_url, licence, publication_date, reference_year
      )
    `).eq("school_id", school.id).eq("review_status", "approved").order("created_at", { ascending: true }),
    db.from("education_school_officials")
      .select("id,full_name,role_title,start_date,end_date,biography,photo_url")
      .eq("school_id", school.id).eq("is_published", true)
      .order("start_date", { ascending: false, nullsFirst: false }),
  ]);
  if (sourceResult.error || officialResult.error) throw new Error("The school directory is temporarily unavailable.");
  return {
    ...school,
    sources: (sourceResult.data ?? []) as unknown as SchoolProfile["sources"],
    officials: (officialResult.data ?? []) as SchoolProfile["officials"],
  } as unknown as SchoolProfile;
});
