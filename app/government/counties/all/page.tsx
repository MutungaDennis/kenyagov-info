import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "All 47 counties",
  description: "A complete list of Kenya's 47 counties with governors and key facts.",
  path: "/government/counties/all",
});


/** Legacy URL — directory now lives at /government/counties */
export default function AllCountiesRedirectPage() {
  redirect("/government/counties");
}
