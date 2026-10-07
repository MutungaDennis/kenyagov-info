import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Give feedback",
  description: "Tell us what you think of CitizenGuide.KE or report a problem with a page.",
  path: "/feedback",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
