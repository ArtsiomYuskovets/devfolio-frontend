"use client";

import { useProjectViewData } from "./hooks/useProjectViewData";
import { ProjectTemplateActions } from "./ProjectTemplateActions";
import { ProjectTemplateAuthorAside } from "./ProjectTemplateAuthorAside";
import { ProjectTemplateGallery } from "./ProjectTemplateGallery";
import { ProjectTemplateHeader } from "./ProjectTemplateHeader";
import { ProjectTemplateInfo } from "./ProjectTemplateInfo";
import { ProjectTemplateSkills } from "./ProjectTemplateSkills";
import styles from "./ProjectTemplate.module.scss";

export type ProjectTemplateProps = {
  projectId: string;
};

export function ProjectTemplate({ projectId }: ProjectTemplateProps) {
  const {
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
  } = useProjectViewData(projectId);

  if (!projectId) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>Проект не найден</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>Загрузка проекта…</p>
      </section>
    );
  }

  if (isError || !project) {
    const status =
      error && typeof error === "object" && "status" in error
        ? String((error as { status?: unknown }).status)
        : "";
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>
          Не удалось загрузить проект{status ? ` (${status})` : ""}.
        </p>
      </section>
    );
  }

  return (
    <section className={styles["project-template"]}>
      <ProjectTemplateHeader
        projectTitle={project.name || "Проект"}
        editHref={editHref}
      />

      <div className={styles["project-template__main"]}>
        <ProjectTemplateAuthorAside
          authorName={authorName}
          authorProfile={authorProfile}
          authorProfileHref={authorProfileHref}
        />

        <section className={styles["project-template__project"]}>
          <button
            type="button"
            className={styles["project-template__favorite"]}
            aria-label="Добавить проект в избранное"
          >
            ☆
          </button>

          <ProjectTemplateGallery images={gallery} />
          <ProjectTemplateInfo project={project} />
          <ProjectTemplateSkills skills={skills} isLoading={isSkillsLoading} />
          <ProjectTemplateActions editHref={editHref} />
        </section>
      </div>
    </section>
  );
}
