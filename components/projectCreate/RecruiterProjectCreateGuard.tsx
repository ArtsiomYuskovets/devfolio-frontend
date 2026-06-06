"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyUserType } from "@/hooks/useMyUserType";
import { ProjectCreateForm } from "./ProjectCreateForm";

export function RecruiterProjectCreateGuard() {
  const router = useRouter();
  const { isRecruiter, isLoading } = useMyUserType();

  useEffect(() => {
    if (!isLoading && isRecruiter) {
      router.replace("/projects");
    }
  }, [isLoading, isRecruiter, router]);

  if (isLoading || isRecruiter) {
    return null;
  }

  return <ProjectCreateForm />;
}
