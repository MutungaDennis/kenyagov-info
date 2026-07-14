// Auth pages use the parent admin layout's unauthenticated chrome
// (service header only — no sidebar).
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
