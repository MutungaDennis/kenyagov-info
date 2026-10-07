import { redirect } from 'next/navigation';
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Government publications",
  description: "Reports and publications issued by the Kenyan government.",
  path: "/government/publications",
});

export default function PublicationsRedirect() {
  redirect('/search/all?document_type=publication');
}