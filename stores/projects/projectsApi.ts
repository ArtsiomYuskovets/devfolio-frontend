import { createApi } from '@reduxjs/toolkit/query/react';
import { Project, ProjectInfoFields, ProjectLikeStatus, SkillCategory } from '@/types/types'
import { normalizeProjectSkillViews, type ProjectSkillView } from '@/lib/normalizeProjectSkills';
import { normalizeProjectLikeStatus } from '@/lib/projectLikeStatus';
import { normalizeProjectPayload } from '@/lib/projectNormalize';
import { normalizeFavoritesResponse } from '@/lib/normalizeFavorites';
import { normalizeListResponse } from '@/lib/normalizeList';
import { pickProjectId } from '@/lib/projectId';
import type { ProjectListSort } from '@/lib/projectListSort';
import { axiosBaseQuery } from '../axios';
import { API_BASE_URL } from '@/lib/env';

export interface ProjectsListParams {
    page: number;
    size: number;
    sort?: ProjectListSort;
    name?: string;
    skillIds?: string[];
    categories?: SkillCategory[];
}

function buildProjectsListParams(params: ProjectsListParams): URLSearchParams {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page));
    searchParams.set('size', String(params.size));

    if (params.sort) {
        searchParams.set('sort', params.sort);
    }

    const name = params.name?.trim();
    if (name) {
        searchParams.set('name', name);
    }

    for (const skillId of params.skillIds ?? []) {
        if (skillId.trim()) {
            searchParams.append('skillIds', skillId.trim());
        }
    }

    for (const category of params.categories ?? []) {
        searchParams.append('categories', category);
    }

    return searchParams;
}

function omitUndefinedParams(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
}

function bumpProjectViewCount(project: Project) {
    project.viewersCount = (project.viewersCount ?? 0) + 1;
}

function bumpProjectInListDraft(draft: Project[], normalizedId: string) {
    for (const project of draft) {
        const id =
            pickProjectId(project) ??
            project.projectId?.trim() ??
            '';
        if (id === normalizedId) {
            bumpProjectViewCount(project);
            break;
        }
    }
}

type ViewCountPatchResult = {
    patches: { undo: () => void }[];
    detailPatched: boolean;
};

function patchProjectViewCountInCaches(
    dispatch: (action: unknown) => { undo: () => void },
    getState: () => unknown,
    projectId: string,
    options?: { detailOnly?: boolean }
): ViewCountPatchResult {
    const normalizedId = projectId.trim();
    const patches: { undo: () => void }[] = [];
    let detailPatched = false;
    const state = getState();

    const detail = projectsApi.endpoints.getProjectsById.select(normalizedId)(state as never);
    if (detail?.data) {
        patches.push(
            dispatch(
                projectsApi.util.updateQueryData(
                    'getProjectsById',
                    normalizedId,
                    bumpProjectViewCount
                )
            )
        );
        detailPatched = true;
    }

    if (!options?.detailOnly) {
        for (const args of projectsApi.util.selectCachedArgsForQuery(
            state as never,
            'getProjectsList'
        )) {
            patches.push(
                dispatch(
                    projectsApi.util.updateQueryData('getProjectsList', args, (draft) => {
                        bumpProjectInListDraft(draft, normalizedId);
                    })
                )
            );
        }

        for (const args of projectsApi.util.selectCachedArgsForQuery(
            state as never,
            'getUsersProjects'
        )) {
            patches.push(
                dispatch(
                    projectsApi.util.updateQueryData('getUsersProjects', args, (draft) => {
                        bumpProjectInListDraft(draft, normalizedId);
                    })
                )
            );
        }

        for (const args of projectsApi.util.selectCachedArgsForQuery(
            state as never,
            'getFavoritesProjects'
        )) {
            patches.push(
                dispatch(
                    projectsApi.util.updateQueryData('getFavoritesProjects', args, (draft) => {
                        bumpProjectInListDraft(draft, normalizedId);
                    })
                )
            );
        }
    }

    return { patches, detailPatched };
}

