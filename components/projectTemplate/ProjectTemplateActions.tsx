import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateActionsProps = {
  editHref?: string;
};

export function ProjectTemplateActions({ editHref }: ProjectTemplateActionsProps) {
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
    </div>
  );
}
