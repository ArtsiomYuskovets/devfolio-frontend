import { createApi } from "@reduxjs/toolkit/query/react";
import {
    UserProfileInfo,
    DataForFillProfile,
    UserProfileFeed,
} from "@/types/types";
import { normalizeListResponse } from "@/lib/normalizeList";
import { pickProfileUserId } from "@/lib/userId";
import { axiosBaseQuery } from "../axios";

const API_ORIGIN = "http://localhost:8080";

function normalizeAvatarUrl(value: unknown): string {
    if (typeof value !== "string" || !value.trim()) {
        return "";
    }
    const url = value.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${API_ORIGIN}${normalizedPath}`;
}

function normalizeUserProfile(response: unknown): UserProfileInfo {
    if (!response || typeof response !== "object") {
        return response as UserProfileInfo;
    }
    const userId = pickProfileUserId(response);
    const raw = response as Record<string, unknown>;
    const base = { ...raw };
    if (userId) {
        base.userId = userId;
    }
    const normalizedAvatar = normalizeAvatarUrl(
        raw.avatarURL ?? raw.avatarUrl ?? raw.avatar_url
    );
    if (normalizedAvatar) {
        base.avatarURL = normalizedAvatar;
    }
    return base as UserProfileInfo;
}

function normalizeUserFeedItem(response: unknown): UserProfileFeed {
    if (!response || typeof response !== "object") {
        return response as UserProfileFeed;
    }
    const raw = response as Record<string, unknown>;
    return {
        ...(raw as UserProfileFeed),
        userId:
            (typeof raw.userId === "string" && raw.userId) ||
            (typeof raw.id === "string" && raw.id) ||
            "",
        nickname:
            (typeof raw.nickname === "string" && raw.nickname) ||
            (typeof raw.username === "string" && raw.username) ||
            "",
        displayName:
            (typeof raw.displayName === "string" && raw.displayName) ||
            (typeof raw.display_name === "string" && raw.display_name) ||
            (typeof raw.fullName === "string" && raw.fullName) ||
            "",
        avatarURL: normalizeAvatarUrl(
            raw.avatarURL ?? raw.avatarUrl ?? raw.avatar_url
        ),
        userType:
            (raw.userType as UserProfileFeed["userType"]) ??
            (raw.user_type as UserProfileFeed["userType"]) ??
            "JOB_SEEKER",
        bioSnippet:
            (typeof raw.bioSnippet === "string" && raw.bioSnippet) ||
            (typeof raw.bio_snippet === "string" && raw.bio_snippet) ||
            (typeof raw.bio === "string" && raw.bio) ||
            "",
        createdAt:
            (typeof raw.createdAt === "number" && raw.createdAt) ||
            (typeof raw.created_at === "number" && raw.created_at) ||
            0,
    };
}

type PagedQueryParams = {
    page: number;
    size: number;
    sort: string[];
};

interface ProfilesSearchParams extends PagedQueryParams {
    skills: string[];
}

function profileCacheTags(profile?: UserProfileInfo) {
    const userId =
        profile?.userId ||
        (profile ? pickProfileUserId(profile) : undefined);
    return [
        { type: "UserProfile" as const, id: "ME" },
        ...(userId ? [{ type: "UserProfile" as const, id: userId }] : []),
    ];
}

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: axiosBaseQuery({ baseUrl: "http://localhost:8080/" }),
    tagTypes: ["UserProfile", "ProfilesList"],
    endpoints: (builder) => ({
        getMyProfile: builder.query<UserProfileInfo, void>({
            query: () => ({
                url: "api/profiles/me",
                method: "GET",
            }),
            transformResponse: normalizeUserProfile,
            providesTags: [{ type: "UserProfile", id: "ME" }],
        }),

        getUserProfile: builder.query<UserProfileInfo, string>({
            query: (userId) => ({
                url: `api/profiles/${userId}`,
                method: "GET",
            }),
            transformResponse: normalizeUserProfile,
            providesTags: (_result, _error, userId) => [
                { type: "UserProfile", id: userId },
            ],
        }),

        getProfilesList: builder.query<UserProfileInfo[], ProfilesSearchParams>({
            query: (searchParams) => ({
                url: "api/profiles",
                method: "GET",
                params: {
                    skills: searchParams.skills,
                    page: searchParams.page,
                    size: searchParams.size,
                    sort: searchParams.sort?.length
                        ? searchParams.sort.join(",")
                        : undefined,
                },
            }),
            transformResponse: (response: unknown) =>
                normalizeListResponse<unknown>(response).map((item) =>
                    normalizeUserProfile(item)
                ),
            providesTags: ["ProfilesList"],
        }),

        updateMyProfile: builder.mutation<UserProfileInfo, Partial<DataForFillProfile>>({
            query: (data) => ({
                url: "api/profiles/me",
                method: "PUT",
                data,
            }),
            transformResponse: normalizeUserProfile,
            invalidatesTags: (result) => [
                ...profileCacheTags(result),
                "ProfilesList",
            ],
        }),

        fillMyProfile: builder.mutation<UserProfileInfo, DataForFillProfile>({
            query: (data) => ({
                url: "api/profiles",
                method: "POST",
                data,
            }),
            transformResponse: normalizeUserProfile,
            invalidatesTags: (result) => [
                ...profileCacheTags(result),
                "ProfilesList",
            ],
        }),

        deleteMyProfile: builder.mutation<void, void>({
            query: () => ({
                url: "api/profiles/me",
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "UserProfile", id: "ME" }, "ProfilesList"],
        }),
        getUserFeed: builder.query<UserProfileFeed[], PagedQueryParams>({
            query: (params) => ({
                url: "api/profiles",
                method: "GET",
                params: {
                    page: params.page,
                    size: params.size,
                    sort: params.sort?.length ? params.sort.join(",") : undefined,
                },
            }),
            transformResponse: (response: unknown) =>
                normalizeListResponse<unknown>(response).map((item) =>
                    normalizeUserFeedItem(item)
                ),
            providesTags: ["ProfilesList"],
        }),
        uploadAvatar: builder.mutation<string, File | string>({
            query: (file) => {
                if (typeof file === "string") {
                    return {
                        url: "api/profiles/me/avatar",
                        method: "PATCH",
                        data: { avatarURL: file },
                    };
                }
                const formData = new FormData();
                formData.append("avatar", file);
                return {
                    url: "api/profiles/me/avatar",
                    method: "POST",
                    data: formData,
                };
            },
            invalidatesTags: () => profileCacheTags(),
        }),
        deleteAvatar: builder.mutation<void, void>({
            query: () => ({
                url: "api/profiles/me/avatar",
                method: "DELETE",
            }),
            invalidatesTags: () => profileCacheTags(),
        }),
    }),
});

export const {
    useGetMyProfileQuery,
    useGetUserProfileQuery,
    useGetProfilesListQuery,
    useUpdateMyProfileMutation,
    useFillMyProfileMutation,
    useDeleteMyProfileMutation,
    useGetUserFeedQuery,
    useUploadAvatarMutation,
    useDeleteAvatarMutation,
} = userApi;