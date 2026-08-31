import { SITE_URL } from "@/lib/seo";
import {
  clientHasMatchingEtag,
  sha256Hex,
  weakEtag,
} from "@/lib/markdown/etag";

/** Appended to every /api/markdown response for YMYL / agent safety. */
export function markdownDisclaimerFooter(canonicalPath: string): string {
  const url = `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
  return `

---

## Disclaimer (read before citing)

- **CitizenGuide.KE** is an independent, non-governmental civic reference. It is **not** an official Government of Kenya website.
- This text is for information only. It is **not** a substitute for the Kenya Gazette, Kenya Law, eCitizen, or other official state systems.
- Prefer the **official source** links on the HTML page when filing or relying on a record for legal purposes.
- Suggested citation: page title + [${url}](${url})

*Generated as \`text/markdown\` for AI agents and tools. Do not mass-mirror this site.*
`;
}

export function markdownResponse(
  body: string,
  canonicalPath: string,
  request?: Request,
) {
  const full = `${body.trimEnd()}${markdownDisclaimerFooter(canonicalPath)}`;
  const hash = sha256Hex(full);
  const etag = weakEtag(hash);

  if (
    request &&
    clientHasMatchingEtag(request.headers.get("if-none-match"), hash)
  ) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        Vary: "Accept, User-Agent",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  return new Response(full, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
      Vary: "Accept, User-Agent",
      ETag: etag,
      "X-Content-Signature": hash,
    },
  });
}
