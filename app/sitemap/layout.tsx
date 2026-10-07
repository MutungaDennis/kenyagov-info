import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Site map",
  description: "A full list of the sections and pages on CitizenGuide.KE.",
  path: "/sitemap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
