import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { Project } from '@/types/types'
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

const axiosBaseQuery = (
    { baseUrl }: AxiosBaseQueryConfig = { baseUrl: '' }
): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
    async ({ url, method, data, params, headers }) => {
        try {
            const result = await api({
                url: baseUrl + url,
                method,
                data,
                params,
                headers,
            });

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
        createProject: builder.mutation<Project, Project>({
            query: (project) => ({
                url: `api/projects`,
                method: 'POST',
                data: project,
            }),
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
        getProjectSkills: builder.query<string[], string>({
            query: (projectId) => ({
                url: `api/projects/${projectId}/skills`,
                method: 'GET',
            }),
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
            
                url: `api/profiles/${userId}/projects`,
                method: 'GET',
                params: { search, projectPublic, createdAfter, createdBefore, page, size, sort: sort?.join(',') },
            }),
            providesTags: ['ProjectsList'],
        }),
    }),
});