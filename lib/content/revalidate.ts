import "server-only";
import { revalidatePath } from "next/cache";

export function refreshHansard() {
  revalidatePath("/government/legislature", "layout");
  revalidatePath("/open-data", "layout");
  revalidatePath("/sitemap.xml");
}
export function refreshServices(slug?: string) {
  revalidatePath("/services", "layout");
  if (slug) revalidatePath(`/${slug}`);
  revalidatePath("/sitemap.xml");
}
