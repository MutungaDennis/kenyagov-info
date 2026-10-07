import { redirect } from 'next/navigation';
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Public consultations",
  description: "Open and closed public consultations run by Kenyan government bodies, and how to take part.",
  path: "/government/consultations",
});

export default function ConsultationsRedirect() {
  redirect('/search/all?document_type=consultation');
}