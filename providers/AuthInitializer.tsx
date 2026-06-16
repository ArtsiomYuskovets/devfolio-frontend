"use client";

import { useEffect } from "react";
import { store } from "@/stores/store";
import { useAppDispatch } from "@/stores/auth/hooks";
import { setTokens } from "@/stores/auth/authSlice";
import { tokenService } from "@/lib/tokenService";
import { setAccessTokenGetter, setupInterceptors } from "@/lib/authApi";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    tokenService.setDispatchCallback((dispatch, accessToken, expiresAt) => {
      dispatch(setTokens({ accessToken, expiresAt }));
    });

    setAccessTokenGetter(() => {
      const { accessToken } = store.getState().auth;
      return accessToken ?? null;
    });

    setupInterceptors(dispatch);
  }, [dispatch]);

  return <>{children}</>;
}
