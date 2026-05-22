import { TokensResponse } from "@/types/types";
import type { InternalAxiosRequestConfig } from "axios";
import { api } from "./authApi";
import { clearAuthStorage, persistAuth } from "@/lib/authStorage";
import { accessTokenExpiresAt } from "@/lib/authTokenUtils";
import { resetApiCaches } from "@/lib/resetApiCaches";
import { setTokens, clearTokens } from "../stores/auth/authSlice";
import type { AppDispatch } from "@/stores/store";

let dispatchTokens: (dispatch: AppDispatch, accessToken: string, expiresAt: number) => void = () => {};
let refreshInFlight: Promise<boolean> | null = null;

export const tokenService = {
  setDispatchCallback: (
    callback: (dispatch: AppDispatch, accessToken: string, expiresAt: number) => void
  ) => {
    dispatchTokens = callback;
  },

  setTokens: (data: TokensResponse, dispatch: AppDispatch) => {
    const expiresAt = accessTokenExpiresAt(data.accessTokenExpiresIn);
    persistAuth(data.accessToken, expiresAt);
    dispatchTokens(dispatch, data.accessToken, expiresAt);
  },

  clearTokens: (dispatch: AppDispatch) => {
    clearAuthStorage();
    resetApiCaches(dispatch);
    dispatch(clearTokens());
  },

  logout: async (dispatch: AppDispatch): Promise<void> => {
    try {
      await api.post("api/auth/logout");
    } catch {
      // Session may already be invalid on the server.
    } finally {
      tokenService.clearTokens(dispatch);
    }
  },

  refreshAccessToken: async (dispatch: AppDispatch): Promise<boolean> => {
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const res = await api.post<TokensResponse>("api/auth/refresh", undefined, {
          _skipAuth: true,
        } as InternalAxiosRequestConfig & { _skipAuth: boolean });
        tokenService.setTokens(res.data, dispatch);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  },
};
