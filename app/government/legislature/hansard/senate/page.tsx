import HansardArchive, { type ArchiveParams } from "@/components/hansard/HansardArchive";
export const dynamic = "force-dynamic";
export const metadata = { title: "Senate Hansard" };
export default async function ArchivePage({ searchParams }: { searchParams: Promise<ArchiveParams> }) {
 return <HansardArchive house="senate" label="Senate" filters={await searchParams} />;
}
