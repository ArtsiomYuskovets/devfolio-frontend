import { resolveApiAssetUrl } from "@/lib/projectImage";

export const API_ORIGIN = "http://localhost:8080";

export function pickAvatarUrlFromPayload(
  response: unknown
): string | undefined {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  const raw = response as Record<string, unknown>;
  const keys = [
    "avatarURL",
    "avatarUrl",
    "avatar_url",
    "avatar",
    "imageUrl",
    "image_url",
    "profileImageUrl",
    "profile_image_url",
  ];

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function normalizeAvatarUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  return resolveApiAssetUrl(value.trim());
}

export function profileAvatarEndpointUrl(userId: string): string {
  return `${API_ORIGIN}/api/profiles/${encodeURIComponent(userId.trim())}/avatar`;
}

export function resolveProfileAvatarUrl(
  avatarURL: string | undefined,
  userId: string | undefined
): string | undefined {
  const explicit = avatarURL?.trim();
  if (explicit) {
    return normalizeAvatarUrl(explicit) || explicit;
  }

  const id = userId?.trim();
  if (id) {
    return profileAvatarEndpointUrl(id);
  }

  return undefined;
}

export function isProtectedApiAssetUrl(url: string): boolean {
  const normalized = url.trim();
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith(API_ORIGIN)) {
    return true;
  }

  return normalized.startsWith("/api/");
}

export function normalizeUploadAvatarResponse(response: unknown): string {
  if (typeof response === "string") {
    return normalizeAvatarUrl(response);
  }

  const picked = pickAvatarUrlFromPayload(response);
  return picked ? normalizeAvatarUrl(picked) : "";
}
