import type { Project } from "@/types/types";
import { pickProjectId } from "@/lib/projectId";

const API_ORIGIN = "http://localhost:8080";

function readString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

export function pickProjectPreviewUrl(response: unknown): string | undefined {
  if (!response || typeof response !== "object") return undefined;
  const o = response as Record<string, unknown>;

  const flatKeys = [
    "previewImageUrl",
    "preview_url",
    "previewUrl",
    "coverImageUrl",
    "cover_url",
    "thumbnailUrl",
    "thumbnail_url",
    "imageUrl",
    "image_url",
    "preview",
    "coverUrl",
    "mainImageUrl",
    "bannerUrl",
    "photoUrl",
  ];

  for (const key of flatKeys) {
    const v = readString(o[key]);
    if (v) return v;
  }

  const previewObj = o.preview;
  if (previewObj && typeof previewObj === "object" && previewObj !== null) {
    const p = previewObj as Record<string, unknown>;
    const nested = readString(p.url ?? p.imageUrl ?? p.href);
    if (nested) return nested;
  }

  const images = o.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") {
      const v = readString(first);
      if (v) return v;
    }
    if (first && typeof first === "object" && first !== null) {
      const img = first as Record<string, unknown>;
      const v = readString(img.url ?? img.imageUrl ?? img.href);
      if (v) return v;
    }
  }

  return undefined;
}

export function resolveApiAssetUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${API_ORIGIN}${path}`;
}

export function projectCardPreviewSrc(project: Project): string | undefined {
  const raw = project.previewImageUrl;
  if (raw?.trim()) {
    return resolveApiAssetUrl(raw.trim());
  }
  const id = pickProjectId(project);
  if (!id) return undefined;
  return `${API_ORIGIN}/api/projects/${encodeURIComponent(id)}/preview`;
}
