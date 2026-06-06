"use client";

import { useEffect, useMemo, useRef } from "react";
import { resolveSkillDisplayName } from "@/lib/normalizeProjectSkills";
import { pickProjectGalleryUrls } from "@/lib/projectImage";
import { pickUserId } from "@/lib/userId";
import {
  useGetProjectsByIdQuery,
  useGetProjectSkillsQuery,
  useRecordProjectViewMutation,
} from "@/stores/projects/projectsApi";
import { useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
} from "@/stores/user/userApi";
import type { ProjectViewSkill } from "../projectTemplate.utils";

const VIEW_SESSION_PREFIX = "project-view:";

function markViewRecorded(projectId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const key = `${VIEW_SESSION_PREFIX}${projectId}`;
  if (sessionStorage.getItem(key) === "1") {
    return false;
  }
  sessionStorage.setItem(key, "1");
  return true;
}

export function useProjectViewData(projectId: string) {
  const {
    data: project,
    isLoading,
    error,
    isError,
  } = useGetProjectsByIdQuery(projectId, { skip: !projectId });

  const [recordProjectView] = useRecordProjectViewMutation();
  const viewRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!projectId || viewRecordedRef.current === projectId) {
      return;
    }
    if (!markViewRecorded(projectId)) {
      viewRecordedRef.current = projectId;
      return;
    }
    viewRecordedRef.current = projectId;
    void recordProjectView(projectId);
  }, [projectId, recordProjectView]);

  const { data: projectSkillViews = [], isLoading: isSkillsLoading } =
    useGetProjectSkillsQuery(projectId, { skip: !projectId });

  const { data: myProfile } = useGetMyProfileQuery();

  const ownerId = project ? pickUserId(project) ?? project.userId : undefined;

  const isOwner = useMemo(() => {
    const myId = pickUserId(myProfile) ?? myProfile?.userId;
    if (!myId || !ownerId) {
      return false;
    }
    return myId === ownerId;
  }, [myProfile, ownerId]);

  const { data: authorProfile } = useGetUserProfileQuery(ownerId ?? "", {
    skip: !ownerId,
  });

  const skillIdsList = useMemo(
    () => projectSkillViews.map((a) => a.skillId).filter(Boolean),
    [projectSkillViews]
  );

  const { data: skillsByIds = [], isFetching: isSkillsCatalogLoading } =
    useSkillsByIdsQuery(skillIdsList, {
      skip: !projectId || skillIdsList.length === 0,
    });

  const catalogById = useMemo(() => {
    const map = new Map<string, string>();
    for (const skill of skillsByIds) {
      const id = skill.id.trim();
      if (id) {
        map.set(id, skill.name);
      }
    }
    return map;
  }, [skillsByIds]);

  const skills: ProjectViewSkill[] = useMemo(
    () =>
      projectSkillViews.map((view) => {
        const skillId = view.skillId.trim();
        return {
          key: skillId,
          label: resolveSkillDisplayName(view, catalogById.get(skillId)),
          verified: view.verified,
        };
      }),
    [projectSkillViews, catalogById]
  );

  const gallery = useMemo(
    () => (project ? pickProjectGalleryUrls(project) : []),
    [project]
  );

  const authorName = authorProfile
    ? `${authorProfile.firstName} ${authorProfile.lastName}`.trim() ||
      authorProfile.nickname
    : "Автор проекта";

  const authorProfileHref = ownerId ? `/profile/${ownerId}` : undefined;

  const editHref =
    isOwner && projectId ? `/project/${projectId}/template` : undefined;

  const likesCount = project?.likesCount ?? 0;
  const viewsCount = project?.viewersCount ?? 0;

  return {
    project,
    isLoading,
    isError,
    error,
    gallery,
    skills,
    isSkillsLoading: isSkillsLoading || isSkillsCatalogLoading,
    authorProfile,
    authorName,
    authorProfileHref,
    editHref,
    isOwner,
    ownerId,
    likesCount,
    viewsCount,
  };
}
