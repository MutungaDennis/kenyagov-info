import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Communities of Kenya",
  description: "The ethnic and cultural communities of Kenya.",
  path: "/society-and-culture/communities",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
