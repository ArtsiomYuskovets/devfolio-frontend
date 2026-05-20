import { TokensResponse } from "@/types/types";
import { api } from "./authApi";
import { clearAuthStorage, persistAuth } from "@/lib/authStorage";
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
    const expiresAt = Date.now() + data.accessTokenExpiresIn * 1000;
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
        const res = await api.post<TokensResponse>("api/auth/refresh");
        tokenService.setTokens(res.data, dispatch);
        return true;
      } catch (e) {
        console.log("Ошибка обновления токенов: " + e);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  },
};
