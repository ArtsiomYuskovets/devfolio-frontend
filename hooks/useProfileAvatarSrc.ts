"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/authApi";
import {
  isProtectedApiAssetUrl,
  resolveProfileAvatarUrl,
} from "@/lib/profileAvatar";

function toApiPath(url: string): string {
  const trimmed = url.trim();
  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, "");
  return withoutOrigin.startsWith("/") ? withoutOrigin : `/${withoutOrigin}`;
}

export function useProfileAvatarSrc(
  avatarURL: string | undefined,
  userId: string | undefined
): string | undefined {
  const resolved = resolveProfileAvatarUrl(avatarURL, userId);
  const [src, setSrc] = useState<string | undefined>(() =>
    resolved && !isProtectedApiAssetUrl(resolved) ? resolved : undefined
  );

  useEffect(() => {
    if (!resolved) {
      setSrc(undefined);
      return;
    }

    if (!isProtectedApiAssetUrl(resolved)) {
      setSrc(resolved);
      return;
    }

    let cancelled = false;
    let objectUrl: string | undefined;

    void api
      .get(toApiPath(resolved), { responseType: "blob" })
      .then((response) => {
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(response.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(undefined);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resolved]);

  return src;
}
