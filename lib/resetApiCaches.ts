import type { AppDispatch } from "@/stores/store";
import { projectsApi } from "@/stores/projects/projectsApi";
import { skillApi } from "@/stores/skill/skillApi";
import { userApi } from "@/stores/user/userApi";

export function resetApiCaches(dispatch: AppDispatch) {
  dispatch(userApi.util.resetApiState());
  dispatch(projectsApi.util.resetApiState());
  dispatch(skillApi.util.resetApiState());
}
