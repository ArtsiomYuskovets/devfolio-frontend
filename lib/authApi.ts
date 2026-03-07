import axios from "axios";
import { tokenService } from "./tokenService";
import { AppDispatch } from "../stores/auth/store";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

let getAccessTokenFromState: () => string | null = () => null;

export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessTokenFromState = getter;
};

export const setupInterceptors = (dispatch: AppDispatch) => {
  api.interceptors.request.use((config) => {
    const token = getAccessTokenFromState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        const isRefreshRequest = String(error.config?.url ?? '').includes('refresh');

        if (isRefreshRequest) {
          tokenService.clearTokens(dispatch);
          return Promise.reject(error);
        }

        const refreshed = await tokenService.refreshAccessToken(dispatch);
        if (refreshed) {
          error.config.headers.Authorization = `Bearer ${getAccessTokenFromState()}`;
          return api.request(error.config);
        } else {
          tokenService.clearTokens(dispatch);
        }
      }
      return Promise.reject(error);
    }
  );
};