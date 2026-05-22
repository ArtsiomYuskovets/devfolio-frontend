export const REFRESH_BEFORE_MS = 60_000;

export function isTokenValid(expiresAt: number | null | undefined): boolean {
  return typeof expiresAt === "number" && Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function shouldRefreshToken(expiresAt: number | null | undefined): boolean {
  if (!isTokenValid(expiresAt)) {
    return true;
  }
  return Date.now() >= (expiresAt as number) - REFRESH_BEFORE_MS;
}

export function accessTokenExpiresAt(expiresIn: number): number {
  const now = Date.now();
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    return now;
  }
  if (expiresIn > 1_000_000_000_000) {
    return expiresIn;
  }
  if (expiresIn > 1_000_000_000) {
    return expiresIn * 1000;
  }
  if (expiresIn < 86_400 * 30) {
    return now + expiresIn * 1000;
  }
  return now + expiresIn;
}

export function isAuthRequestUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return (
    url.includes("auth/refresh") ||
    url.includes("auth/login") ||
    url.includes("auth/register")
  );
}
