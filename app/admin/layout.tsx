import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

// Ensure auth checks always run fresh (no caching of user sessions)
export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side protection.
  // On /admin/login, /forgot-password, /reset-password this returns null
  // (to avoid redirect loops) and we render the page anyway.
  const user = await requireAdmin();

  // Server action for logout (secure, clears cookies properly)
  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const displayEmail = user?.email ?? "Admin";

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f8f8",
      }}
    >
      {/* Clean professional admin header - no black bg */}
      <header
        style={{
          backgroundColor: "#ffffff",
          color: "#0b0c0c",
          padding: "12px 0",
          borderBottom: "1px solid #b1b4b6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              CitizenGuide<span style={{ color: "#1d70b8" }}>.KE</span>
            </span>
            <span
              style={{
                backgroundColor: "#1d70b8",
                color: "#ffffff",
                padding: "2px 10px",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                borderRadius: "3px",
                letterSpacing: "0.5px",
              }}
            >
              Admin
            </span>
          </div>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px" }}>
              <span style={{ color: "#505a5f" }}>
                {displayEmail}
              </span>

              <form action={handleSignOut} style={{ margin: 0 }}>
                <button
                  type="submit"
                  style={{
                    background: "transparent",
                    border: "1px solid #1d70b8",
                    color: "#1d70b8",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Admin Two-Column Layout */}
      {user ? (
        <div
          style={{
            flex: "1",
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: "24px 20px",
            display: "flex",
            gap: "32px",
            boxSizing: "border-box",
          }}
        >
          {/* Clean Sidebar */}
          <AdminNav />

          {/* Main Content */}
          <main style={{ flex: "1", minWidth: "0", backgroundColor: "#fff", padding: "20px", borderRadius: "4px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            {children}
          </main>
        </div>
      ) : (
        <main style={{ flex: "1", padding: "20px" }}>{children}</main>
      )}
    </div>
  );
}


