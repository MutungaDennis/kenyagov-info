import { getAllActsOfParliament } from "@/lib/sanity/client";
import ParliamentActsListClient from "./ParliamentActsListClient";

// Force Next.js to revalidate the Sanity data stream every 60 seconds
export const revalidate = 60; 

export default async function ParliamentActsPage() {
  // Fetch live legislative documents on the server side securely
  const acts = await getAllActsOfParliament();

  // Fallback structural arrays to prevent runtime breakdown if Sanity is down
  const safeActs = Array.isArray(acts) ? acts : [];

  return (
    <ParliamentActsListClient initialActs={safeActs} />
  );
}
