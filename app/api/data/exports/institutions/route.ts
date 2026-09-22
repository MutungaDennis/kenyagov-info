import { datasetExport } from "@/lib/open-data/export";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return datasetExport(request, "institutions");
}
