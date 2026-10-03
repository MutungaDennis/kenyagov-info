import HansardArchive, { type ArchiveParams } from "@/components/hansard/HansardArchive";
export const dynamic = "force-dynamic";
export const metadata = { title: "National Assembly Hansard" };
export default async function ArchivePage({ searchParams }: { searchParams: Promise<ArchiveParams> }) {
 return <HansardArchive house="national-assembly" label="National Assembly" filters={await searchParams} />;
}
