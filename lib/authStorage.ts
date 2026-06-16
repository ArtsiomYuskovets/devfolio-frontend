const STORAGE_KEY = "devfolio_auth";

type StoredAuth = {
  accessToken: string;
  expiresAt: number;
};

export function persistAuth(accessToken: string, expiresAt: number): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken, expiresAt })
    );
  } catch {

  }
}

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredAuth;
    if (
      typeof parsed.accessToken === "string" &&
      parsed.accessToken &&
      typeof parsed.expiresAt === "number"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {

  }
}
