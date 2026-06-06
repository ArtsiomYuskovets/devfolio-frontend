"use client";

import Link from "next/link";
import { ProjectLikeButton } from "@/components/projects/ProjectLikeButton";
import { useMyUserType } from "@/hooks/useMyUserType";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateActionsProps = {
  projectId: string;
  likesCount: number;
  editHref?: string;
};

export function ProjectTemplateActions({
  projectId,
  likesCount,
  editHref,
}: ProjectTemplateActionsProps) {
  const { isJobSeeker } = useMyUserType();

  return (
    <div className={styles["project-template__actions"]}>
      {editHref ? (
        <Link href={editHref} className={styles["project-template__edit-link"]}>
          Редактировать проект
        </Link>
      ) : null}
      {isJobSeeker ? (
        <ProjectLikeButton
          projectId={projectId}
          likesCount={likesCount}
          size="action"
          className={styles["project-template__like-action"]}
          activeClassName={styles["project-template__like-action--active"]}
        />
      ) : null}
    </div>
  );
}
