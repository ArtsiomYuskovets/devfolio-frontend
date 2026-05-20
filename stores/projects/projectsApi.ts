import { createApi } from '@reduxjs/toolkit/query/react';
import { Project, ProjectInfo, ProjectSkillAttachment } from '@/types/types'
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
    const raw: unknown[] = [];
    if (Array.isArray(response)) {
        raw.push(...response);
    } else if (response && typeof response === 'object') {
        const r = response as Record<string, unknown>;
        const nested = r.content ?? r.items ?? r.data ?? r.projects;
        if (Array.isArray(nested)) {
            raw.push(...nested);
        }
    }
    return raw.map((item) => normalizeProjectPayload(item));
}

export const projectsApi = createApi({
    reducerPath: 'projectsApi',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080/' }),
    tagTypes: ['ProjectsList', 'Favorites'],
    endpoints: (builder) => ({
        getProjectsById: builder.query<Project, string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}`,
                method: 'GET',
            }),
            transformResponse: normalizeProjectPayload,
            providesTags: ['ProjectsList'],
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
        createProject: builder.mutation<Project, ProjectInfo>({
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
                url: `api/projects/${projectId}/verifications`,
                method: 'POST',
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        addProjectSkill: builder.mutation<void, { projectId: string, skillId: string }>({
            query: ({ projectId, skillId }) => ({
                url: `api/projects/${projectId}/skills/${skillId}`,
                method: 'POST',
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        deleteProjectSkill: builder.mutation<void, { projectId: string, skillId: string }>({
            query: ({ projectId, skillId }) => ({
                url: `api/projects/${projectId}/skills/${skillId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectsList'],
        }),
        getProjectSkills: builder.query<ProjectSkillAttachment[], string>({
            query: (projectId) => ({
                url: `api/projects/${encodeURIComponent(projectId)}/skills`,
                method: 'GET',
            }),
            transformResponse: (response: unknown): ProjectSkillAttachment[] => {
                const list = normalizeListResponse<unknown>(response);
                return list.flatMap((item: unknown): ProjectSkillAttachment[] => {
                    if (typeof item === 'string') {
                        return item ? [{ skillId: item, verified: false }] : [];
                    }
                    if (item && typeof item === 'object' && item !== null) {
                        const o = item as Record<string, unknown>;
                        const skillId =
                            typeof o.skillId === 'string'
                                ? o.skillId
                                : typeof o.skill_id === 'string'
                                  ? o.skill_id
                                  : typeof o.id === 'string'
                                    ? o.id
                                    : '';
                        if (!skillId) return [];
                        return [{ skillId, verified: Boolean(o.verified) }];
                    }
                    return [];
                });
            },
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
} = projectsApi;