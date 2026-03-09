import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from '@/stores/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;