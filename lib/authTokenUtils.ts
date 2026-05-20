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
