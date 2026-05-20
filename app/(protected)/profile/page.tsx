"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pickProfileUserId } from "@/lib/userId";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: profile, isLoading, isFetching, isError } = useGetMyProfileQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );

  const userId = profile ? pickProfileUserId(profile) ?? profile.userId : undefined;

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (userId) {
      router.replace(`/profile/${userId}`);
      return;
    }

    if (!isError) {
      router.replace("/profile/edit");
      return;
    }

    router.replace("/dashboard");
  }, [isLoading, isFetching, isError, userId, router]);

  return null;
}
