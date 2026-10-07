import { redirect } from 'next/navigation';
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Cabinet decisions",
  description: "Decisions made by the Kenyan Cabinet, with dates and the ministries responsible.",
  path: "/government/cabinet-decisions",
});

export default function CabinetDecisionsRedirect() {
  redirect('/search/all?document_type=cabinet_decision');
}