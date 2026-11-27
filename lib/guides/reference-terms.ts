import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

export type GlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  meaning: string;
  reference_label: string | null;
  reference_url: string | null;
};

export type GuideAcronym = {
  id: string;
  acronym: string;
  full_form: string;
  category: string;
  meaning: string | null;
  reference_label: string | null;
  reference_url: string | null;
};

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_glossary_terms")
      .select("id,slug,term,meaning,reference_label,reference_url")
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

export async function getGuideAcronyms(): Promise<GuideAcronym[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("guide_acronyms")
      .select("id,acronym,full_form,category,meaning,reference_label,reference_url")
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
