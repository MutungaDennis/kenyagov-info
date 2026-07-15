import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Clean category URL that maps to the services finder filter.
 * GOV.UK-style shareable path without relying on query strings alone.
 */
export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/services?category=${encodeURIComponent(slug)}`);
}
