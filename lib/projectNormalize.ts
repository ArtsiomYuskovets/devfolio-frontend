import type { Project } from "@/types/types";
import { pickProjectId } from "@/lib/projectId";
import { pickProjectPreviewUrl } from "@/lib/projectImage";
import { pickProjectSkillViewsFromProject } from "@/lib/normalizeProjectSkills";
import { pickUserId } from "@/lib/userId";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

function mergeRecords(
  ...parts: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
  return Object.assign({}, ...parts.filter(isPlainObject));
}

function flattenProjectEnvelope(
  source: Record<string, unknown>
): Record<string, unknown> {
  let merged: Record<string, unknown> = { ...source };

  for (const key of ["data", "project", "result", "payload", "body", "item"] as const) {
    const nested = source[key];
    if (isPlainObject(nested)) {
      merged = mergeRecords(merged, flattenProjectEnvelope(nested));
    }
  }

  for (const key of [
    "projectData",
    "project_data",
    "projectInfo",
    "project_info",
    "info",
    "details",
    "metadata",
    "attributes",
    "stats",
    "engagement",
    "metrics",
    "interaction",
    "counters",
    "analytics",
    "statistics",
  ] as const) {
    const nested = merged[key];
    if (isPlainObject(nested)) {
      merged = mergeRecords(merged, nested);
    }
  }

  return merged;
}

function unwrapProjectRaw(response: unknown): Record<string, unknown> | null {
  if (!isPlainObject(response)) {
    return null;
  }

  return flattenProjectEnvelope(response);
}

function readString(
  o: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return undefined;
}

function readBool(
  o: Record<string, unknown>,
  ...keys: string[]
): boolean | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") {
      return v;
    }
    if (v === 1 || v === "1" || v === "true") {
      return true;
    }
    if (v === 0 || v === "0" || v === "false") {
      return false;
    }
  }
  return undefined;
}

function readCount(
  o: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
      return Math.floor(v);
    }
    if (typeof v === "string" && v.trim()) {
      const parsed = Number(v);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.floor(parsed);
      }
    }
  }
  return undefined;
}

function readTimestamp(
  o: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      if (v > 0 && v < 1e11) {
        return v * 1000;
      }
      return v;
    }
    if (typeof v === "string" && v.trim()) {
      const parsed = Date.parse(v);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

export function normalizeProjectPayload(response: unknown): Project {
  const raw = unwrapProjectRaw(response);
  if (!raw) {
    return response as Project;
  }

  const projectId = pickProjectId(raw) ?? undefined;
  const previewImageUrl = pickProjectPreviewUrl(raw);
  const userId = pickUserId(raw) ?? undefined;

  const name = readString(
    raw,
    "name",
    "title",
    "projectName",
    "project_name"
  );
  const description = readString(
    raw,
    "description",
    "fullDescription",
    "full_description",
    "body"
  );
  const shortDescription = readString(
    raw,
    "shortDescription",
    "short_description",
    "summary",
    "excerpt"
  );
  const githubUrl = readString(
    raw,
    "githubUrl",
    "github_url",
    "githubURL",
    "repositoryUrl",
    "repository_url",
    "repoUrl",
    "repo_url",
    "gitUrl",
    "git_url"
  );
  const projectPublic = readBool(
    raw,
    "projectPublic",
    "project_public",
    "isPublic",
    "is_public",
    "public"
  );

  const createdAt = readTimestamp(
    raw,
    "createdAt",
    "created_at",
    "created",
    "createdDate",
    "created_date"
  );
  const updatedAt = readTimestamp(
    raw,
    "updatedAt",
    "updated_at",
    "updated",
    "modifiedAt",
    "modified_at",
    "lastModified",
    "last_modified"
  );

  const viewersCount = readCount(
    raw,
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
  const likesCount = readCount(
    raw,
    "likesCount",
    "likes_count",
    "likeCount",
    "like_count",
    "totalLikes",
    "total_likes",
    "likes"
  );
  const projectSkillViews = pickProjectSkillViewsFromProject(raw);

  return {
    ...(raw as Project),
    ...(projectId ? { projectId } : {}),
    ...(previewImageUrl ? { previewImageUrl } : {}),
    ...(userId ? { userId } : {}),
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(shortDescription ? { shortDescription } : {}),
    ...(githubUrl ? { githubUrl } : {}),
    ...(projectPublic !== undefined ? { projectPublic } : {}),
    ...(createdAt !== undefined ? { createdAt } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
    viewersCount: viewersCount ?? 0,
    likesCount: likesCount ?? 0,
    ...(projectSkillViews.length > 0 ? { projectSkillViews } : {}),
  };
}
