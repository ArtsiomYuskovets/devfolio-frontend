import type { Project } from "@/types/types";
import { normalizeListResponse } from "@/lib/normalizeList";
import { normalizeProjectPayload } from "@/lib/projectNormalize";
import { pickProjectId } from "@/lib/projectId";

function stubProject(projectId: string): Project {
  return {
    projectId,
    name: "",
    description: "",
    shortDescription: "",
    githubUrl: "",
    projectPublic: true,
    createdAt: 0,
    updatedAt: 0,
  };
}

function idsFromUnknownList(list: unknown[]): string[] {
  return list.flatMap((item) => {
    if (typeof item === "string" && item.trim()) {
      return [item.trim()];
    }
    const id = pickProjectId(item);
    return id ? [id] : [];
  });
}

export function normalizeFavoritesResponse(response: unknown): Project[] {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const r = response as Record<string, unknown>;
    const idFields = [
      r.projectIds,
      r.project_ids,
      r.favoriteIds,
      r.favorite_ids,
      r.favoriteProjectIds,
      r.ids,
    ];
    for (const field of idFields) {
      if (Array.isArray(field)) {
        return idsFromUnknownList(field).map(stubProject);
      }
    }

    const nestedLists = [
      r.favorites,
      r.content,
      r.items,
      r.data,
      r.projects,
    ];
    for (const nested of nestedLists) {
      if (Array.isArray(nested) && nested.length > 0) {
        return normalizeFavoritesResponse(nested);
      }
    }
  }

  const list = normalizeListResponse<unknown>(response);
  if (list.length === 0) {
    return [];
  }

  if (list.every((item) => typeof item === "string")) {
    return (list as string[])
      .map((id) => id.trim())
      .filter(Boolean)
      .map(stubProject);
  }

  return list.map((item) => {
    if (typeof item === "string") {
      return stubProject(item.trim());
    }
    const normalized = normalizeProjectPayload(item);
    const id = pickProjectId(normalized) ?? normalized.projectId;
    if (id && !normalized.projectId) {
      return { ...normalized, projectId: id };
    }
    return normalized;
  });
}

export function isProjectDisplayReady(project: Project): boolean {
  return Boolean(project.name?.trim() || project.shortDescription?.trim());
}
