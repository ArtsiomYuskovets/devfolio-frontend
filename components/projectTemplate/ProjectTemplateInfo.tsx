import type { Project } from "@/types/types";
import { formatProjectDate } from "./projectTemplate.utils";
import styles from "./ProjectTemplate.module.scss";

type ProjectTemplateInfoProps = {
  project: Project;
  likesCount: number;
  viewsCount: number;
};

export function ProjectTemplateInfo({
  project,
  likesCount,
  viewsCount,
}: ProjectTemplateInfoProps) {
  return (
    <>
      <div className={styles["project-template__headline"]}>
        <h1 className={styles["project-template__title"]}>{project.name}</h1>
        <span className={styles["project-template__visibility"]}>
          {project.projectPublic ? "Публичный" : "Приватный"}
        </span>
      </div>

      <div className={styles["project-template__meta-row"]}>
        <span>Создан: {formatProjectDate(project.createdAt)}</span>
        <span>Обновлён: {formatProjectDate(project.updatedAt)}</span>
        <span>{likesCount} ♥</span>
        <span>{viewsCount} 👁</span>
      </div>

      {project.githubUrl ? (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className={styles["project-template__github"]}
        >
          {project.githubUrl}
        </a>
      ) : (
        <p className={styles["project-template__github-empty"]}>
          Ссылка на репозиторий не указана
        </p>
      )}

      <div className={styles["project-template__details"]}>
        <article className={styles["project-template__panel"]}>
          <h2 className={styles["project-template__panel-title"]}>
            Краткое описание
          </h2>
          <p className={styles["project-template__panel-text"]}>
            {project.shortDescription?.trim() ||
              "Краткое описание не добавлено."}
          </p>
        </article>

        <article className={styles["project-template__panel"]}>
          <h2 className={styles["project-template__panel-title"]}>Описание</h2>
          <p className={styles["project-template__panel-text"]}>
            {project.description?.trim() ||
              "Полное описание проекта пока не добавлено."}
          </p>
        </article>
      </div>
    </>
  );
}
