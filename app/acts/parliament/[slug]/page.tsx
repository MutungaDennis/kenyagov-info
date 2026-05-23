import { notFound } from "next/navigation";
import { getActOfParliamentBySlug } from "@/lib/sanity/client";
import ParliamentActReaderClient from "./ParliamentActReaderClient"; // Ensure this matches exactly

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60; 

export default async function ActPage({ params }: Props) {
  const { slug } = await params;
  const act = await getActOfParliamentBySlug(slug);

  if (!act) {
    notFound();
  }

  return (
    <ParliamentActReaderClient initialAct={act} />
  );
}
