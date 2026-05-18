import type { Project } from "@/types/types";
import { pickProjectId } from "@/lib/projectId";
import { pickProjectPreviewUrl } from "@/lib/projectImage";
import { pickUserId } from "@/lib/userId";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

function mergeRecords(
  ...parts: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
  return Object.assign({}, ...parts.filter(isPlainObject));
}

function unwrapProjectRaw(response: unknown): Record<string, unknown> | null {
  if (!isPlainObject(response)) {
    return null;
  }

  for (const key of ["data", "project", "result", "payload", "body", "item"]) {
    const nested = response[key];
    if (
      isPlainObject(nested) &&
      (pickProjectId(nested) || nested.name || nested.title)
    ) {
      return mergeRecords(response, nested);
    }
  }

  let merged: Record<string, unknown> = { ...response };
  for (const key of ["projectInfo", "info", "details", "metadata", "attributes"]) {
    const nested = response[key];
    if (isPlainObject(nested)) {
      merged = mergeRecords(merged, nested);
    }
  }

  return merged;
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
  };
}
