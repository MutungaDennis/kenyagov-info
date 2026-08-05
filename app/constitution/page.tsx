import { getAllConstitutionArticles, getChapters } from "@/lib/sanity/client";
import ConstitutionTableOfContents from "./ConstitutionTableOfContents";

/** Constitution text rarely changes — long cache for Cloudflare Free tier. */
export const revalidate = 86400;

export default async function ConstitutionServerPage() {
  // Fail soft: never 500 the whole route if Sanity is down or slow on Cloudflare
  let safeArticles: unknown[] = [];
  let safeChapters: unknown[] = [];
  try {
    const [articles, chapters] = await Promise.all([
      getAllConstitutionArticles(),
      getChapters(),
    ]);
    safeArticles = Array.isArray(articles) ? articles : [];
    safeChapters = Array.isArray(chapters) ? chapters : [];
  } catch (err) {
    console.error("[constitution] Sanity fetch failed:", err);
  }

  return (
    <ConstitutionTableOfContents
      initialArticles={safeArticles as never[]}
      initialChapters={safeChapters as never[]}
    />
  );
}
