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
  const { accessToken, accessTokenExpiresAt, isAuthCheckComplete } = useAppSelector(
    (state) => state.auth
  );

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    if (isAuthCheckComplete && !isAuthenticated) {
      router.replace(AUTH_PATH);
    }
  }, [isAuthCheckComplete, isAuthenticated, router]);

  if (!isAuthCheckComplete) {
    return null; // или <Spinner /> пока идёт проверка сессии
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
