"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { formatSkillCategoryLabel } from "@/lib/skillCategory";
import { useProjectEditorSkills } from "./hooks/useProjectEditorSkills";
import styles from "./ProjectTemplate.module.scss";
import editorStyles from "./ProjectTemplateEditor.module.scss";

type ProjectTemplateEditorSkillsProps = {
  projectId: string;
};

export function ProjectTemplateEditorSkills({
  projectId,
}: ProjectTemplateEditorSkillsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    skillSearch,
    setSkillSearch,
    attachedSkills,
    selectableCatalogSkills,
    catalogTotal,
    isProjectSkillsLoading,
    isProjectSkillsError,
    isCatalogBusy,
    isCatalogError,
    refetchCatalog,
    isCatalogNamesLoading,
    isAdding,
    isRemoving,
    isVerifying,
    verifiedCount,
    skillsError,
    addSkill,
    removeSkill,
    verifySkills,
    debouncedSearch,
  } = useProjectEditorSkills(projectId);

  useEffect(() => {
    if (isMenuOpen) {
      void refetchCatalog();
    }
  }, [isMenuOpen, refetchCatalog]);

  const skillChipClass = (verified: boolean) =>
    `${styles["project-template__skill"]} ${
      verified
        ? styles["project-template__skill--verified"]
        : styles["project-template__skill--unverified"]
    }`;

  return (
    <div className={editorStyles["project-template-editor__skills"]}>
      <div className={styles["project-template__skills-head"]}>
        <div>
          <span className={styles["project-template__skills-title"]}>Навыки</span>
          {attachedSkills.length > 0 ? (
            <p className={editorStyles["project-template-editor__skills-meta"]}>
              Верифицировано: {verifiedCount} из {attachedSkills.length}
            </p>
          ) : null}
        </div>
        <div className={styles["project-template__skills-control"]}>
          <button
            type="button"
            className={styles["project-template__add-skill-button"]}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Добавить навык из каталога"
            aria-expanded={isMenuOpen}
          >
            +
          </button>
          {isMenuOpen ? (
            <div
              className={`${styles["project-template__skills-dropdown"]} ${editorStyles["project-template-editor__skills-dropdown"]}`}
              role="listbox"
            >
              <Input
                variant="primary-light"
                className={editorStyles["project-template-editor__skill-search"]}
                placeholder="Поиск в каталоге навыков"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
              {isCatalogBusy ? (
                <span className={styles["project-template__skills-empty"]}>
                  Загрузка каталога…
                </span>
              ) : isCatalogError ? (
                <span className={styles["project-template__skills-empty"]}>
                  Не удалось загрузить каталог
                </span>
              ) : selectableCatalogSkills.length > 0 ? (
                selectableCatalogSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    className={styles["project-template__skills-option"]}
                    onClick={() => {
                      void addSkill(skill.id);
                      setIsMenuOpen(false);
                      setSkillSearch("");
                    }}
                    disabled={isAdding}
                  >
                    <span>{skill.name}</span>
                    {skill.category ? (
                      <span
                        className={
                          editorStyles["project-template-editor__skill-category"]
                        }
                      >
                        {formatSkillCategoryLabel(skill.category)}
                      </span>
                    ) : null}
                  </button>
                ))
              ) : (
                <span className={styles["project-template__skills-empty"]}>
                  {catalogTotal === 0
                    ? debouncedSearch
                      ? "Ничего не найдено"
                      : "Каталог навыков пуст"
                    : debouncedSearch
                      ? "Ничего не найдено"
                      : "Все навыки из каталога уже добавлены"}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {skillsError ? (
        <p className={editorStyles["project-template-editor__skills-error"]} role="alert">
          {skillsError}
        </p>
      ) : null}

      {isVerifying ? (
        <p className={editorStyles["project-template-editor__skills-meta"]}>
          Ожидание результата верификации…
        </p>
      ) : null}

      {isProjectSkillsLoading || isCatalogNamesLoading ? (
        <p className={editorStyles["project-template-editor__skills-meta"]}>
          Загрузка навыков проекта…
        </p>
      ) : isProjectSkillsError ? (
        <p className={editorStyles["project-template-editor__skills-error"]} role="alert">
          Не удалось загрузить навыки проекта
        </p>
      ) : attachedSkills.length === 0 ? (
        <p className={editorStyles["project-template-editor__skills-meta"]}>
          Добавьте навыки из каталога (+). После сохранения проекта можно запросить
          верификацию.
        </p>
      ) : (
        <div className={styles["project-template__skills"]}>
          {attachedSkills.map((skill) => (
            <button
              key={skill.skillId}
              type="button"
              className={skillChipClass(skill.verified)}
              onClick={() => void removeSkill(skill.skillId)}
              disabled={isRemoving}
              title={
                skill.verified
                  ? "Верифицирован — нажмите, чтобы удалить"
                  : "Не верифицирован — нажмите, чтобы удалить"
              }
            >
              {skill.name}
              {skill.category ? ` · ${formatSkillCategoryLabel(skill.category)}` : ""} ×
            </button>
          ))}
        </div>
      )}

      <div className={editorStyles["project-template-editor__verify-row"]}>
        <button
          type="button"
          className={editorStyles["project-template-editor__verify-button"]}
          onClick={() => void verifySkills()}
          disabled={isVerifying || attachedSkills.length === 0}
        >
          {isVerifying ? "Верификация…" : "Верифицировать навыки"}
        </button>
        <span className={editorStyles["project-template-editor__skills-hint"]}>
          Запускает проверку навыков, привязанных к этому проекту
        </span>
      </div>
    </div>
  );
}
