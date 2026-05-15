import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { Project, ProjectInfo, ProjectSkillAttachment } from '@/types/types'
import { pickProjectId } from '@/lib/projectId';
import { pickProjectPreviewUrl } from '@/lib/projectImage';
import { api } from '@/lib/authApi';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface AxiosBaseQueryArgs {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
}

interface AxiosBaseQueryResult<T = unknown> {
    data: T;
}

interface AxiosBaseQueryError {
    status?: number;
    data: unknown;
}

interface AxiosBaseQueryConfig {
    baseUrl?: string;
}
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

function normalizeProjectPayload(response: unknown): Project {
    const id = pickProjectId(response);
    if (!response || typeof response !== 'object') {
        return response as Project;
    }
    const base = { ...(response as Record<string, unknown>) };
    if (id) {
        base.projectId = id;
    }
    const previewUrl = pickProjectPreviewUrl(response);
    if (previewUrl) {
        base.previewImageUrl = previewUrl;
    }
    return base as Project;
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

const axiosBaseQuery = (
    { baseUrl }: AxiosBaseQueryConfig = { baseUrl: '' }
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
    async ({ url, method, data, params, headers }) => {
        try {
            const req: AxiosRequestConfig = {
                url: baseUrl + url,
                method,
                data,
                params,
                headers,
            };
            if (typeof FormData !== 'undefined' && data instanceof FormData) {
                const h: Record<string, unknown> = {
                    ...(headers && typeof headers === 'object' && !Array.isArray(headers)
                        ? (headers as Record<string, unknown>)
                        : {}),
                };
                h['Content-Type'] = false;
                req.headers = h as AxiosRequestConfig['headers'];
            }
            const result = await api(req);

            return { data: result.data };

        } catch (axiosError) {
            const err = axiosError as AxiosError;

            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || err.message,
                },
            };
        }
    };

export const projectsApi = createApi({
    reducerPath: 'projectsApi',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080/' }),
    tagTypes: ['ProjectsList'],
    endpoints: (builder) => ({
        getProjectsById: builder.query<Project, string>({
            query: (projectId) => ({
                url: `api/projects/${projectId}`,
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
                url: `api/projects/${projectId}/skills`,
                method: 'GET',
            }),
            transformResponse: (response: unknown): ProjectSkillAttachment[] => {
                if (!Array.isArray(response)) return [];
                return response.flatMap((item: unknown): ProjectSkillAttachment[] => {
                    if (typeof item === 'string') {
                        return item ? [{ skillId: item, verified: false }] : [];
                    }
                    if (item && typeof item === 'object' && item !== null) {
                        const o = item as Record<string, unknown>;
                        const skillId =
                            typeof o.skillId === 'string'
                                ? o.skillId
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
} = projectsApi;