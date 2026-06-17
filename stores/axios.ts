import { api } from "@/lib/authApi";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { AxiosError, AxiosRequestConfig } from "axios";

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

export const axiosBaseQuery = (
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