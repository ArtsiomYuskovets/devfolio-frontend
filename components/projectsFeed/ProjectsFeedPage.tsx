"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { ProfileProjectCard } from "@/components/profile/ProfileProjectCard";
import {
  ProjectsFeedFilters,
  type ProjectsFeedFiltersState,
} from "./ProjectsFeedFilters";
import { useMyUserType } from "@/hooks/useMyUserType";
import { useGetProjectsListQuery } from "@/stores/projects/projectsApi";
import { pickProjectId } from "@/lib/projectId";
import { pickUserId } from "@/lib/userId";
import { projectCardDescription } from "@/lib/projectDisplay";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import styles from "./ProjectsFeedPage.module.scss";

const FEED_PAGE_SIZE = 10;

const INITIAL_FILTERS: ProjectsFeedFiltersState = {
  name: "",
  skillIds: [],
  categories: [],
};

export function ProjectsFeedPage() {
  const router = useRouter();
  const { isJobSeeker } = useMyUserType();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ProjectsFeedFiltersState>(INITIAL_FILTERS);

  const filtersKey = `${filters.name}|${filters.skillIds.join(",")}|${filters.categories.join(",")}`;

  useEffect(() => {
    setPage(0);
  }, [filtersKey]);

  const {
    data: projects = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProjectsListQuery({
    page,
    size: FEED_PAGE_SIZE,
    sort: [],
    name: filters.name || undefined,
    skillIds: filters.skillIds.length ? filters.skillIds : undefined,
    categories: filters.categories.length ? filters.categories : undefined,
  });

  const canGoPrev = page > 0;
  const canGoNext = projects.length === FEED_PAGE_SIZE;
  const hasActiveFilters =
    Boolean(filters.name.trim()) ||
    filters.skillIds.length > 0 ||
    filters.categories.length > 0;
  const isListLoading = isLoading || isFetching;

  return (
    <section className={styles["projects-feed"]}>
      <header className={styles["projects-feed__header"]}>
        <div className={styles["projects-feed__header-left"]}>
          <span className={styles["projects-feed__chip"]}>Лента проектов</span>
        </div>

        <Link href="/projects" className={styles["projects-feed__brand"]}>
          Devfolio
        </Link>
      </header>

      <div className={styles["projects-feed__content"]}>
        <ProjectsFeedFilters
          value={filters}
          onChange={setFilters}
          showCreateProject={isJobSeeker}
          onCreateProject={() => router.push("/projects/new")}
        />

        {isListLoading ? (
          <p className={styles["projects-feed__status"]}>Загрузка проектов…</p>
        ) : isError ? (
          <p className={styles["projects-feed__status"]} role="alert">
            Не удалось загрузить ленту.
            {error && typeof error === "object" && "status" in error
              ? ` (${String((error as { status?: unknown }).status)})`
              : ""}
          </p>
        ) : projects.length === 0 ? (
          <p className={styles["projects-feed__status"]}>
            {hasActiveFilters
              ? "По выбранным фильтрам проектов не найдено."
              : "Пока нет проектов."}
          </p>
        ) : (
          <>
            <section className={styles["projects-feed__list"]}>
              {projects.map((project) => {
                const id =
                  pickProjectId(project) ?? project.projectId?.trim() ?? "";
                if (!id) {
                  return null;
                }
                return (
                  <Link
                    key={id}
                    href={`/project/${id}`}
                    className={styles["projects-feed__project-link"]}
                  >
                    <ProfileProjectCard
                      title={project.name || "Без названия"}
                      description={projectCardDescription(project)}
                      likes={project.likesCount}
                      views={project.viewersCount}
                      previewSrc={projectCardPreviewSrc(project)}
                      projectId={id}
                      ownerUserId={pickUserId(project) ?? project.userId}
                    />
                  </Link>
                );
              })}
            </section>
            <div className={styles["projects-feed__pagination"]}>
              <Button
                type="button"
                variant="outline-light"
                size="small"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canGoPrev || isListLoading}
              >
                Назад
              </Button>
              <span className={styles["projects-feed__page-label"]}>
                Страница {page + 1}
              </span>
              <Button
                type="button"
                variant="outline-light"
                size="small"
                onClick={() => setPage((p) => p + 1)}
                disabled={!canGoNext || isListLoading}
              >
                Вперёд
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
