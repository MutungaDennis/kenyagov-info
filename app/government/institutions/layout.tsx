import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Government institutions",
  description: "Search Kenyan ministries, departments, agencies, commissions and other public bodies.",
  path: "/government/institutions",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
