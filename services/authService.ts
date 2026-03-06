import { api } from "@/lib/authApi";
import { tokenService } from "@/lib/tokenService";
import { TokensResponse } from "@/types/types";
import { AppDispatch } from "../stores/auth/store";

export async function loginOrRegistr(
  isLogin: boolean,
  email: string,
  password: string,
  dispatch: AppDispatch
) {
  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const res = await api.post<TokensResponse>(endpoint, { email, password });
    tokenService.setTokens(res.data, dispatch); 
  } catch (e) {
    console.log(e);
  }
}