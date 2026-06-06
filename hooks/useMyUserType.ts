"use client";

import { useGetMyProfileQuery } from "@/stores/user/userApi";
import type { UserType } from "@/types/types";
import { isJobSeeker, isRecruiter } from "@/lib/userType";

export function useMyUserType() {
  const { data: profile, isLoading, isFetching, isError } = useGetMyProfileQuery();

  const userType: UserType = profile?.userType ?? "JOB_SEEKER";

  return {
    userType,
    isRecruiter: isRecruiter(userType),
    isJobSeeker: isJobSeeker(userType),
    isLoading: isLoading || isFetching,
    isError,
    profile,
  };
}
