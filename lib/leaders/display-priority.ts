export const MAX_DISPLAY_PRIORITY = 999;

/** Empty means automatic ordering. Never coerce invalid admin input to null. */
export function normalizeDisplayPriority(value: unknown): number | null {
  if (value == null || (typeof value === "string" && value.trim() === "")) return null;
  const candidate = typeof value === "string" && /^\d+$/.test(value.trim())
    ? Number(value.trim()) : value;
  if (typeof candidate !== "number" || !Number.isInteger(candidate) || candidate < 1 || candidate > MAX_DISPLAY_PRIORITY) {
    throw new Error(`Public prominence must be a whole number from 1 to ${MAX_DISPLAY_PRIORITY}, or empty for automatic ordering.`);
  }
  return candidate;
}

/** Read-side compatibility: only valid stored priorities influence ordering. */
export function storedDisplayPriority(value: unknown): number | null {
  try { return normalizeDisplayPriority(value); } catch { return null; }
}
