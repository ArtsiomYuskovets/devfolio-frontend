"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/stores/auth/hooks";
import { setAuthCheckComplete, clearTokens } from "@/stores/auth/authSlice";
import { tokenService } from "@/lib/tokenService";
import { userService } from "@/lib/userService";

const AUTH_PATH = "/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const refreshStartedRef = useRef(false);
  const { accessToken, accessTokenExpiresAt, isAuthCheckComplete } = useAppSelector(
    (state) => state.auth
  );
  const userId = useAppSelector((state) => state.user.userId);

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    const hasValidToken =
      !!accessToken &&
      !!accessTokenExpiresAt &&
      Date.now() < accessTokenExpiresAt;

    if (hasValidToken) {
      dispatch(setAuthCheckComplete(true));
      return;
    }

    if (refreshStartedRef.current) return;
    refreshStartedRef.current = true;

    tokenService.refreshAccessToken(dispatch).finally(() => {
      dispatch(setAuthCheckComplete(true));
    });
  }, [accessToken, accessTokenExpiresAt, dispatch]);

  useEffect(() => {
    if (isAuthCheckComplete && !isAuthenticated) {
      dispatch(clearTokens());
      userService.clearUser(dispatch);
      router.replace(AUTH_PATH);
    }
  }, [isAuthCheckComplete, isAuthenticated, router, dispatch]);

  useEffect(() => {
    if (isAuthCheckComplete && isAuthenticated && !userId) {
      userService.getCurrentUser(dispatch);
    }
  }, [isAuthCheckComplete, isAuthenticated, userId, dispatch]);

  if (!isAuthCheckComplete) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
