import { createApi } from '@reduxjs/toolkit/query/react';
import { Skill } from '@/types/types';
import { normalizeListResponse } from '@/lib/normalizeList';
import { axiosBaseQuery } from '../axios';


interface SkillsSearchParams {
    search: string;
    category: string;
    includeInactive: boolean;
    page: number;
    size: number;
    sort: string[];
}

export const skillApi = createApi({
    reducerPath: 'skillApi',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080/' }),
    tagTypes: ['Skills', 'SkillList'],
    endpoints: (builder) => ({
        getSkillsList: builder.query<Skill[], SkillsSearchParams>({
            query: (searchParams) => ({
                url: 'api/skills',
                method: 'GET',
                params: {
                    search: searchParams.search || undefined,
                    category: searchParams.category || undefined,
                    includeInactive: searchParams.includeInactive,
                    page: searchParams.page,
                    size: searchParams.size,
                    sort: searchParams.sort?.length
                        ? searchParams.sort.join(',')
                        : undefined,
                },
            }),
            transformResponse: (response: unknown) =>
                normalizeListResponse<Skill>(response),
            providesTags: ['SkillList'],
        }),
        getSkill: builder.query<Skill, string>({
            query: (skillId) => ({
                url: `api/skills/${skillId}`,
                method: 'GET',
            }),
            providesTags: ['Skills'],
        }),
        updateSkill: builder.mutation<Skill, Skill>({
            query: (skill) => ({
                url: `api/skills/${skill.id}`,
                method: 'PUT',
                body: skill,
            }),
            invalidatesTags: ['Skills'],
        }),
        deleteSkill: builder.mutation<void, string>({
            query: (skillId) => ({
                url: `api/skills/${skillId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Skills'],
        }),
        createSkill: builder.mutation<Skill, Skill>({
            query: (skill) => ({
                url: `api/skills`,
                method: 'POST',
                body: skill,
            }),
            invalidatesTags: ['Skills'],
        }),
        skillsByIds: builder.query<Skill[], string[]>({
            query: (skillIds) => ({
                url: `api/skills/by-ids`,
                method: 'POST',
                data: skillIds,
            }),
            transformResponse: (response: unknown) =>
                normalizeListResponse<Skill>(response),
            providesTags: ['Skills'],
        }),
    }),
});

export const {
    useGetSkillsListQuery,
    useGetSkillQuery,
    useUpdateSkillMutation,
    useDeleteSkillMutation,
    useCreateSkillMutation,
    useSkillsByIdsQuery,
} = skillApi;