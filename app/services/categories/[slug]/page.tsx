import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/services/${encodeURIComponent(slug)}`);
}

export const dynamic = "force-dynamic";
