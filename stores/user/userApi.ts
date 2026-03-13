import { createApi } from '@reduxjs/toolkit/query/react';
import { UserProfileInfo, DataForFillProfile } from '@/types/types'
import { axiosBaseQuery } from '../axios';

interface ProfilesSearchParams {
    skills: string[];
    page: number;
    size: number;
    sort: string[];
}

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:8080/' }),
    tagTypes: ['UserProfile', 'ProfilesList'],
    endpoints: (builder) => ({
        getMyProfile: builder.query<UserProfileInfo, void>({
            query: () => ({
                url: 'api/profiles/me',
                method: 'GET',
            }),
            providesTags: ['UserProfile'],
        }),

        getUserProfile: builder.query<UserProfileInfo, string>({
            query: (userId) => ({
                url: `api/profiles/${userId}`,
                method: 'GET',
            }),
        }),

        getProfilesList: builder.query<UserProfileInfo[], ProfilesSearchParams>({
            query: (searchParams) => ({
                url: 'api/profiles',
                method: 'GET',
                params: {
                    skills: searchParams.skills,
                    page: searchParams.page,
                    size: searchParams.size,
                    sort: searchParams.sort,
                },
            }),
            providesTags: ['ProfilesList'],
        }),

        updateMyProfile: builder.mutation<UserProfileInfo, Partial<DataForFillProfile>>({
            query: (data) => ({
                url: 'api/profiles/me',
                method: 'PUT',
                data, 
            }),
            invalidatesTags: ['UserProfile'],
        }),

        fillMyProfile: builder.mutation<UserProfileInfo, DataForFillProfile>({
            query: (data) => ({
                url: 'api/profiles',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['UserProfile'],
        }),

        updateAvatar: builder.mutation<string, File | string>({
            query: (file) => {
                if (typeof file === 'string') {
                    return {
                        url: 'api/profiles/me/avatar',
                        method: 'PATCH',
                        data: { avatarURL: file },
                    };
                }

                const formData = new FormData();
                formData.append('avatar', file);

                return {
                    url: 'api/profiles/me/avatar',
                    method: 'POST',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                };
            },
            invalidatesTags: ['UserProfile'],
        }),

        deleteMyProfile: builder.mutation<void, void>({
            query: () => ({
                url: 'api/profiles/me',
                method: 'DELETE',
            }),
            invalidatesTags: ['UserProfile', 'ProfilesList'],
        }),
    }),
});

export const {
    useGetMyProfileQuery,
    useGetUserProfileQuery,
    useGetProfilesListQuery,
    useUpdateMyProfileMutation,
    useFillMyProfileMutation,
    useUpdateAvatarMutation,
    useDeleteMyProfileMutation,
} = userApi;