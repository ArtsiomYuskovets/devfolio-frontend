import { UserProfileInfo } from "@/types/types";
import { api } from "./authApi"; 
import { AppDispatch } from "@/stores/auth/store";
import { setUser, clearUser } from "@/stores/user/userSlice";

export const userService = {
  setUser: (data: UserProfileInfo, dispatch: AppDispatch) => {
    dispatch(setUser(data));
  },

  clearUser: (dispatch: AppDispatch) => {
    dispatch(clearUser());
  },

  getCurrentUser: async (dispatch: AppDispatch): Promise<boolean> => {
    try {
      const res = await api.get<UserProfileInfo>("api/profiles/me");
      userService.setUser(res.data, dispatch);
      console.log("userService", res.data);
      return true;
    } catch (e) {
      console.warn("[userService] Ошибка загрузки профиля:", e);
      return false;
    }
  },
};
