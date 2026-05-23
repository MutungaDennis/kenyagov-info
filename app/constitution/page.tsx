import { getAllConstitutionArticles, getChapters } from "@/lib/sanity/client";
import ConstitutionTableOfContents from "./ConstitutionTableOfContents";

export const revalidate = 60; // Revalidate content every minute

export default async function ConstitutionServerPage() {
  // 1. Fetch live content from Sanity datasets on the server
  const articles = await getAllConstitutionArticles();
  const chapters = await getChapters();

  // 2. Fallback diagnostic to catch empty server values during builds
  const safeArticles = Array.isArray(articles) ? articles : [];
  const safeChapters = Array.isArray(chapters) ? chapters : [];

  return (
    <ConstitutionTableOfContents 
      initialArticles={safeArticles} 
      initialChapters={safeChapters} 
    />
  );
}
