import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "County assemblies",
  description: "Kenya's county assemblies, their leadership and members.",
  path: "/government/county-assemblies",
});


/** Legacy URL — assemblies directory now lives under /government/counties */
export default function CountyAssembliesLegacyRedirect() {
  redirect("/government/counties/county-assemblies");
}
