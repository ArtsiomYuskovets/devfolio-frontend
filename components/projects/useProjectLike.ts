"use client";

import { useCallback } from "react";
import {
  useGetProjectLikeStatusQuery,
  useLikeProjectMutation,
  useUnlikeProjectMutation,
} from "@/stores/projects/projectsApi";

export function useProjectLike(projectId: string) {
  const { data: status, isLoading: isStatusLoading } =
    useGetProjectLikeStatusQuery(projectId, { skip: !projectId });

  const [likeProject, { isLoading: isLiking }] = useLikeProjectMutation();
  const [unlikeProject, { isLoading: isUnliking }] = useUnlikeProjectMutation();

  const isLiked = status?.liked ?? false;
  const isBusy = isLiking || isUnliking;

  const toggle = useCallback(async () => {
    if (!projectId || isBusy) {
      return;
    }
    try {
      if (isLiked) {
        await unlikeProject(projectId).unwrap();
      } else {
        await likeProject(projectId).unwrap();
      }
    } catch {
      // состояние обновится после успешного ответа
    }
  }, [projectId, isBusy, isLiked, likeProject, unlikeProject]);

  return {
    isLiked,
    isBusy,
    isStatusLoading,
    toggle,
    canLike: Boolean(projectId),
  };
}
