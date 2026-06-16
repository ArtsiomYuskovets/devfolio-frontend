import type { Project } from "@/types/types";

function readCount(source: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.floor(parsed);
      }
    }
  }
  return 0;
}

function readNestedCount(raw: Record<string, unknown>, ...keys: string[]): number {
  const direct = readCount(raw, ...keys);
  if (direct > 0) {
    return direct;
  }

  for (const nestKey of [
    "projectInfo",
    "project_info",
    "stats",
    "statistics",
    "engagement",
    "metrics",
    "interaction",
    "counters",
    "analytics",
  ] as const) {
    const nested = raw[nestKey];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const nestedCount = readCount(nested as Record<string, unknown>, ...keys);
      if (nestedCount > 0) {
        return nestedCount;
      }
    }
  }

  return 0;
}

export function projectLikesCount(
  project: Project | Record<string, unknown> | null | undefined
): number {
  if (!project || typeof project !== "object") {
    return 0;
  }
  return readNestedCount(
    project as Record<string, unknown>,
    "likesCount",
    "likes_count",
    "likeCount",
    "like_count",
    "totalLikes",
    "total_likes",
    "likes"
  );
}

export function projectViewsCount(
  project: Project | Record<string, unknown> | null | undefined
): number {
  if (!project || typeof project !== "object") {
    return 0;
  }
  return readNestedCount(
    project as Record<string, unknown>,
    "viewersCount",
    "viewers_count",
    "viewerCount",
    "viewer_count",
    "viewsCount",
    "views_count",
    "viewCount",
    "view_count",
    "totalViews",
    "total_views",
    "views",
    "numberOfViews",
    "number_of_views"
  );
}
