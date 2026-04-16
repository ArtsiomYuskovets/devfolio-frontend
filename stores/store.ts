import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../stores/auth/authSlice';
import { userApi } from '@/stores/user/userApi';
import { skillApi } from '@/stores/skill/skillApi';
import { projectsApi } from './projects/projectsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [skillApi.reducerPath]: skillApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, skillApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;