"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { areLikelySkillIds } from "@/lib/skillDisplay";
import {
  useGetProjectsByIdQuery,
  useGetProjectSkillsQuery,
} from "@/stores/projects/projectsApi";
import { useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import styles from "./ProjectViewPage.module.scss";

type ProjectViewPageProps = {
  projectId: string;
};

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return "не указано";
  }

  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ProjectViewPage({ projectId }: ProjectViewPageProps) {
  const { data: project, isLoading, error } = useGetProjectsByIdQuery(projectId, {
    skip: !projectId,
  });
  const { data: skillAttachments = [], isLoading: isSkillsLoading } =
    useGetProjectSkillsQuery(projectId, {
      skip: !projectId,
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

  const skillsForView = useMemo(() => {
    if (looksLikeIds && skillsResolved?.length) {
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

  const dates = useMemo(
    () => ({
      createdAt: formatDate(project?.createdAt),
      updatedAt: formatDate(project?.updatedAt),
    }),
    [project?.createdAt, project?.updatedAt]
  );

  const previewSrc = project ? projectCardPreviewSrc(project) : undefined;
  const [previewBroken, setPreviewBroken] = useState(false);

  useEffect(() => {
    setPreviewBroken(false);
  }, [project?.projectId, previewSrc]);

  if (!projectId) {
    return <div className={styles["project-view__status"]}>Проект не найден</div>;
  }

  if (isLoading) {
    return <div className={styles["project-view__status"]}>Загрузка проекта...</div>;
  }

  if (error || !project) {
    return (
      <div className={styles["project-view__status"]}>
        Ошибка загрузки проекта
      </div>
    );
  }

  return (
    <section className={styles["project-view"]}>
      <div className={styles["project-view__shell"]}>
        <header className={styles["project-view__hero"]}>
          <div className={styles["project-view__hero-top"]}>
            <div className={styles["project-view__hero-nav"]}>
              <Link href="/projects" className={styles["project-view__back-link"]}>
                ← К ленте
              </Link>
              <Link
                href={`/project/${project.projectId}/template`}
                className={styles["project-view__edit-link"]}
              >
                Редактировать
              </Link>
            </div>
            <span className={styles["project-view__visibility"]}>
              {project.projectPublic ? "Публичный проект" : "Приватный проект"}
            </span>
          </div>

          {previewSrc && !previewBroken ? (
            <div className={styles["project-view__preview-wrap"]}>
              <img
                src={previewSrc}
                alt=""
                className={styles["project-view__preview-img"]}
                loading="eager"
                decoding="async"
                onError={() => setPreviewBroken(true)}
              />
            </div>
          ) : null}

          <h1 className={styles["project-view__title"]}>{project.name}</h1>

          <div className={styles["project-view__meta"]}>
            <span>Создан: {dates.createdAt}</span>
            <span>Обновлен: {dates.updatedAt}</span>
            <span>ID: {project.projectId}</span>
          </div>
        </header>

        <div className={styles["project-view__content"]}>
          <article className={styles["project-view__card"]}>
            <h2 className={styles["project-view__card-title"]}>Описание</h2>
            <p className={styles["project-view__text"]}>
              {project.description || "Описание проекта пока не добавлено."}
            </p>
          </article>

          <article className={styles["project-view__card"]}>
            <h2 className={styles["project-view__card-title"]}>Репозиторий</h2>
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className={styles["project-view__repo-link"]}
              >
                {project.githubUrl}
              </a>
            ) : (
              <p className={styles["project-view__text"]}>
                Ссылка на репозиторий не указана.
              </p>
            )}
          </article>

          <article className={styles["project-view__card"]}>
            <h2 className={styles["project-view__card-title"]}>Навыки проекта</h2>

            {isSkillsLoading ? (
              <p className={styles["project-view__text"]}>Загрузка навыков...</p>
            ) : skillsForView.length > 0 ? (
              <div className={styles["project-view__skills"]}>
                {skillsForView.map((skill) => (
                  <span
                    key={skill.key}
                    className={`${styles["project-view__skill"]} ${
                      skill.verified
                        ? styles["project-view__skill--verified"]
                        : styles["project-view__skill--unverified"]
                    }`}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles["project-view__text"]}>
                Навыки для проекта пока не добавлены.
              </p>
            )}
          </article>
        </div>

        <div className={styles["project-view__actions"]}>
          <Button type="button" variant="outline-dark" size="normal">
            Откликнуться
          </Button>
          <Button type="button" variant="outline-dark" size="normal">
            Сохранить проект
          </Button>
        </div>
      </div>
    </section>
  );
}
