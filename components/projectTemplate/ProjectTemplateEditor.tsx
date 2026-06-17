"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input/Input";
import { TextareaField } from "@/components/ui/textarea-field/TextareaField";
import { Button } from "@/components/ui/button/Button";
import {
  useDeleteProjectMutation,
  useGetProjectsByIdQuery,
  useUpdateProjectMutation,
} from "@/stores/projects/projectsApi";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import { useProfileAvatarSrc } from "@/hooks/useProfileAvatarSrc";
import { pickUserId } from "@/lib/userId";
import { validateProjectForm } from "@/lib/formValidation";
import { ProjectTemplateEditorSkills } from "./ProjectTemplateEditorSkills";
import { ProjectTemplateEditorPhotos } from "./ProjectTemplateEditorPhotos";
import styles from "./ProjectTemplate.module.scss";
import editorStyles from "./ProjectTemplateEditor.module.scss";

export type ProjectTemplateEditorProps = {
  projectId: string;
};

export function ProjectTemplateEditor({ projectId }: ProjectTemplateEditorProps) {
  const router = useRouter();
  const { data: project, isLoading, error } = useGetProjectsByIdQuery(projectId, {
    skip: !projectId,
  });

  const { data: myProfile, isLoading: isProfileLoading } = useGetMyProfileQuery();

  const ownerId = project ? pickUserId(project) ?? project.userId : undefined;
  const myId = pickUserId(myProfile) ?? myProfile?.userId;
  const myAvatarSrc = useProfileAvatarSrc(myProfile?.avatarURL, myId);
  const isOwner = Boolean(myId && ownerId && myId === ownerId);

  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name ?? "");
      setDescription(project.description ?? "");
      setShortDescription(project.shortDescription ?? "");
      setGithubUrl(project.githubUrl ?? "");
    }
  }, [project]);

  const handleSave = useCallback(async () => {
    if (!project) {
      return;
    }
    setSaveError(null);

    const validationErrors = validateProjectForm({ name, githubUrl });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    setFieldErrors({});

    try {
      await updateProject({
        ...project,
        name,
        description,
        shortDescription,
        githubUrl,
      }).unwrap();
      router.push(`/project/${projectId}`);
    } catch {
      setSaveError("Не удалось сохранить проект");
    }
  }, [project, projectId, router, updateProject, name, description, shortDescription, githubUrl]);

  const handleDelete = useCallback(async () => {
    if (!project) {
      return;
    }

    const projectTitle = name.trim() || project.name?.trim() || "без названия";
    const confirmed = window.confirm(
      `Удалить проект «${projectTitle}»? Это действие нельзя отменить.`
    );
    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteProject(projectId).unwrap();
      router.replace("/projects");
    } catch {
      setDeleteError("Не удалось удалить проект");
    }
  }, [deleteProject, name, project, projectId, router]);

  const authorName = myProfile
    ? `${myProfile.firstName} ${myProfile.lastName}`.trim() || myProfile.nickname
    : "Автор";

  if (!projectId) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>Укажите id проекта</p>
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

  if (error || !project) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>
          Не удалось загрузить проект
        </p>
      </section>
    );
  }

  if (!isProfileLoading && !isOwner) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>
          Редактирование доступно только автору проекта.
        </p>
        <Link
          href={`/project/${projectId}`}
          className={styles["project-template__edit-link"]}
        >
          К просмотру проекта
        </Link>
      </section>
    );
  }

  return (
    <section
      className={`${styles["project-template"]} ${editorStyles["project-template-editor"]}`}
    >
      <header className={styles["project-template__top"]}>
        <div className={styles["project-template__top-controls"]}>
          <Link
            href={`/project/${projectId}`}
            className={styles["project-template__icon-button"]}
            aria-label="К просмотру"
          >
            ←
          </Link>
          <span className={styles["project-template__project-chip"]}>
            Редактирование
          </span>
        </div>
        <Link href="/projects" className={styles["project-template__brand"]}>
          Devfolio
        </Link>
      </header>

      <div className={styles["project-template__main"]}>
        <aside className={styles["project-template__author"]}>
          <div
            className={styles["project-template__avatar"]}
            style={
              myAvatarSrc
                ? {
                    backgroundImage: `url(${myAvatarSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <h2 className={styles["project-template__author-name"]}>{authorName}</h2>
        </aside>

        <section className={styles["project-template__project"]}>
          <div className={editorStyles["project-template-editor__fields"]}>
            <Input
              variant="outline-light"
              className={editorStyles["project-template-editor__input"]}
              label="Название проекта"
              requiredMark
              placeholder="Название проекта"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }
              }}
              error={fieldErrors.name}
            />
            <Input
              variant="outline-light"
              className={editorStyles["project-template-editor__input"]}
              label="Ссылка на GitHub"
              requiredMark
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                if (fieldErrors.githubUrl) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.githubUrl;
                    return next;
                  });
                }
              }}
              error={fieldErrors.githubUrl}
            />
          </div>

          <ProjectTemplateEditorPhotos projectId={projectId} project={project} />

          <div className={styles["project-template__details"]}>
            <h3 className={editorStyles["project-template-editor__section-title"]}>
              Описание
            </h3>
            <TextareaField
              className={editorStyles["project-template-editor__description-field"]}
              label="Краткое описание"
              placeholder="Одна–две строки для карточек и списков"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
            />
            <TextareaField
              className={editorStyles["project-template-editor__description-field"]}
              label="Полное описание"
              placeholder="Подробное описание проекта, технологии и особенности"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />

            <ProjectTemplateEditorSkills projectId={projectId} />

            {saveError ? (
              <p
                className={editorStyles["project-template-editor__skills-error"]}
                role="alert"
              >
                {saveError}
              </p>
            ) : null}

            {deleteError ? (
              <p
                className={editorStyles["project-template-editor__skills-error"]}
                role="alert"
              >
                {deleteError}
              </p>
            ) : null}

            <div className={editorStyles["project-template-editor__actions"]}>
              <Button
                type="button"
                variant="outline-dark"
                size="small"
                onClick={() => void handleSave()}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? "Сохранение…" : "Сохранить проект"}
              </Button>
              <Button
                type="button"
                variant="outline-light"
                size="small"
                className={editorStyles["project-template-editor__delete-button"]}
                onClick={() => void handleDelete()}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? "Удаление…" : "Удалить проект"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
