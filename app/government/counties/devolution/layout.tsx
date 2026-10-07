import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Devolution in Kenya",
  description: "How devolution works in Kenya: county functions, funding and oversight.",
  path: "/government/counties/devolution",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
