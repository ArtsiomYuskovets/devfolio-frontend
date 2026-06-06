import { api } from "@/lib/authApi";
import { resetApiCaches } from "@/lib/resetApiCaches";
import { tokenService } from "@/lib/tokenService";
import { TokensResponse } from "@/types/types";
import type { AppDispatch } from "@/stores/store";

export async function loginOrRegistr(
  isLogin: boolean,
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<boolean> {
  try {
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const res = await api.post<TokensResponse>(
      endpoint,
      { email, password },
      { withCredentials: true }
    );
    resetApiCaches(dispatch);
    tokenService.setTokens(res.data, dispatch);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}