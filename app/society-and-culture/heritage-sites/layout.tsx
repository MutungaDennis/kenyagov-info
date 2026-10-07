import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Heritage sites in Kenya",
  description: "Kenya's national and world heritage sites.",
  path: "/society-and-culture/heritage-sites",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
