import type { Metadata } from "next";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import { buildPageMetadata } from "@/lib/seo";

type Options = {
  type: string;
  slug: string;
  basePath: string;
  fallbackTitle: string;
  summaryField?: string;
};

/** Page metadata for a Sanity document detail page; noindex when not found. */
export async function sanityDetailMetadata({
  type,
  slug,
  basePath,
  fallbackTitle,
  summaryField,
}: Options): Promise<Metadata> {
  const path = `${basePath}/${slug}`;
  try {
    const doc = await createSanityClient().fetch<{
      title?: string;
      summary?: unknown;
    } | null>(
      `*[_type == $type && slug.current == $slug][0]{ title, "summary": ${
        summaryField ? summaryField : "null"
      } }`,
      { type, slug },
    );
    if (doc?.title) {
      const summary =
        typeof doc.summary === "string" ? doc.summary.replace(/\s+/g, " ").trim() : "";
      return buildPageMetadata({
        title: doc.title,
        description: (summary || `${doc.title} — ${fallbackTitle} on CitizenGuide.KE.`).slice(0, 300),
        path,
      });
    }
  } catch {
    /* fall through */
  }
  return buildPageMetadata({
    title: fallbackTitle,
    description: `${fallbackTitle} on CitizenGuide.KE.`,
    path,
  });
}