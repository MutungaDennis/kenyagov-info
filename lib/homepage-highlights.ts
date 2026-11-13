import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_HOMEPAGE_HIGHLIGHTS,
  parseHomepageHighlight,
  type HomepageHighlight,
  type HomepageHighlightsConfig,
} from "@/lib/homepage-highlights-schema";

export async function getHomepageHighlights(): Promise<HomepageHighlightsConfig> {
  try {
    const { data, error } = await createPublicClient()
      .from("homepage_highlights")
      .select("section_title, items")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Could not load homepage highlights:", error.message);
      return DEFAULT_HOMEPAGE_HIGHLIGHTS;
    }

    if (!data) return DEFAULT_HOMEPAGE_HIGHLIGHTS;

    const rawTitle =
      typeof data.section_title === "string" ? data.section_title.trim() : "";
    const items = Array.isArray(data.items)
      ? data.items
          .slice(0, 3)
          .map(parseHomepageHighlight)
          .filter((item): item is HomepageHighlight => item !== null)
      : [];

    return {
      sectionTitle:
        rawTitle.length > 0 && rawTitle.length <= 80
          ? rawTitle
          : DEFAULT_HOMEPAGE_HIGHLIGHTS.sectionTitle,
      items,
    };
  } catch (error) {
    console.error("Could not load homepage highlights:", error);
    return DEFAULT_HOMEPAGE_HIGHLIGHTS;
  }
}
