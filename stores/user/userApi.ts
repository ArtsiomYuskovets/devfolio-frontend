import { createApi } from "@reduxjs/toolkit/query/react";
import {
    UserProfileInfo,
    DataForFillProfile,
    UserProfileFeed,
    CareerListApiPayload,
    ProfileCareerEntry,
} from "@/types/types";
import { normalizeCareerResponse } from "@/lib/normalizeCareer";
import { normalizeListResponse } from "@/lib/normalizeList";
import {
    normalizeUploadAvatarResponse,
    pickAvatarUrlFromPayload,
    resolveProfileAvatarUrl,
} from "@/lib/profileAvatar";
import { pickProfileUserId } from "@/lib/userId";
import { axiosBaseQuery } from "../axios";
import { API_BASE_URL } from "@/lib/env";

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
    const profileUserId = userId ?? undefined;
    const normalizedAvatar = resolveProfileAvatarUrl(
        pickAvatarUrlFromPayload(raw),
        profileUserId
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
        avatarURL: resolveProfileAvatarUrl(
            pickAvatarUrlFromPayload(raw),
            (typeof raw.userId === "string" && raw.userId) ||
                (typeof raw.id === "string" && raw.id) ||
                undefined
        ) ?? "",
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

export interface ProfilesFeedParams extends PagedQueryParams {
    search?: string;
    skills?: string[];
}

function buildProfilesListParams(params: ProfilesFeedParams): URLSearchParams {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page));
    searchParams.set("size", String(params.size));

    if (params.sort?.length) {
        searchParams.set("sort", params.sort.join(","));
    }

    const search = params.search?.trim();
    if (search) {
        searchParams.set("search", search);
    }

    for (const skillId of params.skills ?? []) {
        if (skillId.trim()) {
            searchParams.append("skills", skillId.trim());
        }
    }

    return searchParams;
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
    baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
    tagTypes: ["UserProfile", "ProfilesList", "UserCareer"],
    endpoints: (builder) => ({
        getMyProfile: builder.query<UserProfileInfo | null, void>({
            async queryFn(_arg, _api, _extraOptions, baseQuery) {
                const result = await baseQuery({
                    url: "api/profiles/me",
                    method: "GET",
                });

                if (result.error) {
                    if (result.error.status === 404) {
                        return { data: null };
                    }
                    return { error: result.error };
                }

                return { data: normalizeUserProfile(result.data) };
            },
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

        getProfilesList: builder.query<UserProfileInfo[], ProfilesFeedParams>({
            query: (searchParams) => ({
                url: "api/profiles",
                method: "GET",
                params: buildProfilesListParams(searchParams),
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
        getUserFeed: builder.query<UserProfileFeed[], ProfilesFeedParams>({
            query: (params) => ({
                url: "api/profiles",
                method: "GET",
                params: buildProfilesListParams(params),
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
                formData.append("file", file);
                return {
                    url: "api/profiles/me/avatar",
                    method: "POST",
                    data: formData,
                };
            },
            transformResponse: normalizeUploadAvatarResponse,
            invalidatesTags: () => profileCacheTags(),
        }),
        deleteAvatar: builder.mutation<void, void>({
            query: () => ({
                url: "api/profiles/me/avatar",
                method: "DELETE",
            }),
            invalidatesTags: () => profileCacheTags(),
        }),
        getUserCareer: builder.query<ProfileCareerEntry[], string>({
            async queryFn(userId, _api, _extraOptions, baseQuery) {
                const result = await baseQuery({
                    url: `api/profiles/${encodeURIComponent(userId)}/career`,
                    method: "GET",
                });

                if (result.error) {
                    if (result.error.status === 404) {
                        return { data: [] };
                    }
                    return { error: result.error };
                }

                return { data: normalizeCareerResponse(result.data) };
            },
            providesTags: (_result, _error, userId) => [
                { type: "UserCareer", id: userId },
            ],
        }),
        updateMyCareer: builder.mutation<
            ProfileCareerEntry[],
            { userId: string; payload: CareerListApiPayload }
        >({
            query: ({ payload }) => ({
                url: "api/profiles/me/career",
                method: "PUT",
                data: payload,
            }),
            transformResponse: normalizeCareerResponse,
            invalidatesTags: (_result, _error, { userId }) => [
                { type: "UserCareer", id: userId },
            ],
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
    useGetUserCareerQuery,
    useUpdateMyCareerMutation,
} = userApi;