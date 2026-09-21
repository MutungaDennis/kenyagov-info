import type { ReactNode } from "react";

// import "@/app/admin.css";


export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
