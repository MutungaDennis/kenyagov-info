import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Government officials",
  description:
    "Find Kenya’s public leaders and officials — current and former roles, institutions, and contact information.",
  path: "/government/people",
});

export default function PeopleSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
