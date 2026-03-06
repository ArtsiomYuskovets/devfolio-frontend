"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/stores/auth/hooks";

const AUTH_PATH = "/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, accessTokenExpiresAt } = useAppSelector((state) => state.auth);

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(AUTH_PATH);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
