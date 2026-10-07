// app/government/executive-orders/page.tsx
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Executive orders",
  description: "Executive orders issued by the President of Kenya.",
  path: "/government/executive-orders",
});

export default function ExecutiveOrdersPage() {
  return (
    <div>
      <h1>Executive Orders</h1>
    </div>
  );
}
