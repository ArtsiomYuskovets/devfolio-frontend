"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { useGetSkillsListQuery, useSkillsByIdsQuery } from "@/stores/skill/skillApi";
import {
  DEFAULT_PROJECT_LIST_SORT,
  PROJECT_LIST_SORT_OPTIONS,
  type ProjectListSort,
} from "@/lib/projectListSort";
import type { SkillCategory } from "@/types/types";
import styles from "./ProjectsFeedFilters.module.scss";

export type ProjectsFeedFiltersState = {
  name: string;
  skillIds: string[];
  categories: SkillCategory[];
  sort: ProjectListSort;
};

type ProjectsFeedFiltersProps = {
  applied: ProjectsFeedFiltersState;
  onApply: (next: ProjectsFeedFiltersState) => void;
  showCreateProject?: boolean;
  onCreateProject?: () => void;
};

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "LANGUAGE", label: "Языки" },
  { value: "FRAMEWORK", label: "Фреймворки" },
  { value: "TOOL", label: "Инструменты" },
  { value: "PLATFORM", label: "Платформы" },
];

const CATALOG_PAGE_SIZE = 50;

const EMPTY_FILTERS: ProjectsFeedFiltersState = {
  name: "",
  skillIds: [],
  categories: [],
  sort: DEFAULT_PROJECT_LIST_SORT,
};

