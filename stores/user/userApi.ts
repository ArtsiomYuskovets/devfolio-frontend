import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { UserProfileInfo, DataForFillProfile } from '@/types/types'
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

        getProfilesList: builder.query<UserProfileInfo[], void>({
            query: () => ({
                url: 'api/profiles',
                method: 'GET',
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
                        method: 'PUT',
                        data: { avatarURL: file },
                    };
                }

                const formData = new FormData();
                formData.append('avatar', file);

                return {
                    url: 'api/profiles/avatar',
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