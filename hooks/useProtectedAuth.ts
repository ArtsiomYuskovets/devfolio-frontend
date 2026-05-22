"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isTokenValid,
  REFRESH_BEFORE_MS,
  shouldRefreshToken,
} from "@/lib/authTokenUtils";
import { tokenService } from "@/lib/tokenService";
import { useAppDispatch, useAppSelector } from "@/stores/auth/hooks";
import { setAuthCheckComplete } from "@/stores/auth/authSlice";

const AUTH_PATH = "/auth";
const PERIODIC_CHECK_MS = 30_000;

type SessionStatus = "checking" | "authenticated" | "unauthenticated";

let initialSessionCheck: Promise<boolean> | null = null;

export function useProtectedAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessTokenExpiresAt, isAuthCheckComplete } = useAppSelector(
    (state) => state.auth
  );

  const [status, setStatus] = useState<SessionStatus>("checking");
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const runRefresh = useCallback(
    () => tokenService.refreshAccessToken(dispatch),
    [dispatch]
  );

  const markUnauthenticatedIfExpired = useCallback(
    (refreshOk: boolean) => {
      if (refreshOk) {
        setStatus("authenticated");
        return;
      }
      if (!isTokenValid(accessTokenExpiresAt)) {
        setStatus("unauthenticated");
      }
    },
    [accessTokenExpiresAt]
  );

  const scheduleRefresh = useCallback(
    (expiresAt: number) => {
      clearRefreshTimer();
      const delay = Math.max(expiresAt - Date.now() - REFRESH_BEFORE_MS, 5_000);
      refreshTimerRef.current = setTimeout(() => {
        void (async () => {
          const ok = await runRefresh();
          markUnauthenticatedIfExpired(ok);
        })();
      }, delay);
    },
    [clearRefreshTimer, runRefresh, markUnauthenticatedIfExpired]
  );

  useEffect(() => {
    let cancelled = false;

    if (!initialSessionCheck) {
      initialSessionCheck = (async () => {
        if (
          isTokenValid(accessTokenExpiresAt) &&
          !shouldRefreshToken(accessTokenExpiresAt)
        ) {
          return true;
        }
        const ok = await runRefresh();
        if (ok) {
          return true;
        }
        return isTokenValid(accessTokenExpiresAt);
      })().finally(() => {
        initialSessionCheck = null;
      });
    }

    void initialSessionCheck.then((ok) => {
      if (!cancelled) {
        setStatus(ok ? "authenticated" : "unauthenticated");
        dispatch(setAuthCheckComplete(true));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessTokenExpiresAt, dispatch, runRefresh]);

  useEffect(() => {
    if (status !== "authenticated" || !accessTokenExpiresAt) {
      return;
    }
    scheduleRefresh(accessTokenExpiresAt);
    return clearRefreshTimer;
  }, [accessTokenExpiresAt, status, scheduleRefresh, clearRefreshTimer]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const intervalId = setInterval(() => {
      if (shouldRefreshToken(accessTokenExpiresAt)) {
        void (async () => {
          const ok = await runRefresh();
          markUnauthenticatedIfExpired(ok);
        })();
      }
    }, PERIODIC_CHECK_MS);

    return () => clearInterval(intervalId);
  }, [status, accessTokenExpiresAt, runRefresh, markUnauthenticatedIfExpired]);

  useEffect(() => {
    if (!isAuthCheckComplete || status !== "unauthenticated") {
      return;
    }
    void tokenService.clearTokens(dispatch);
    router.replace(AUTH_PATH);
  }, [isAuthCheckComplete, status, router, dispatch]);

  useEffect(() => clearRefreshTimer, [clearRefreshTimer]);

  return {
    status,
    isReady: isAuthCheckComplete && status === "authenticated",
  };
}
