import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  accessTokenExpiresAt: null,
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
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export default authSlice.reducer;