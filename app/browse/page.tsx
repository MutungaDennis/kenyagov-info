import { permanentRedirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Browse all topics",
  description: "Browse every topic on CitizenGuide.KE: government, elections, the Constitution, laws, counties, public services and more.",
  path: "/browse",
});


/**
 * GOV.UK-style /browse entry → topics hub.
 * Also registered as permanent: true in next.config.ts redirects.
 */
export default function BrowseRedirectPage() {
  permanentRedirect("/topics");
}
