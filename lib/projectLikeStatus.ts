import type { ProjectLikeStatus } from "@/types/types";

function readBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") {
    return v;
  }
  if (v === 1 || v === "1" || v === "true") {
    return true;
  }
  if (v === 0 || v === "0" || v === "false") {
    return false;
  }
  return undefined;
}

export function normalizeProjectLikeStatus(response: unknown): ProjectLikeStatus {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    const nested = r.data ?? r.status ?? r.result;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return normalizeProjectLikeStatus(nested);
    }
    const liked = readBool(
      r.liked ??
        r.isLiked ??
        r.is_liked ??
        r.hasLiked ??
        r.has_liked ??
        r.likedByCurrentUser ??
        r.liked_by_current_user
    );
    if (liked !== undefined) {
      return { liked };
    }
  }
  return { liked: false };
}
