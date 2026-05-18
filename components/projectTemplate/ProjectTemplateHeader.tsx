import Link from "next/link";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateHeaderProps = {
  projectTitle: string;
  editHref?: string;
};

export function ProjectTemplateHeader({
  projectTitle,
  editHref,
}: ProjectTemplateHeaderProps) {
  return (
    <header className={styles["project-template__top"]}>
      <div className={styles["project-template__top-controls"]}>
        <Link
          href="/projects"
          className={styles["project-template__icon-button"]}
          aria-label="К ленте проектов"
        >
          ←
        </Link>
        <span className={styles["project-template__project-chip"]}>
          {projectTitle}
        </span>
        {editHref ? (
          <Link
            href={editHref}
            className={styles["project-template__edit-chip"]}
          >
            Редактировать
          </Link>
        ) : null}
      </div>

      <Link href="/projects" className={styles["project-template__brand"]}>
        Devfolio
      </Link>
    </header>
  );
}
