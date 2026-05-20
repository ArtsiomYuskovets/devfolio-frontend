import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadAuth } from '@/lib/authStorage';
import { isTokenValid } from '@/lib/authTokenUtils';

interface AuthState {
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  isAuthCheckComplete: boolean;
}

function buildInitialState(): AuthState {
  const stored = loadAuth();
  if (stored && isTokenValid(stored.expiresAt)) {
    return {
      accessToken: stored.accessToken,
      accessTokenExpiresAt: stored.expiresAt,
      isAuthCheckComplete: false,
    };
  }
  return {
    accessToken: null,
    accessTokenExpiresAt: null,
    isAuthCheckComplete: false,
  };
}

const initialState: AuthState = buildInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; expiresAt: number }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.accessTokenExpiresAt = action.payload.expiresAt;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
    },
    setAuthCheckComplete: (state, action: PayloadAction<boolean>) => {
      state.isAuthCheckComplete = action.payload;
    },
  },
});

export const { setTokens, clearTokens, setAuthCheckComplete } = authSlice.actions;
export default authSlice.reducer;