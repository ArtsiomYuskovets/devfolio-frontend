import axios, { type InternalAxiosRequestConfig } from "axios";
import type { AppDispatch } from "@/stores/store";
import { isAuthRequestUrl } from "@/lib/authTokenUtils";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

type AuthAxiosConfig = InternalAxiosRequestConfig & { _skipAuth?: boolean };

let getAccessTokenFromState: () => string | null = () => null;

export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessTokenFromState = getter;
};

export const setupInterceptors = (dispatch: AppDispatch) => {
  api.interceptors.request.use((config) => {
    const cfg = config as AuthAxiosConfig;
    const url = String(cfg.url ?? "");
    const skipAuth = cfg._skipAuth || isAuthRequestUrl(url);

    if (skipAuth) {
      delete cfg.headers.Authorization;
      return cfg;
    }

    const token = getAccessTokenFromState();
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error.response?.status;
      const url = String(error.config?.url ?? "");
      const isRefreshRequest = url.includes("auth/refresh");

      if (status !== 401) {
        return Promise.reject(error);
      }

      const { tokenService } = await import("./tokenService");

      if (isRefreshRequest) {
        return Promise.reject(error);
      }

      const refreshed = await tokenService.refreshAccessToken(dispatch);
      if (refreshed) {
        const cfg = error.config as AuthAxiosConfig;
        const token = getAccessTokenFromState();
        if (token) {
          cfg.headers.Authorization = `Bearer ${token}`;
        }
        return api.request(cfg);
      }

      tokenService.clearTokens(dispatch);
      return Promise.reject(error);
    }
  );
};
