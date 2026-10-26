export const TEST_PATH_PATTERNS = [
  /^\/Test\.com/i,
  /^\/test(\/|$)/i,
  /^\/localhost/i,
];

export function isTestPath(path: string): boolean {
  return TEST_PATH_PATTERNS.some((re) => re.test(path));
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

export function pct(yes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((yes / total) * 100);
}