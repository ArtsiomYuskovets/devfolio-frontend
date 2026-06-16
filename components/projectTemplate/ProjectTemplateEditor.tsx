"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import {
  useGetProjectsByIdQuery,
  useUpdateProjectMutation,
} from "@/stores/projects/projectsApi";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import { useProfileAvatarSrc } from "@/hooks/useProfileAvatarSrc";
import { pickUserId } from "@/lib/userId";
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

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
          <Input
            variant="primary-light"
            className={editorStyles["project-template-editor__input"]}
            placeholder="Название проекта"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            variant="primary-light"
            className={editorStyles["project-template-editor__input"]}
            placeholder="Ссылка на GitHub"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <ProjectTemplateEditorPhotos projectId={projectId} project={project} />

          <div className={styles["project-template__details"]}>
            <textarea
              className={editorStyles["project-template-editor__textarea"]}
              placeholder="Краткое описание"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
            />
            <textarea
              className={editorStyles["project-template-editor__textarea"]}
              placeholder="Описание проекта"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

            <div className={editorStyles["project-template-editor__actions"]}>
              <Button
                type="button"
                variant="outline-dark"
                size="small"
                onClick={() => void handleSave()}
                disabled={isSaving}
              >
                {isSaving ? "Сохранение…" : "Сохранить проект"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
