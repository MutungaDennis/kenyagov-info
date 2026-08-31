import { redirect } from "next/navigation";

/** Legacy URL — assemblies directory now lives under /government/counties */
export default function CountyAssembliesLegacyRedirect() {
  redirect("/government/counties/county-assemblies");
}
