import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * County profiles are institution pages. Static routes under /government/counties/*
 * (governors, wards, devolution, …) take precedence over this dynamic segment.
 */
export default async function CountySlugRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/government/institutions/${slug}`);
}
