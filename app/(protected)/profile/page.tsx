"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pickProfileUserId } from "@/lib/userId";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: profile, isLoading, isFetching } = useGetMyProfileQuery();

  const userId = profile ? pickProfileUserId(profile) ?? profile.userId : undefined;

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (userId) {
      router.replace(`/profile/${userId}`);
      return;
    }

    router.replace("/profile/edit");
  }, [isLoading, isFetching, userId, router]);

  return null;
}
