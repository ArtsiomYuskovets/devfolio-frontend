import { useMemo } from "react";
import { areLikelySkillIds } from "@/lib/skillDisplay";
import { pickProjectGalleryUrls } from "@/lib/projectImage";
import { pickUserId } from "@/lib/userId";
import {
  useGetProjectsByIdQuery,
  useGetProjectSkillsQuery,
} from "@/stores/projects/projectsApi";
import { useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
} from "@/stores/user/userApi";
import type { ProjectViewSkill } from "../projectTemplate.utils";

export function useProjectViewData(projectId: string) {
  const {
    data: project,
    isLoading,
    error,
    isError,
  } = useGetProjectsByIdQuery(projectId, { skip: !projectId });

  const { data: skillAttachments = [], isLoading: isSkillsLoading } =
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
    () => skillAttachments.map((a) => a.skillId).filter(Boolean),
    [skillAttachments]
  );

  const verifiedBySkillId = useMemo(
    () => new Map(skillAttachments.map((a) => [a.skillId, a.verified])),
    [skillAttachments]
  );

  const looksLikeIds = areLikelySkillIds(skillIdsList);

  const { data: skillsResolved } = useSkillsByIdsQuery(skillIdsList, {
    skip: !projectId || !looksLikeIds || skillIdsList.length === 0,
  });

  const skills: ProjectViewSkill[] = useMemo(() => {
    if (looksLikeIds && Array.isArray(skillsResolved) && skillsResolved.length) {
      return skillsResolved.map((s) => ({
        key: s.id,
        label: s.name,
        verified: verifiedBySkillId.get(s.id) ?? false,
      }));
    }
    return skillIdsList.map((id) => ({
      key: id,
      label: id,
      verified: verifiedBySkillId.get(id) ?? false,
    }));
  }, [looksLikeIds, skillsResolved, skillIdsList, verifiedBySkillId]);

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

  return {
    project,
    isLoading,
    isError,
    error,
    gallery,
    skills,
    isSkillsLoading,
    authorProfile,
    authorName,
    authorProfileHref,
    editHref,
    isOwner,
    ownerId,
  };
}
