import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "County performance",
  description: "How Kenya's counties perform on service delivery, revenue and development.",
  path: "/government/counties/performance",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
