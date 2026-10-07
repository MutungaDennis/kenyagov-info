import { buildPageMetadata } from "@/lib/seo";
/** Holidays page is a client island; segment stays statically cached. */
export const revalidate = 3600;
export default function HolidaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export const metadata = buildPageMetadata({
  title: "Public holidays in Kenya",
  description: "Kenya's public holidays, with dates for this year and the next.",
  path: "/society-and-culture/holidays",
});
