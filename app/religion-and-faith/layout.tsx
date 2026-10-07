import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Religion and faith in Kenya",
  description: "Religious communities in Kenya and how the Constitution protects freedom of religion.",
  path: "/religion-and-faith",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
