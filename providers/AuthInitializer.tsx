'use client';

import { useEffect } from 'react';
import { store } from '@/stores/auth/store';
import { useAppDispatch } from '@/stores/auth/hooks';
import { setTokens, setAuthCheckComplete } from '@/stores/auth/authSlice';
import { tokenService } from '@/lib/tokenService';
import { setAccessTokenGetter, setupInterceptors } from '@/lib/authApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    tokenService.setDispatchCallback((dispatch, accessToken, expiresAt) => {
      dispatch(setTokens({ accessToken, expiresAt }));
    });

    setAccessTokenGetter(() => {
      const { accessToken, accessTokenExpiresAt } = store.getState().auth;
      if (accessToken && accessTokenExpiresAt && Date.now() <= accessTokenExpiresAt) {
        return accessToken;
      }
      return null;
    });

    setupInterceptors(dispatch);

    const { accessToken, accessTokenExpiresAt } = store.getState().auth;
    const hasValidToken =
      !!accessToken &&
      !!accessTokenExpiresAt &&
      Date.now() < accessTokenExpiresAt;

    if (hasValidToken) {
      dispatch(setAuthCheckComplete(true));
      return;
    }

    tokenService.refreshAccessToken(dispatch).finally(() => {
      dispatch(setAuthCheckComplete(true));
    });
  }, [dispatch]);

  return <>{children}</>;
}
