const DEFAULT_API_URL = "http://localhost:8080";

function normalizeApiOrigin(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export const API_ORIGIN = normalizeApiOrigin(
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
);

    /** API base URL with trailing slash for RTK Query axiosBaseQuery */
export const API_BASE_URL = `${API_ORIGIN}/`;

export const VERIFY_TIMEOUT_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_VERIFY_TIMEOUT_MS,
  10_000
);
