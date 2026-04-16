"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetMyProfileQuery();

  useEffect(() => {
    if (profile?.userId) {
      router.replace(`/profile/${profile.userId}`);
      return;
    }

    if (!isLoading) {
      router.replace("/dashboard");
    }
  }, [isLoading, profile?.userId, router]);

  return null;
}