function normalizeProjectsListResponse(response: unknown): Project[] {
    console.log('[project] GET /api/projects (list) raw', {
        typeofResponse: typeof response,
        isArray: Array.isArray(response),
        raw: response,
    });

    const items = normalizeListResponse<unknown>(response);
    const projects = items.map((item) => normalizeProjectPayload(item));

    if (items[0]) {
        console.log('[project] list item[0] raw', items[0]);
    }
    if (projects[0]) {
        console.log('[project] list item[0] normalized', projects[0]);
    }

    return projects;
}

export const projectsApi = createApi({
    reducerPath: 'projectsApi',
    baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ['ProjectsList', 'Favorites', 'ProjectSkills', 'ProjectInteraction'],
    endpoints: (builder) => ({
        getProjectsById: builder.query<Project, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}`,
                method: 'GET',
            }),
            transformResponse: (response: unknown, _meta, projectId) => {
                console.log('[project] GET /api/projects/:id', {
                    projectId,
                    typeofResponse: typeof response,
                    isArray: Array.isArray(response),
                    raw: response,
                });
                const normalized = normalizeProjectPayload(response);
                console.log('[project] after normalizeProjectPayload', normalized);
                return normalized;
            },
            providesTags: (_result, _error, projectId) => [
                { type: 'ProjectsList', id: projectId },
                { type: 'ProjectInteraction', id: projectId },
            ],
        }),
        updateProject: builder.mutation<Project, Project>({
            query: (project) => ({
                url: `api/projects/${project.projectId}`,
                method: 'PUT',
                data: project,
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        deleteProject: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, projectId) => [
                { type: 'ProjectsList', id: projectId },
                'ProjectsList',
                'Favorites',
            ],
        }),
        createProject: builder.mutation<Project, ProjectInfoFields>({
            query: (body) => ({
                url: `api/projects`,
                method: 'POST',
                data: body,
            }),
            transformResponse: normalizeProjectPayload,
            invalidatesTags: ['ProjectsList'],
        }),
        verifyProjectSkills: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/verifications`,
                method: 'POST',
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        addProjectSkill: builder.mutation<void, { projectId: string, skillId: string }>({
            query: ({ projectId, skillId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/skills/${encodeURIComponent(skillId)}`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectSkills', id: projectId },
                'ProjectsList',
            ],
        }),
        deleteProjectSkill: builder.mutation<void, { projectId: string, skillId: string }>({
            query: ({ projectId, skillId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/skills/${encodeURIComponent(skillId)}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectSkills', id: projectId },
                'ProjectsList',
            ],
        }),
        getProjectSkills: builder.query<ProjectSkillView[], string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/skills`,
                method: 'GET',
            }),
            transformResponse: (response: unknown) =>
                normalizeProjectSkillViews(response),
            providesTags: (_result, _error, projectId) => [
                { type: 'ProjectSkills', id: projectId },
            ],
        }),
        getUsersProjects: builder.query<Project[], {
            userId: string;
            search?: string;
            projectPublic?: boolean;
            createdAfter?: string;
            createdBefore?: string;
            page?: number;
            size?: number;
            sort?: ProjectListSort;
        }>({
            query: ({ userId, search, projectPublic, createdAfter, createdBefore, page, size, sort }) => ({
                url: `api/users/${encodeURIComponent(userId)}/projects`,
                method: 'GET',
                params: omitUndefinedParams({
                    search,
                    projectPublic,
                    createdAfter,
                    createdBefore,
                    page,
                    size,
                    sort,
                }),
            }),
            transformResponse: normalizeProjectsListResponse,
            providesTags: ['ProjectsList'],
        }),
        getProjectsList: builder.query<Project[], ProjectsListParams>({
            query: (params) => ({
                url: `api/projects`,
                method: 'GET',
                params: buildProjectsListParams(params),
            }),
            transformResponse: normalizeProjectsListResponse,
            providesTags: ['ProjectsList'],
        }),
        uploadPreviewImage: builder.mutation<void, { projectId: string, image: File }>({
            query: ({ projectId, image }) => {
                const formData = new FormData();
                formData.append('file', image);
                return {
                    url: `api/projects/${encodeURIComponent(projectId)}/preview`,
                    method: 'POST',
                    data: formData,
                };
            },
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectsList', id: projectId },
                'ProjectsList',
            ],
        }),
        uploadProjectPhoto: builder.mutation<void, { projectId: string, photo: File }>({
            query: ({ projectId, photo }) => {
                const formData = new FormData();
                formData.append('file', photo);
                return {
                    url: `api/projects/${encodeURIComponent(projectId)}/images`,
                    method: 'POST',
                    data: formData,
                };
            },
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectsList', id: projectId },
                'ProjectsList',
            ],
        }),
        deleteProjectImage: builder.mutation<void, { projectId: string, imageUrl: string }>({
            query: ({ projectId, imageUrl }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/images`,
                method: 'DELETE',
                params: { url: imageUrl },
            }),
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectsList', id: projectId },
                'ProjectsList',
            ],
        }),
        deleteProjectPreviewImage: builder.mutation<void, { projectId: string }>({
            query: ({ projectId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/preview`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { projectId }) => [
                { type: 'ProjectsList', id: projectId },
                'ProjectsList',
            ],
        }),
        addProjectToFavorites: builder.mutation<void, { projectId: string }>({
            query: ({ projectId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/favorites`,
                method: 'POST',
            }),
            invalidatesTags: ['Favorites', 'ProjectsList'],
        }),
        removeProjectFromFavorites: builder.mutation<void, { projectId: string }>({
            query: ({ projectId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/favorites`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Favorites', 'ProjectsList'],
        }),
        getFavoritesProjects: builder.query<Project[], void>({
            query: () => ({
                url: `api/users/me/favorites`,
                method: 'GET',
            }),
            transformResponse: normalizeFavoritesResponse,
            providesTags: ['Favorites'],
        }),
        recordProjectView: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/view`,
                method: 'POST',
            }),
            async onQueryStarted(projectId, { dispatch, queryFulfilled, getState }) {
                const normalizedId = projectId.trim();
                const { patches, detailPatched } = patchProjectViewCountInCaches(
                    dispatch,
                    getState,
                    normalizedId
                );

                try {
                    await queryFulfilled;

                    if (!detailPatched) {
                        const latePatch = patchProjectViewCountInCaches(
                            dispatch,
                            getState,
                            normalizedId,
                            { detailOnly: true }
                        );
                        patches.push(...latePatch.patches);
                    }
                } catch {
                    patches.forEach((patch) => patch.undo());
                }
            },
        }),
        likeProject: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/like`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, projectId) => [
                { type: 'ProjectInteraction', id: projectId },
                { type: 'ProjectsList', id: projectId },
            ],
        }),
        unlikeProject: builder.mutation<void, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/like`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, projectId) => [
                { type: 'ProjectInteraction', id: projectId },
                { type: 'ProjectsList', id: projectId },
            ],
        }),
        getProjectLikeStatus: builder.query<ProjectLikeStatus, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/like/status`,
                method: 'GET',
            }),
            transformResponse: normalizeProjectLikeStatus,
            providesTags: (_result, _error, projectId) => [
                { type: 'ProjectInteraction', id: projectId },
            ],
        }),
    }),
});

export const {
    useGetProjectsByIdQuery,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useCreateProjectMutation,
    useVerifyProjectSkillsMutation,
    useAddProjectSkillMutation,
    useDeleteProjectSkillMutation,
    useGetProjectSkillsQuery,
    useGetUsersProjectsQuery,
    useGetProjectsListQuery,
    useUploadPreviewImageMutation,
    useUploadProjectPhotoMutation,
    useDeleteProjectImageMutation,
    useDeleteProjectPreviewImageMutation,
    useAddProjectToFavoritesMutation,
    useRemoveProjectFromFavoritesMutation,
    useGetFavoritesProjectsQuery,
    useRecordProjectViewMutation,
    useLikeProjectMutation,
    useUnlikeProjectMutation,
    useGetProjectLikeStatusQuery,
} = projectsApi;