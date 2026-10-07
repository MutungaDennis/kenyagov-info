import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Support",
  description: "Get help using CitizenGuide.KE.",
  path: "/support",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
