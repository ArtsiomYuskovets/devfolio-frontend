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

function pickImageUrlFromItem(item: unknown): string | undefined {
  if (typeof item === "string") {
    return readString(item);
  }
  if (item && typeof item === "object" && item !== null) {
    const o = item as Record<string, unknown>;
    return readString(o.url ?? o.imageUrl ?? o.href);
  }
  return undefined;
}

export function pickProjectGalleryUrls(response: unknown): string[] {
  if (!response || typeof response !== "object") {
    return [];
  }
  const o = response as Record<string, unknown>;
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (raw?: string) => {
    if (!raw) return;
    const resolved = resolveApiAssetUrl(raw);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      urls.push(resolved);
    }
  };

  push(pickProjectPreviewUrl(response));

  const images = o.images;
  if (Array.isArray(images)) {
    for (const item of images) {
      push(pickImageUrlFromItem(item));
    }
  }

  const photos =
    o.photos ??
    o.gallery ??
    o.galleryImages ??
    o.gallery_images ??
    o.imageUrls ??
    o.image_urls;
  if (Array.isArray(photos)) {
    for (const item of photos) {
      push(pickImageUrlFromItem(item));
    }
  }

  const id = pickProjectId(response);
  if (urls.length === 0 && id) {
    push(`${API_ORIGIN}/api/projects/${encodeURIComponent(id)}/preview`);
  }

  return urls;
}

export type ProjectEditorPhotoSlot = {
  role: "preview" | "gallery";
  displayUrl: string;
  deleteUrl: string;
};

export function buildProjectEditorPhotoSlots(
  project: unknown,
  slotCount = 5
): Array<ProjectEditorPhotoSlot | null> {
  const slots: Array<ProjectEditorPhotoSlot | null> = Array.from(
    { length: slotCount },
    () => null
  );

  if (!project || typeof project !== "object") {
    return slots;
  }

  const raw = project as Record<string, unknown>;
  const previewRaw = pickProjectPreviewUrl(raw);
  if (previewRaw) {
    slots[0] = {
      role: "preview",
      displayUrl: resolveApiAssetUrl(previewRaw),
      deleteUrl: previewRaw,
    };
  }

  const images = raw.images;
  if (!Array.isArray(images)) {
    return slots;
  }

  let galleryIndex = 1;
  for (const item of images) {
    if (galleryIndex >= slotCount) {
      break;
    }

    const imageRaw = pickImageUrlFromItem(item);
    if (!imageRaw) {
      continue;
    }

    const displayUrl = resolveApiAssetUrl(imageRaw);
    if (slots[0]?.displayUrl === displayUrl) {
      continue;
    }

    slots[galleryIndex] = {
      role: "gallery",
      displayUrl,
      deleteUrl: imageRaw,
    };
    galleryIndex += 1;
  }

  return slots;
}

export function projectCardPreviewSrc(project: Project): string | undefined {
  const gallery = pickProjectGalleryUrls(project);
  if (gallery.length > 0) {
    return gallery[0];
  }
  const raw = project.previewImageUrl;
  if (raw?.trim()) {
    return resolveApiAssetUrl(raw.trim());
  }
  const id = pickProjectId(project);
  if (!id) return undefined;
  return `${API_ORIGIN}/api/projects/${encodeURIComponent(id)}/preview`;
}
