"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import {
  useGetSkillsListQuery,
  useSkillsByIdsQuery,
} from "@/stores/skill/skillApi";
import type { Skill, SkillCategory } from "@/types/types";
import styles from "./ProjectsFeedFilters.module.scss";

export type ProjectsFeedFiltersState = {
  name: string;
  skillIds: string[];
  categories: SkillCategory[];
};

type ProjectsFeedFiltersProps = {
  value: ProjectsFeedFiltersState;
  onChange: (next: ProjectsFeedFiltersState) => void;
  showCreateProject?: boolean;
  onCreateProject?: () => void;
};

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "LANGUAGE", label: "Языки" },
  { value: "FRAMEWORK", label: "Фреймворки" },
  { value: "TOOL", label: "Инструменты" },
  { value: "PLATFORM", label: "Платформы" },
];

const CATALOG_PAGE_SIZE = 100;

function toggleCategory(
  current: SkillCategory[],
  category: SkillCategory
): SkillCategory[] {
  return current.includes(category)
    ? current.filter((item) => item !== category)
    : [...current, category];
}

export function ProjectsFeedFilters({
  value,
  onChange,
  showCreateProject = false,
  onCreateProject,
}: ProjectsFeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState(value.name);
  const [skillSearch, setSkillSearch] = useState("");
  const [debouncedSkillSearch, setDebouncedSkillSearch] = useState("");
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);

  useEffect(() => {
    setNameInput(value.name);
  }, [value.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = nameInput.trim();
      if (trimmed !== value.name) {
        onChange({
          name: trimmed,
          skillIds: value.skillIds,
          categories: value.categories,
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput, value.name, value.skillIds, value.categories, onChange]);

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
      { skip: !isSkillPickerOpen }
    );

  const selectedSkillIds = useMemo(
    () => new Set(value.skillIds),
    [value.skillIds]
  );

  const selectableSkills = useMemo(
    () =>
      catalogSkills.filter(
        (skill) => skill.id.trim() && !selectedSkillIds.has(skill.id)
      ),
    [catalogSkills, selectedSkillIds]
  );

  const { data: skillsByIds = [] } = useSkillsByIdsQuery(value.skillIds, {
    skip: value.skillIds.length === 0,
  });

  const selectedSkillLabels = useMemo(() => {
    const byId = new Map<string, Skill>();
    for (const skill of skillsByIds) {
      byId.set(skill.id, skill);
    }
    return value.skillIds.map((id) => ({
      id,
      name: byId.get(id)?.name ?? id,
    }));
  }, [skillsByIds, value.skillIds]);

  const hasActiveFilters =
    Boolean(value.name.trim()) ||
    value.skillIds.length > 0 ||
    value.categories.length > 0;

  const applyNameSearch = () => {
    onChange({ ...value, name: nameInput.trim() });
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyNameSearch();
    }
  };

  const handleToggleCategory = (category: SkillCategory) => {
    onChange({
      ...value,
      categories: toggleCategory(value.categories, category),
    });
  };

  const handleAddSkill = (skill: Skill) => {
    const id = skill.id.trim();
    if (!id || selectedSkillIds.has(id)) {
      return;
    }
    onChange({
      ...value,
      skillIds: [...value.skillIds, id],
    });
    setSkillSearch("");
    setIsSkillPickerOpen(false);
  };

  const handleRemoveSkill = (skillId: string) => {
    onChange({
      ...value,
      skillIds: value.skillIds.filter((id) => id !== skillId),
    });
  };

  const handleResetFilters = () => {
    setNameInput("");
    onChange({ name: "", skillIds: [], categories: [] });
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
            aria-label="Искать проекты"
            onClick={applyNameSearch}
          >
            ⌕
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className={styles["projects-feed-filters__panel"]}>
          <div className={styles["projects-feed-filters__group"]}>
            <span className={styles["projects-feed-filters__label"]}>
              Категории навыков
            </span>
            <div className={styles["projects-feed-filters__chips"]}>
              {SKILL_CATEGORIES.map((category) => {
                const isActive = value.categories.includes(category.value);
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

          <div className={styles["projects-feed-filters__group"]}>
            <span className={styles["projects-feed-filters__label"]}>Навыки</span>
            {selectedSkillLabels.length > 0 ? (
              <div className={styles["projects-feed-filters__selected"]}>
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
            ) : (
              <p className={styles["projects-feed-filters__hint"]}>
                Выберите навыки для фильтрации проектов
              </p>
            )}

            <div className={styles["projects-feed-filters__skill-picker"]}>
              <Button
                type="button"
                variant="outline-light"
                size="small"
                onClick={() => setIsSkillPickerOpen((open) => !open)}
                aria-expanded={isSkillPickerOpen}
              >
                {isSkillPickerOpen ? "Скрыть каталог" : "Добавить навык"}
              </Button>

              {isSkillPickerOpen ? (
                <div className={styles["projects-feed-filters__skill-dropdown"]}>
                  <Input
                    variant="outline-light"
                    className={styles["projects-feed-filters__input"]}
                    placeholder="Поиск в каталоге навыков"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                  {isCatalogLoading ? (
                    <p className={styles["projects-feed-filters__hint"]}>
                      Загрузка каталога…
                    </p>
                  ) : selectableSkills.length > 0 ? (
                    <ul className={styles["projects-feed-filters__skill-list"]}>
                      {selectableSkills.map((skill) => (
                        <li key={skill.id}>
                          <button
                            type="button"
                            className={styles["projects-feed-filters__skill-option"]}
                            onClick={() => handleAddSkill(skill)}
                          >
                            <span>{skill.name}</span>
                            <span className={styles["projects-feed-filters__skill-meta"]}>
                              {skill.category}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles["projects-feed-filters__hint"]}>
                      Навыки не найдены
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
