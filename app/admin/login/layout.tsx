// Dedicated layout for auth pages under /admin (login, forgot, reset).
// This keeps them outside the protected admin chrome (header + sidebar).
// Note: parent app/admin/layout.tsx still wraps, but we provide a clean container here.

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal clean wrapper for the auth screens
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {children}
    </div>
  );
}
