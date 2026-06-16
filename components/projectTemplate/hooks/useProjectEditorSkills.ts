"use client";

import { useEffect, useMemo, useState } from "react";
import { extractApiErrorMessage } from "@/lib/apiError";
import { resolveSkillDisplayName } from "@/lib/normalizeProjectSkills";
import { normalizeSkillIdList } from "@/lib/skillId";
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
const VERIFY_SETTLE_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function catalogSkillId(skill: Skill): string {
  return skill.id.trim();
}

export function useProjectEditorSkills(projectId: string) {
  const [skillSearch, setSkillSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [isVerificationSettling, setIsVerificationSettling] = useState(false);

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
    () => normalizeSkillIdList(projectSkillViews.map((view) => view.skillId)),
    [projectSkillViews]
  );

  const { data: skillsByIds = [], isFetching: isCatalogNamesLoading } =
    useSkillsByIdsQuery(skillIds, {
      skip: !projectId || skillIds.length === 0,
    });

  const catalogById = useMemo(() => {
    const map = new Map<string, Skill>();
    for (const skill of skillsByIds) {
      const id = skill.id.trim();
      if (id) {
        map.set(id, skill);
      }
    }
    return map;
  }, [skillsByIds]);

  const attachedSkills = useMemo(
    () =>
      projectSkillViews.map((view) => {
        const skillId = view.skillId.trim();
        const catalog = catalogById.get(skillId);
        return {
          skillId,
          name: resolveSkillDisplayName(view, catalog?.name),
          category: view.category ?? catalog?.category ?? "",
          verified: view.verified,
        };
      }),
    [projectSkillViews, catalogById]
  );

  const attachedIds = useMemo(
    () => new Set(attachedSkills.map((skill) => skill.skillId)),
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
        .map((skill) => ({ ...skill, id: catalogSkillId(skill) }))
        .filter((skill) => skill.id && !attachedIds.has(skill.id)),
    [catalogList, attachedIds]
  );

  const isCatalogBusy =
    isCatalogLoading || (isCatalogFetching && catalogList.length === 0);

  const [addProjectSkill, { isLoading: isAdding }] =
    useAddProjectSkillMutation();
  const [deleteProjectSkill, { isLoading: isRemoving }] =
    useDeleteProjectSkillMutation();
  const [verifyProjectSkills, { isLoading: isVerifying }] =
    useVerifyProjectSkillsMutation();

  const verifiedCount = attachedSkills.filter((skill) => skill.verified).length;

  const addSkill = async (skillId: string) => {
    setSkillsError(null);
    try {
      await addProjectSkill({ projectId, skillId }).unwrap();
    } catch (error) {
      setSkillsError(
        extractApiErrorMessage(error, "Не удалось добавить навык")
      );
    }
  };

  const removeSkill = async (skillId: string) => {
    setSkillsError(null);
    try {
      await deleteProjectSkill({ projectId, skillId }).unwrap();
    } catch (error) {
      setSkillsError(
        extractApiErrorMessage(error, "Не удалось удалить навык")
      );
    }
  };

  const verifySkills = async () => {
    setSkillsError(null);
    setIsVerificationSettling(true);

    try {
      await verifyProjectSkills(projectId).unwrap();
      await delay(VERIFY_SETTLE_DELAY_MS);
      await refetchProjectSkills();
    } catch (error) {
      setSkillsError(
        extractApiErrorMessage(error, "Не удалось верифицировать навыки")
      );
    } finally {
      setIsVerificationSettling(false);
    }
  };

  const isVerifyInProgress = isVerifying || isVerificationSettling;

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
    isVerifying: isVerifyInProgress,
    verifiedCount,
    skillsError,
    addSkill,
    removeSkill,
    verifySkills,
    debouncedSearch,
  };
}
