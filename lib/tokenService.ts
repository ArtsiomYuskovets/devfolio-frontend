import { TokensResponse } from "@/types/types";
import { api } from "./authApi";
import { AppDispatch } from "../stores/auth/store";
import { setTokens, clearTokens } from "../stores/auth/authSlice";

let dispatchTokens: (dispatch: AppDispatch, accessToken: string, expiresAt: number) => void = () => {};

export const tokenService = {

  setDispatchCallback: (
    callback: (dispatch: AppDispatch, accessToken: string, expiresAt: number) => void
  ) => {
    dispatchTokens = callback;
  },

  setTokens: (data: TokensResponse, dispatch: AppDispatch) => {
    dispatchTokens(
      dispatch,
      data.accessToken,
      Date.now() + data.accessTokenExpiresIn * 1000
    );
  },
  clearTokens: (dispatch: AppDispatch) => {
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
    try {
      const res = await api.post<TokensResponse>('api/auth/refresh');
      tokenService.setTokens(res.data, dispatch);
      return true;
    } catch (e) {
      console.log("Ошибка обновления токенов: " + e);
      return false;
    }
  },
};