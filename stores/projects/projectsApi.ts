import { createApi } from '@reduxjs/toolkit/query/react';
import { Project, ProjectInfoFields, ProjectLikeStatus } from '@/types/types'
import { normalizeProjectSkillViews, type ProjectSkillView } from '@/lib/normalizeProjectSkills';
import { normalizeProjectLikeStatus } from '@/lib/projectLikeStatus';
import { normalizeProjectPayload } from '@/lib/projectNormalize';
import { normalizeFavoritesResponse } from '@/lib/normalizeFavorites';
import { normalizeListResponse } from '@/lib/normalizeList';
import { axiosBaseQuery } from '../axios';

interface ProjectsListParams {
    page: number;
    size: number;
    sort: string[];
}

function omitUndefinedParams(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
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
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080/' }),
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
                url: `api/projects/${projectId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectsList'],
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
            invalidatesTags: (_result, _error, projectId) => [
                { type: 'ProjectSkills', id: projectId },
                'ProjectsList',
            ],
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
            sort?: string[];
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
                    sort: sort?.length ? sort.join(',') : undefined,
                }),
            }),
            transformResponse: normalizeProjectsListResponse,
            providesTags: ['ProjectsList'],
        }),
        getProjectsList: builder.query<Project[], ProjectsListParams>({
            query: (params) => ({
                url: `api/projects`,
                method: 'GET',
                params: {
                    page: params.page,
                    size: params.size,
                    sort: params.sort?.length ? params.sort.join(',') : undefined,
                },
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
            invalidatesTags: ['ProjectsList'],
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
            invalidatesTags: ['ProjectsList'],
        }),
        deleteProjectImage: builder.mutation<void, { projectId: string, imageUrl: string }>({
            query: ({ projectId, imageUrl }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/images`,
                method: 'DELETE',
                params: { url: imageUrl },
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        deleteProjectPreviewImage: builder.mutation<void, { projectId: string }>({
            query: ({ projectId }) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/preview`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectsList'],
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
            invalidatesTags: (_result, _error, projectId) => [
                { type: 'ProjectsList', id: projectId },
                { type: 'ProjectInteraction', id: projectId },
            ],
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