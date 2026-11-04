import type { ReactNode } from "react";

import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
