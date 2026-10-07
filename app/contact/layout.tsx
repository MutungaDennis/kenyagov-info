import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact us",
  description: "Contact the CitizenGuide.KE team with questions, corrections or suggestions about Kenyan government information.",
  path: "/contact",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
