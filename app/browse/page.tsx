import { redirect } from "next/navigation";

/**
 * GOV.UK-style /browse entry point → Kenya topics hub.
 */
export default function BrowseRedirectPage() {
  redirect("/topics");
}
