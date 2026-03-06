import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  isAuthCheckComplete: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
  isAuthCheckComplete: false,
};

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