function toggleValue<T>(current: T[], value: T): T[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

function filtersEqual(
  a: ProjectsFeedFiltersState,
  b: ProjectsFeedFiltersState
): boolean {
  return (
    a.name === b.name &&
    a.skillIds.join(",") === b.skillIds.join(",") &&
    a.categories.join(",") === b.categories.join(",") &&
    a.sort === b.sort
  );
}

export function ProjectsFeedFilters({
  applied,
  onApply,
  showCreateProject = false,
  onCreateProject,
}: ProjectsFeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectsFeedFiltersState>(applied);
  const [nameInput, setNameInput] = useState(applied.name);
  const [skillSearch, setSkillSearch] = useState("");
  const [debouncedSkillSearch, setDebouncedSkillSearch] = useState("");

  useEffect(() => {
    setDraft(applied);
    setNameInput(applied.name);
  }, [applied]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSkillSearch(skillSearch.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [skillSearch]);

  const { data: catalogSkills = [], isFetching: isCatalogLoading } =
    useGetSkillsListQuery(
      {
        search: debouncedSkillSearch,
        category: "",
        includeInactive: false,
        page: 0,
        size: CATALOG_PAGE_SIZE,
        sort: [],
      },
      { skip: !isOpen || !isSkillPickerOpen }
    );

  const draftSkillIds = useMemo(() => new Set(draft.skillIds), [draft.skillIds]);

  const { data: skillsByIds = [] } = useSkillsByIdsQuery(draft.skillIds, {
    skip: draft.skillIds.length === 0,
  });

  const selectedSkillLabels = useMemo(() => {
    const byId = new Map(skillsByIds.map((skill) => [skill.id, skill.name]));
    for (const skill of catalogSkills) {
      byId.set(skill.id, skill.name);
    }
    return draft.skillIds.map((id) => ({
      id,
      name: byId.get(id) ?? id.slice(0, 8),
    }));
  }, [catalogSkills, draft.skillIds, skillsByIds]);

  const hasActiveFilters =
    Boolean(applied.name.trim()) ||
    applied.skillIds.length > 0 ||
    applied.categories.length > 0 ||
    applied.sort !== DEFAULT_PROJECT_LIST_SORT;

  const hasPendingChanges =
    nameInput.trim() !== draft.name ||
    !filtersEqual({ ...draft, name: nameInput.trim() }, applied);

  const applyFilters = () => {
    const next = { ...draft, name: nameInput.trim() };
    onApply(next);
    setDraft(next);
    setNameInput(next.name);
    setIsOpen(false);
    setIsSkillPickerOpen(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };

  const handleToggleCategory = (category: SkillCategory) => {
    setDraft((prev) => ({
      ...prev,
      categories: toggleValue(prev.categories, category),
    }));
  };

  const handleToggleSkill = (skillId: string) => {
    const id = skillId.trim();
    if (!id) {
      return;
    }
    setDraft((prev) => ({
      ...prev,
      skillIds: toggleValue(prev.skillIds, id),
    }));
  };

  const handleRemoveSkill = (skillId: string) => {
    setDraft((prev) => ({
      ...prev,
      skillIds: prev.skillIds.filter((id) => id !== skillId),
    }));
  };

  const handleSortChange = (sort: ProjectListSort) => {
    setDraft((prev) => ({ ...prev, sort }));
  };

  const handleResetFilters = () => {
    setNameInput("");
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    setIsSkillPickerOpen(false);
  };

  return (
    <section className={styles["projects-feed-filters"]}>
      <div className={styles["projects-feed-filters__row"]}>
        <div className={styles["projects-feed-filters__actions"]}>
          {showCreateProject ? (
            <Button
              type="button"
              variant="outline-light"
              size="small"
              onClick={onCreateProject}
            >
              + Добавить проект
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline-light"
            size="small"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
          >
            Фильтры{hasActiveFilters ? " •" : ""}
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline-light"
              size="small"
              onClick={handleResetFilters}
            >
              Сбросить
            </Button>
          ) : null}
        </div>

        <div className={styles["projects-feed-filters__search"]}>
          <Input
            variant="outline-light"
            className={styles["projects-feed-filters__input"]}
            placeholder="Поиск по названию"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={handleNameKeyDown}
          />
          <button
            type="button"
            className={styles["projects-feed-filters__search-button"]}
            aria-label="Применить поиск"
            onClick={applyFilters}
          >
            ⌕
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className={styles["projects-feed-filters__panel"]}>
          <div className={styles["projects-feed-filters__panel-grid"]}>
            <div className={styles["projects-feed-filters__group"]}>
              <span className={styles["projects-feed-filters__label"]}>
                Сортировка
              </span>
              <div className={styles["projects-feed-filters__chip-row"]}>
                {PROJECT_LIST_SORT_OPTIONS.map((option) => {
                  const isActive = draft.sort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles["projects-feed-filters__chip"]} ${
                        isActive ? styles["projects-feed-filters__chip--active"] : ""
                      }`}
                      onClick={() => handleSortChange(option.value)}
                      aria-pressed={isActive}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles["projects-feed-filters__group"]}>
              <span className={styles["projects-feed-filters__label"]}>
                Категории
              </span>
              <div className={styles["projects-feed-filters__chip-row"]}>
                {SKILL_CATEGORIES.map((category) => {
                  const isActive = draft.categories.includes(category.value);
                  return (
                    <button
                      key={category.value}
                      type="button"
                      className={`${styles["projects-feed-filters__chip"]} ${
                        isActive ? styles["projects-feed-filters__chip--active"] : ""
                      }`}
                      onClick={() => handleToggleCategory(category.value)}
                      aria-pressed={isActive}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles["projects-feed-filters__group"]}>
            <div className={styles["projects-feed-filters__skills-head"]}>
              <span className={styles["projects-feed-filters__label"]}>
                Навыки
              </span>
              <Button
                type="button"
                variant="outline-light"
                size="normal"
                onClick={() => setIsSkillPickerOpen((open) => !open)}
                aria-expanded={isSkillPickerOpen}
              >
                {isSkillPickerOpen ? "Скрыть" : "Выбрать"}
              </Button>
            </div>

            {selectedSkillLabels.length > 0 ? (
              <div className={styles["projects-feed-filters__tags"]}>
                {selectedSkillLabels.map((skill) => (
                  <span key={skill.id} className={styles["projects-feed-filters__tag"]}>
                    {skill.name}
                    <button
                      type="button"
                      className={styles["projects-feed-filters__tag-remove"]}
                      aria-label={`Убрать ${skill.name}`}
                      onClick={() => handleRemoveSkill(skill.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {isSkillPickerOpen ? (
              <div className={styles["projects-feed-filters__skills-picker"]}>
                <Input
                  variant="outline-light"
                  className={styles["projects-feed-filters__input"]}
                  placeholder="Поиск навыка"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
                {isCatalogLoading ? (
                  <p className={styles["projects-feed-filters__hint"]}>
                    Загрузка…
                  </p>
                ) : catalogSkills.length > 0 ? (
                  <ul className={styles["projects-feed-filters__skills-list"]}>
                    {catalogSkills.map((skill) => {
                      const id = skill.id.trim();
                      if (!id) {
                        return null;
                      }
                      const isSelected = draftSkillIds.has(id);
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            className={`${styles["projects-feed-filters__skill-option"]} ${
                              isSelected
                                ? styles["projects-feed-filters__skill-option--active"]
                                : ""
                            }`}
                            onClick={() => handleToggleSkill(id)}
                            aria-pressed={isSelected}
                          >
                            {skill.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={styles["projects-feed-filters__hint"]}>
                    Навыки не найдены
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className={styles["projects-feed-filters__panel-actions"]}>
            <Button
              type="button"
              variant="outline-light"
              size="normal"
              onClick={applyFilters}
              disabled={!hasPendingChanges}
            >
              Применить
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
