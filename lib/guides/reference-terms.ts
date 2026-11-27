import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type GlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  short_meaning: string;
  details: string;
};

export type GuideAcronym = {
  id: string;
  slug: string;
  acronym: string;
  full_form: string;
  short_meaning: string;
  details: string;
};

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_glossary_terms")
      .select("id,slug,term,short_meaning,details")
      .eq("is_published", true)
      .order("sort_order")
      .order("term");
    if (error) throw error;
    return (data || []) as GlossaryTerm[];
  } catch (error) {
    console.error("[guides] Could not load glossary terms", error);
    return [];
  }
}

export async function getGlossaryTermBySlug(slug: string): Promise<GlossaryTerm | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_glossary_terms")
      .select("id,slug,term,short_meaning,details")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data as GlossaryTerm | null;
  } catch (error) {
    console.error("[guides] Could not load glossary detail", error);
    return null;
  }
}

export async function getGuideAcronyms(): Promise<GuideAcronym[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_acronyms")
      .select("id,slug,acronym,full_form,short_meaning,details")
      .eq("is_published", true)
      .order("sort_order")
      .order("acronym");
    if (error) throw error;
    return (data || []) as GuideAcronym[];
  } catch (error) {
    console.error("[guides] Could not load acronyms", error);
    return [];
  }
}

export async function getGuideAcronymBySlug(slug: string): Promise<GuideAcronym | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_acronyms")
      .select("id,slug,acronym,full_form,short_meaning,details")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data as GuideAcronym | null;
  } catch (error) {
    console.error("[guides] Could not load acronym detail", error);
    return null;
  }
}
