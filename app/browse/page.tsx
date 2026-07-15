import { permanentRedirect } from "next/navigation";

/**
 * GOV.UK-style /browse entry → topics hub.
 * Also registered as permanent: true in next.config.ts redirects.
 */
export default function BrowseRedirectPage() {
  permanentRedirect("/topics");
}
