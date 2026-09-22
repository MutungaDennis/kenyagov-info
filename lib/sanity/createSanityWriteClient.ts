import "server-only";
import { createClient, type SanityClient } from "@sanity/client";
import {
  getSanityDataset,
  getSanityProjectId,
} from "@/lib/sanity/createSanityClient";

/** Server-only mutation client. The API token can never enter a client bundle. */
export function createSanityWriteClient(): SanityClient {
  return createClient({
    projectId: getSanityProjectId(),
    dataset: getSanityDataset(),
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
}
