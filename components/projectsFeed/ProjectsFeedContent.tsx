"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProjectsFeedFilters,
  type ProjectsFeedFiltersState,
} from "./ProjectsFeedFilters";
import { DEFAULT_PROJECT_LIST_SORT } from "@/lib/projectListSort";
import { ProjectsFeedList } from "./ProjectsFeedList";
import { useMyUserType } from "@/hooks/useMyUserType";
import styles from "./ProjectsFeedPage.module.scss";

const INITIAL_FILTERS: ProjectsFeedFiltersState = {
  name: "",
  skillIds: [],
  categories: [],
  sort: DEFAULT_PROJECT_LIST_SORT,
};

export function ProjectsFeedContent() {
  const router = useRouter();
  const { isJobSeeker } = useMyUserType();
  const [appliedFilters, setAppliedFilters] =
    useState<ProjectsFeedFiltersState>(INITIAL_FILTERS);

  return (
    <div className={styles["projects-feed__content"]}>
      <ProjectsFeedFilters
        applied={appliedFilters}
        onApply={setAppliedFilters}
        showCreateProject={isJobSeeker}
        onCreateProject={() => router.push("/projects/new")}
      />
      <ProjectsFeedList filters={appliedFilters} />
    </div>
  );
}
