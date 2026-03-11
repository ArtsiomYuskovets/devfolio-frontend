"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/stores/auth/hooks";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.user.userId);

  useEffect(() => {
    if (userId) {
      router.replace(`/profile/${userId}`);
    } else {
      router.replace("/dashboard");
    }
  }, [userId, router]);

  return null;
}
