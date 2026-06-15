"use client";

import Link from "next/link";
import { ProfileProjectCard } from "@/components/profile/ProfileProjectCard";
import { isProjectDisplayReady } from "@/lib/normalizeFavorites";
import { projectCardDescription } from "@/lib/projectDisplay";
import { projectLikesCount, projectViewsCount } from "@/lib/projectEngagement";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import { useGetProjectsByIdQuery } from "@/stores/projects/projectsApi";
import type { Project } from "@/types/types";
import styles from "../projectsFeed/ProjectsFeedPage.module.scss";

type FavoriteProjectItemProps = {
  projectId: string;
  initialProject?: Project;
};

export function FavoriteProjectItem({
  projectId,
  initialProject,
}: FavoriteProjectItemProps) {
  const needsFetch =
    !initialProject || !isProjectDisplayReady(initialProject);

  const { data: fetched, isLoading, isError } = useGetProjectsByIdQuery(
    projectId,
    { skip: !needsFetch }
  );

  const project =
    fetched ??
    (initialProject && isProjectDisplayReady(initialProject)
      ? initialProject
      : undefined);

  if (needsFetch && isLoading) {
    return (
      <p className={styles["projects-feed__status"]}>Загрузка проекта…</p>
    );
  }

  if (!project) {
    if (isError) {
      return (
        <p className={styles["projects-feed__status"]}>
          Не удалось загрузить проект {projectId.slice(0, 8)}…
        </p>
      );
    }
    return null;
  }

  return (
    <Link
      href={`/project/${projectId}`}
      className={styles["projects-feed__project-link"]}
    >
      <ProfileProjectCard
        title={project.name || "Без названия"}
        description={projectCardDescription(project)}
        likes={projectLikesCount(project)}
        views={projectViewsCount(project)}
        previewSrc={projectCardPreviewSrc(project)}
        projectId={projectId}
        ownerUserId={project.userId}
      />
    </Link>
  );
}
