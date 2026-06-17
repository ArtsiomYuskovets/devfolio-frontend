"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { resolveSkillDisplayName } from "@/lib/normalizeProjectSkills";
import { projectLikesCount, projectViewsCount } from "@/lib/projectEngagement";
import { pickProjectGalleryUrls } from "@/lib/projectImage";
import { pickUserId } from "@/lib/userId";
import {
  useGetProjectsByIdQuery,
  useRecordProjectViewMutation,
} from "@/stores/projects/projectsApi";
import { useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
} from "@/stores/user/userApi";
import type { ProjectViewSkill } from "../projectTemplate.utils";

const recordedProjectViews = new Set<string>();
const pendingProjectViews = new Set<string>();

export function useProjectViewData(projectId: string) {
  const {
    data: project,
    isLoading,
    error,
    isError,
  } = useGetProjectsByIdQuery(projectId, { skip: !projectId });

  const { data: myProfile } = useGetMyProfileQuery();

  const [recordProjectView] = useRecordProjectViewMutation();
  const recordProjectViewRef = useRef(recordProjectView);
  recordProjectViewRef.current = recordProjectView;

  useLayoutEffect(() => {
    const normalizedId = projectId.trim();
    if (!normalizedId || !project || !myProfile) {
      return;
    }

    const ownerId = pickUserId(project) ?? project.userId;
    const myId = pickUserId(myProfile) ?? myProfile.userId;
    if (myId && ownerId && myId === ownerId) {
      recordedProjectViews.add(normalizedId);
      return;
    }

    if (
      recordedProjectViews.has(normalizedId) ||
      pendingProjectViews.has(normalizedId)
    ) {
      return;
    }

    pendingProjectViews.add(normalizedId);

    void (async () => {
      try {
        await recordProjectViewRef.current(normalizedId).unwrap();
        recordedProjectViews.add(normalizedId);
      } catch {
        // allow retry on next navigation
      } finally {
        pendingProjectViews.delete(normalizedId);
      }
    })();
  }, [projectId, project, myProfile]);

  const projectSkillViews = useMemo(
    () => project?.projectSkillViews ?? [],
    [project]
  );

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

  const skillIdsNeedingCatalog = useMemo(
    () =>
      projectSkillViews
        .filter((view) => !view.name?.trim() || view.name === view.skillId)
        .map((view) => view.skillId)
        .filter(Boolean),
    [projectSkillViews]
  );

  const { data: skillsByIds = [], isFetching: isSkillsCatalogLoading } =
    useSkillsByIdsQuery(skillIdsNeedingCatalog, {
      skip: !projectId || skillIdsNeedingCatalog.length === 0,
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

  const likesCount = projectLikesCount(project);
  const viewsCount = projectViewsCount(project);

  return {
    project,
    isLoading,
    isError,
    error,
    gallery,
    skills,
    isSkillsLoading: isLoading || isSkillsCatalogLoading,
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
