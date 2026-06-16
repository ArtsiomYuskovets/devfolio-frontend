"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { ProfileProjectCard } from "@/components/profile/ProfileProjectCard";
import { useGetProjectsListQuery } from "@/stores/projects/projectsApi";
import { pickProjectId } from "@/lib/projectId";
import { pickUserId } from "@/lib/userId";
import { projectCardDescription } from "@/lib/projectDisplay";
import { projectLikesCount, projectViewsCount } from "@/lib/projectEngagement";
import { projectCardPreviewSrc } from "@/lib/projectImage";
import type { ProjectsFeedFiltersState } from "./ProjectsFeedFilters";
import { DEFAULT_PROJECT_LIST_SORT } from "@/lib/projectListSort";
import styles from "./ProjectsFeedPage.module.scss";

const FEED_PAGE_SIZE = 10;

type ProjectsFeedListProps = {
  filters: ProjectsFeedFiltersState;
};

export function ProjectsFeedList({ filters }: ProjectsFeedListProps) {
  const [page, setPage] = useState(0);

  const filtersKey = `${filters.name}|${filters.skillIds.join(",")}|${filters.categories.join(",")}|${filters.sort}`;

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
    sort: filters.sort,
    name: filters.name || undefined,
    skillIds: filters.skillIds.length ? filters.skillIds : undefined,
    categories: filters.categories.length ? filters.categories : undefined,
  });

  useEffect(() => {
    if (!isLoading && !isFetching && page > 0 && projects.length === 0) {
      setPage((currentPage) => Math.max(0, currentPage - 1));
    }
  }, [isLoading, isFetching, page, projects.length]);

  const canGoPrev = page > 0;
  const canGoNext = projects.length === FEED_PAGE_SIZE;
  const isInitialLoading = isLoading && projects.length === 0;
  const hasActiveFilters =
    Boolean(filters.name.trim()) ||
    filters.skillIds.length > 0 ||
    filters.categories.length > 0 ||
    filters.sort !== DEFAULT_PROJECT_LIST_SORT;

  if (isInitialLoading) {
    return (
      <p className={styles["projects-feed__status"]}>Загрузка проектов…</p>
    );
  }

  if (isError && projects.length === 0) {
    return (
      <p className={styles["projects-feed__status"]} role="alert">
        Не удалось загрузить ленту.
        {error && typeof error === "object" && "status" in error
          ? ` (${String((error as { status?: unknown }).status)})`
          : ""}
      </p>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <p className={styles["projects-feed__status"]}>
          {hasActiveFilters
            ? "По выбранным фильтрам проектов не найдено."
            : "Пока нет проектов."}
        </p>
        {canGoPrev ? (
          <div className={styles["projects-feed__pagination"]}>
            <Button
              type="button"
              variant="outline-light"
              size="small"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isFetching}
            >
              Назад
            </Button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <section
        className={`${styles["projects-feed__list"]} ${
          isFetching ? styles["projects-feed__list--fetching"] : ""
        }`}
        aria-busy={isFetching}
      >
        {projects.map((project) => {
          const id = pickProjectId(project) ?? project.projectId?.trim() ?? "";
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
                likes={projectLikesCount(project)}
                views={projectViewsCount(project)}
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
          disabled={!canGoPrev || isFetching}
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
          disabled={!canGoNext || isFetching}
        >
          Вперёд
        </Button>
      </div>
    </>
  );
}
