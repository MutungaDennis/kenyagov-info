import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "County analytics",
  description: "Compare Kenya's counties using population, development and performance data.",
  path: "/government/counties/analytics",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
