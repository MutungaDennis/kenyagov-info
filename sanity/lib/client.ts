import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

/**
 * Read-only Sanity client for the Next app.
 * Uses @sanity/client (not next-sanity) to keep the Cloudflare Worker small.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
