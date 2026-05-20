"use client";

import { useCallback, useMemo } from "react";
import { pickProjectId } from "@/lib/projectId";
import { pickUserId } from "@/lib/userId";
import {
  useAddProjectToFavoritesMutation,
  useGetFavoritesProjectsQuery,
  useRemoveProjectFromFavoritesMutation,
} from "@/stores/projects/projectsApi";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export function useProjectFavorite(
  projectId: string,
  ownerUserId?: string
) {
  const { data: myProfile } = useGetMyProfileQuery();
  const myUserId = pickUserId(myProfile) ?? myProfile?.userId;

  const isOwnProject = Boolean(
    myUserId && ownerUserId && myUserId === ownerUserId
  );

  const { data: favorites = [], isLoading: isFavoritesLoading } =
    useGetFavoritesProjectsQuery();

  const favoriteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const project of favorites) {
      const id = pickProjectId(project) ?? project.projectId;
      if (id) {
        ids.add(id);
      }
    }
    return ids;
  }, [favorites]);

  const isFavorite = favoriteIds.has(projectId);

  const [addFavorite, { isLoading: isAdding }] =
    useAddProjectToFavoritesMutation();
  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveProjectFromFavoritesMutation();

  const isBusy = isAdding || isRemoving;

  const toggle = useCallback(async () => {
    if (!projectId || isOwnProject || isBusy) {
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite({ projectId }).unwrap();
      } else {
        await addFavorite({ projectId }).unwrap();
      }
    } catch {
      // UI остаётся в прежнем состоянии до успешного ответа
    }
  }, [
    projectId,
    isOwnProject,
    isBusy,
    isFavorite,
    addFavorite,
    removeFavorite,
  ]);

  return {
    isFavorite,
    isOwnProject,
    isBusy,
    isFavoritesLoading,
    toggle,
    canFavorite: Boolean(projectId) && !isOwnProject,
  };
}
