/** Holidays page is a client island; segment stays statically cached. */
export const revalidate = 3600;
export default function HolidaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
