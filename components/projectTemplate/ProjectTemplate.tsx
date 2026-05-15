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
import styles from "./ProjectTemplate.module.scss";

export type ProjectTemplateProps = {
  /** При наличии — данные и действия идут через projectsApi / skillApi. */
  projectId?: string;
  title?: string;
  githubUrl?: string;
};

const placeholderSkills = ["React", "TypeScript", "Node.js", "PostgreSQL"];
const availableSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Next.js",
  "Redux Toolkit",
];

export function ProjectTemplate({
  projectId = "",
  title = 'Проект "Имя автора"',
  githubUrl: demoGithubUrl = "https://github.com/coldsteeze/devfolio-frontend",
}: ProjectTemplateProps) {
  const isApiMode = Boolean(projectId);

  const { data: project, isLoading: isProjectLoading, error: projectError } =
    useGetProjectsByIdQuery(projectId, { skip: !isApiMode });

  const { data: projectSkillAttachments = [], refetch: refetchProjectSkills } =
    useGetProjectSkillsQuery(projectId, { skip: !isApiMode });

  const skillIdsFromApi = useMemo(
    () => projectSkillAttachments.map((a) => a.skillId).filter(Boolean),
    [projectSkillAttachments]
  );

  const skillIdsResolved = areLikelySkillIds(skillIdsFromApi);
  const { data: skillsFromCatalog } = useSkillsByIdsQuery(skillIdsFromApi, {
    skip: !isApiMode || !skillIdsResolved || skillIdsFromApi.length === 0,
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
    { skip: !isApiMode }
  );

  const { data: myProfile } = useGetMyProfileQuery(undefined, {
    skip: !isApiMode,
  });

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

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setShortDescription(project.shortDescription ?? "");
      setGithubUrl(project.githubUrl ?? "");
    }
  }, [project]);

  const projectSkillsResolved = useMemo(() => {
    if (!isApiMode) return [];
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
  }, [
    isApiMode,
    skillIdsResolved,
    skillsFromCatalog,
    projectSkillAttachments,
    skillIdsFromApi,
  ]);

  const selectableCatalogSkills = useMemo(() => {
    if (!isApiMode) return [];
    const attached = new Set(skillIdsFromApi);
    return catalogSkills.filter((s) => !attached.has(s.id));
  }, [isApiMode, catalogSkills, skillIdsFromApi]);

  const [mockSkills, setMockSkills] = useState<string[]>(placeholderSkills);
  /** Локальная «верификация» для демо без API (после кнопки все навыки считаются верифицированными). */
  const [mockSkillVerified, setMockSkillVerified] = useState<
    Record<string, boolean>
  >({});
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);

  const mockSelectableSkills = useMemo(
    () => availableSkills.filter((skill) => !mockSkills.includes(skill)),
    [mockSkills]
  );

  const handleRemoveMockSkill = useCallback((skill: string) => {
    setMockSkills((prev) => prev.filter((x) => x !== skill));
    setMockSkillVerified((prev) => {
      const next = { ...prev };
      delete next[skill];
      return next;
    });
  }, []);

  const handleMockVerifySkills = useCallback(() => {
    setMockSkillVerified((prev) => {
      const next = { ...prev };
      for (const s of mockSkills) {
        next[s] = true;
      }
      return next;
    });
  }, [mockSkills]);

  const skillChipClass = useCallback((verified: boolean) => {
    return `${styles["project-template__skill"]} ${
      verified
        ? styles["project-template__skill--verified"]
        : styles["project-template__skill--unverified"]
    }`;
  }, []);

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

  const chipTitle = isApiMode ? name || "Проект" : title;
  const authorName = myProfile
    ? `${myProfile.firstName} ${myProfile.lastName}`.trim() || myProfile.nickname
    : "Имя Фамилия";

  if (isApiMode) {
    if (isProjectLoading) {
      return (
        <section className={styles["project-template"]}>
          <p className={styles["project-template__status"]}>Загрузка проекта…</p>
        </section>
      );
    }

    if (projectError || !project) {
      return (
        <section className={styles["project-template"]}>
          <p className={styles["project-template__status"]}>
            Не удалось загрузить проект
          </p>
        </section>
      );
    }
  }

  return (
    <section className={styles["project-template"]}>
      <header className={styles["project-template__top"]}>
        <div className={styles["project-template__top-controls"]}>
          <button
            type="button"
            className={styles["project-template__icon-button"]}
            aria-label="Меню"
          >
            ☰
          </button>
          {isApiMode ? (
            <Link
              href={`/project/${projectId}`}
              className={styles["project-template__icon-button"]}
              aria-label="Назад"
            >
              ←
            </Link>
          ) : (
            <Link
              href="/projects"
              className={styles["project-template__icon-button"]}
              aria-label="К ленте проектов"
            >
              ←
            </Link>
          )}
          <span className={styles["project-template__project-chip"]}>
            {chipTitle}
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
              isApiMode && myProfile?.avatarURL
                ? {
                    backgroundImage: `url(${myProfile.avatarURL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <h2 className={styles["project-template__author-name"]}>
            {authorName}
          </h2>
          <div className={styles["project-template__author-actions"]}>
            <Button type="button" variant="outline-dark" size="normal">
              Написать исполнителю
            </Button>
            <Button type="button" variant="outline-dark" size="normal">
              Подписаться
            </Button>
          </div>
        </aside>

        <section className={styles["project-template__project"]}>
          <div className={styles["project-template__preview-wrap"]}>
            <button
              type="button"
              className={styles["project-template__arrow"]}
              aria-label="Предыдущий скриншот"
            >
              ‹
            </button>

            <div className={styles["project-template__preview"]}>
              <svg
                className={styles["project-template__preview-icon"]}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13 21.5C13 18.4624 15.4624 16 18.5 16H45.5C48.5376 16 51 18.4624 51 21.5V42.5C51 45.5376 48.5376 48 45.5 48H18.5C15.4624 48 13 45.5376 13 42.5V21.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M24 16L27.5 12H36.5L40 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2" />
                <circle cx="21" cy="24" r="2" fill="currentColor" />
              </svg>
            </div>

            <button
              type="button"
              className={styles["project-template__arrow"]}
              aria-label="Следующий скриншот"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            className={styles["project-template__favorite"]}
            aria-label="Добавить проект в избранное"
          >
            ☆
          </button>

          <Input
            variant="primary-light"
            className={styles["project-template__input"]}
            placeholder="Название проекта"
            value={isApiMode ? name : title}
            onChange={
              isApiMode ? (e) => setName(e.target.value) : undefined
            }
            readOnly={!isApiMode}
          />
          <Input
            variant="primary-light"
            className={styles["project-template__input"]}
            placeholder="Ссылка на GitHub"
            value={isApiMode ? githubUrl : demoGithubUrl}
            onChange={
              isApiMode ? (e) => setGithubUrl(e.target.value) : undefined
            }
            readOnly={!isApiMode}
          />

          <div className={styles["project-template__details"]}>
            {isApiMode ? (
              <>
                <textarea
                  className={styles["project-template__textarea"]}
                  placeholder="Краткое описание"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                />
                <textarea
                  className={styles["project-template__textarea"]}
                  placeholder="Описание проекта"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </>
            ) : (
              <textarea
                className={styles["project-template__textarea"]}
                placeholder="Описание проекта"
                readOnly
              />
            )}

            <div className={styles["project-template__skills-panel"]}>
              <div className={styles["project-template__skills-head"]}>
                <span className={styles["project-template__skills-title"]}>
                  Навыки
                </span>
                <div className={styles["project-template__skills-control"]}>
                  <button
                    type="button"
                    className={styles["project-template__add-skill-button"]}
                    onClick={() => setIsSkillsMenuOpen((prev) => !prev)}
                    aria-label="Добавить навык"
                    disabled={
                      isApiMode &&
                      !isCatalogFetching &&
                      catalogSkills.length === 0
                    }
                  >
                    +
                  </button>

                  {isSkillsMenuOpen && (
                    <div className={styles["project-template__skills-dropdown"]}>
                      {isApiMode ? (
                        selectableCatalogSkills.length > 0 ? (
                          selectableCatalogSkills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              className={styles["project-template__skills-option"]}
                              onClick={() => handleAddSkillFromCatalog(skill.id)}
                              disabled={isAddingSkill}
                            >
                              {skill.name}
                            </button>
                          ))
                        ) : (
                          <span className={styles["project-template__skills-empty"]}>
                            Нет доступных навыков для добавления
                          </span>
                        )
                      ) : mockSelectableSkills.length > 0 ? (
                        mockSelectableSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            className={styles["project-template__skills-option"]}
                            onClick={() => {
                              setMockSkills((prev) => [...prev, skill]);
                              setIsSkillsMenuOpen(false);
                            }}
                          >
                            {skill}
                          </button>
                        ))
                      ) : (
                        <span className={styles["project-template__skills-empty"]}>
                          Все навыки уже добавлены
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles["project-template__skills"]}>
                {isApiMode
                  ? projectSkillsResolved.map((s) =>
                      skillIdsResolved ? (
                        <button
                          key={s.id}
                          type="button"
                          className={skillChipClass(s.verified)}
                          onClick={() => void handleRemoveSkill(s.id)}
                          disabled={isDeletingSkill}
                          title="Нажмите, чтобы убрать навык"
                        >
                          {s.label} ×
                        </button>
                      ) : (
                        <span
                          key={s.id}
                          className={skillChipClass(s.verified)}
                        >
                          {s.label}
                        </span>
                      )
                    )
                  : mockSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        className={skillChipClass(
                          mockSkillVerified[skill] ?? false
                        )}
                        onClick={() => handleRemoveMockSkill(skill)}
                        title="Нажмите, чтобы убрать навык"
                      >
                        {skill} ×
                      </button>
                    ))}
              </div>

              <div className={styles["project-template__actions-row"]}>
                {isApiMode && (
                  <Button
                    type="button"
                    variant="outline-dark"
                    size="small"
                    className={styles["project-template__save-button"]}
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                  >
                    {isSaving ? "Сохранение…" : "Сохранить изменения"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline-dark"
                  size="small"
                  className={styles["project-template__verify-button"]}
                  onClick={
                    isApiMode
                      ? () => void handleVerifySkills()
                      : () => handleMockVerifySkills()
                  }
                  disabled={isApiMode ? isVerifying : false}
                >
                  {isApiMode && isVerifying
                    ? "Верификация…"
                    : "Верифицировать навыки"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
