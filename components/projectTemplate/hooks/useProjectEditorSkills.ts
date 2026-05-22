"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveSkillDisplayName } from "@/lib/normalizeProjectSkills";
import {
  useAddProjectSkillMutation,
  useDeleteProjectSkillMutation,
  useGetProjectSkillsQuery,
  useVerifyProjectSkillsMutation,
} from "@/stores/projects/projectsApi";
import type { Skill } from "@/types/types";
import {
  useGetSkillsListQuery,
  useSkillsByIdsQuery,
} from "@/stores/skill/skillApi";

const CATALOG_PAGE_SIZE = 200;

function catalogSkillId(skill: Skill): string {
  return skill.id.trim();
}

export function useProjectEditorSkills(projectId: string) {
  const [skillSearch, setSkillSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(skillSearch.trim()), 300);
    return () => clearTimeout(timer);
  }, [skillSearch]);

  const {
    data: projectSkillViews = [],
    isLoading: isProjectSkillsLoading,
    isError: isProjectSkillsError,
    refetch: refetchProjectSkills,
  } = useGetProjectSkillsQuery(projectId, { skip: !projectId });

  const skillIds = useMemo(
    () => projectSkillViews.map((a) => a.skillId),
    [projectSkillViews]
  );

  const { data: skillsByIds = [], isFetching: isCatalogNamesLoading } =
    useSkillsByIdsQuery(skillIds, {
      skip: !projectId || skillIds.length === 0,
    });

  const catalogById = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const skill of skillsByIds) {
      map.set(skill.id, skill);
    }
    return map;
  }, [skillsByIds]);

  const attachedSkills = useMemo(
    () =>
      projectSkillViews.map((view) => {
        const catalog = catalogById.get(view.skillId);
        return {
          skillId: view.skillId,
          name: resolveSkillDisplayName(view, catalog?.name),
          category: view.category ?? catalog?.category ?? "",
          verified: view.verified,
        };
      }),
    [projectSkillViews, catalogById]
  );

  const attachedIds = useMemo(
    () => new Set(attachedSkills.map((s) => s.skillId)),
    [attachedSkills]
  );

  const {
    data: catalogSkills = [],
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useGetSkillsListQuery(
    {
      search: debouncedSearch,
      category: "",
      includeInactive: false,
      page: 0,
      size: CATALOG_PAGE_SIZE,
      sort: [],
    },
    { skip: !projectId }
  );

  const catalogList = Array.isArray(catalogSkills) ? catalogSkills : [];

  const selectableCatalogSkills = useMemo(
    () =>
      catalogList
        .map((s) => ({ ...s, id: catalogSkillId(s) }))
        .filter((s) => s.id && !attachedIds.has(s.id)),
    [catalogList, attachedIds]
  );

  const isCatalogBusy =
    isCatalogLoading || (isCatalogFetching && catalogList.length === 0);

  const [addProjectSkill, { isLoading: isAdding }] = useAddProjectSkillMutation();
  const [deleteProjectSkill, { isLoading: isRemoving }] =
    useDeleteProjectSkillMutation();
  const [verifyProjectSkills, { isLoading: isVerifying }] =
    useVerifyProjectSkillsMutation();

  const verifiedCount = attachedSkills.filter((s) => s.verified).length;

  const addSkill = async (skillId: string) => {
    setSkillsError(null);
    try {
      await addProjectSkill({ projectId, skillId }).unwrap();
    } catch {
      setSkillsError("Не удалось добавить навык");
    }
  };

  const removeSkill = async (skillId: string) => {
    setSkillsError(null);
    try {
      await deleteProjectSkill({ projectId, skillId }).unwrap();
    } catch {
      setSkillsError("Не удалось удалить навык");
    }
  };

  const verifySkills = async () => {
    setSkillsError(null);
    try {
      await verifyProjectSkills(projectId).unwrap();
      await refetchProjectSkills();
    } catch {
      setSkillsError("Не удалось верифицировать навыки");
    }
  };

  return {
    skillSearch,
    setSkillSearch,
    attachedSkills,
    selectableCatalogSkills,
    catalogTotal: catalogList.length,
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
  };
}
