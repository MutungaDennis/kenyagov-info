// app/search/all/page.tsx
// Legacy URL — redirect to the unified GOV.UK-style site search.
import { redirect } from "next/navigation";

export const revalidate = 86400;

type SearchParams = {
  q?: string;
  type?: string;
  document_type?: string;
};

export default async function SearchAllRedirectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const next = new URLSearchParams();
  if (params.q?.trim()) next.set("q", params.q.trim());
  // Map legacy document_type / type onto the main search facet when present
  if (params.type?.trim()) next.set("type", params.type.trim());
  if (params.document_type?.trim() && !next.has("type")) {
    next.set("type", params.document_type.trim());
  }
  const qs = next.toString();
  redirect(qs ? `/search?${qs}` : "/search");
}
