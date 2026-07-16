import { getAllActsOfParliament } from "@/lib/sanity/client";
import ParliamentActsListClient from "./ParliamentActsListClient";

// Force Next.js to revalidate the Sanity data stream every 60 seconds
export const revalidate = 3600; 

export async function generateMetadata() {
  return {
    title: 'Acts of Parliament',
    description: 'Browse and search Acts passed by the Parliament of Kenya, including National Assembly and Senate legislation.',
  };
}

export default async function ParliamentActsPage() {
  // Fetch live legislative documents on the server side securely
  const acts = await getAllActsOfParliament();

  // Fallback structural arrays to prevent runtime breakdown if Sanity is down
  const safeActs = Array.isArray(acts) ? acts : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Legislation",
            "name": "Acts of Parliament of Kenya",
            "description": "Official legislation passed by the Parliament of Kenya.",
            "url": "https://citizenguide.ke/acts/parliament",
            "publisher": {
              "@type": "GovernmentOrganization",
              "name": "Parliament of Kenya"
            }
          })
        }}
      />
      <ParliamentActsListClient initialActs={safeActs} />
    </>
  );
}
