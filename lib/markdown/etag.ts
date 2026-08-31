import { createHash } from "node:crypto";

export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function weakEtag(hash: string): string {
  return `W/"${hash}"`;
}

export function clientHasMatchingEtag(
  ifNoneMatch: string | null,
  hash: string,
): boolean {
  if (!ifNoneMatch) return false;
  const candidates = ifNoneMatch.split(",").map((s) => s.trim());
  const weak = weakEtag(hash);
  const strong = `"${hash}"`;
  return candidates.some((c) => c === weak || c === strong || c === hash);
}
