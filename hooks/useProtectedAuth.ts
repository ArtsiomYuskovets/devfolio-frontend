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

export function useProtectedAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessTokenExpiresAt, isAuthCheckComplete } = useAppSelector(
    (state) => state.auth
  );

  const [status, setStatus] = useState<SessionStatus>("checking");
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlightRef = useRef(false);
  const initialCheckDoneRef = useRef(false);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const runRefresh = useCallback(async (): Promise<boolean> => {
    if (refreshInFlightRef.current) {
      return false;
    }
    refreshInFlightRef.current = true;
    try {
      return await tokenService.refreshAccessToken(dispatch);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [dispatch]);

  const scheduleRefresh = useCallback(
    (expiresAt: number) => {
      clearRefreshTimer();
      const delay = Math.max(expiresAt - Date.now() - REFRESH_BEFORE_MS, 5_000);
      refreshTimerRef.current = setTimeout(() => {
        void (async () => {
          const ok = await runRefresh();
          if (!ok) {
            setStatus("unauthenticated");
          }
        })();
      }, delay);
    },
    [clearRefreshTimer, runRefresh]
  );

  useEffect(() => {
    if (initialCheckDoneRef.current) {
      return;
    }
    initialCheckDoneRef.current = true;

    let cancelled = false;

    void (async () => {
      if (
        isTokenValid(accessTokenExpiresAt) &&
        !shouldRefreshToken(accessTokenExpiresAt)
      ) {
        if (!cancelled) {
          setStatus("authenticated");
        }
        return;
      }

      const ok = await runRefresh();
      if (!cancelled) {
        setStatus(ok ? "authenticated" : "unauthenticated");
      }
    })().finally(() => {
      if (!cancelled) {
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
          if (!ok) {
            setStatus("unauthenticated");
          }
        })();
      }
    }, PERIODIC_CHECK_MS);

    return () => clearInterval(intervalId);
  }, [status, accessTokenExpiresAt, runRefresh]);

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
