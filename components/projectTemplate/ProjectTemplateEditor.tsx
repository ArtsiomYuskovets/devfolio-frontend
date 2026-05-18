"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { areLikelySkillIds } from "@/lib/skillDisplay";
import {
  useAddProjectSkillMutation,
  useDeleteProjectSkillMutation,
  useGetProjectSkillsQuery,
  useGetProjectsByIdQuery,
  useUpdateProjectMutation,
  useVerifyProjectSkillsMutation,
} from "@/stores/projects/projectsApi";
import { useGetSkillsListQuery, useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import { useGetMyProfileQuery } from "@/stores/user/userApi";
import { pickUserId } from "@/lib/userId";
import styles from "./ProjectTemplate.module.scss";
import editorStyles from "./ProjectTemplateEditor.module.scss";

export type ProjectTemplateEditorProps = {
  projectId: string;
};

export function ProjectTemplateEditor({ projectId }: ProjectTemplateEditorProps) {
  const { data: project, isLoading, error } = useGetProjectsByIdQuery(projectId, {
    skip: !projectId,
  });

  const { data: projectSkillAttachments = [], refetch: refetchProjectSkills } =
    useGetProjectSkillsQuery(projectId, { skip: !projectId });

  const skillIdsFromApi = useMemo(
    () => projectSkillAttachments.map((a) => a.skillId).filter(Boolean),
    [projectSkillAttachments]
  );

  const skillIdsResolved = areLikelySkillIds(skillIdsFromApi);
  const { data: skillsFromCatalog } = useSkillsByIdsQuery(skillIdsFromApi, {
    skip: !projectId || !skillIdsResolved || skillIdsFromApi.length === 0,
  });

  const { data: catalogSkills = [], isFetching: isCatalogFetching } =
    useGetSkillsListQuery(
      {
        search: "",
        category: "",
        includeInactive: false,
        page: 0,
        size: 200,
        sort: [],
      },
      { skip: !projectId }
    );

  const { data: myProfile, isLoading: isProfileLoading } = useGetMyProfileQuery();

  const ownerId = project ? pickUserId(project) ?? project.userId : undefined;
  const myId = pickUserId(myProfile) ?? myProfile?.userId;
  const isOwner = Boolean(myId && ownerId && myId === ownerId);

  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [addProjectSkill, { isLoading: isAddingSkill }] =
    useAddProjectSkillMutation();
  const [deleteProjectSkill, { isLoading: isDeletingSkill }] =
    useDeleteProjectSkillMutation();
  const [verifyProjectSkills, { isLoading: isVerifying }] =
    useVerifyProjectSkillsMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name ?? "");
      setDescription(project.description ?? "");
      setShortDescription(project.shortDescription ?? "");
      setGithubUrl(project.githubUrl ?? "");
    }
  }, [project]);

  const projectSkillsResolved = useMemo(() => {
    const idToVerified = new Map(
      projectSkillAttachments.map((a) => [a.skillId, a.verified])
    );
    if (skillIdsResolved && skillsFromCatalog?.length) {
      return skillsFromCatalog.map((s) => ({
        id: s.id,
        label: s.name,
        verified: idToVerified.get(s.id) ?? false,
      }));
    }
    return skillIdsFromApi.map((id) => ({
      id,
      label: id,
      verified: idToVerified.get(id) ?? false,
    }));
  }, [skillIdsResolved, skillsFromCatalog, projectSkillAttachments, skillIdsFromApi]);

  const catalogSkillsList = useMemo(
    () => (Array.isArray(catalogSkills) ? catalogSkills : []),
    [catalogSkills]
  );

  const selectableCatalogSkills = useMemo(() => {
    const attached = new Set(skillIdsFromApi);
    return catalogSkillsList.filter((s) => !attached.has(s.id));
  }, [catalogSkillsList, skillIdsFromApi]);

  const skillChipClass = useCallback(
    (verified: boolean) =>
      `${styles["project-template__skill"]} ${
        verified
          ? styles["project-template__skill--verified"]
          : styles["project-template__skill--unverified"]
      }`,
    []
  );

  const handleSave = useCallback(async () => {
    if (!project) return;
    await updateProject({
      ...project,
      name,
      description,
      shortDescription,
      githubUrl,
    }).unwrap();
  }, [project, updateProject, name, description, shortDescription, githubUrl]);

  const handleAddSkillFromCatalog = useCallback(
    async (skillId: string) => {
      await addProjectSkill({ projectId, skillId }).unwrap();
      setIsSkillsMenuOpen(false);
      refetchProjectSkills();
    },
    [addProjectSkill, projectId, refetchProjectSkills]
  );

  const handleRemoveSkill = useCallback(
    async (skillId: string) => {
      await deleteProjectSkill({ projectId, skillId }).unwrap();
      refetchProjectSkills();
    },
    [deleteProjectSkill, projectId, refetchProjectSkills]
  );

  const handleVerifySkills = useCallback(async () => {
    await verifyProjectSkills(projectId).unwrap();
    refetchProjectSkills();
  }, [verifyProjectSkills, projectId, refetchProjectSkills]);

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
              myProfile?.avatarURL
                ? {
                    backgroundImage: `url(${myProfile.avatarURL})`,
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

            <div className={editorStyles["project-template-editor__skills"]}>
              <div className={styles["project-template__skills-head"]}>
                <span className={styles["project-template__skills-title"]}>
                  Навыки
                </span>
                <div className={styles["project-template__skills-control"]}>
                  <button
                    type="button"
                    className={styles["project-template__add-skill-button"]}
                    onClick={() => setIsSkillsMenuOpen((p) => !p)}
                    aria-label="Добавить навык"
                    disabled={
                      !isCatalogFetching && catalogSkillsList.length === 0
                    }
                  >
                    +
                  </button>
                  {isSkillsMenuOpen ? (
                    <div className={styles["project-template__skills-dropdown"]}>
                      {selectableCatalogSkills.length > 0 ? (
                        selectableCatalogSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            className={styles["project-template__skills-option"]}
                            onClick={() => void handleAddSkillFromCatalog(skill.id)}
                            disabled={isAddingSkill}
                          >
                            {skill.name}
                          </button>
                        ))
                      ) : (
                        <span className={styles["project-template__skills-empty"]}>
                          Нет доступных навыков
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles["project-template__skills"]}>
                {projectSkillsResolved.map((s) =>
                  skillIdsResolved ? (
                    <button
                      key={s.id}
                      type="button"
                      className={skillChipClass(s.verified)}
                      onClick={() => void handleRemoveSkill(s.id)}
                      disabled={isDeletingSkill}
                    >
                      {s.label} ×
                    </button>
                  ) : (
                    <span key={s.id} className={skillChipClass(s.verified)}>
                      {s.label}
                    </span>
                  )
                )}
              </div>

              <div className={editorStyles["project-template-editor__actions"]}>
                <Button
                  type="button"
                  variant="outline-dark"
                  size="small"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? "Сохранение…" : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="outline-dark"
                  size="small"
                  onClick={() => void handleVerifySkills()}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Верификация…" : "Верифицировать навыки"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
