import HansardArchive, { type ArchiveParams } from "@/components/hansard/HansardArchive";
export const dynamic = "force-dynamic";
export const metadata = { title: "County Assemblies Hansard" };
export default async function ArchivePage({ searchParams }: { searchParams: Promise<ArchiveParams> }) {
 return <HansardArchive house="county-assembly" label="County Assemblies" filters={await searchParams} />;
}
