import { createApi } from '@reduxjs/toolkit/query/react';
import { Skill } from '@/types/types';
import { normalizeSkillPayload, normalizeSkillsListResponse } from '@/lib/normalizeSkill';
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
                normalizeSkillsListResponse(response),
            providesTags: ['SkillList'],
        }),
        getSkill: builder.query<Skill, string>({
            query: (skillId) => ({
                url: `api/skills/${encodeURIComponent(skillId)}`,
                method: 'GET',
            }),
            transformResponse: (response: unknown) => {
                const normalized = normalizeSkillPayload(response);
                return normalized ?? (response as Skill);
            },
            providesTags: ['Skills'],
        }),
        updateSkill: builder.mutation<Skill, Skill>({
            query: (skill) => ({
                url: `api/skills/${encodeURIComponent(skill.id)}`,
                method: 'PUT',
                data: skill,
            }),
            invalidatesTags: ['Skills', 'SkillList'],
        }),
        deleteSkill: builder.mutation<void, string>({
            query: (skillId) => ({
                url: `api/skills/${encodeURIComponent(skillId)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Skills', 'SkillList'],
        }),
        createSkill: builder.mutation<Skill, Skill>({
            query: (skill) => ({
                url: `api/skills`,
                method: 'POST',
                data: skill,
            }),
            invalidatesTags: ['Skills', 'SkillList'],
        }),
        skillsByIds: builder.query<Skill[], string[]>({
            query: (skillIds) => ({
                url: `api/skills/by-ids`,
                method: 'POST',
                data: {
                    skillIds: skillIds.map((id) => id.trim()).filter(Boolean),
                },
            }),
            serializeQueryArgs: ({ queryArgs }) => {
                const ids = [...queryArgs]
                    .map((id) => id.trim())
                    .filter(Boolean)
                    .sort();
                return `skillsByIds:${ids.join(',')}`;
            },
            transformResponse: (response: unknown) =>
                normalizeSkillsListResponse(response),
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
