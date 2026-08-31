import { redirect } from "next/navigation";

/** Legacy URL — MCA register now lives under /government/counties/county-assemblies/mcas */
export default async function MCAsLegacyRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (typeof value === "string" && value) qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const query = qs.toString();
  redirect(
    `/government/counties/county-assemblies/mcas${query ? `?${query}` : ""}`,
  );
}
