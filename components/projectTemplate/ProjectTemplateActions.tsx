import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { ProjectLikeButton } from "@/components/projects/ProjectLikeButton";
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
  return (
    <div className={styles["project-template__actions"]}>
      {editHref ? (
        <Link href={editHref} className={styles["project-template__edit-link"]}>
          Редактировать проект
        </Link>
      ) : null}
      <Button type="button" variant="outline-dark" size="normal">
        Откликнуться
      </Button>
      <Button type="button" variant="outline-dark" size="normal">
        Сохранить проект
      </Button>
      <ProjectLikeButton
        projectId={projectId}
        likesCount={likesCount}
        size="action"
        className={styles["project-template__like-action"]}
        activeClassName={styles["project-template__like-action--active"]}
      />
    </div>
  );
}
